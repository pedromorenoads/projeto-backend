const querystring = require('querystring');
const { Op } = require('sequelize');
const {
  sequelize,
  Product,
  ProductImage,
  ProductOption,
  Category,
  ProductCategory,
} = require('../models');
const AppError = require('../utils/AppError');
const { saveBase64Image, buildImageUrl, removeLocalImage } = require('../utils/fileHelper');
const { parseLimit, parsePage, parseFields, parseIdList } = require('../utils/query');

const PRODUCT_INCLUDE = [
  { model: ProductImage, as: 'images', attributes: ['id', 'path'] },
  { model: ProductOption, as: 'options' },
  {
    model: Category,
    as: 'categories',
    attributes: ['id'],
    through: { attributes: [] },
  },
];

function toBoolean(value) {
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }

  return Boolean(value);
}

function parseRadius(value) {
  if (value === undefined || value === null || value === '') {
    return 0;
  }

  const radius = parseInt(String(value).replace(/[^\d-]/g, ''), 10);
  return Number.isInteger(radius) ? radius : 0;
}

function serializeProduct(product) {
  const plain = typeof product.get === 'function' ? product.get({ plain: true }) : product;

  return {
    id: plain.id,
    enabled: Boolean(plain.enabled),
    name: plain.name,
    slug: plain.slug,
    stock: plain.stock,
    description: plain.description,
    price: plain.price,
    price_with_discount: plain.price_with_discount,
    brand: plain.brand,
    gender: plain.gender,
    rating: plain.rating === null || plain.rating === undefined ? 0 : Number(plain.rating),
    reviews: plain.reviews === null || plain.reviews === undefined ? 0 : Number(plain.reviews),
    category_ids: (plain.categories || []).map((category) => category.id),
    images: (plain.images || []).map((image) => ({
      id: image.id,
      content: buildImageUrl(image.path),
    })),
    options: (plain.options || []).map((option) => ({
      id: option.id,
      title: option.title,
      shape: option.shape,
      radius: option.radius,
      type: option.type,
      values: option.values ? option.values.split(',') : [],
    })),
  };
}

function validateProductFields(data, { partial }) {
  if (!partial) {
    if (!data.name || !String(data.name).trim()) {
      throw new AppError(400, 'O nome do produto é obrigatório');
    }

    if (!data.slug || !String(data.slug).trim()) {
      throw new AppError(400, 'O slug do produto é obrigatório');
    }

    if (data.price === undefined || data.price === null || data.price === '') {
      throw new AppError(400, 'O preço do produto é obrigatório');
    }

    if (data.price_with_discount === undefined || data.price_with_discount === null || data.price_with_discount === '') {
      throw new AppError(400, 'O preço com desconto é obrigatório');
    }
  } else {
    if (data.name !== undefined && !String(data.name).trim()) {
      throw new AppError(400, 'O nome do produto não pode ser vazio');
    }

    if (data.slug !== undefined && !String(data.slug).trim()) {
      throw new AppError(400, 'O slug do produto não pode ser vazio');
    }
  }

  if (data.price !== undefined) {
    const price = Number(data.price);
    if (!Number.isFinite(price) || price < 0) {
      throw new AppError(400, 'O preço deve ser um número maior ou igual a zero');
    }
  }

  if (data.price_with_discount !== undefined) {
    const priceWithDiscount = Number(data.price_with_discount);
    if (!Number.isFinite(priceWithDiscount) || priceWithDiscount < 0) {
      throw new AppError(400, 'O preço com desconto deve ser um número maior ou igual a zero');
    }
  }

  if (data.stock !== undefined) {
    const stock = Number(data.stock);
    if (!Number.isInteger(stock) || stock < 0) {
      throw new AppError(400, 'O estoque deve ser um número inteiro maior ou igual a zero');
    }
  }

  if (data.rating !== undefined) {
    const rating = Number(data.rating);
    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      throw new AppError(400, 'A avaliação deve ser um número entre 0 e 5');
    }
  }

  if (data.reviews !== undefined) {
    const reviews = Number(data.reviews);
    if (!Number.isInteger(reviews) || reviews < 0) {
      throw new AppError(400, 'O número de avaliações deve ser um inteiro maior ou igual a zero');
    }
  }

  if (data.category_ids !== undefined && !Array.isArray(data.category_ids)) {
    throw new AppError(400, 'category_ids deve ser uma lista de IDs');
  }

  if (data.images !== undefined && !Array.isArray(data.images)) {
    throw new AppError(400, 'images deve ser uma lista');
  }

  if (data.options !== undefined && !Array.isArray(data.options)) {
    throw new AppError(400, 'options deve ser uma lista');
  }
}

function buildProductValues(data) {
  return {
    enabled: data.enabled === undefined ? false : toBoolean(data.enabled),
    name: String(data.name).trim(),
    slug: String(data.slug).trim(),
    use_in_menu: data.use_in_menu === undefined ? false : toBoolean(data.use_in_menu),
    stock: data.stock === undefined ? 0 : Number(data.stock),
    description: data.description === undefined || data.description === null ? null : String(data.description),
    price: Number(data.price),
    price_with_discount: Number(data.price_with_discount),
    brand: data.brand === undefined || data.brand === null ? null : String(data.brand).trim(),
    gender: data.gender === undefined || data.gender === null ? null : String(data.gender).trim(),
    rating: data.rating === undefined ? 0 : Number(data.rating),
    reviews: data.reviews === undefined ? 0 : Number(data.reviews),
  };
}

function normalizeOptionValues(option) {
  const raw = option.values !== undefined ? option.values : option.value;

  if (raw === undefined || raw === null) {
    return undefined;
  }

  const list = Array.isArray(raw) ? raw : String(raw).split(',');
  return list
    .map((item) => String(item).trim())
    .filter(Boolean)
    .join(',');
}

function buildOptionForCreate(productId, option) {
  if (!option || typeof option !== 'object') {
    throw new AppError(400, 'Opção de produto inválida');
  }

  if (!option.title || !String(option.title).trim()) {
    throw new AppError(400, 'O título da opção é obrigatório');
  }

  const values = normalizeOptionValues(option);
  if (!values) {
    throw new AppError(400, `A opção "${option.title}" precisa ter pelo menos um valor`);
  }

  const shape = option.shape === undefined ? 'square' : String(option.shape);
  if (!['square', 'circle'].includes(shape)) {
    throw new AppError(400, 'O formato da opção deve ser square ou circle');
  }

  const type = option.type === undefined ? 'text' : String(option.type);
  if (!['text', 'color'].includes(type)) {
    throw new AppError(400, 'O tipo da opção deve ser text ou color');
  }

  return {
    product_id: productId,
    title: String(option.title).trim(),
    shape,
    radius: parseRadius(option.radius),
    type,
    values,
  };
}

function buildOptionUpdates(option) {
  const updates = {};

  if (option.title !== undefined) {
    if (!String(option.title).trim()) {
      throw new AppError(400, 'O título da opção não pode ser vazio');
    }
    updates.title = String(option.title).trim();
  }

  if (option.shape !== undefined) {
    const shape = String(option.shape);
    if (!['square', 'circle'].includes(shape)) {
      throw new AppError(400, 'O formato da opção deve ser square ou circle');
    }
    updates.shape = shape;
  }

  if (option.type !== undefined) {
    const type = String(option.type);
    if (!['text', 'color'].includes(type)) {
      throw new AppError(400, 'O tipo da opção deve ser text ou color');
    }
    updates.type = type;
  }

  if (option.radius !== undefined) {
    updates.radius = parseRadius(option.radius);
  }

  const values = normalizeOptionValues(option);
  if (values !== undefined) {
    if (!values) {
      throw new AppError(400, 'A opção precisa ter pelo menos um valor');
    }
    updates.values = values;
  }

  return updates;
}

function toStoredPath(content, type) {
  if (typeof content !== 'string' || !content.trim()) {
    throw new AppError(400, 'A imagem precisa de um conteúdo (content)');
  }

  const value = content.trim();

  // No update é permitido informar uma URL já existente no lugar de um base64.
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return saveBase64Image(value, type);
}

async function syncCategories(productId, categoryIds, transaction) {
  if (categoryIds === undefined) {
    return;
  }

  const ids = [...new Set(categoryIds.map((id) => Number(id)))];

  if (ids.some((id) => !Number.isInteger(id) || id <= 0)) {
    throw new AppError(400, 'category_ids deve conter apenas IDs válidos');
  }

  if (ids.length) {
    const found = await Category.findAll({
      where: { id: { [Op.in]: ids } },
      attributes: ['id'],
      raw: true,
      transaction,
    });

    if (found.length !== ids.length) {
      throw new AppError(400, 'Uma ou mais categorias informadas não existem');
    }
  }

  await ProductCategory.destroy({ where: { product_id: productId }, transaction });

  if (ids.length) {
    await ProductCategory.bulkCreate(
      ids.map((categoryId) => ({ product_id: productId, category_id: categoryId })),
      { transaction }
    );
  }
}

async function createImages(productId, images, transaction) {
  if (images === undefined) {
    return;
  }

  const rows = images.map((image) => {
    if (!image || typeof image !== 'object') {
      throw new AppError(400, 'Imagem de produto inválida');
    }

    return {
      product_id: productId,
      enabled: image.enabled === undefined ? false : toBoolean(image.enabled),
      path: toStoredPath(image.content, image.type),
    };
  });

  if (rows.length) {
    await ProductImage.bulkCreate(rows, { transaction });
  }
}

async function updateImages(productId, images, transaction) {
  if (images === undefined) {
    return;
  }

  for (const image of images) {
    if (!image || typeof image !== 'object') {
      throw new AppError(400, 'Imagem de produto inválida');
    }

    if (image.id === undefined) {
      const storedPath = toStoredPath(image.content, image.type);
      await ProductImage.create(
        {
          product_id: productId,
          enabled: image.enabled === undefined ? false : toBoolean(image.enabled),
          path: storedPath,
        },
        { transaction }
      );
      continue;
    }

    const existing = await ProductImage.findOne({
      where: { id: image.id, product_id: productId },
      transaction,
    });

    if (!existing) {
      continue;
    }

    if (image.deleted) {
      removeLocalImage(existing.path);
      await existing.destroy({ transaction });
      continue;
    }

    if (image.content !== undefined) {
      const newPath = toStoredPath(image.content, image.type);
      if (existing.path !== newPath) {
        removeLocalImage(existing.path);
      }
      existing.path = newPath;
    }

    if (image.enabled !== undefined) {
      existing.enabled = toBoolean(image.enabled);
    }

    await existing.save({ transaction });
  }
}

async function createOptions(productId, options, transaction) {
  if (options === undefined) {
    return;
  }

  const rows = options.map((option) => buildOptionForCreate(productId, option));

  if (rows.length) {
    await ProductOption.bulkCreate(rows, { transaction });
  }
}

async function updateOptions(productId, options, transaction) {
  if (options === undefined) {
    return;
  }

  for (const option of options) {
    if (!option || typeof option !== 'object') {
      throw new AppError(400, 'Opção de produto inválida');
    }

    if (option.id === undefined) {
      const row = buildOptionForCreate(productId, option);
      await ProductOption.create(row, { transaction });
      continue;
    }

    const existing = await ProductOption.findOne({
      where: { id: option.id, product_id: productId },
      transaction,
    });

    if (!existing) {
      continue;
    }

    if (option.deleted) {
      await existing.destroy({ transaction });
      continue;
    }

    const updates = buildOptionUpdates(option);
    if (Object.keys(updates).length) {
      await existing.update(updates, { transaction });
    }
  }
}

async function getById(id, transaction) {
  const value = String(id);
  // O front-end usa o slug nas URLs; aceitamos também o ID numérico.
  const where = /^\d+$/.test(value) ? { id: Number(value) } : { slug: value };

  const product = await Product.findOne({
    where,
    include: PRODUCT_INCLUDE,
    transaction,
  });

  if (!product) {
    throw new AppError(404, 'Produto não encontrado');
  }

  return serializeProduct(product);
}

async function listImagePaths(productId, transaction) {
  return ProductImage.findAll({
    where: { product_id: productId },
    attributes: ['path'],
    raw: true,
    transaction,
  });
}

function parsePriceRange(value) {
  const match = String(value).match(/^(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/);

  if (!match) {
    throw new AppError(400, 'O parâmetro price-range deve estar no formato min-max');
  }

  let min = Number(match[1]);
  let max = Number(match[2]);

  if (min > max) {
    [min, max] = [max, min];
  }

  return [min, max];
}

/**
 * O parser padrão do Express transforma `option[1]=GG` em um array e perde o ID.
 * Por isso os filtros de opção são lidos da query string original.
 */
function extractOptionFilters(query, rawQuery) {
  const filters = new Map();

  const addFilter = (rawId, rawValues) => {
    const id = Number(rawId);

    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError(400, 'O filtro de opções deve usar o formato option[id]=valor');
    }

    const values = (Array.isArray(rawValues) ? rawValues.join(',') : String(rawValues))
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const current = filters.get(id) || [];
    filters.set(id, [...new Set([...current, ...values])]);
  };

  if (rawQuery) {
    const parsed = querystring.parse(rawQuery);

    for (const [key, value] of Object.entries(parsed)) {
      const match = key.match(/^option\[(\d+)\]$/);
      if (match) {
        addFilter(match[1], value);
      }
    }
  }

  // Fallback para chamadas diretas ao service ou parsers que mantêm a chave literal.
  if (query.option && typeof query.option === 'object' && !Array.isArray(query.option)) {
    for (const [key, value] of Object.entries(query.option)) {
      if (/^\d+$/.test(key)) {
        addFilter(key, value);
      }
    }
  }

  for (const key of Object.keys(query)) {
    const match = key.match(/^option\[(\d+)\]$/);
    if (match) {
      addFilter(match[1], query[key]);
    }
  }

  return [...filters.entries()].map(([id, values]) => ({ id, values }));
}

function intersect(current, next) {
  if (current === null) {
    return next;
  }

  return new Set([...current].filter((id) => next.has(id)));
}

async function search(query = {}, rawQuery = '') {
  const limit = parseLimit(query.limit, 12);
  const page = parsePage(query.page, 1);
  const fields = parseFields(query.fields);
  const where = {};

  if (query.match) {
    const term = `%${query.match}%`;
    where[Op.or] = [{ name: { [Op.like]: term } }, { description: { [Op.like]: term } }];
  }

  if (query['price-range']) {
    where.price = { [Op.between]: parsePriceRange(query['price-range']) };
  }

  // Os filtros por categoria e por opção são resolvidos em queries separadas
  // para manter a paginação e a contagem de produtos corretas.
  let allowedIds = null;

  if (query.category_ids) {
    const categoryIds = parseIdList(query.category_ids, 'category_ids');

    const rows = await ProductCategory.findAll({
      where: { category_id: { [Op.in]: categoryIds } },
      attributes: ['product_id'],
      raw: true,
    });

    allowedIds = intersect(allowedIds, new Set(rows.map((row) => row.product_id)));
  }

  for (const filter of extractOptionFilters(query, rawQuery)) {
    const optionWhere = { id: filter.id };

    if (filter.values.length) {
      optionWhere[Op.or] = filter.values.map((value) => ({
        values: { [Op.like]: `%${value}%` },
      }));
    }

    const rows = await ProductOption.findAll({
      where: optionWhere,
      attributes: ['product_id'],
      raw: true,
    });

    allowedIds = intersect(allowedIds, new Set(rows.map((row) => row.product_id)));
  }

  if (allowedIds) {
    if (allowedIds.size === 0) {
      return { data: [], total: 0, limit, page };
    }

    where.id = { [Op.in]: [...allowedIds] };
  }

  const options = {
    where,
    include: PRODUCT_INCLUDE,
    distinct: true,
    order: [['id', 'ASC']],
  };

  if (limit !== -1) {
    options.limit = limit;
    options.offset = (page - 1) * limit;
  }

  const { count, rows } = await Product.findAndCountAll(options);

  const data = rows.map((product) => {
    const serialized = serializeProduct(product);

    if (!fields.length) {
      return serialized;
    }

    const keys = new Set(['id', ...fields]);
    return [...keys].reduce((result, key) => {
      if (key in serialized) {
        result[key] = serialized[key];
      }
      return result;
    }, {});
  });

  return {
    data,
    total: count,
    limit,
    page,
  };
}

async function create(data = {}) {
  validateProductFields(data, { partial: false });

  return sequelize.transaction(async (transaction) => {
    const product = await Product.create(buildProductValues(data), { transaction });

    await syncCategories(product.id, data.category_ids, transaction);
    await createImages(product.id, data.images, transaction);
    await createOptions(product.id, data.options, transaction);

    return getById(product.id, transaction);
  });
}

async function update(id, data = {}) {
  return sequelize.transaction(async (transaction) => {
    const product = await Product.findByPk(id, { transaction });

    if (!product) {
      throw new AppError(404, 'Produto não encontrado');
    }

    validateProductFields(data, { partial: true });

    const updates = {};
    const fields = [
      'name',
      'slug',
      'stock',
      'description',
      'price',
      'price_with_discount',
      'brand',
      'gender',
      'rating',
      'reviews',
    ];

    if (data.enabled !== undefined) updates.enabled = toBoolean(data.enabled);
    if (data.use_in_menu !== undefined) updates.use_in_menu = toBoolean(data.use_in_menu);

    for (const field of fields) {
      if (data[field] !== undefined) {
        updates[field] = data[field];
      }
    }

    if (updates.name !== undefined) updates.name = String(updates.name).trim();
    if (updates.slug !== undefined) updates.slug = String(updates.slug).trim();
    if (updates.stock !== undefined) updates.stock = Number(updates.stock);
    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.price_with_discount !== undefined) updates.price_with_discount = Number(updates.price_with_discount);
    if (updates.description !== undefined && updates.description !== null) {
      updates.description = String(updates.description);
    }
    if (updates.brand !== undefined && updates.brand !== null) {
      updates.brand = String(updates.brand).trim();
    }
    if (updates.gender !== undefined && updates.gender !== null) {
      updates.gender = String(updates.gender).trim();
    }
    if (updates.rating !== undefined) updates.rating = Number(updates.rating);
    if (updates.reviews !== undefined) updates.reviews = Number(updates.reviews);

    if (Object.keys(updates).length) {
      await product.update(updates, { transaction });
    }

    await syncCategories(product.id, data.category_ids, transaction);
    await updateImages(product.id, data.images, transaction);
    await updateOptions(product.id, data.options, transaction);
  });
}

async function remove(id) {
  await sequelize.transaction(async (transaction) => {
    const product = await Product.findByPk(id, { transaction });

    if (!product) {
      throw new AppError(404, 'Produto não encontrado');
    }

    const images = await listImagePaths(product.id, transaction);

    await ProductImage.destroy({ where: { product_id: product.id }, transaction });
    await ProductOption.destroy({ where: { product_id: product.id }, transaction });
    await ProductCategory.destroy({ where: { product_id: product.id }, transaction });
    await product.destroy({ transaction });

    images.forEach((image) => removeLocalImage(image.path));
  });
}

module.exports = {
  search,
  getById,
  create,
  update,
  remove,
};

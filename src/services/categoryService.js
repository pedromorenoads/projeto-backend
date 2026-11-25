const { Category } = require('../models');
const AppError = require('../utils/AppError');
const { parseLimit, parsePage, parseFields, pickFields } = require('../utils/query');

const DEFAULT_FIELDS = ['id', 'name', 'slug', 'use_in_menu'];

function toPublicCategory(category) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    use_in_menu: Boolean(category.use_in_menu),
  };
}

function parseBooleanFilter(value) {
  if (value === 'true' || value === '1' || value === 1 || value === true) {
    return true;
  }

  if (value === 'false' || value === '0' || value === 0 || value === false) {
    return false;
  }

  throw new AppError(400, 'O parâmetro use_in_menu deve ser true ou false');
}

async function search(query = {}) {
  const limit = parseLimit(query.limit, 12);
  const page = parsePage(query.page, 1);
  const fields = parseFields(query.fields);
  const where = {};

  if (query.use_in_menu !== undefined) {
    where.use_in_menu = parseBooleanFilter(query.use_in_menu);
  }

  const options = {
    where,
    order: [['id', 'ASC']],
  };

  if (limit !== -1) {
    options.limit = limit;
    options.offset = (page - 1) * limit;
  }

  const { count, rows } = await Category.findAndCountAll(options);
  const data = rows.map((category) => pickFields(toPublicCategory(category), fields, DEFAULT_FIELDS));

  return {
    data,
    total: count,
    limit,
    page,
  };
}

async function getById(id) {
  const category = await Category.findByPk(id);

  if (!category) {
    throw new AppError(404, 'Categoria não encontrada');
  }

  return toPublicCategory(category);
}

async function create(data = {}) {
  const { name, slug, use_in_menu } = data;

  if (!name || !String(name).trim()) {
    throw new AppError(400, 'O nome da categoria é obrigatório');
  }

  if (!slug || !String(slug).trim()) {
    throw new AppError(400, 'O slug da categoria é obrigatório');
  }

  const category = await Category.create({
    name: String(name).trim(),
    slug: String(slug).trim(),
    use_in_menu: use_in_menu === undefined ? false : Boolean(use_in_menu),
  });

  return toPublicCategory(category);
}

async function update(id, data = {}) {
  const category = await Category.findByPk(id);

  if (!category) {
    throw new AppError(404, 'Categoria não encontrada');
  }

  const updates = {};

  if (data.name !== undefined) {
    if (!String(data.name).trim()) {
      throw new AppError(400, 'O nome da categoria não pode ser vazio');
    }
    updates.name = String(data.name).trim();
  }

  if (data.slug !== undefined) {
    if (!String(data.slug).trim()) {
      throw new AppError(400, 'O slug da categoria não pode ser vazio');
    }
    updates.slug = String(data.slug).trim();
  }

  if (data.use_in_menu !== undefined) {
    updates.use_in_menu = Boolean(data.use_in_menu);
  }

  if (Object.keys(updates).length) {
    await category.update(updates);
  }
}

async function remove(id) {
  const category = await Category.findByPk(id);

  if (!category) {
    throw new AppError(404, 'Categoria não encontrada');
  }

  await category.destroy();
}

module.exports = {
  search,
  getById,
  create,
  update,
  remove,
};

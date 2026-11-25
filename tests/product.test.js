const { request, app, getToken } = require('./helpers/api');
const { resetDatabase, closeDatabase } = require('./helpers/db');

const TINY_PNG =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

let token;
let categoryId;
let categoryId2;

beforeEach(async () => {
  await resetDatabase();

  token = await getToken();

  const category1 = await createCategory({ name: 'Tênis', slug: 'tenis', use_in_menu: true });
  const category2 = await createCategory({ name: 'Ofertas', slug: 'ofertas', use_in_menu: false });

  categoryId = category1.body.id;
  categoryId2 = category2.body.id;
});

afterAll(closeDatabase);

function createCategory(data) {
  return request(app)
    .post('/v1/category')
    .set('Authorization', `Bearer ${token}`)
    .send(data);
}

function createProduct(overrides = {}) {
  return request(app)
    .post('/v1/product')
    .set('Authorization', `Bearer ${token}`)
    .send({
      enabled: true,
      name: 'Tênis Runner',
      slug: 'tenis-runner',
      stock: 10,
      description: 'Tênis leve para corrida',
      price: 199.9,
      price_with_discount: 149.9,
      category_ids: [categoryId],
      images: [{ type: 'image/png', content: TINY_PNG }],
      options: [{ title: 'Tamanho', shape: 'square', radius: '4px', type: 'text', value: ['PP', 'GG'] }],
      ...overrides,
    });
}

describe('Produtos', () => {
  test('bloqueia o cadastro sem token', async () => {
    const response = await request(app).post('/v1/product').send({ name: 'Produto' });

    expect(response.status).toBe(401);
  });

  test('cadastra um produto com imagens, opções e categorias', async () => {
    const response = await createProduct();

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Tênis Runner');
    expect(response.body.category_ids).toEqual([categoryId]);
    expect(response.body.images).toHaveLength(1);
    expect(response.body.images[0].content).toMatch(/^http/);
    expect(response.body.options).toHaveLength(1);
    expect(response.body.options[0].values).toEqual(['PP', 'GG']);
    expect(response.body.options[0].radius).toBe(4);
  });

  test('retorna 400 quando o preço não é informado', async () => {
    const response = await createProduct({ price: undefined });

    expect(response.status).toBe(400);
  });

  test('retorna 400 quando a categoria informada não existe', async () => {
    const response = await createProduct({ category_ids: [9999] });

    expect(response.status).toBe(400);
  });

  test('busca produto pelo id', async () => {
    const created = await createProduct();
    const response = await request(app).get(`/v1/product/${created.body.id}`);

    expect(response.status).toBe(200);
    expect(response.body.slug).toBe('tenis-runner');
  });

  test('retorna 404 para produto inexistente', async () => {
    const response = await request(app).get('/v1/product/9999');

    expect(response.status).toBe(404);
  });

  test('lista produtos com paginação padrão', async () => {
    await createProduct();
    const response = await request(app).get('/v1/product/search');

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.limit).toBe(12);
    expect(response.body.page).toBe(1);
  });

  test('filtra produtos por termo de busca', async () => {
    await createProduct();

    const found = await request(app).get('/v1/product/search').query({ match: 'corrida' });
    const notFound = await request(app).get('/v1/product/search').query({ match: 'inexistente' });

    expect(found.body.total).toBe(1);
    expect(notFound.body.total).toBe(0);
  });

  test('filtra produtos por categoria', async () => {
    await createProduct();

    const found = await request(app)
      .get('/v1/product/search')
      .query({ category_ids: String(categoryId) });

    const notFound = await request(app)
      .get('/v1/product/search')
      .query({ category_ids: String(categoryId2) });

    expect(found.body.total).toBe(1);
    expect(notFound.body.total).toBe(0);
  });

  test('filtra produtos por faixa de preço', async () => {
    await createProduct();

    const found = await request(app).get('/v1/product/search').query({ 'price-range': '100-200' });
    const notFound = await request(app).get('/v1/product/search').query({ 'price-range': '300-400' });

    expect(found.body.total).toBe(1);
    expect(notFound.body.total).toBe(0);
  });

  test('filtra produtos pelo valor de uma opção', async () => {
    const created = await createProduct();
    const optionId = created.body.options[0].id;

    const found = await request(app)
      .get('/v1/product/search')
      .query({ [`option[${optionId}]`]: 'GG' });

    const notFound = await request(app)
      .get('/v1/product/search')
      .query({ [`option[${optionId}]`]: 'XG' });

    expect(found.body.total).toBe(1);
    expect(notFound.body.total).toBe(0);
  });

  test('limita os campos retornados na listagem', async () => {
    await createProduct();

    const response = await request(app).get('/v1/product/search').query({ fields: 'name,price' });

    expect(response.status).toBe(200);
    expect(Object.keys(response.body.data[0]).sort()).toEqual(['id', 'name', 'price']);
  });

  test('pagina os produtos', async () => {
    await createProduct({ name: 'Produto 1', slug: 'produto-1' });
    await createProduct({ name: 'Produto 2', slug: 'produto-2' });
    await createProduct({ name: 'Produto 3', slug: 'produto-3' });

    const firstPage = await request(app).get('/v1/product/search').query({ limit: 2, page: 1 });
    const secondPage = await request(app).get('/v1/product/search').query({ limit: 2, page: 2 });

    expect(firstPage.body.total).toBe(3);
    expect(firstPage.body.data).toHaveLength(2);
    expect(secondPage.body.data).toHaveLength(1);
  });

  test('atualiza produto, imagens, opções e categorias', async () => {
    const created = await createProduct();
    const productId = created.body.id;
    const imageId = created.body.images[0].id;
    const optionId = created.body.options[0].id;

    const response = await request(app)
      .put(`/v1/product/${productId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Tênis Atualizado',
        category_ids: [categoryId2],
        images: [
          { id: imageId, deleted: true },
          { type: 'image/png', content: TINY_PNG },
        ],
        options: [
          { id: optionId, deleted: true },
          { title: 'Tipo', shape: 'square', type: 'text', values: ['100% algodão'] },
        ],
      });

    expect(response.status).toBe(204);

    const updated = await request(app).get(`/v1/product/${productId}`);
    expect(updated.body.name).toBe('Tênis Atualizado');
    expect(updated.body.category_ids).toEqual([categoryId2]);
    expect(updated.body.images).toHaveLength(1);
    expect(updated.body.options).toHaveLength(1);
    expect(updated.body.options[0].title).toBe('Tipo');
    expect(updated.body.options[0].values).toEqual(['100% algodão']);
  });

  test('retorna 404 ao atualizar produto inexistente', async () => {
    const response = await request(app)
      .put('/v1/product/9999')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Tênis Atualizado' });

    expect(response.status).toBe(404);
  });

  test('deleta um produto', async () => {
    const created = await createProduct();

    const response = await request(app)
      .delete(`/v1/product/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);

    const afterDelete = await request(app).get(`/v1/product/${created.body.id}`);
    expect(afterDelete.status).toBe(404);
  });

  test('bloqueia a exclusão sem token', async () => {
    const created = await createProduct();

    const response = await request(app).delete(`/v1/product/${created.body.id}`);

    expect(response.status).toBe(401);
  });
});

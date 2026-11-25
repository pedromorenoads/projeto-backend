const { request, app, getToken } = require('./helpers/api');
const { resetDatabase, closeDatabase } = require('./helpers/db');

beforeEach(resetDatabase);
afterAll(closeDatabase);

function createCategory(token, data = {}) {
  return request(app)
    .post('/v1/category')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Shoes', slug: 'shoes', use_in_menu: true, ...data });
}

describe('Categorias', () => {
  test('bloqueia o cadastro sem token', async () => {
    const response = await request(app)
      .post('/v1/category')
      .send({ name: 'Shoes', slug: 'shoes', use_in_menu: true });

    expect(response.status).toBe(401);
  });

  test('cadastra uma categoria', async () => {
    const token = await getToken();
    const response = await createCategory(token);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: expect.any(Number),
      name: 'Shoes',
      slug: 'shoes',
      use_in_menu: true,
    });
  });

  test('lista categorias com paginação padrão', async () => {
    const token = await getToken();
    await createCategory(token, { name: 'Shoes', slug: 'shoes' });
    await createCategory(token, { name: 'Offers', slug: 'offers' });

    const response = await request(app).get('/v1/category/search');

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(2);
    expect(response.body.limit).toBe(12);
    expect(response.body.page).toBe(1);
    expect(response.body.data).toHaveLength(2);
  });

  test('retorna todos os itens quando limit é -1', async () => {
    const token = await getToken();
    await createCategory(token, { name: 'Shoes', slug: 'shoes' });
    await createCategory(token, { name: 'Offers', slug: 'offers' });
    await createCategory(token, { name: 'Black Friday', slug: 'black-friday', use_in_menu: false });

    const response = await request(app).get('/v1/category/search').query({ limit: -1 });

    expect(response.status).toBe(200);
    expect(response.body.limit).toBe(-1);
    expect(response.body.data).toHaveLength(3);
  });

  test('limita os campos retornados', async () => {
    const token = await getToken();
    await createCategory(token);

    const response = await request(app).get('/v1/category/search').query({ fields: 'name,slug' });

    expect(response.status).toBe(200);
    expect(Object.keys(response.body.data[0]).sort()).toEqual(['id', 'name', 'slug']);
  });

  test('filtra categorias por use_in_menu', async () => {
    const token = await getToken();
    await createCategory(token, { name: 'Shoes', slug: 'shoes', use_in_menu: true });
    await createCategory(token, { name: 'Black Friday', slug: 'black-friday', use_in_menu: false });

    const response = await request(app).get('/v1/category/search').query({ use_in_menu: 'false' });

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.data[0].slug).toBe('black-friday');
  });

  test('retorna 400 para limit inválido', async () => {
    const response = await request(app).get('/v1/category/search').query({ limit: 'abc' });

    expect(response.status).toBe(400);
  });

  test('busca categoria pelo id', async () => {
    const token = await getToken();
    const created = await createCategory(token);

    const response = await request(app).get(`/v1/category/${created.body.id}`);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Shoes');
  });

  test('retorna 404 para categoria inexistente', async () => {
    const response = await request(app).get('/v1/category/9999');

    expect(response.status).toBe(404);
  });

  test('atualiza uma categoria', async () => {
    const token = await getToken();
    const created = await createCategory(token);

    const response = await request(app)
      .put(`/v1/category/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Calçados', slug: 'calcados' });

    expect(response.status).toBe(204);

    const updated = await request(app).get(`/v1/category/${created.body.id}`);
    expect(updated.body.name).toBe('Calçados');
    expect(updated.body.slug).toBe('calcados');
  });

  test('retorna 404 ao atualizar categoria inexistente', async () => {
    const token = await getToken();

    const response = await request(app)
      .put('/v1/category/9999')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Calçados' });

    expect(response.status).toBe(404);
  });

  test('deleta uma categoria', async () => {
    const token = await getToken();
    const created = await createCategory(token);

    const response = await request(app)
      .delete(`/v1/category/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);

    const afterDelete = await request(app).get(`/v1/category/${created.body.id}`);
    expect(afterDelete.status).toBe(404);
  });

  test('bloqueia a exclusão sem token', async () => {
    const token = await getToken();
    const created = await createCategory(token);

    const response = await request(app).delete(`/v1/category/${created.body.id}`);

    expect(response.status).toBe(401);
  });
});

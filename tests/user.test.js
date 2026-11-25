const { request, app, registerUser, getToken } = require('./helpers/api');
const { resetDatabase, closeDatabase } = require('./helpers/db');

beforeEach(resetDatabase);
afterAll(closeDatabase);

describe('Usuários', () => {
  test('cadastra um usuário e não devolve a senha', async () => {
    const response = await registerUser();

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(Number),
      firstname: 'Maria',
      surname: 'Silva',
      email: 'maria@mail.com',
    });
    expect(response.body).not.toHaveProperty('password');
  });

  test('não cadastra quando a confirmação de senha é diferente', async () => {
    const response = await registerUser({ confirmPassword: 'outra-senha' });

    expect(response.status).toBe(400);
  });

  test('não cadastra e-mail duplicado', async () => {
    await registerUser();
    const response = await registerUser();

    expect(response.status).toBe(400);
  });

  test('busca usuário pelo id', async () => {
    const created = await registerUser();
    const response = await request(app).get(`/v1/user/${created.body.id}`);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe('maria@mail.com');
  });

  test('retorna 404 para usuário inexistente', async () => {
    const response = await request(app).get('/v1/user/9999');

    expect(response.status).toBe(404);
  });

  test('gera token com credenciais válidas', async () => {
    await registerUser();
    const response = await request(app)
      .post('/v1/user/token')
      .send({ email: 'maria@mail.com', password: '123@123' });

    expect(response.status).toBe(200);
    expect(typeof response.body.token).toBe('string');
  });

  test('não gera token com senha inválida', async () => {
    await registerUser();
    const response = await request(app)
      .post('/v1/user/token')
      .send({ email: 'maria@mail.com', password: 'senha-errada' });

    expect(response.status).toBe(400);
  });

  test('bloqueia atualização sem token', async () => {
    const created = await registerUser();
    const response = await request(app)
      .put(`/v1/user/${created.body.id}`)
      .send({ firstname: 'Ana' });

    expect(response.status).toBe(401);
  });

  test('atualiza o usuário com token válido', async () => {
    const created = await registerUser();
    const token = await getToken({ email: 'outra@mail.com' });

    const response = await request(app)
      .put(`/v1/user/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ firstname: 'Ana', surname: 'Souza' });

    expect(response.status).toBe(204);

    const updated = await request(app).get(`/v1/user/${created.body.id}`);
    expect(updated.body.firstname).toBe('Ana');
    expect(updated.body.surname).toBe('Souza');
  });

  test('retorna 404 ao atualizar usuário inexistente', async () => {
    const token = await getToken();
    const response = await request(app)
      .put('/v1/user/9999')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstname: 'Ana' });

    expect(response.status).toBe(404);
  });

  test('deleta o usuário com token válido', async () => {
    const created = await registerUser();
    const token = await getToken({ email: 'outra@mail.com' });

    const response = await request(app)
      .delete(`/v1/user/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);

    const afterDelete = await request(app).get(`/v1/user/${created.body.id}`);
    expect(afterDelete.status).toBe(404);
  });
});

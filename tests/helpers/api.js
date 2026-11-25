const request = require('supertest');
const app = require('../../src/app');

const defaultUser = {
  firstname: 'Maria',
  surname: 'Silva',
  email: 'maria@mail.com',
  password: '123@123',
  confirmPassword: '123@123',
};

function registerUser(overrides = {}) {
  return request(app)
    .post('/v1/user')
    .send({ ...defaultUser, ...overrides });
}

async function getToken(overrides = {}) {
  const payload = { ...defaultUser, ...overrides };
  const created = await request(app).post('/v1/user').send(payload);

  if (created.status !== 201) {
    throw new Error(`Não foi possível criar o usuário de teste (status ${created.status})`);
  }

  const login = await request(app)
    .post('/v1/user/token')
    .send({ email: payload.email, password: payload.password });

  return login.body.token;
}

module.exports = {
  request,
  app,
  defaultUser,
  registerUser,
  getToken,
};

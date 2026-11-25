const { User } = require('../models');
const AppError = require('../utils/AppError');
const { generateToken } = require('../utils/token');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toPublicUser(user) {
  return {
    id: user.id,
    firstname: user.firstname,
    surname: user.surname,
    email: user.email,
  };
}

function validateEmail(email) {
  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim())) {
    throw new AppError(400, 'Informe um e-mail válido');
  }
}

async function getById(id) {
  const user = await User.findByPk(id);

  if (!user) {
    throw new AppError(404, 'Usuário não encontrado');
  }

  return toPublicUser(user);
}

async function create(data = {}) {
  const { firstname, surname, email, password, confirmPassword } = data;

  if (!firstname || !String(firstname).trim()) {
    throw new AppError(400, 'O nome é obrigatório');
  }

  if (!surname || !String(surname).trim()) {
    throw new AppError(400, 'O sobrenome é obrigatório');
  }

  validateEmail(email);

  if (!password) {
    throw new AppError(400, 'A senha é obrigatória');
  }

  if (String(password).length < 6) {
    throw new AppError(400, 'A senha deve ter no mínimo 6 caracteres');
  }

  if (password !== confirmPassword) {
    throw new AppError(400, 'A senha e a confirmação de senha não conferem');
  }

  const emailInUse = await User.findOne({ where: { email: email.trim() } });
  if (emailInUse) {
    throw new AppError(400, 'Já existe um usuário com este e-mail');
  }

  const user = await User.create({
    firstname: firstname.trim(),
    surname: surname.trim(),
    email: email.trim(),
    password,
  });

  return toPublicUser(user);
}

async function update(id, data = {}) {
  const user = await User.findByPk(id);

  if (!user) {
    throw new AppError(404, 'Usuário não encontrado');
  }

  const updates = {};

  if (data.firstname !== undefined) {
    if (!String(data.firstname).trim()) {
      throw new AppError(400, 'O nome não pode ser vazio');
    }
    updates.firstname = String(data.firstname).trim();
  }

  if (data.surname !== undefined) {
    if (!String(data.surname).trim()) {
      throw new AppError(400, 'O sobrenome não pode ser vazio');
    }
    updates.surname = String(data.surname).trim();
  }

  if (data.email !== undefined) {
    validateEmail(data.email);
    const email = data.email.trim();
    const emailInUse = await User.findOne({ where: { email } });

    if (emailInUse && emailInUse.id !== user.id) {
      throw new AppError(400, 'Já existe um usuário com este e-mail');
    }

    updates.email = email;
  }

  if (Object.keys(updates).length) {
    await user.update(updates);
  }
}

async function remove(id) {
  const user = await User.findByPk(id);

  if (!user) {
    throw new AppError(404, 'Usuário não encontrado');
  }

  await user.destroy();
}

async function authenticate(data = {}) {
  const { email, password } = data;

  if (!email || !password) {
    throw new AppError(400, 'E-mail e senha são obrigatórios');
  }

  const user = await User.findOne({ where: { email: String(email).trim() } });

  if (!user || !(await user.checkPassword(String(password)))) {
    throw new AppError(400, 'E-mail ou senha inválidos');
  }

  return {
    token: generateToken({ id: user.id, email: user.email }),
  };
}

module.exports = {
  getById,
  create,
  update,
  remove,
  authenticate,
};

const AppError = require('./AppError');

function parseLimit(value, defaultValue = 12) {
  if (value === undefined || value === '') {
    return defaultValue;
  }

  const limit = Number(value);
  if (!Number.isInteger(limit) || (limit <= 0 && limit !== -1)) {
    throw new AppError(400, 'O parâmetro limit deve ser -1 ou um número inteiro positivo');
  }

  return limit;
}

function parsePage(value, defaultValue = 1) {
  if (value === undefined || value === '') {
    return defaultValue;
  }

  const page = Number(value);
  if (!Number.isInteger(page) || page < 1) {
    throw new AppError(400, 'O parâmetro page deve ser um número inteiro maior ou igual a 1');
  }

  return page;
}

function parseFields(value) {
  if (typeof value !== 'string' || !value.trim()) {
    return [];
  }

  return value
    .split(',')
    .map((field) => field.trim())
    .filter(Boolean);
}

/**
 * Monta a resposta apenas com os campos pedidos (o id é sempre mantido).
 */
function pickFields(source, fields, defaultFields) {
  const plain = typeof source.get === 'function' ? source.get({ plain: true }) : source;
  const keys = fields.length ? Array.from(new Set(['id', ...fields])) : defaultFields;

  return keys.reduce((result, key) => {
    if (key in plain) {
      result[key] = plain[key];
    }
    return result;
  }, {});
}

function parseIdList(value, fieldName) {
  const ids = String(value)
    .split(',')
    .map((id) => Number(id.trim()));

  if (ids.some((id) => !Number.isInteger(id) || id <= 0)) {
    throw new AppError(400, `O parâmetro ${fieldName} deve conter uma lista de IDs válidos`);
  }

  return [...new Set(ids)];
}

module.exports = {
  parseLimit,
  parsePage,
  parseFields,
  pickFields,
  parseIdList,
};

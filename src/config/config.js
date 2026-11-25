require('dotenv').config();

/**
 * Configuração lida pelo Sequelize CLI (migrations/seeders) e pela aplicação.
 * Cada ambiente pode sobrescrever os valores definidos em `base`.
 */
const base = {
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME || 'digital_store',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  dialect: process.env.DB_DIALECT || 'mysql',
  logging: false,
  define: {
    underscored: true,
    timestamps: false,
  },
};

module.exports = {
  development: base,
  test: {
    ...base,
    database: process.env.DB_NAME_TEST || 'digital_store_test',
    storage: process.env.DB_STORAGE,
  },
  production: {
    ...base,
    logging: false,
  },
};

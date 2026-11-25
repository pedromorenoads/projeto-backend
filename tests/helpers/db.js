const app = require('../../src/app');
const { sequelize } = require('../../src/models');

async function resetDatabase() {
  await sequelize.sync({ force: true });
}

async function closeDatabase() {
  await sequelize.close();
}

module.exports = {
  app,
  sequelize,
  resetDatabase,
  closeDatabase,
};

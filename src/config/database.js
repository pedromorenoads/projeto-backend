const { Sequelize } = require('sequelize');
const environments = require('./config');

const config = environments[process.env.NODE_ENV || 'development'];

// O SQLite é usado apenas para rodar os testes sem depender de um servidor MySQL.
const sequelize =
  config.dialect === 'sqlite'
    ? new Sequelize({
        dialect: 'sqlite',
        storage: config.storage || ':memory:',
        logging: false,
      })
    : new Sequelize(config.database, config.username, config.password, config);

module.exports = sequelize;

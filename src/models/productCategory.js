const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Tabela de junção entre produtos e categorias (relação N:N).
const ProductCategory = sequelize.define(
  'ProductCategory',
  {
    product_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    category_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
  },
  {
    tableName: 'products_categories',
    timestamps: false,
  }
);

module.exports = ProductCategory;

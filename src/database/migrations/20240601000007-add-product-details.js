'use strict';

/** Campos extras usados pelo front-end da loja (marca, gênero e avaliações). */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'brand', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('products', 'gender', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('products', 'rating', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0,
    });

    await queryInterface.addColumn('products', 'reviews', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('products', 'reviews');
    await queryInterface.removeColumn('products', 'rating');
    await queryInterface.removeColumn('products', 'gender');
    await queryInterface.removeColumn('products', 'brand');
  },
};

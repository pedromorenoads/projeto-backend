'use strict';

// Categorias usadas pelos produtos de exemplo da loja (compatíveis com o front-end).
const categories = [
  { name: 'Tênis', slug: 'tenis' },
  { name: 'Casual', slug: 'casual' },
  { name: 'Corrida', slug: 'corrida' },
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert(
      'categories',
      categories.map((category) => ({
        ...category,
        use_in_menu: true,
        created_at: now,
        updated_at: now,
      }))
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      'categories',
      { slug: categories.map((category) => category.slug) },
      {}
    );
  },
};

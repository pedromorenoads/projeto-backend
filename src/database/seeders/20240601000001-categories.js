'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('categories', [
      {
        name: 'Shoes',
        slug: 'shoes',
        use_in_menu: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'Offers',
        slug: 'offers',
        use_in_menu: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'Black Friday',
        slug: 'black-friday',
        use_in_menu: false,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('categories', null, {});
  },
};

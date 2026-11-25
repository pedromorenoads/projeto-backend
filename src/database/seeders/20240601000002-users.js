'use strict';

// Usuário de demonstração: user@demo.com / 123@123
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('users', [
      {
        firstname: 'Usuário',
        surname: 'Demo',
        email: 'user@demo.com',
        password: '$2b$10$D3ph5JR7eAH7fIRnwCDFVekDbtu7Y7JnymovqH8oYIO.3dqfHBVBK',
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: 'user@demo.com' }, {});
  },
};

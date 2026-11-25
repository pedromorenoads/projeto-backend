process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.APP_URL = process.env.APP_URL || 'http://localhost:3000';

// Por padrão os testes usam SQLite em memória, sem precisar de um MySQL rodando.
if (!process.env.DB_DIALECT) {
  process.env.DB_DIALECT = 'sqlite';
}

if (!process.env.DB_STORAGE) {
  process.env.DB_STORAGE = ':memory:';
}

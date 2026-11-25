require('dotenv').config();

const baseUrl = (process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/$/, '');

const errorResponse = {
  description: 'Erro',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/Error' },
    },
  },
};

const unauthorizedResponse = {
  description: 'Token de autorização ausente ou inválido',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/Error' },
    },
  },
};

const notFoundResponse = {
  description: 'Recurso não encontrado',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/Error' },
    },
  },
};

const badRequestResponse = {
  description: 'Dados da requisição inválidos',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/Error' },
    },
  },
};

const idParameter = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'integer' },
};

const security = [{ bearerAuth: [] }];

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Digital Store API',
    version: '1.0.0',
    description: 'API REST de uma loja virtual com autenticação JWT.',
  },
  servers: [{ url: baseUrl }],
  tags: [
    { name: 'Usuários' },
    { name: 'Categorias' },
    { name: 'Produtos' },
  ],
  paths: {
    '/v1/user/token': {
      post: {
        tags: ['Usuários'],
        summary: 'Gera o token JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'user@mail.com' },
                  password: { type: 'string', example: '123@123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Token gerado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { token: { type: 'string' } },
                },
              },
            },
          },
          400: badRequestResponse,
        },
      },
    },
    '/v1/user': {
      post: {
        tags: ['Usuários'],
        summary: 'Cadastra um usuário',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['firstname', 'surname', 'email', 'password', 'confirmPassword'],
                properties: {
                  firstname: { type: 'string', example: 'Maria' },
                  surname: { type: 'string', example: 'Silva' },
                  email: { type: 'string', example: 'maria@mail.com' },
                  password: { type: 'string', example: '123@123' },
                  confirmPassword: { type: 'string', example: '123@123' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Usuário criado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
          },
          400: badRequestResponse,
        },
      },
    },
    '/v1/user/{id}': {
      get: {
        tags: ['Usuários'],
        summary: 'Busca um usuário pelo ID',
        parameters: [idParameter],
        responses: {
          200: {
            description: 'Usuário encontrado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
          },
          404: notFoundResponse,
        },
      },
      put: {
        tags: ['Usuários'],
        summary: 'Atualiza um usuário',
        security,
        parameters: [idParameter],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firstname: { type: 'string' },
                  surname: { type: 'string' },
                  email: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          204: { description: 'Usuário atualizado' },
          400: badRequestResponse,
          401: unauthorizedResponse,
          404: notFoundResponse,
        },
      },
      delete: {
        tags: ['Usuários'],
        summary: 'Remove um usuário',
        security,
        parameters: [idParameter],
        responses: {
          204: { description: 'Usuário removido' },
          401: unauthorizedResponse,
          404: notFoundResponse,
        },
      },
    },
    '/v1/category/search': {
      get: {
        tags: ['Categorias'],
        summary: 'Lista categorias com paginação e filtros',
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 12, example: -1 } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'fields', in: 'query', schema: { type: 'string', example: 'name,slug' } },
          { name: 'use_in_menu', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: {
            description: 'Lista de categorias',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/Category' } },
                    total: { type: 'integer' },
                    limit: { type: 'integer' },
                    page: { type: 'integer' },
                  },
                },
              },
            },
          },
          400: badRequestResponse,
        },
      },
    },
    '/v1/category/{id}': {
      get: {
        tags: ['Categorias'],
        summary: 'Busca uma categoria pelo ID',
        parameters: [idParameter],
        responses: {
          200: {
            description: 'Categoria encontrada',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } },
          },
          404: notFoundResponse,
        },
      },
      put: {
        tags: ['Categorias'],
        summary: 'Atualiza uma categoria',
        security,
        parameters: [idParameter],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CategoryInput' },
            },
          },
        },
        responses: {
          204: { description: 'Categoria atualizada' },
          400: badRequestResponse,
          401: unauthorizedResponse,
          404: notFoundResponse,
        },
      },
      delete: {
        tags: ['Categorias'],
        summary: 'Remove uma categoria',
        security,
        parameters: [idParameter],
        responses: {
          204: { description: 'Categoria removida' },
          401: unauthorizedResponse,
          404: notFoundResponse,
        },
      },
    },
    '/v1/category': {
      post: {
        tags: ['Categorias'],
        summary: 'Cadastra uma categoria',
        security,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CategoryInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Categoria criada',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } },
          },
          400: badRequestResponse,
          401: unauthorizedResponse,
        },
      },
    },
    '/v1/product/search': {
      get: {
        tags: ['Produtos'],
        summary: 'Lista produtos com paginação e filtros',
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 12, example: 30 } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'fields', in: 'query', schema: { type: 'string', example: 'name,images,price' } },
          { name: 'match', in: 'query', schema: { type: 'string', example: 'Tênis' } },
          { name: 'category_ids', in: 'query', schema: { type: 'string', example: '15,24' } },
          { name: 'price-range', in: 'query', schema: { type: 'string', example: '100-200' } },
          { name: 'option[45]', in: 'query', schema: { type: 'string', example: 'GG,PP' } },
        ],
        responses: {
          200: {
            description: 'Lista de produtos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
                    total: { type: 'integer' },
                    limit: { type: 'integer' },
                    page: { type: 'integer' },
                  },
                },
              },
            },
          },
          400: badRequestResponse,
        },
      },
    },
    '/v1/product/{id}': {
      get: {
        tags: ['Produtos'],
        summary: 'Busca um produto pelo ID',
        parameters: [idParameter],
        responses: {
          200: {
            description: 'Produto encontrado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } },
          },
          404: notFoundResponse,
        },
      },
      put: {
        tags: ['Produtos'],
        summary: 'Atualiza um produto',
        security,
        parameters: [idParameter],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductInput' },
            },
          },
        },
        responses: {
          204: { description: 'Produto atualizado' },
          400: badRequestResponse,
          401: unauthorizedResponse,
          404: notFoundResponse,
        },
      },
      delete: {
        tags: ['Produtos'],
        summary: 'Remove um produto',
        security,
        parameters: [idParameter],
        responses: {
          204: { description: 'Produto removido' },
          401: unauthorizedResponse,
          404: notFoundResponse,
        },
      },
    },
    '/v1/product': {
      post: {
        tags: ['Produtos'],
        summary: 'Cadastra um produto',
        security,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Produto criado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } },
          },
          400: badRequestResponse,
          401: unauthorizedResponse,
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Recurso não encontrado' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          firstname: { type: 'string', example: 'Maria' },
          surname: { type: 'string', example: 'Silva' },
          email: { type: 'string', example: 'maria@mail.com' },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Shoes' },
          slug: { type: 'string', example: 'shoes' },
          use_in_menu: { type: 'boolean', example: true },
        },
      },
      CategoryInput: {
        type: 'object',
        required: ['name', 'slug'],
        properties: {
          name: { type: 'string', example: 'Shoes' },
          slug: { type: 'string', example: 'shoes' },
          use_in_menu: { type: 'boolean', example: true },
        },
      },
      ProductImage: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          content: { type: 'string', example: 'https://store.com/media/product-01/image-01.png' },
        },
      },
      ProductOption: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Cor' },
          shape: { type: 'string', enum: ['square', 'circle'], example: 'square' },
          radius: { type: 'integer', example: 4 },
          type: { type: 'string', enum: ['text', 'color'], example: 'text' },
          values: { type: 'array', items: { type: 'string' }, example: ['PP', 'GG', 'M'] },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          enabled: { type: 'boolean', example: true },
          name: { type: 'string', example: 'Produto 01' },
          slug: { type: 'string', example: 'produto-01' },
          stock: { type: 'integer', example: 10 },
          description: { type: 'string', example: 'Descrição do produto 01' },
          price: { type: 'number', example: 119.9 },
          price_with_discount: { type: 'number', example: 99.9 },
          category_ids: { type: 'array', items: { type: 'integer' }, example: [1, 15] },
          images: { type: 'array', items: { $ref: '#/components/schemas/ProductImage' } },
          options: { type: 'array', items: { $ref: '#/components/schemas/ProductOption' } },
        },
      },
      ProductInput: {
        type: 'object',
        required: ['name', 'slug', 'price', 'price_with_discount'],
        properties: {
          enabled: { type: 'boolean', example: true },
          name: { type: 'string', example: 'Produto 01' },
          slug: { type: 'string', example: 'produto-01' },
          stock: { type: 'integer', example: 10 },
          description: { type: 'string', example: 'Descrição do produto 01' },
          price: { type: 'number', example: 119.9 },
          price_with_discount: { type: 'number', example: 99.9 },
          category_ids: { type: 'array', items: { type: 'integer' }, example: [1, 15] },
          images: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                type: { type: 'string', example: 'image/png' },
                content: { type: 'string', example: 'base64 da imagem' },
                deleted: { type: 'boolean' },
              },
            },
          },
          options: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                title: { type: 'string', example: 'Cor' },
                shape: { type: 'string', enum: ['square', 'circle'] },
                radius: { type: 'string', example: '4px' },
                type: { type: 'string', enum: ['text', 'color'] },
                value: { type: 'array', items: { type: 'string' } },
                values: { type: 'array', items: { type: 'string' } },
                deleted: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
  },
};

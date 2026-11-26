# Digital Store API

API REST de uma loja virtual desenvolvida como projeto final do curso de Desenvolvimento Full Stack. O projeto implementa o CRUD de usuários, categorias e produtos, relacionamento N:N entre produtos e categorias, upload de imagens, filtros de busca e autenticação com JWT.

## Tecnologias

- Node.js + Express
- Sequelize (ORM) + MySQL
- Dotenv
- JWT (jsonwebtoken)
- Bcrypt
- Swagger (swagger-ui-express)
- Jest + Supertest
- Nodemon

## Estrutura do projeto

```
project-root/
├── public/
│   └── uploads/              # imagens enviadas em base64
├── src/
│   ├── config/               # conexão com o banco e configuração do Swagger
│   ├── controllers/          # camada HTTP (recebe a requisição e devolve a resposta)
│   ├── database/
│   │   ├── migrations/       # criação das tabelas
│   │   └── seeders/          # dados de exemplo
│   ├── middleware/           # autenticação JWT e tratamento de erros
│   ├── models/               # modelos e associações do Sequelize
│   ├── routes/               # definição das rotas /v1
│   ├── services/             # regras de negócio
│   ├── utils/                # helpers (erros, paginação, arquivos, token)
│   ├── app.js                # configuração do Express
│   └── server.js             # inicialização do servidor
├── tests/                    # testes de integração
├── .env.example
├── .sequelizerc
└── package.json
```

## Pré-requisitos

- Node.js 18 ou superior
- npm
- MySQL 8

## Configuração

1. Instale as dependências:

```bash
npm install
```

2. Crie o arquivo de variáveis de ambiente a partir do exemplo:

```bash
# Linux/macOS
cp .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env
```

3. Crie o banco de dados no MySQL:

```sql
CREATE DATABASE digital_store;
```

Ajuste `DB_USER`, `DB_PASSWORD` e `DB_PORT` no `.env` conforme a instalação local do MySQL.

4. Rode as migrations:

```bash
npm run db:migrate
```

5. (Opcional) Popule o banco com dados de exemplo:

```bash
npm run db:seed
```

Os seeders criam categorias, um catálogo de produtos de exemplo (com imagens em `public/seed-images`) e um usuário de demonstração:

```
email: user@demo.com
senha: 123@123
```

6. Inicie o servidor:

```bash
npm run dev
```

A API fica disponível em `http://localhost:3000` e a documentação em `http://localhost:3000/api-docs`.

## Variáveis de ambiente

| Variável | Descrição | Exemplo |
| --- | --- | --- |
| `PORT` | Porta do servidor | `3000` |
| `APP_URL` | URL usada para montar o endereço público das imagens | `http://localhost:3000` |
| `DB_DIALECT` | Dialeto do banco | `mysql` |
| `DB_HOST` | Host do MySQL | `localhost` |
| `DB_PORT` | Porta do MySQL | `3306` |
| `DB_NAME` | Nome do banco | `digital_store` |
| `DB_USER` | Usuário do banco | `root` |
| `DB_PASSWORD` | Senha do banco | `root` |
| `JWT_SECRET` | Segredo usado para assinar o token | `troque-por-um-segredo-forte` |
| `JWT_EXPIRES_IN` | Tempo de validade do token | `1d` |

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Sobe o servidor com Nodemon |
| `npm start` | Sobe o servidor sem Nodemon |
| `npm test` | Roda os testes usando SQLite em memória |
| `npm run test:mysql` | Roda os testes contra o MySQL |
| `npm run db:migrate` | Executa as migrations |
| `npm run db:migrate:undo` | Desfaz todas as migrations |
| `npm run db:seed` | Executa os seeders |
| `npm run db:seed:undo` | Desfaz os seeders |

## Autenticação

A geração do token é feita em `POST /v1/user/token`:

```json
{
  "email": "user@demo.com",
  "password": "123@123"
}
```

A resposta contém o token:

```json
{
  "token": "<JWT>"
}
```

As rotas de escrita (`POST`, `PUT` e `DELETE`) exigem o cabeçalho:

```
Authorization: Bearer <JWT>
```

O cadastro de usuário (`POST /v1/user`) e a geração de token (`POST /v1/user/token`) são as únicas rotas de escrita públicas. Quando o token não é enviado ou é inválido, a API responde com **401 Unauthorized**.

## Endpoints

### Usuários

| Método | Rota | Autenticação | Status possíveis |
| --- | --- | --- | --- |
| GET | `/v1/user/:id` | Não | 200, 404 |
| POST | `/v1/user` | Não | 201, 400 |
| PUT | `/v1/user/:id` | Sim | 204, 400, 401, 404 |
| DELETE | `/v1/user/:id` | Sim | 204, 401, 404 |
| POST | `/v1/user/token` | Não | 200, 400 |

### Categorias

| Método | Rota | Autenticação | Status possíveis |
| --- | --- | --- | --- |
| GET | `/v1/category/search` | Não | 200, 400 |
| GET | `/v1/category/:id` | Não | 200, 404 |
| POST | `/v1/category` | Sim | 201, 400, 401 |
| PUT | `/v1/category/:id` | Sim | 204, 400, 401, 404 |
| DELETE | `/v1/category/:id` | Sim | 204, 401, 404 |

### Produtos

| Método | Rota | Autenticação | Status possíveis |
| --- | --- | --- | --- |
| GET | `/v1/product/search` | Não | 200, 400 |
| GET | `/v1/product/:id` | Não | 200, 404 |
| POST | `/v1/product` | Sim | 201, 400, 401 |
| PUT | `/v1/product/:id` | Sim | 204, 400, 401, 404 |
| DELETE | `/v1/product/:id` | Sim | 204, 401, 404 |

Em `GET /v1/product/:id`, o parâmetro pode ser o ID numérico ou o `slug` do produto (usado nas URLs do front-end).

## Filtros de busca

### Categorias — `GET /v1/category/search`

- `limit`: itens por página (`12` por padrão, use `-1` para trazer todos)
- `page`: página atual (`1` por padrão)
- `fields`: campos separados por vírgula (`name,slug`)
- `use_in_menu`: `true` ou `false`

### Produtos — `GET /v1/product/search`

- `limit`: itens por página (`12` por padrão, use `-1` para trazer todos)
- `page`: página atual (`1` por padrão)
- `fields`: campos separados por vírgula (`name,images,price`)
- `match`: busca por nome ou descrição
- `category_ids`: IDs de categorias separados por vírgula (`15,24`)
- `price-range`: faixa de preço (`100-200`)
- `option[ID]`: filtra pelo valor de uma opção do produto (`option[45]=GG,PP`)

Exemplo:

```
GET /v1/product/search?match=tênis&category_ids=1,2&price-range=100-300&option[1]=GG&limit=12&page=1
```

## Modelo de dados

| Tabela | Colunas principais |
| --- | --- |
| `users` | `id`, `firstname`, `surname`, `email`, `password` (hash bcrypt), `created_at`, `updated_at` |
| `categories` | `id`, `name`, `slug`, `use_in_menu`, `created_at`, `updated_at` |
| `products` | `id`, `enabled`, `name`, `slug`, `use_in_menu`, `stock`, `description`, `price`, `price_with_discount`, `brand`, `gender`, `rating`, `reviews`, `created_at`, `updated_at` |
| `product_images` | `id`, `product_id`, `enabled`, `path` |
| `product_options` | `id`, `product_id`, `title`, `shape`, `radius`, `type`, `values` |
| `products_categories` | `product_id`, `category_id` |

As chaves estrangeiras usam `ON DELETE CASCADE`, então ao excluir um produto as imagens, opções e vínculos com categorias também são removidos.

## Imagens dos produtos

No cadastro, cada imagem é enviada em base64 (`content`) junto com o `type` (ex.: `image/png`). O arquivo é gravado em `public/uploads` e o caminho relativo é salvo na tabela `product_images`.

Na resposta, o campo `content` volta como URL completa, montada a partir de `APP_URL`:

```json
{
  "id": 1,
  "content": "http://localhost:3000/uploads/1712345678-arquivo.png"
}
```

Na atualização, uma imagem pode ser removida (`deleted: true`), substituída (enviando um novo `content`) ou mantida. Também é aceito um `content` que já seja uma URL externa.

## Testes

Os testes de integração cobrem os CRUDs, a autenticação, os filtros de busca, a paginação e o upload de imagens.

```bash
npm test
```

Por padrão a suíte usa SQLite em memória, então não é necessário ter o MySQL rodando. Para rodar contra o MySQL, crie o banco de testes e execute:

```sql
CREATE DATABASE digital_store_test;
```

```bash
npm run test:mysql
```

## Decisões de implementação

- A arquitetura segue o padrão MVC com uma camada de `services`, mantendo os controllers apenas responsáveis pela requisição/resposta.
- O hash da senha é gerado por um hook do Sequelize, garantindo que nenhuma senha seja salva em texto puro.
- A criação e a atualização de produtos usam transações para evitar registros incompletos caso alguma etapa falhe.
- O campo `radius` é gravado como inteiro (o valor `"4px"`, por exemplo, é convertido para `4`), conforme o tipo definido na modelagem.
- As datas de criação e atualização usam as colunas `created_at` e `updated_at`, com `timestamps: true` nos modelos que precisam delas.

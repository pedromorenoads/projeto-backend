require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const swaggerDocument = require('./config/swagger');
const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
// Limite maior para aceitar imagens enviadas em base64.
app.use(express.json({ limit: '15mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));
app.use('/seed-images', express.static(path.join(__dirname, '..', 'public', 'seed-images')));

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Digital Store API',
    docs: '/api-docs',
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

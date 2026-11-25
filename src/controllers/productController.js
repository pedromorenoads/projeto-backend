const productService = require('../services/productService');
const asyncHandler = require('../utils/asyncHandler');

const search = asyncHandler(async (req, res) => {
  const result = await productService.search(req.query, req.originalUrl.split('?')[1]);
  res.status(200).json(result);
});

const getById = asyncHandler(async (req, res) => {
  const product = await productService.getById(req.params.id);
  res.status(200).json(product);
});

const create = asyncHandler(async (req, res) => {
  const product = await productService.create(req.body);
  res.status(201).json(product);
});

const update = asyncHandler(async (req, res) => {
  await productService.update(req.params.id, req.body);
  res.status(204).send();
});

const remove = asyncHandler(async (req, res) => {
  await productService.remove(req.params.id);
  res.status(204).send();
});

module.exports = {
  search,
  getById,
  create,
  update,
  remove,
};

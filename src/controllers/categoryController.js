const categoryService = require('../services/categoryService');
const asyncHandler = require('../utils/asyncHandler');

const search = asyncHandler(async (req, res) => {
  const result = await categoryService.search(req.query);
  res.status(200).json(result);
});

const getById = asyncHandler(async (req, res) => {
  const category = await categoryService.getById(req.params.id);
  res.status(200).json(category);
});

const create = asyncHandler(async (req, res) => {
  const category = await categoryService.create(req.body);
  res.status(201).json(category);
});

const update = asyncHandler(async (req, res) => {
  await categoryService.update(req.params.id, req.body);
  res.status(204).send();
});

const remove = asyncHandler(async (req, res) => {
  await categoryService.remove(req.params.id);
  res.status(204).send();
});

module.exports = {
  search,
  getById,
  create,
  update,
  remove,
};

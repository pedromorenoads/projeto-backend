const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');

const getById = asyncHandler(async (req, res) => {
  const user = await userService.getById(req.params.id);
  res.status(200).json(user);
});

const create = asyncHandler(async (req, res) => {
  const user = await userService.create(req.body);
  res.status(201).json(user);
});

const update = asyncHandler(async (req, res) => {
  await userService.update(req.params.id, req.body);
  res.status(204).send();
});

const remove = asyncHandler(async (req, res) => {
  await userService.remove(req.params.id);
  res.status(204).send();
});

const login = asyncHandler(async (req, res) => {
  const result = await userService.authenticate(req.body);
  res.status(200).json(result);
});

module.exports = {
  getById,
  create,
  update,
  remove,
  login,
};

const userRoutes = require('express').Router();
const {
  getUsers, getUser, createUser, updateUserAvatar, updateUserName,
} = require('../controllers/users');

userRoutes.get('/', getUsers);
userRoutes.get('/:userId', getUser);
userRoutes.post('/', createUser);
userRoutes.patch('/me', updateUserName);
userRoutes.patch('/me/avatar', updateUserAvatar);

module.exports = userRoutes;

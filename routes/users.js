const userRoutes = require('express').Router();
const {
  getUsers, getUser, updateUserAvatar, updateUserName, getMe,
} = require('../controllers/users');
const { validateUserId, validateUserInfo, validateAvatar } = require('../utils/validators/userValidator');

userRoutes.get('/', getUsers);
userRoutes.get('/:id', validateUserId, getUser);
userRoutes.patch('/me', validateUserInfo, updateUserName);
userRoutes.patch('/me/avatar', validateAvatar, updateUserAvatar);
userRoutes.get('/me', getMe);

module.exports = userRoutes;

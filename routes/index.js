const protectedRoutes = require('express').Router();
const commonRoutes = require('express').Router();
const { login, createUser } = require('../controllers/users');
const userRoutes = require('./users');
const cardRoutes = require('./cards');
const { validateLogin, validateRegister } = require('../utils/validators/userValidator');

commonRoutes.post('/signin', validateLogin, login);
commonRoutes.post('/signup', validateRegister, createUser);

protectedRoutes.use('/users', userRoutes);
protectedRoutes.use('/cards', cardRoutes);

module.exports = {
  commonRoutes,
  protectedRoutes,
};

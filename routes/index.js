const mainRoutes = require('express').Router();
const userRoutes = require('./users');
const cardRoutes = require('./cards');

mainRoutes.use('/users', userRoutes);
mainRoutes.use('/cards', cardRoutes);

module.exports = mainRoutes;

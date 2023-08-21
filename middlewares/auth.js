const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../utils/errors/unauthorized-err');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  let payload;
  try {
    const { authorization } = req.cookies;
    if (!authorization) {
      return next(new UnauthorizedError('Необходима авторизация'));
    }
    payload = jwt.verify(authorization, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (err) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }
  req.user = payload;
  next();
};

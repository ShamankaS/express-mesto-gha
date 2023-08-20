const { mongoose } = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const BadRequestError = require('../utils/errors/bad-request-err');
const NotFoundError = require('../utils/errors/not-found-err');
const ConflictError = require('../utils/errors/conflict-err');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUsers = async (req, res, next) => {
  try {
    const user = await User.find({});
    res.send(user);
  } catch (err) {
    next(err);
  }
};

module.exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).orFail();
    res.send(user);
  } catch (err) {
    if (err instanceof mongoose.Error.DocumentNotFoundError) {
      next(new NotFoundError('Пользователь не найден'));
    } else if (err instanceof mongoose.Error.CastError) {
      next(new BadRequestError('Переданы некорректные данные'));
    } else {
      next(err);
    }
  }
};

module.exports.createUser = async (req, res, next) => {
  try {
    const {
      name, about, avatar, email, password,
    } = req.body;
    const hash = await bcrypt.hash(password, 10);
    await User.create({
      name, about, avatar, email, password: hash,
    });
    res.send({
      message: 'Пользователь успешно создан',
    });
  } catch (err) {
    if (err.code === 11000) {
      next(new ConflictError('Пользователь с данным email уже зарегистрирован'));
    } else if (err instanceof mongoose.Error.CastError) {
      next(new BadRequestError('Переданы некорректные данные'));
    } else {
      next(err);
    }
  }
};

const updateUserData = async (req, res, next, data) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      data,
      { new: true, runValidators: true },
    ).orFail();
    res.send(user);
  } catch (err) {
    if (err instanceof mongoose.Error.DocumentNotFoundError) {
      next(new NotFoundError('Пользователь по указанному _id не найден'));
    } else if (err instanceof mongoose.Error.ValidationError) {
      next(new BadRequestError('Переданы некорректные данные'));
    } else {
      next(err);
    }
  }
};

module.exports.updateUserName = (req, res) => {
  const { name, about } = req.body;
  updateUserData(req, res, { name, about });
};

module.exports.updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  updateUserData(req, res, { avatar });
};

module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findUserByCredentials(email, password);
    const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
    res.status(200).cookie('jwt', token, {
      maxAge: 3600000 * 24 * 7,
      httpOnly: true,
    }).send({ message: 'Авторизация прошла успешно' });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      next(new BadRequestError(err.message));
    } else {
      next(err);
    }
  }
};

module.exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    res.send(user);
  } catch (err) {
    return next(err);
  }
};

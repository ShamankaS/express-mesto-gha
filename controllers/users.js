const { mongoose } = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { SUCCESS_CREATED_CODE } = require('../utils/constants');
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
    const user = await User.findById(req.params.id).orFail();
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
    const createdUser = await User.create({
      name, about, avatar, email, password: hash,
    });
    // удаляем пароль созданного пользователя из ответа
    const user = createdUser.toObject();
    delete user.password;
    res.status(SUCCESS_CREATED_CODE).send(user);
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

const updateUserData = async (req, res, data, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findByIdAndUpdate(
      userId,
      data,
      { new: true, runValidators: true },
    );
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

module.exports.updateUserName = (req, res, next) => {
  const { name, about } = req.body;
  updateUserData(req, res, { name, about }, next);
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
    return res.cookie('authorization', token, {
      maxAge: 3600000 * 24 * 7,
      httpOnly: true,
      secure: NODE_ENV === 'production',
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
    const { _id } = req.user;
    const user = await User.findOne({ _id });
    res.send(user);
  } catch (err) {
    return next(err);
  }
};

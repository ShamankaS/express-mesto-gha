const { mongoose } = require('mongoose');
const User = require('../models/user');
const { DEFAULT_ERROR_CODE, NOT_FOUND_ERROR_CODE, INCORRECT_DATA_ERROR_CODE } = require('../utils/constants');

module.exports.getUsers = async (req, res) => {
  try {
    const user = await User.find({});
    res.send(user);
  } catch (err) {
    if (err instanceof mongoose.Error.DocumentNotFoundError) {
      return res.status(NOT_FOUND_ERROR_CODE).send({
        message: 'Пользователи не найдены',
      });
    }
    res.status(DEFAULT_ERROR_CODE).send({
      message: 'На сервере произошла ошибка',
    });
  }
};

module.exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).orFail();
    res.send(user);
  } catch (err) {
    if (err instanceof mongoose.Error.DocumentNotFoundError) {
      return res.status(NOT_FOUND_ERROR_CODE).send({
        message: 'Пользователь не найден',
      });
    }
    if (err instanceof mongoose.Error.CastError) {
      return res.status(INCORRECT_DATA_ERROR_CODE).send({
        message: 'Переданы некорректные данные',
      });
    }
    res.status(DEFAULT_ERROR_CODE).send({
      message: 'На сервере произошла ошибка',
    });
  }
};

module.exports.createUser = async (req, res) => {
  try {
    const { name, about, avatar } = req.body;
    const createdUser = await User.create({ name, about, avatar });
    res.send(createdUser);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      return res.status(INCORRECT_DATA_ERROR_CODE).send({
        message: 'Переданы некорректные данные',
      });
    }
    res.status(DEFAULT_ERROR_CODE).send({
      message: 'На сервере произошла ошибка',
    });
  }
};

async function updateUserData(req, res) {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      req.body,
      { new: true, runValidators: true },
    ).orFail();
    res.send(user);
  } catch (err) {
    if (err instanceof mongoose.Error.DocumentNotFoundError) {
      return res.status(NOT_FOUND_ERROR_CODE).send({
        message: 'Пользователь по указанному _id не найден',
      });
    }
    if (err instanceof mongoose.Error.ValidationError) {
      return res.status(INCORRECT_DATA_ERROR_CODE).send({
        message: 'Переданы некорректные данные',
      });
    }
    res.status(DEFAULT_ERROR_CODE).send({
      message: 'На сервере произошла ошибка',
    });
  }
}

module.exports.updateUserName = async (req, res) => updateUserData(req, res);

module.exports.updateUserAvatar = async (req, res) => updateUserData(req, res);

const User = require('../models/user');
const { DEFAULT_ERROR_CODE, NOT_FOUND_ERROR_CODE, INCORRECT_DATA_ERROR_CODE } = require('../utils/constants');

module.exports.getUsers = async (req, res) => {
  try {
    const user = await User.find({});
    if (user.length === 0) {
      return res.send({
        message: 'В базе данных отсутствуют пользователи',
      });
    }
    res.send(user);
  } catch (err) {
    res.status(DEFAULT_ERROR_CODE).send({
      message: 'На сервере произошла ошибка',
    });
  }
};

module.exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    res.send(user);
  } catch (err) {
    console.log(err.name);
    if (err.name === 'CastError') {
      return res.status(INCORRECT_DATA_ERROR_CODE).send({
        message: 'Пользователь по указанному id не найден',
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
    if (err.name === 'ValidationError') {
      return res.status(INCORRECT_DATA_ERROR_CODE).send({
        message: 'Переданы некорректные данные при создании пользователя',
      });
    }
    res.status(DEFAULT_ERROR_CODE).send({
      message: 'На сервере произошла ошибка',
    });
  }
};

module.exports.updateUserName = async (req, res) => {
  try {
    const { name, about } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: true, runValidators: true },
    );
    res.send(updatedUser);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(NOT_FOUND_ERROR_CODE).send({
        message: 'Пользователь по указанному _id не найден',
      });
    }
    if (err.name === 'ValidationError') {
      return res.status(INCORRECT_DATA_ERROR_CODE).send({
        message: 'Переданы некорректные данные при обновлении профиля',
      });
    }
    res.status(DEFAULT_ERROR_CODE).send({
      message: 'На сервере произошла ошибка',
    });
  }
};

module.exports.updateUserAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: true },
    );
    res.send(updatedUser);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(NOT_FOUND_ERROR_CODE).send({
        message: 'Пользователь по указанному _id не найден',
      });
    }
    if (err.name === 'ValidationError') {
      return res.status(INCORRECT_DATA_ERROR_CODE).send({
        message: 'Переданы некорректные данные при обновлении аватара',
      });
    }
    res.status(DEFAULT_ERROR_CODE).send({
      message: 'На сервере произошла ошибка',
    });
  }
};

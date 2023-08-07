const Card = require('../models/card');
const { DEFAULT_ERROR_CODE, NOT_FOUND_ERROR_CODE, INCORRECT_DATA_ERROR_CODE } = require('../utils/constants');

module.exports.getCards = async (req, res) => {
  try {
    const cards = await Card.find({});
    if (cards.length === 0) {
      return res.send({
        message: 'В базе данных отсутствуют карточки',
      });
    }
    res.send(cards);
  } catch (err) {
    res.status(DEFAULT_ERROR_CODE).send({
      message: 'На сервере произошла ошибка',
    });
  }
};

module.exports.createCard = async (req, res) => {
  try {
    const { name, link } = req.body;
    await Card.create({ name, link, owner: req.user._id });
    res.send({
      message: 'Карточка успешно создана',
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(INCORRECT_DATA_ERROR_CODE).send({
        message: 'Переданы некорректные данные при создании карточки',
      });
    }
    res.status(DEFAULT_ERROR_CODE).send({
      message: 'На сервере произошла ошибка',
    });
  }
};

module.exports.deleteCard = async (req, res) => {
  try {
    await Card.findByIdAndDelete(req.params.cardId);
    res.send({
      message: 'Карточка удалена',
    });
  } catch (err) {
    console.log(err.name);
    if (err.name === 'CastError') {
      return res.status(NOT_FOUND_ERROR_CODE).send({
        message: `Карточка по указанному _id: ${req.params.cardId} не найдена`,
      });
    }
    res.status(DEFAULT_ERROR_CODE).send({
      message: 'На сервере произошла ошибка',
    });
  }
};

const handleCardLike = async (req, res, options) => {
  try {
    const action = options.addLike ? '$addToSet' : '$pull';
    await Card.findByIdAndUpdate(
      req.params.cardId,
      { [action]: { likes: req.user._id } },
      { new: true },
    ).populate([
      { path: 'likes', model: 'user' },
    ]);
    res.send({
      message: 'Лайк на карточке успешно поставлен/снят',
    });
  } catch (err) {
    console.log(err);
    if (err.name === 'CastError') {
      return res.status(NOT_FOUND_ERROR_CODE).send({
        message: 'Карточка по указанному _id не найдена',
      });
    }
    if (err.name === 'ValidationError') {
      return res.status(INCORRECT_DATA_ERROR_CODE).send({
        message: 'Переданы некорректные данные для постановки/снятии лайка',
      });
    }
    res.status(DEFAULT_ERROR_CODE).send({
      message: 'На сервере произошла ошибка',
    });
  }
};

module.exports.likeCard = (req, res) => {
  handleCardLike(req, res, { addLike: true });
};

module.exports.dislikeCard = (req, res) => {
  handleCardLike(req, res, { addLike: false });
};

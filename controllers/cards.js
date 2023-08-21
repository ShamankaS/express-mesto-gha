const { mongoose } = require('mongoose');
const Card = require('../models/card');
const { SUCCESS_CREATED_CODE } = require('../utils/constants');
const BadRequestError = require('../utils/errors/bad-request-err');
const NotFoundError = require('../utils/errors/not-found-err');
const ForbiddenError = require('../utils/errors/forbidden-err');

module.exports.getCards = async (req, res, next) => {
  try {
    const cards = await Card.find({});
    res.send(cards);
  } catch (err) {
    next(err);
  }
};

module.exports.createCard = async (req, res, next) => {
  try {
    const { name, link } = req.body;
    const createdCard = await Card.create({ name, link, owner: req.user._id });
    res.status(SUCCESS_CREATED_CODE).send(createdCard);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      next(new BadRequestError(err.message));
    } else {
      next(err);
    }
  }
};

module.exports.deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.cardId).orFail();
    if (card.owner.toString() === req.user._id) {
      await Card.deleteOne(card);
      res.send({
        message: 'Карточка удалена',
      });
    } else {
      next(new ForbiddenError('Нельзя удалять карточку другого пользователя'));
    }
  } catch (err) {
    if (err instanceof mongoose.Error.DocumentNotFoundError) {
      next(new NotFoundError('Карточка не найдена'));
    } else if (err instanceof mongoose.Error.CastError) {
      next(new BadRequestError('Карточка не найдена'));
    } else {
      next(err);
    }
  }
};

const handleCardLike = async (req, res, next, options) => {
  try {
    const action = options.addLike ? '$addToSet' : '$pull';
    const updatedCard = await Card.findByIdAndUpdate(
      req.params.cardId,
      { [action]: { likes: req.user._id } },
      { new: true },
    ).populate([
      { path: 'likes', model: 'user' },
    ]).orFail();
    res.send(updatedCard);
  } catch (err) {
    if (err instanceof mongoose.Error.DocumentNotFoundError) {
      next(new NotFoundError('Карточка не найдена'));
    } else if (err instanceof mongoose.Error.CastError) {
      next(new BadRequestError('Переданы некорректные данные'));
    } else {
      next(err);
    }
  }
};

module.exports.likeCard = (req, res, next) => {
  handleCardLike(req, res, next, { addLike: true });
};

module.exports.dislikeCard = (req, res, next) => {
  handleCardLike(req, res, next, { addLike: false });
};

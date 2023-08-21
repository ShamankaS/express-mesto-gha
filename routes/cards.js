const cardRoutes = require('express').Router();
const {
  getCards, createCard, deleteCard, likeCard, dislikeCard,
} = require('../controllers/cards');
const { validateCard, validateCardId } = require('../utils/validators/cardValidator');

cardRoutes.get('/', getCards);
cardRoutes.post('/', validateCard, createCard);
cardRoutes.delete('/:cardId', validateCardId, deleteCard);
cardRoutes.put('/:cardId/likes', validateCardId, likeCard);
cardRoutes.delete('/:cardId/likes', validateCardId, dislikeCard);

module.exports = cardRoutes;

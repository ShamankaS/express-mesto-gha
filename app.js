const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/users');
const cardRoutes = require('./routes/cards');
const { NOT_FOUND_ERROR_CODE } = require('./utils/constants');

const { PORT = 3000 } = process.env;

const app = express();
mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use(bodyParser.json());

app.use((req, res, next) => {
  req.user = {
    _id: '64d0c8f65326e2a6213ac1ea',
  };
  next();
});

app.use('/users', userRoutes);
app.use('/cards', cardRoutes);

app.use('*', (req, res) => {
  res.status(NOT_FOUND_ERROR_CODE).send({
    message: 'Запрашиваемый адрес не найден. Проверьте URL и метод запроса',
  });
});

app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
});

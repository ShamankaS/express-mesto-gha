require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');

const cookieParser = require('cookie-parser');

const mainRoutes = require('./routes/index');
const auth = require('./middlewares/auth');
const errorsHandler = require('./middlewares/error');

const { login, createUser } = require('./controllers/users');
const { validateLogin, validateRegister } = require('./utils/validators/userValidator');
const NotFoundError = require('./utils/errors/not-found-err');

const { PORT = 3000 } = process.env;

const app = express();
mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use(bodyParser.json());

app.use(cookieParser());

app.post('/signin', validateLogin, login);
app.post('/signup', validateRegister, createUser);

app.use(auth);
app.use('/', mainRoutes);

app.use('*', () => {
  throw new NotFoundError('Запрашиваемый адрес не найден. Проверьте URL и метод запроса');
});

app.use(errors());
app.use(errorsHandler);

app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
});

const dotenv = require('dotenv');

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('./models/connexion');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dogsRouter = require('./routes/dogs');
var placesRouter = require('./routes/places')
var friendsRouter = require('./routes/friends')
var generateDataRouter = require('./routes/generateData');

var app = express();

const fileUpload = require('express-fileupload');
app.use(fileUpload());
const cors = require('cors');
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dogs', dogsRouter);
app.use('/places', placesRouter);
app.use('/friends', friendsRouter);
app.use('/generatedata', generateDataRouter);

module.exports = app;

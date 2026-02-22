const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { frontendUrl } = require('./config');

const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());

// On ne dev pas le frontend mais on utilise CORS quand meme
// Faut tester par le froontend
app.use(cors({
  origin: frontendUrl,
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// Analyse des cookies
app.use(cookieParser());

// Routes
app.use('/', routes);

// Gestion des erreurs
app.use(notFound);
app.use(errorHandler);

module.exports = app;

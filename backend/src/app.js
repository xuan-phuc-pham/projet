const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { frontendUrl } = require('./config');

const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: frontendUrl,
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// Cookie parsing
app.use(cookieParser());

// Routes
app.use('/', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;

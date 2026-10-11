const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  logger.error(message, {
    statusCode,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    error: {
      message,
      stack: err.stack,
    },
  });
}

module.exports = errorHandler;

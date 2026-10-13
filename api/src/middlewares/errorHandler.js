const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const requestId = uuidv4();
  
  const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

  logger.error(err.message || 'Internal server error', {
    requestId,
    statusCode,
    path: req.path,
    method: req.method,
    stack: err.stack,
  });

  const response = {
    error: {
      message: isDevelopment ? err.message : 'An error occurred',
      requestId,
    },
  };

  if (isDevelopment && process.env.NODE_ENV !== 'production') {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;

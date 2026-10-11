const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../utils/errors');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid authorization header'));
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.decode(token);
    
    if (!decoded) {
      return next(new UnauthorizedError('Invalid token'));
    }

    req.user = decoded;
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid token'));
  }
}

module.exports = authenticate;

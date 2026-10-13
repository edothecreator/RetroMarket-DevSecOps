const { ForbiddenError } = require('../utils/errors');

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return next(new ForbiddenError('Access denied'));
    }

    const hasRole = allowedRoles.some(role => req.user.roles.includes(role));

    if (!hasRole) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
}

module.exports = authorize;

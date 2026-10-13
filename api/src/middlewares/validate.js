const { BadRequestError } = require('../utils/errors');

function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const data = source === 'query' ? req.query : req.body;
      const validated = schema.parse(data);
      
      if (source === 'query') {
        req.query = validated;
      } else {
        req.body = validated;
      }
      
      next();
    } catch (error) {
      if (error.errors) {
        const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        next(new BadRequestError(messages));
      } else {
        next(new BadRequestError(error.message));
      }
    }
  };
}

module.exports = validate;

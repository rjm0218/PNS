const { validationResult } = require('express-validator');
const { error } = require('./response');
const log = require('./logger');

exports.validateAndCatch = (validators, handler) => [
  ...validators,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return error(res, 'Validation error', 400, errors.array());
    try {
      await handler(req, res, next);
    } catch (err) {
      log(err.message);
      return error(res, err.message, err.statusCode || 500, err.details);
    }
  }
];
const { error } = require('../utils/response');

exports.validateJsonStructure = (jsonField) => (req, res, next) => {
  try {
    const obj = JSON.parse(req.body[jsonField]);
    req.body[`parsed${jsonField.charAt(0).toUpperCase() + jsonField.slice(1)}`] = obj;
    next();
  } catch (err) {
    return error(res, 'Invalid JSON format', 400);
  }
};

exports.validateJsonEntries = (jsonField, schema) => (req, res, next) => {
  const validationErrors = [];
  const obj = req.body[`parsed${jsonField.charAt(0).toUpperCase() + jsonField.slice(1)}`];
  for (const [key, rule] of Object.entries(schema)) {
    if (!obj.hasOwnProperty(key)) {
      validationErrors.push({ key, msg: `${key} is required` });
      continue;
    }
    const value = obj[key];
    if (rule.required && (typeof value !== rule.type || (typeof value === 'string' && value.trim() === '')))
      validationErrors.push({ key, msg: `${key} must be a non-empty ${rule.type}` });
  }
  if (validationErrors.length > 0) return error(res, 'Schema validation failed', 400, validationErrors);
  next();
};
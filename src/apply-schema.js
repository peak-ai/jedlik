const { ValidationError } = require('./errors');

const applySchema = (schema, item, { timestamps }) => {
  const payload = { ...item };
  Object.entries(schema).forEach(([key, config]) => {
    if (config.required && item[key] === undefined) {
      throw new ValidationError(`Key "${key}" is required in ${item.constructor}`);
    }
    if (item[key] === undefined) {
      payload[key] = (config.default === undefined ? config.default : null);
    }
  });

  Object.keys(payload).forEach((key) => {
    if (!Object.keys(schema).includes(key)) {
      if (!(timestamps && ['createdAt', 'updatedAt'].includes(key))) {
        delete payload[key];
      }
    }
  });

  return payload;
};

module.exports = applySchema;

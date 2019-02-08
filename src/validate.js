const { ValidationError } = require('./errors');
const SchemaField = require('./schema-field');

const primitives = [{
  obj: String,
  type: 'string',
}, {
  obj: Number,
  type: 'number',
}, {
  obj: Boolean,
  type: 'boolean',
}];

const validate = (schema, item) => {
  Object.entries(schema).forEach(([fieldName, fieldSchema]) => {
    // primitive validation
    if (primitives.some(p => p.obj === fieldSchema)) {
      const requiredType = primitives.find(p => p.obj === fieldSchema).type;
      const actualType = typeof item[fieldName];
      if (actualType !== requiredType) {
        throw new ValidationError(`Path "${fieldName}" - Expected ${requiredType}, got ${actualType}`);
      }
      // array validation
    } else if (Array.isArray(fieldSchema)) {
      if (!Array.isArray(item[fieldName])) {
        throw new ValidationError(`Path "${fieldName}" - Expected array, got ${typeof item[fieldName]}`);
      }
      const [listSchema] = fieldSchema;
      // nested primitive validation
      if (primitives.some(p => p.obj === listSchema)) {
        const requiredType = primitives.find(p => p.obj === listSchema).type;
        item[fieldName].forEach((listItem, index) => {
          const actualType = typeof listItem;
          if (actualType !== requiredType) {
            throw new ValidationError(`Path "${fieldName}[${index}]" - Expected ${requiredType}, got ${actualType}`);
          }
        });
      }
      // TODO: nested literal object validation
      // TODO: nested SchemaField validation
    } else if (fieldSchema.constructor === Object) {
      // validate literal objects
    } else if (fieldSchema.constructor === SchemaField) {
      // advanced field validation
    }
  });
};

module.exports = validate;

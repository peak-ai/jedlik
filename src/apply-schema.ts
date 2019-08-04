import { ValidationError } from './errors';
import { IModel, IModelPropertiesMap } from './model';

interface ISchemaConfig {
  required?: boolean;
  default?: any;
}

export interface ISchema {
  [key: string]: ISchemaConfig;
}

interface IOptions {
  timestamps: boolean;
}

const applySchema = (schema: ISchema, item: IModel, options?: IOptions): IModelPropertiesMap => {
  const { db, ...payload } = item;

  Object.entries(schema).forEach(([key, config]) => {
    if (config.required && payload[key] === undefined) {
      throw new ValidationError(`Key "${key}" is required in ${item.constructor}`);
    }

    if (item[key] === undefined) {
      payload[key] = (config.default === undefined ? config.default : null);
    }
  });

  Object.keys(payload).forEach((key) => {
    if (!Object.keys(schema).includes(key)) {
      if (!(options && options.timestamps && ['createdAt', 'updatedAt'].includes(key))) {
        delete payload[key];
      }
    }
  });

  return payload;
};

export default applySchema;

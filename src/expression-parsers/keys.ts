import { id, toName, toValue } from './utils';
import {
  ExpressionAttributeNameMap,
  ExpressionAttributeValueMap,
  Key,
} from '../document-client';

type Action = {
  id: string;
  key: string;
  value: unknown;
};

export class Parser {
  private actions: Action[];

  constructor(key: Key) {
    this.actions = Object.entries(key).map(([k, v]) => ({
      id: id(),
      key: k,
      value: v,
    }));
  }

  get expressionAttributeNames(): ExpressionAttributeNameMap {
    return this.actions.reduce(
      (names, action) => ({
        ...names,
        [toName(action.key)]: action.key,
      }),
      {}
    );
  }

  get expressionAttributeValues(): ExpressionAttributeValueMap {
    return this.actions.reduce(
      (values, action) => ({
        ...values,
        [toValue(action.id)]: action.value,
      }),
      {}
    );
  }

  get expression(): string {
    return this.actions
      .map((action) => `${toName(action.key)} = ${toValue(action.id)}`)
      .join(' AND ');
  }
}

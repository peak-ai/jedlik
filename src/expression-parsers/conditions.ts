import { id, toName, toValue } from './utils';
import {
  ExpressionAttributeNameMap,
  ExpressionAttributeValueMap,
} from '../document-client';

// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html
type Operator = '=' | '<>' | '<' | '<=' | '>' | '>=';

type ConditionFunctionWithValue = 'begins_with' | 'contains';
type ConditionFunctionNoValue = 'attribute_exists' | 'attribute_not_exists';

// TODO: Add support for `BETWEEN`, `IN`, `attribute_type` and `size`

type ConditionWithValue<T> =
  | {
      key: Extract<keyof T, string>;
      operator: Operator;
      value: T[keyof T];
    }
  | {
      key: Extract<keyof T, string>;
      operator: ConditionFunctionWithValue;
      value: T[keyof T];
    };

type ConditionNoValue<T> = {
  key: Extract<keyof T, string>;
  operator: ConditionFunctionNoValue;
};

type Condition<T> = ConditionWithValue<T> | ConditionNoValue<T>;

type Identifiable<T> = T & { id: string };

type AndGroup<T> = {
  $and: ConditionMap<T>[];
};

type OrGroup<T> = {
  $or: ConditionMap<T>[];
};

type NotGroup<T> = {
  $not: ConditionMap<T>;
};

type ConditionGroup<T> = AndGroup<T> | OrGroup<T> | NotGroup<T>;

type ConditionMap<T> = T | ConditionGroup<T>;

export type Conditions<T> = ConditionMap<Condition<T>>;

function addIdsToGroups<T>(
  conditions: ConditionMap<Condition<T>>[]
): ConditionMap<Identifiable<Condition<T>>>[] {
  return conditions.map(addIdsToConditions);
}

function addIdsToConditions<T>(
  conditions: ConditionMap<Condition<T>>
): ConditionMap<Identifiable<Condition<T>>> {
  if ((conditions as AndGroup<Condition<T>>).$and) {
    return {
      $and: addIdsToGroups((conditions as AndGroup<Condition<T>>).$and),
    } as ConditionMap<Identifiable<Condition<T>>>;
  }

  if ((conditions as OrGroup<Condition<T>>).$or) {
    return {
      $or: addIdsToGroups((conditions as OrGroup<Condition<T>>).$or),
    } as ConditionMap<Identifiable<Condition<T>>>;
  }

  if ((conditions as NotGroup<Condition<T>>).$not) {
    return {
      $not: addIdsToConditions((conditions as NotGroup<Condition<T>>).$not),
    } as ConditionMap<Identifiable<Condition<T>>>;
  }

  return {
    ...(conditions as Condition<T>),
    id: id(),
  };
}

/**
 * Expression Attribute Name Helpers
 */
function getAttributeNames<T>({
  key,
}: Condition<T>): ExpressionAttributeNameMap {
  return {
    [toName(key)]: key,
  };
}

function getAttributeNamesFromConditionMaps<T>(
  conditions: ConditionMap<Condition<T>>[]
): ExpressionAttributeNameMap {
  return conditions.reduce(
    (names, condition) => ({
      ...names,
      ...getExpressionAttributeNames(condition),
    }),
    {}
  );
}

function getExpressionAttributeNames<T>(
  conditions: ConditionMap<Condition<T>>
): ExpressionAttributeNameMap {
  if ((conditions as AndGroup<Condition<T>>).$and) {
    return getAttributeNamesFromConditionMaps(
      (conditions as AndGroup<Condition<T>>).$and
    );
  }

  if ((conditions as OrGroup<Condition<T>>).$or) {
    return getAttributeNamesFromConditionMaps(
      (conditions as OrGroup<Condition<T>>).$or
    );
  }

  if ((conditions as NotGroup<Identifiable<Condition<T>>>).$not) {
    return getAttributeNamesFromConditionMaps([
      (conditions as NotGroup<Identifiable<Condition<T>>>).$not,
    ]);
  }

  return getAttributeNames(conditions as Condition<T>);
}

/**
 * Expression Attribute Value Helpers
 */

function getAttributeValue<T>(
  condition: Identifiable<Condition<T>>
): ExpressionAttributeValueMap {
  if ((condition as Identifiable<ConditionWithValue<T>>).value) {
    return {
      [toValue(condition.id)]: (condition as Identifiable<
        ConditionWithValue<T>
      >).value,
    };
  }

  return {};
}

function getAttributeValuesFromConditionMaps<T>(
  conditions: ConditionMap<Identifiable<Condition<T>>>[]
): ExpressionAttributeValueMap {
  return conditions.reduce(
    (values, condition) => ({
      ...values,
      ...getExpressionAttributeValues(condition),
    }),
    {}
  );
}

function getExpressionAttributeValues<T>(
  conditions: ConditionMap<Identifiable<Condition<T>>>
): ExpressionAttributeValueMap {
  if ((conditions as AndGroup<Identifiable<Condition<T>>>).$and) {
    return getAttributeValuesFromConditionMaps(
      (conditions as AndGroup<Identifiable<Condition<T>>>).$and
    );
  }

  if ((conditions as OrGroup<Identifiable<Condition<T>>>).$or) {
    return getAttributeValuesFromConditionMaps(
      (conditions as OrGroup<Identifiable<Condition<T>>>).$or
    );
  }

  if ((conditions as NotGroup<Identifiable<Condition<T>>>).$not) {
    return getAttributeValuesFromConditionMaps([
      (conditions as NotGroup<Identifiable<Condition<T>>>).$not,
    ]);
  }

  return getAttributeValue(conditions as Identifiable<Condition<T>>);
}

/**
 * Expression Helpers
 */

function getSimpleExpression<T>(condition: Identifiable<Condition<T>>): string {
  if (['begins_with', 'contains'].includes(condition.operator)) {
    return `${condition.operator}(${toName(condition.key)}, ${toValue(
      condition.id
    )})`;
  }

  if (
    ['attribute_exists', 'attribute_not_exists'].includes(condition.operator)
  ) {
    return `${condition.operator}(${toName(condition.key)})`;
  }

  return `${toName(condition.key)} ${condition.operator} ${toValue(
    condition.id
  )}`;
}

function getAndExpression<T>(
  group: AndGroup<Identifiable<Condition<T>>>
): string {
  return `(${group.$and.map(getConditionExpression).join(' AND ')})`;
}

function getOrExpression<T>(
  group: OrGroup<Identifiable<Condition<T>>>
): string {
  return `(${group.$or.map(getConditionExpression).join(' OR ')})`;
}

function getNotExpression<T>(
  group: NotGroup<Identifiable<Condition<T>>>
): string {
  return `NOT ${getConditionExpression(group.$not)}`;
}

function getConditionExpression<T>(
  conditions: ConditionMap<Identifiable<Condition<T>>>
): string {
  if ((conditions as AndGroup<Identifiable<Condition<T>>>).$and) {
    return getAndExpression(conditions as AndGroup<Identifiable<Condition<T>>>);
  }

  if ((conditions as OrGroup<Identifiable<Condition<T>>>).$or) {
    return getOrExpression(conditions as OrGroup<Identifiable<Condition<T>>>);
  }

  if ((conditions as NotGroup<Identifiable<Condition<T>>>).$not) {
    return getNotExpression(conditions as NotGroup<Identifiable<Condition<T>>>);
  }

  return getSimpleExpression(conditions as Identifiable<Condition<T>>);
}

export class Parser<T> {
  private actions: ConditionMap<Identifiable<Condition<T>>>;

  constructor(conditions: ConditionMap<Condition<T>>) {
    this.actions = addIdsToConditions(conditions);
  }

  public get expressionAttributeNames(): ExpressionAttributeNameMap {
    return getExpressionAttributeNames(this.actions);
  }

  public get expressionAttributeValues(): ExpressionAttributeValueMap {
    return getExpressionAttributeValues(this.actions);
  }

  public get expression(): string {
    return getConditionExpression(this.actions);
  }
}

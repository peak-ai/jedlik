import crypto from 'crypto';
import {
  ExpressionAttributeNameMap,
  ExpressionAttributeValueMap,
  DynamoDBSet,
} from '../document-client';

type operation = 'SET' | 'REMOVE' | 'ADD' | 'DELETE';

type Action = {
  id: string;
  operation: operation;
  path: string[];
  value: unknown;
  conditional: boolean;
};

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]> | LiteralMap<T[P]>;
};

type SetUpdate<T> = DeepPartial<T>;

type RemoveUpdate<T> = {
  [P in keyof T]?: RemoveUpdate<T[P]> | true;
};

type AddUpdate<T> = {
  [P in keyof T]?: number | DynamoDBSet;
};

type DeleteUpdate<T> = {
  [P in keyof T]?: DynamoDBSet;
};

type Update<T> = SetUpdate<T> | AddUpdate<T> | RemoveUpdate<T>;

export type UpdateMap<T> = {
  set?: [SetUpdate<T>, SetUpdate<T>?];
  remove?: RemoveUpdate<T>;
  add?: AddUpdate<T>;
  delete?: DeleteUpdate<T>;
};

export type Shape<T> = T | LiteralMap<T>;

export function Literal<T>(values: T): LiteralMap<T> {
  return new LiteralMap(values);
}

class LiteralMap<T> {
  constructor(public values: T) {}
}

const id = (): string => crypto.randomBytes(20).toString('hex');

const toAction = <T>(
  path: string[],
  value: unknown,
  operation: operation,
  conditional = false
): Action => ({
  id: id(),
  operation,
  conditional,
  path, // if it's nested we need to get the path recursively
  value, // if its nested we need to get to the end of the line
});

type pathValuePairs = [string[], unknown][];

const getPathValuePairs = (
  key: string,
  value: unknown,
  path: string[] = []
): pathValuePairs => {
  if (Object.getPrototypeOf(value) === Object.prototype) {
    return Object.entries(value as Record<string, unknown>).reduce(
      (acc, [k, value]) => {
        return [...acc, ...getPathValuePairs(k, value, path.concat(key))];
      },
      [] as pathValuePairs
    );
  } else if (value instanceof LiteralMap) {
    return [[path.concat(key), value.values]];
  }

  return [[path.concat(key), value]];
};

const getActions = <T>(
  update: Update<T>,
  operation: operation,
  conditional = false
): Action[] => {
  return Object.entries(update).reduce((actions, [key, value]) => {
    const pathValues = getPathValuePairs(key, value);
    return actions.concat(
      pathValues.map(([path, value]) =>
        toAction(path, value, operation, conditional)
      )
    );
  }, [] as Action[]);
};

const toActions = <T>(updates: UpdateMap<T>): Action[] => {
  let actions: Action[] = [];

  if (updates.set) {
    const [sets, conditionals] = updates.set;
    let setActions = getActions(sets, 'SET');

    if (conditionals) {
      const conditionalActions = getActions(conditionals, 'SET', true);
      setActions = setActions.filter(
        (a) =>
          !conditionalActions.some((c) => c.path.join('.') === a.path.join('.'))
      );

      actions = actions.concat(setActions);
      actions = actions.concat(conditionalActions);
    } else {
      actions = actions.concat(setActions);
    }
  }

  if (updates.remove) {
    actions = actions.concat(getActions(updates.remove, 'REMOVE'));
  }

  if (updates.add) {
    actions = actions.concat(getActions(updates.add, 'ADD'));
  }

  if (updates.delete) {
    actions = actions.concat(getActions(updates.delete, 'DELETE'));
  }

  return actions;
};

const toName = (key: string): string => `#${key}`;
const toValue = (key: string): string => `:${key}`;

export class UpdateExpressionParser<T> {
  private actions: Action[];

  constructor(updates: UpdateMap<T>) {
    this.actions = toActions(updates);
  }

  public get expressionAttributeNames(): ExpressionAttributeNameMap {
    return this.actions.reduce(
      (acc, action) =>
        action.path.reduce(
          (a, k) => ({
            ...a,
            [`#${k}`]: k,
          }),
          acc
        ),
      {}
    );
  }

  public get expressionAttributeValues(): ExpressionAttributeValueMap {
    return this.actions
      .filter((action) => action.operation !== 'REMOVE')
      .reduce(
        (acc, action) => ({
          ...acc,
          [`:${action.id}`]: action.value,
        }),
        {}
      );
  }

  public get expression(): string {
    const sets: string[] = [];
    const removes: string[] = [];
    const adds: string[] = [];
    const deletes: string[] = [];

    this.actions.forEach((action) => {
      const path = action.path.map(toName).join('.');
      const value = toValue(action.id);
      switch (action.operation) {
        case 'SET': {
          if (action.conditional) {
            sets.push(`${path} = if_not_exists(${path}, ${value})`);
          } else {
            sets.push(`${path} = ${value}`);
          }
          break;
        }
        case 'REMOVE': {
          removes.push(path);
          break;
        }
        case 'ADD': {
          adds.push(`${path} ${value}`);
          break;
        }
        case 'DELETE': {
          deletes.push(`${path} ${value}`);
          break;
        }
        default: {
          break;
        }
      }
    });

    return [
      sets.length ? `SET ${sets.join(', ')} ` : '',
      removes.length ? `REMOVE ${removes.join(', ')} ` : '',
      adds.length ? `ADD ${adds.join(', ')} ` : '',
      deletes.length ? `DELETE ${deletes.join(', ')}` : '',
    ]
      .join('')
      .trim();
  }
}

// type calc = (n: number) => number;

// const fibonacci: calc = (n) => {
//   const cache = [0, 1];

//   const f: calc = (n) => {
//     if (cache.length > n) {
//       return cache[n];
//     } else {
//       const x = f(n - 1) + f(n - 2);
//       cache.push(x);
//       return x;
//     }
//   };

//   return f(n);
// };

// const fibonacci = (n: number): number => {
//   if (n < 2) return n;
//   return fibonacci(n - 1) + fibonacci(n - 2);
// };

// console.time('fib');
// console.log(fibonacci(102));
// console.timeEnd('fib');

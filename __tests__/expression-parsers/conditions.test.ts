import { Parser, Conditions } from '../../src/expression-parsers/conditions';

const hexadecimalKey = /^:[\da-f]{40}$/i;

const getValueName =
  (values: Record<string, unknown>) =>
  (value: unknown): string =>
    (
      Object.entries(values).find(([, v]) => v === value) as [string, unknown]
    )[0];

describe('simple conditions', () => {
  const condition: Conditions<any> = {
    key: 'key',
    operator: '=',
    value: 'value',
  };

  let parser: Parser<any>;

  beforeEach(() => {
    parser = new Parser(condition);
  });

  it('gets attribute names from a simple condition map', () => {
    expect(parser.expressionAttributeNames).toEqual({
      [`#${condition.key}`]: condition.key,
    });
  });

  it('gets attribute values from a simple condition map', () => {
    const keys = Object.keys(parser.expressionAttributeValues);
    // all keys are random hexadecimal strings
    expect(keys.length).toBe(1);

    keys.forEach((key) => {
      expect(key).toMatch(hexadecimalKey);
    });

    // all values should be present
    const values = Object.values(parser.expressionAttributeValues);
    expect(values).toContain(condition.value);
  });

  it('returns a condition expression from a simple = condition map', () => {
    const valueName = getValueName(parser.expressionAttributeValues);

    expect(parser.expression).toEqual(
      `#${condition.key} ${condition.operator} ${valueName(condition.value)}`
    );
  });

  it('returns a condition expression from a simple > condition map', () => {
    const c: Conditions<any> = {
      key: 'key',
      operator: '>',
      value: 'value',
    };

    parser = new Parser(c);

    const valueName = getValueName(parser.expressionAttributeValues);

    expect(parser.expression).toEqual(
      `#${c.key} ${c.operator} ${valueName(c.value)}`
    );
  });

  it('returns a condition expression from a simple < condition map', () => {
    const c: Conditions<any> = {
      key: 'key',
      operator: '<',
      value: 'value',
    };

    parser = new Parser(c);

    const valueName = getValueName(parser.expressionAttributeValues);

    expect(parser.expression).toEqual(
      `#${c.key} ${c.operator} ${valueName(c.value)}`
    );
  });

  it('returns a condition expression from a simple >= condition map', () => {
    const c: Conditions<any> = {
      key: 'key',
      operator: '>=',
      value: 'value',
    };

    parser = new Parser(c);

    const valueName = getValueName(parser.expressionAttributeValues);

    expect(parser.expression).toEqual(
      `#${c.key} ${c.operator} ${valueName(c.value)}`
    );
  });

  it('returns a condition expression from a simple <= condition map', () => {
    const c: Conditions<any> = {
      key: 'key',
      operator: '<=',
      value: 'value',
    };

    parser = new Parser(c);

    const valueName = getValueName(parser.expressionAttributeValues);

    expect(parser.expression).toEqual(
      `#${c.key} ${c.operator} ${valueName(c.value)}`
    );
  });

  it('returns a condition expression from a simple <> condition map', () => {
    const c: Conditions<any> = {
      key: 'key',
      operator: '<>',
      value: 'value',
    };

    parser = new Parser(c);

    const valueName = getValueName(parser.expressionAttributeValues);

    expect(parser.expression).toEqual(
      `#${c.key} ${c.operator} ${valueName(c.value)}`
    );
  });
});

describe('AND condition groups', () => {
  const condition1: Conditions<any> = {
    key: 'key1',
    operator: '=',
    value: 'value1',
  };

  const condition2: Conditions<any> = {
    key: 'key2',
    operator: '=',
    value: 'value2',
  };

  const conditions = {
    $and: [condition1, condition2],
  };

  const parser = new Parser(conditions);

  it('gets attribute names', () => {
    expect(parser.expressionAttributeNames).toEqual({
      [`#${condition1.key}`]: condition1.key,
      [`#${condition2.key}`]: condition2.key,
    });
  });

  it('gets attribute values', () => {
    const keys = Object.keys(parser.expressionAttributeValues);
    // all keys are random hexadecimal strings
    expect(keys.length).toBe(2);

    keys.forEach((key) => {
      expect(key).toMatch(hexadecimalKey);
    });

    // all values should be present
    const values = Object.values(parser.expressionAttributeValues);
    expect(values).toContain(condition1.value);
    expect(values).toContain(condition2.value);
  });

  it('gets the condition expression', () => {
    const valueName = getValueName(parser.expressionAttributeValues);

    expect(parser.expression).toEqual(
      `(#${condition1.key} ${condition1.operator} ${valueName(
        condition1.value
      )} AND #${condition2.key} ${condition2.operator} ${valueName(
        condition2.value
      )})`
    );
  });
});

describe('OR condition groups', () => {
  const condition1: Conditions<any> = {
    key: 'key1',
    operator: '=',
    value: 'value1',
  };

  const condition2: Conditions<any> = {
    key: 'key2',
    operator: '=',
    value: 'value2',
  };

  const conditions = {
    $or: [condition1, condition2],
  };

  const parser = new Parser(conditions);

  it('gets attribute names', () => {
    expect(parser.expressionAttributeNames).toEqual({
      [`#${condition1.key}`]: condition1.key,
      [`#${condition2.key}`]: condition2.key,
    });
  });

  it('gets attribute values', () => {
    const keys = Object.keys(parser.expressionAttributeValues);
    // all keys are random hexadecimal strings
    expect(keys.length).toBe(2);

    keys.forEach((key) => {
      expect(key).toMatch(hexadecimalKey);
    });

    // all values should be present
    const values = Object.values(parser.expressionAttributeValues);
    expect(values).toContain(condition1.value);
    expect(values).toContain(condition2.value);
  });

  it('gets the condition expression', () => {
    const valueName = getValueName(parser.expressionAttributeValues);

    expect(parser.expression).toEqual(
      `(#${condition1.key} ${condition1.operator} ${valueName(
        condition1.value
      )} OR #${condition2.key} ${condition2.operator} ${valueName(
        condition2.value
      )})`
    );
  });
});

describe('NOT conditions', () => {
  const condition: Conditions<any> = {
    key: 'key1',
    operator: '=',
    value: 'value1',
  };

  const conditions = {
    $not: condition,
  };

  const parser = new Parser(conditions);

  it('gets attribute names', () => {
    expect(parser.expressionAttributeNames).toEqual({
      [`#${condition.key}`]: condition.key,
    });
  });

  it('gets attribute values', () => {
    const keys = Object.keys(parser.expressionAttributeValues);
    // all keys are random hexadecimal strings
    expect(keys.length).toBe(1);

    keys.forEach((key) => {
      expect(key).toMatch(hexadecimalKey);
    });

    // all values should be present
    const values = Object.values(parser.expressionAttributeValues);
    expect(values).toContain(condition.value);
  });

  it('gets the condition expression', () => {
    const valueName = getValueName(parser.expressionAttributeValues);

    expect(parser.expression).toEqual(
      `NOT #${condition.key} ${condition.operator} ${valueName(
        condition.value
      )}`
    );
  });
});

describe('nested condition groups', () => {
  const condition1: Conditions<any> = {
    key: 'key1',
    operator: '=',
    value: 'value1',
  };

  const condition2: Conditions<any> = {
    key: 'key2',
    operator: '=',
    value: 'value2',
  };

  const condition3: Conditions<any> = {
    key: 'key3',
    operator: '=',
    value: 'value3',
  };

  const conditions = {
    $or: [condition1, { $and: [condition2, condition3] }],
  };

  const parser = new Parser(conditions);

  it('gets attribute names', () => {
    expect(parser.expressionAttributeNames).toEqual({
      [`#${condition1.key}`]: condition1.key,
      [`#${condition2.key}`]: condition2.key,
      [`#${condition3.key}`]: condition3.key,
    });
  });

  it('gets attribute values', () => {
    const keys = Object.keys(parser.expressionAttributeValues);
    // all keys are random hexadecimal strings
    expect(keys.length).toBe(3);

    keys.forEach((key) => {
      expect(key).toMatch(hexadecimalKey);
    });

    // all values should be present
    const values = Object.values(parser.expressionAttributeValues);
    expect(values).toContain(condition1.value);
    expect(values).toContain(condition2.value);
    expect(values).toContain(condition3.value);
  });

  it('gets the condition expression', () => {
    const valueName = getValueName(parser.expressionAttributeValues);

    expect(parser.expression).toEqual(
      `(#${condition1.key} ${condition1.operator} ${valueName(
        condition1.value
      )} OR (#${condition2.key} ${condition2.operator} ${valueName(
        condition2.value
      )} AND #${condition3.key} ${condition3.operator} ${valueName(
        condition3.value
      )}))`
    );
  });
});

describe('multiple values for the same key in complex filter groups', () => {
  const condition1: Conditions<any> = {
    key: 'key1',
    operator: '=',
    value: 'value1',
  };

  const condition2: Conditions<any> = {
    key: 'key1',
    operator: '=',
    value: 'value2',
  };

  const conditions = {
    $or: [condition1, condition2],
  };

  const parser = new Parser(conditions);

  it('gets attribute names', () => {
    expect(parser.expressionAttributeNames).toEqual({
      [`#${condition1.key}`]: condition1.key,
    });
  });

  it('gets attribute values', () => {
    const keys = Object.keys(parser.expressionAttributeValues);
    // all keys are random hexadecimal strings
    expect(keys.length).toBe(2);

    keys.forEach((key) => {
      expect(key).toMatch(hexadecimalKey);
    });

    // all values should be present
    const values = Object.values(parser.expressionAttributeValues);
    expect(values).toContain(condition1.value);
    expect(values).toContain(condition2.value);
  });

  it('gets the condition expression', () => {
    const valueName = getValueName(parser.expressionAttributeValues);

    expect(parser.expression).toEqual(
      `(#${condition1.key} ${condition1.operator} ${valueName(
        condition1.value
      )} OR #${condition2.key} ${condition2.operator} ${valueName(
        condition2.value
      )})`
    );
  });
});

describe('condition functions with values', () => {
  const condition: Conditions<any> = {
    key: 'key',
    operator: 'begins_with',
    value: 'value',
  };

  let parser: Parser<any>;

  beforeEach(() => {
    parser = new Parser(condition);
  });

  it('gets attribute names', () => {
    expect(parser.expressionAttributeNames).toEqual({
      [`#${condition.key}`]: condition.key,
    });
  });

  it('gets attribute values', () => {
    const keys = Object.keys(parser.expressionAttributeValues);
    // all keys are random hexadecimal strings
    expect(keys.length).toBe(1);

    keys.forEach((key) => {
      expect(key).toMatch(hexadecimalKey);
    });

    // all values should be present
    const values = Object.values(parser.expressionAttributeValues);
    expect(values).toContain(condition.value);
  });

  it('returns a condition expression from a "begins_with" condition map', () => {
    const valueName = getValueName(parser.expressionAttributeValues);

    expect(parser.expression).toEqual(
      `begins_with(#${condition.key}, ${valueName(condition.value)})`
    );
  });

  it('returns a condition expression from a "contains" condition map', () => {
    const c: Conditions<any> = {
      key: 'key',
      operator: 'contains',
      value: 'value',
    };

    parser = new Parser(c);

    const valueName = getValueName(parser.expressionAttributeValues);

    expect(parser.expression).toEqual(
      `contains(#${c.key}, ${valueName(c.value)})`
    );
  });
});

describe('condition functions without values', () => {
  const condition: Conditions<any> = {
    key: 'key',
    operator: 'attribute_exists',
  };

  let parser: Parser<any>;

  beforeEach(() => {
    parser = new Parser(condition);
  });

  it('gets attribute names', () => {
    expect(parser.expressionAttributeNames).toEqual({
      [`#${condition.key}`]: condition.key,
    });
  });

  it('gets no attribute values', () => {
    const keys = Object.keys(parser.expressionAttributeValues);
    // all keys are random hexadecimal strings
    expect(keys.length).toBe(0);
  });

  it('returns a condition expression from a "attribute_exists" condition map', () => {
    expect(parser.expression).toEqual(`attribute_exists(#${condition.key})`);
  });

  it('returns a condition expression from a "attribute_not_exists" condition map', () => {
    const c: Conditions<any> = {
      key: 'key',
      operator: 'attribute_not_exists',
    };

    parser = new Parser(c);

    expect(parser.expression).toEqual(`attribute_not_exists(#${c.key})`);
  });
});

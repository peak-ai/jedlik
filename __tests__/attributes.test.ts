import { Attributes } from '../src/attributes';

interface Props {
  id: number;
  name: string;
}

let attributes: Attributes<Props>;
let id: number;
let name: string;

beforeEach(() => {
  id = Math.ceil((Math.random() * 100));
  name = Math.ceil((Math.random() * 100)).toString();
  attributes = new Attributes({ id, name });
});

describe('get', () => {
  it('returns the given attribute', () => {
    expect(attributes.get('id')).toBe(id);
    expect(attributes.get('name')).toBe(name);
  });
});

describe('getAll', () => {
  it('returns an object with all of the attributes', () => {
    expect(attributes.getAll()).toEqual({ id, name });
  });
});

describe('set', () => {
  it('merges the given attributes into the data', () => {
    attributes.set({ name: 'test' });
    expect(attributes.getAll()).toEqual({ id, name: 'test' });
  });
});

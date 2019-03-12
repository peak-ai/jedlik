const { head } = require('lodash');
const ModelWrapper = require('../src/model');
const MockClient = require('../src/mock-client');

const schema = {
  id: { required: true },
  name: { required: true },
  date: { required: true },
  foobar: { required: true },
};

describe('mock client', () => {
  const mockTableName = 'MOCK_TABLE';
  const mockClientData = {
    list: [
      {
        id: 1,
        name: 'F A Hayek',
        foobar: true,
        date: Date.now(),
      },
      {
        id: 2,
        name: 'Adam Smith',
        foobar: false,
        date: Date.now(),
      },
    ],
    item: {
      id: 3,
      name: 'L V Mises',
      foobar: false,
      date: Date.now(),
    },
  };

  const mockClient = new MockClient(mockClientData);
  const Model = ModelWrapper({
    client: mockClient,
    table: mockTableName,
    schema,
  });

  class TestClass extends Model {
    constructor({
      id,
      name,
      date,
      foobar,
    }) {
      super();
      this.id = id;
      this.name = name;
      this.date = date;
      this.foobar = foobar;
    }
  }

  it('(first)', () => {
    expect.assertions(1);
    TestClass.first({ id: 1 }).then((res) => {
      expect(res).toEqual(expect.objectContaining(head(mockClientData.list)));
    });
  });

  it('(query)', (done) => {
    expect.assertions(1);
    TestClass.query({ id: 1 }).then((res) => {
      const [item] = res;
      expect(item).toEqual(expect.objectContaining(mockClientData.list[0]));
      done();
    });
  });

  it('(create)', (done) => {
    expect.assertions(1);
    TestClass.create(mockClientData.item).then((res) => {
      expect(res).toEqual(expect.objectContaining(mockClientData.item));
      done();
    });
  });

  it('(create) failure', () => {
    expect.assertions(1);
    TestClass.create(mockClientData.item)
      .then(res => expect(res)
        .toEqual(expect.objectContaining(mockClientData.item)))
      .catch(err => expect(err.message).toEqual(mockClientData.createError));
  });

  it('(delete) failure', () => {
    expect.assertions(1);
    TestClass.delete()
      .then(res => expect(res).toEqual(null))
      .catch(err => expect(err.message).toEqual(mockClientData.updateError));
  });
});

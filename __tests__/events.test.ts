import { Events } from '../src/events';

const events = new Events<jest.Mock>();

it('calls all registered event handlers for the given event name with the given data', () => {
  const data = jest.fn();
  const handler1 = jest.fn();
  const handler2 = jest.fn();

  events.on('save', handler1);
  events.on('save', handler2);

  events.emit('save', data);

  expect(handler1).toHaveBeenCalledWith(data);
  expect(handler2).toHaveBeenCalledWith(data);
});

it("doesn't call handlers registered to different events", () => {
  const handler = jest.fn();

  events.on('save', handler);

  events.emit('delete');

  expect(handler).not.toHaveBeenCalled();
});

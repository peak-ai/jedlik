export type EventCallback<T> = (data?: T) => void;

export type EventName = 'save' | 'delete';

export class Events<T> {
  private handlers: { [key: string]: EventCallback<T>[] } = {};

  public on(eventName: EventName, callback: EventCallback<T>): void {
    if (this.handlers[eventName]) {
      this.handlers[eventName].push(callback);
    } else {
      this.handlers[eventName] = [callback];
    }
  }

  public emit(eventName: EventName, data?: T): void {
    if (this.handlers[eventName]) {
      this.handlers[eventName].forEach((handler) => {
        handler(data);
      });
    }
  }
}

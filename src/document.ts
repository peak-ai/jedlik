import { Attributes } from './attributes';
import { Database } from './database';
import { Events } from './events';

export class Document<T> {
  private attributes: Attributes<T>;
  private db: Database<T>;
  private events: Events<Document<T>>;

  constructor(db: Database<T>, events: Events<Document<T>>, props: T) {
    this.attributes = new Attributes(props);
    this.db = db;
    this.events = events;
  }

  public get<K extends keyof T>(key: K): T[K] {
    return this.attributes.get(key);
  }

  public set(props: Partial<T>): void {
    this.attributes.set(props);
  }

  public toObject(): T {
    return this.attributes.getAll();
  }

  public async save(): Promise<void> {
    await this.db.put(this.toObject());
    this.events.emit('save', this);
  }
}

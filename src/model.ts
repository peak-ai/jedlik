import {
  Database,
  DatabaseOptions,
  Key,
  QueryOptions,
  ScanOptions,
} from './database';
import { Document, Schema } from './document';
import { Events, EventName, EventCallback } from './events';

interface ModelOptions<T> {
  table: string;
  schema: Schema<T>;
}

export class Model<T> {
  private db: Database<T>;
  private events: Events<Document<T>> = new Events();
  private schema: Schema<T>;

  constructor(options: ModelOptions<T>, config?: DatabaseOptions) {
    this.db = new Database(options.table, config);
    this.schema = options.schema;
  }

  public create(props: T): Document<T> {
    return this.createDocument(props);
  }

  public async query(key: Key<T>, options?: QueryOptions<T>): Promise<Document<T>[]> {
    const items = await this.db.query(key, options);

    return items.map(item => this.createDocument(item));
  }

  public async first(key: Key<T>, options?: QueryOptions<T>): Promise<Document<T>> {
    const item = await this.db.first(key, options);

    return this.createDocument(item);
  }

  public async scan(options?: ScanOptions<T>): Promise<Document<T>[]> {
    const items = await this.db.scan(options);

    return items.map(item => this.createDocument(item));
  }

  public async get(key: Key<T>): Promise<Document<T>> {
    const item = await this.db.get(key);

    return this.createDocument(item);
  }

  public async delete(key: Key<T>): Promise<void> {
    await this.db.delete(key);
    this.events.emit('delete');
  }

  public on(eventName: EventName, callback: EventCallback<Document<T>>): void {
    this.events.on(eventName, callback);
  }

  private createDocument(item: T): Document<T> {
    return new Document(this.db, this.events, this.schema, item);
  }
}

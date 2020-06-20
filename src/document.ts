import { Attributes } from './attributes';
import { Database, PutOptions } from './database';
import { Events } from './events';

type ValidationError = {
  name: string;
  details: { message: string }[];
};

type ValidationResponse<T> = {
  error?: ValidationError;
  value: T;
};

export interface Schema<T> {
  validate(item: T): ValidationResponse<T>;
}

export class Document<T> {
  private attributes: Attributes<T>;
  private db: Database<T>;
  private events: Events<Document<T>>;
  private schema: Schema<T>;

  constructor(
    db: Database<T>,
    events: Events<Document<T>>,
    schema: Schema<T>,
    props: T
  ) {
    this.attributes = new Attributes(props);
    this.db = db;
    this.events = events;
    this.schema = schema;
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

  public async save(options?: PutOptions<T>): Promise<void> {
    const validation = this.schema.validate(this.toObject());

    if (validation.error) {
      throw validation.error;
    }

    this.set(validation.value);

    await this.db.put(validation.value, options);

    this.events.emit('save', this);
  }
}

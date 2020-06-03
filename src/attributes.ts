export class Attributes<T> {
  constructor(private data: T) {}

  public get<K extends keyof T>(key: K): T[K] {
    return this.data[key];
  }

  public getAll(): T {
    return this.data;
  }

  public set(props: Partial<T>): void {
    Object.assign(this.data, props);
  }
}

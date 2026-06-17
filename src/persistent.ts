import { createRequire } from "node:module";

interface PersistentStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  incr(key: string): Promise<number>;
}

class InMemoryPersistentStore implements PersistentStore {
  private store = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async incr(key: string): Promise<number> {
    const current = parseInt(this.store.get(key) ?? "0", 10);
    const next = current + 1;
    this.store.set(key, String(next));
    return next;
  }
}

class RedisPersistentStore implements PersistentStore {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private readonly client: any, private readonly prefix = "pkv:") {}

  private k(key: string): string {
    return this.prefix + key;
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(this.k(key)) as Promise<string | null>;
  }

  async set(key: string, value: string): Promise<void> {
    await (this.client.set(this.k(key), value) as Promise<unknown>);
  }

  async incr(key: string): Promise<number> {
    const result = await (this.client.incr(this.k(key)) as Promise<number>);
    return typeof result === "number" ? result : Number(result);
  }
}

function createRedisClient(url: string): unknown {
  const require = createRequire(import.meta.url);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ioredis: any = require("ioredis");
  const Redis = ioredis.default ?? ioredis.Redis ?? ioredis;
  return new Redis(url, { maxRetriesPerRequest: null, lazyConnect: false });
}

function createStore(env: { REDIS_URL?: string } = process.env): PersistentStore {
  if (env.REDIS_URL) {
    return new RedisPersistentStore(createRedisClient(env.REDIS_URL));
  }
  return new InMemoryPersistentStore();
}

let _store: PersistentStore | undefined;

export function getPersistentStore(): PersistentStore {
  if (!_store) _store = createStore();
  return _store;
}
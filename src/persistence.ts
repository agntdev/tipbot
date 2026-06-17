import { createRequire } from "node:module";
import type { RedisLike } from "./toolkit/session/redis.js";

const PREFIX = "data:";

class MemoryDomainStorage {
  private store = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.store.get(PREFIX + key) ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    this.store.set(PREFIX + key, value);
  }
}

class RedisDomainStorage {
  constructor(private readonly client: RedisLike) {}

  async get(key: string): Promise<string | null> {
    return this.client.get(PREFIX + key);
  }

  async set(key: string, value: string): Promise<void> {
    await this.client.set(PREFIX + key, value);
  }
}

interface DomainStorage {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}

function createRedisStorage(url: string): DomainStorage {
  const require = createRequire(import.meta.url);
  const ioredis: any = require("ioredis");
  const Redis = ioredis.default ?? ioredis.Redis ?? ioredis;
  const client = new Redis(url, { maxRetriesPerRequest: null, lazyConnect: false });
  return new RedisDomainStorage(client as RedisLike);
}

let _storage: DomainStorage | null = null;

function getStorage(): DomainStorage {
  if (_storage) return _storage;
  if (process.env.REDIS_URL) {
    _storage = createRedisStorage(process.env.REDIS_URL);
  } else {
    _storage = new MemoryDomainStorage();
  }
  return _storage;
}

export async function getCounter(): Promise<number> {
  const raw = await getStorage().get("tips_served");
  if (raw === null) return 0;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
}

export async function setCounter(value: number): Promise<void> {
  await getStorage().set("tips_served", String(value));
}

export async function incrementCounter(): Promise<number> {
  const current = await getCounter();
  const next = current + 1;
  await setCounter(next);
  return next;
}
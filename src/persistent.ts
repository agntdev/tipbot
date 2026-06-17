import { createRequire } from "node:module";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { config } from "./config.js";

interface PersistentStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  incr(key: string): Promise<number>;
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

class SqlitePersistentStore implements PersistentStore {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private initPromise: Promise<any> | null = null;
  private dbPath: string;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async getDb(): Promise<any> {
    if (this.db) return this.db;
    if (!this.initPromise) {
      this.initPromise = this.initDb();
    }
    return this.initPromise;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async initDb(): Promise<any> {
    const require = createRequire(import.meta.url);
    const initSqlJs: (config?: Record<string, unknown>) => Promise<{ Database: new (data?: ArrayLike<number> | null) => unknown }> = require("sql.js");
    const SQL = await initSqlJs();

    let data: ArrayLike<number> | null = null;
    if (existsSync(this.dbPath)) {
      data = new Uint8Array(readFileSync(this.dbPath));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = new (SQL.Database as any)(data) as any;
    db.run("PRAGMA journal_mode=WAL");
    db.run("CREATE TABLE IF NOT EXISTS counters (key TEXT PRIMARY KEY, value INTEGER NOT NULL DEFAULT 0)");
    db.run("INSERT OR IGNORE INTO counters (key, value) VALUES (?, ?)", ["tips_served", 0]);

    this.db = db;
    this.persist();
    return db;
  }

  private persist(): void {
    if (!this.db) return;
    const buffer = this.db.export() as Uint8Array;
    mkdirSync(dirname(this.dbPath), { recursive: true });
    writeFileSync(this.dbPath, buffer);
  }

  async get(key: string): Promise<string | null> {
    const db = await this.getDb();
    const stmt = db.prepare("SELECT value FROM counters WHERE key = ?");
    stmt.bind([key]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return String(row.value);
    }
    stmt.free();
    return null;
  }

  async set(key: string, value: string): Promise<void> {
    const db = await this.getDb();
    db.run("INSERT OR REPLACE INTO counters (key, value) VALUES (?, ?)", [key, parseInt(value, 10)]);
    this.persist();
  }

  async incr(key: string): Promise<number> {
    const db = await this.getDb();
    db.run("INSERT OR IGNORE INTO counters (key, value) VALUES (?, 0)", [key]);
    db.run("UPDATE counters SET value = value + 1 WHERE key = ?", [key]);
    const stmt = db.prepare("SELECT value FROM counters WHERE key = ?");
    stmt.bind([key]);
    stmt.step();
    const row = stmt.getAsObject();
    stmt.free();
    this.persist();
    return row.value as number;
  }
}

function createRedisClient(url: string): unknown {
  const require = createRequire(import.meta.url);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ioredis: any = require("ioredis");
  const Redis = ioredis.default ?? ioredis.Redis ?? ioredis;
  return new Redis(url, { maxRetriesPerRequest: null, lazyConnect: false });
}

function createStore(env: {
  REDIS_URL?: string;
} = process.env): PersistentStore {
  if (env.REDIS_URL) {
    return new RedisPersistentStore(createRedisClient(env.REDIS_URL));
  }
  return new SqlitePersistentStore(config.dbPath);
}

let _store: PersistentStore | undefined;

export function getPersistentStore(): PersistentStore {
  if (!_store) _store = createStore();
  return _store;
}
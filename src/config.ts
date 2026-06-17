import { logger } from "./logger.js";

const DEFAULT_DB_PATH = "./tipbot.db";

function readEnv(): { dbPath: string } {
  const dbPath = (process.env.TIPBOT_DB ?? DEFAULT_DB_PATH).trim();
  if (!dbPath) {
    logger.error("TIPBOT_DB is empty; using default", { default: DEFAULT_DB_PATH });
    return { dbPath: DEFAULT_DB_PATH };
  }
  logger.info("TIPBOT_DB configured", { dbPath });
  return { dbPath };
}

export const config = readEnv();
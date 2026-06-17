import { buildBot } from "./bot.js";
import { logger } from "./logger.js";
import "./config.js";

const BOT_TOKEN_RE = /^\d{8,10}:[A-Za-z0-9_-]{35}$/;

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  logger.error("TELEGRAM_BOT_TOKEN is required", { hint: "Set TELEGRAM_BOT_TOKEN to your BotFather token" });
  process.exit(1);
}

if (!BOT_TOKEN_RE.test(token.trim())) {
  logger.error("TELEGRAM_BOT_TOKEN is invalid", { hint: "Format: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz-01234567" });
  process.exit(1);
}

logger.info("starting bot");
const bot = buildBot(token);
bot.start();

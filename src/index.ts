import { buildBot } from "./bot.js";

// Telegram bot tokens follow the pattern: <bot-id>:<35-char alphanumeric hash>
const BOT_TOKEN_RE = /^\d{8,10}:[A-Za-z0-9_-]{35}$/;

// Runtime entry (dist/index.js). BOT_TOKEN is injected at runtime as a secret.
const token = process.env.BOT_TOKEN;
if (!token) {
  console.error(
    "BOT_TOKEN is required. Set the TELEGRAM_BOT_TOKEN (or BOT_TOKEN) environment variable to your BotFather token.",
  );
  process.exit(1);
}

if (!BOT_TOKEN_RE.test(token.trim())) {
  console.error(
    "BOT_TOKEN is invalid. A valid Telegram bot token looks like 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz-01234567 — obtained from @BotFather.",
  );
  process.exit(1);
}

const bot = buildBot(token);
bot.start();

import { existsSync, unlinkSync } from "node:fs";
import { buildBot } from "./bot.js";
import { config } from "./config.js";
import { resetPersistentStore } from "./persistent.js";

// The Tests-gate harness imports THIS module and calls makeBot() with no args,
// replaying dialog specs tokenlessly (it fakes the Bot API transport — no real
// Telegram call is made). The token is a placeholder for replay. The agntdev-ci
// orchestrator points AGNTDEV_BOT_MODULE at the compiled dist/harness-entry.js.
export function makeBot() {
  if (existsSync(config.dbPath)) {
    unlinkSync(config.dbPath);
  }
  resetPersistentStore();
  return buildBot(process.env.TELEGRAM_BOT_TOKEN ?? "harness-test-token");
}

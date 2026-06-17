import { buildBot } from "./bot.js";
import { createFreshPersistentStore } from "./persistent.js";

// The Tests-gate harness imports THIS module and calls makeBot() with no args,
// replaying dialog specs tokenlessly (it fakes the Bot API transport — no real
// Telegram call is made). The token is a placeholder for replay. The agntdev-ci
// orchestrator points AGNTDEV_BOT_MODULE at the compiled dist/harness-entry.js.
// Each call creates a fresh bot with an isolated persistent store so counter
// state does not leak between specs.
export function makeBot() {
  return buildBot(process.env.TELEGRAM_BOT_TOKEN ?? "harness-test-token", {
    store: createFreshPersistentStore(),
  });
}

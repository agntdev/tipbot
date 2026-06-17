# fix-6ea99ad343e5cee9 — Non-text messages are silently ignored (E2T1 spec gap)

**Weight:** 0.0000 (share of project budget)
**Reward:** 0 TIP

E2T1 specifies: "Reply with a short help hint for unknown messages." The current implementation at `src/bot.ts:103-117` only handles **text** messages (`bot.on("message:text")`). Non-text messages — photos, stickers, documents, voice notes, etc. — receive no reply at all, leaving the user with silent failure. The bot should also register a fallback handler for non-text `message` updates (e.g., `bot.on("message")`) to reply with the same help hint.

## Dialog tests

If this task adds or changes user-facing bot behavior, author its dialog tests as a `BotSpec` JSON array in its OWN file `tests/specs/fix-6ea99ad343e5cee9.json`. NEVER edit or append to a shared `tests/specs.json` — concurrent feature PRs would conflict on it. The tests-gate globs and merges all `tests/specs/*.json`.

If this task adds a bot command, declare it in its OWN file `tests/commands/fix-6ea99ad343e5cee9.json` (a JSON array of command strings, e.g. `["/start"]`). NEVER edit or append to a shared `tests/commands.json` — same conflict reason. The tests-gate globs, merges + de-duplicates all `tests/commands/*.json`.


## Implementation contract

Ship a COMPLETE, working implementation — not a stub. A task is INCOMPLETE (and will be rejected) even if it compiles and the dialog tests pass when it does any of these:
- **Stubbed code:** empty bodies, `TODO`/`FIXME`, commented-out logic, or `throw new Error("not implemented")`.
- **Fabricated data:** `Math.random()`, hardcoded sample arrays, or canned responses standing in for real computed or fetched values.
- **No in-memory data store:** a `Map`/array/module-level variable used as a database is a defect. Anything that must survive a restart (records, subscriptions, balances, schedules, settings) MUST use the toolkit's persistent storage (Redis-backed), not process memory. (The toolkit's auto-selected session storage is only for ephemeral conversation state.)
- **Broken integrations:** call external APIs against their real contract — correct endpoints, ids and params (e.g. a coin *id* like `the-open-network`, not a ticker like `TON`) — with credentials read from env. Do not invent endpoints or fake responses.
- **Dead code:** new commands/handlers must be registered and reachable from the bot's command surface.
If the spec is genuinely under-specified, implement the smallest REAL slice you can verify and note the gap — never fake behavior to make the PR look complete.

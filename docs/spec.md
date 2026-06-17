# TipBot — refined brief

## Summary
A minimal Telegram bot that greets users, serves a random kind tip from a built-in list of 8 tips when asked, and maintains a GLOBAL persisted counter of how many tips have been served. No per-user state and no external APIs.

## Audience
- Telegram users who want a small kindness-tip bot.
- The owner/operator who will run the bot (no admin UI required).

## Core entities
- Tip (in-memory list of 8 built-in strings).
- Counter (global integer representing total tips served, persisted).

## Integrations & notification targets
- Telegram Bot API only (via a standard Telegram bot token).
- No external services or APIs.

## Interaction flows
- /start
  - Action: Bot sends a greeting.\n  - Response example: "Hi Alice! I'm TipBot — send /tip for a kind tip."

- /tip
  - Action: Bot selects one random tip from the built-in list, atomically increments the global counter in persistent storage, and replies with the tip text.
  - Response example: "✨ Tip: Be patient with yourself — small steps count."
  - Note: The command increments the global count but does not display the count unless the owner prefers otherwise (default: do not display on /tip).

- /count
  - Action: Bot reads the persisted global counter and replies with the total number of tips served.
  - Response example: "Total tips served: 123"

- Unknown messages
  - Action: Bot replies with a short help hint: "Use /tip for a kind tip, /count to see how many tips have been served."

## Persistence
- Storage: SQLite database file (default path ./tipbot.db).
- Schema (single table):
  - Table: counters
    - key TEXT PRIMARY KEY
    - value INTEGER NOT NULL
  - Behavior: store the global counter under key = 'tips_served'.
- Concurrency: Use transactions and WAL mode (PRAGMA journal_mode=WAL) so concurrent handlers can increment safely.
- Initialization: On startup, create DB and counters table if missing and ensure 'tips_served' exists (default 0).

## Built-in tips (8)
1. "Be patient with yourself — small steps count."
2. "Listen twice as much as you speak; people notice."
3. "Send a quick message to someone you appreciate today."
4. "Take five deep breaths when things feel overwhelming."
5. "Offer help without expecting anything in return."
6. "Smile — it often changes someone’s day."
7. "Forgive a small mistake; kindness multiplies."
8. "Share a genuine compliment with someone today."

## Error handling & UX
- If DB write/read fails, reply: "Sorry — something went wrong. Try again later." and log the error.
- If bot token missing or invalid, exit with a clear startup error message.
- Respect Telegram rate limits by relying on the bot library's built-in handling; no special throttling required for this low-throughput bot.

## Implementation notes (sensible defaults)
- Language/runtime: Python 3.10+. Recommended library: python-telegram-bot v20+.
- Bot token injection: read from environment variable TELEGRAM_BOT_TOKEN.
- DB file path: configurable via env var TIPBOT_DB (default ./tipbot.db).
- Logging: structured logs to stdout (INFO for normal ops, ERROR for failures).
- Deployment: run as a single process (systemd, Docker, or similar). The DB file must be on a writable volume.

## Payments
- None. No payments or monetization features.

## Non-goals
- No per-user state, profiles, or preferences.
- No external analytics, dashboards, or third-party integrations.
- No admin UI, webhooks beyond Telegram, or payment flows.

## Assumptions & defaults
- Language: English — owner used English and tip text is provided in English.
- Storage: SQLite file ./tipbot.db — embedded storage avoids external services and fits the minimal scope.
- Bot library: python-telegram-bot v20+ — widely used and suitable for Telegram bots in Python.
- Token provisioning: TELEGRAM_BOT_TOKEN env var — common secure deployment practice.
- Tips: fixed set of 8 built-in tips (listed above) — matches the owner's requirement for 8 tips.
- Concurrency & durability: use SQLite transactions + WAL mode — ensures atomic increments and reasonable durability without extra services.
- Visibility on /tip: do not show the total count by default — keeps /tip focused on delivering the tip, while /count provides the metric.

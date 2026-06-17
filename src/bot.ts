import { createBot, inlineKeyboard, inlineButton } from "./toolkit/index.js";

// The per-chat session shape (ephemeral conversation state only). Extend as the
// bot grows. Durable domain data must NOT live here — use the toolkit's
// persistent storage (see AGENTS.md).
export interface Session {
  // example: step?: "awaiting_amount";
}

/**
 * buildBot — assembles the bot and registers every handler, but does NOT start
 * it. Shared by the runtime entry (src/index.ts) and the Tests-gate harness
 * (src/harness-entry.ts) so both exercise the exact same bot. Add new commands
 * and flows here.
 */
export function buildBot(token: string) {
  const bot = createBot<Session>(token, {
    initial: () => ({}),
  });

  bot.api.setMyCommands([
    { command: "start", description: "Start the bot" },
    { command: "help", description: "Show available commands" },
  ]);

  bot.command("start", async (ctx) => {
    const keyboard = inlineKeyboard([
      [inlineButton("Features", "main:features")],
      [inlineButton("Help", "main:help")],
      [inlineButton("About", "main:about")],
    ]);
    await ctx.reply(
      "Welcome to AGNTDev Bot! I am your assistant. Use the menu below to get started.",
      { reply_markup: keyboard },
    );
  });

  bot.callbackQuery("main:features", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply("Features: I can respond to commands and process messages. More features are coming soon.");
  });

  bot.callbackQuery("main:help", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply("Help: Send /start to see the main menu at any time. I understand text messages and commands.");
  });

  bot.callbackQuery("main:about", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply("AGNTDev Bot — built with the AGNTDEV toolkit (grammY + Redis).");
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(
      "Available commands:\n/start — Start the bot\n/help — Show this help",
    );
  });

  bot.on("message:text", async (ctx, next) => {
    if (ctx.message.text.startsWith("/")) {
      await ctx.reply(
        "Sorry, I don't recognize that command. Try /help to see what I can do.",
      );
      return;
    }
    await next();
  });

  bot.on("message:text", async (ctx) => {
    await ctx.reply("I received your message.");
  });

  bot.catch(async (err) => {
    console.error("[agntdev-bot] unhandled error:", err);
    try {
      const ctx = (err as { ctx?: { reply?: (text: string) => Promise<unknown> } }).ctx;
      if (ctx?.reply) {
        await ctx.reply("Something went wrong. Please try again later.");
      }
    } catch {
      // Swallow errors during error recovery to prevent cascading.
    }
  });

  return bot;
}

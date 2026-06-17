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

  bot.on("message:text", async (ctx) => {
    await ctx.reply("I received your message.");
  });

  return bot;
}

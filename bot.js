import { Telegraf } from "telegraf";
import { checkJoin } from "./checker.js";
import fetch from "node-fetch";

import 'dotenv/config';
const bot = new Telegraf(process.env.BOT_TOKEN);

const WAIT_ANIMATION = ['.', '..', '...', '..', '.'];

// /start
bot.start((ctx) => {
  ctx.reply(`Welcome! Click below to get promo content.`,
    { reply_markup: { inline_keyboard: [[{ text: "Join & Get Media", callback_data: "join_check" }]] } });
});

// /upload (admin)
bot.command("upload", async (ctx) => {
  if (ctx.from.id != process.env.OWNER_ID) return;
  ctx.reply("Send me media URL or file to upload.");
});

// Callback join check
bot.on('callback_query', async (ctx) => {
  if (ctx.callbackQuery.data === 'join_check') {
    const userId = ctx.from.id;
    const joined = await checkJoin(userId); // Mini-bot check
    // Wait animation
    let message = await ctx.reply("Processing...🪄\n📢 Update Channel");
    for (let dot of WAIT_ANIMATION) {
      await new Promise(r => setTimeout(r, 300));
      await ctx.telegram.editMessageText(ctx.chat.id, message.message_id, undefined, `Processing${dot}\n📢 Update Channel`);
    }
    if (joined) {
      await ctx.reply("Here is your media: [Video/Photo URL]");
    } else {
      await ctx.reply("Please join the channel first! 🔗");
    }
  }
});

bot.launch();
console.log("Bot started ✅");

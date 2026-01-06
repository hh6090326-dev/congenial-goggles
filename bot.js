import { Telegraf } from "telegraf";
import { checkJoin } from "./checker.js";
import { updateUser, getUser } from "./jsonDB.js";
import 'dotenv/config';

const bot = new Telegraf(process.env.BOT_TOKEN);

const WAIT_ANIMATION = ['.', '..', '...', '..', '.'];
const WAIT_DELAY = 300; // milliseconds

// --- START COMMAND ---
bot.start((ctx) => {
  ctx.reply(`👋 Welcome!
Click below to get your promo content.`,
  { reply_markup: { inline_keyboard: [[{ text: "Join & Get Media", callback_data: "join_check" }]] } });
});

// --- UPLOAD COMMAND (admin only) ---
bot.command("upload", async (ctx) => {
  if (ctx.from.id != process.env.OWNER_ID) return;
  ctx.reply("Send me media URL or file to upload.");
});

// --- CALLBACK QUERY (join check + media delivery) ---
bot.on('callback_query', async (ctx) => {
  if (ctx.callbackQuery.data === 'join_check') {
    const userId = ctx.from.id;

    // check via mini-bot
    const joined = await checkJoin(userId);

    // save user to JSON DB
    updateUser(userId, joined, "media_placeholder.mp4"); // replace with actual media

    // Wait animation
    let message = await ctx.reply("Processing...🪄\n📢 Update Channel");
    for (let dot of WAIT_ANIMATION) {
      await new Promise(r => setTimeout(r, WAIT_DELAY));
      await ctx.telegram.editMessageText(ctx.chat.id, message.message_id, undefined, `Processing${dot}\n📢 Update Channel`);
    }

    // Media delivery
    if (joined) {
      await ctx.reply(`⚠️ Important:
All Messages will be deleted after 1 hour. Save them in your saved messages!

Here is your media: [Your Video/Photo]`,
        { reply_markup: { inline_keyboard: [[{ text: "📢 Uᴘᴅᴀᴛᴇ Cʜᴀɴɴᴇʟ", url: process.env.UPDATE_CHANNEL }]] } });
    } else {
      await ctx.reply("❌ You need to join the channel first! Click the button again after joining.");
    }
  }
});

// --- LAUNCH BOT ---
bot.launch();
console.log("Bot started ✅");

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

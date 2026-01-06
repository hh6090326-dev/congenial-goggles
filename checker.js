import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import 'dotenv/config';

const miniBotToken = process.env.MINI_BOT_TOKEN;

export async function checkJoin(userId) {
  // Call Telegram API via mini-bot
  try {
    const res = await fetch(`https://api.telegram.org/bot${miniBotToken}/getChatMember?chat_id=${process.env.UPDATE_CHANNEL}&user_id=${userId}`);
    const data = await res.json();
    if (data.ok && ['member','administrator','creator'].includes(data.result.status)) return true;
    return false;
  } catch (err) {
    console.log("Error checking join:", err);
    return false;
  }
}

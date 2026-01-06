import fetch from 'node-fetch';
import 'dotenv/config';

export async function checkJoin(userId) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${process.env.MINI_BOT_TOKEN}/getChatMember?chat_id=${process.env.UPDATE_CHANNEL}&user_id=${userId}`);
    const data = await res.json();
    if (data.ok && ['member','administrator','creator'].includes(data.result.status)) return true;
    return false;
  } catch (err) {
    console.log("Error checking join:", err);
    return false;
  }
}

import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { Api } from "telegram";

const API_ID = parseInt(process.env.API_ID);
const API_HASH = process.env.API_HASH;
const STRING_SESSION = process.env.STRING_SESSION;

export const client = new TelegramClient(new StringSession(STRING_SESSION), API_ID, API_HASH, {
  connectionRetries: 5
});

export async function startUserbot(){
  await client.start({
    phoneNumber: async () => "",
    password: async () => "",
    phoneCode: async () => "",
    onError: err => console.log(err)
  });
  console.log("Userbot ready");
}

export async function isJoinedOrRequested(channel, userId){
  try{
    const res = await client.invoke(new Api.channels.GetParticipant({
      channel,
      participant: userId
    }));
    if(res) return true;
  }catch{}
  return false;
}

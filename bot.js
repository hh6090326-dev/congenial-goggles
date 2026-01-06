import { Telegraf, Markup } from "telegraf";
import fs from "fs";
import { startUserbot, isJoinedOrRequested } from "./checker.js";

const BOT_TOKEN = process.env.BOT_TOKEN;
const OWNER_ID = parseInt(process.env.OWNER_ID);
const UPDATE_CHANNEL = process.env.UPDATE_CHANNEL;
const DATA_FILE = "./data.json";

let data = { users:[], clients:{}, media:null };
if (fs.existsSync(DATA_FILE)) data = JSON.parse(fs.readFileSync(DATA_FILE));
const save = ()=>fs.writeFileSync(DATA_FILE, JSON.stringify(data,null,2));

const bot = new Telegraf(BOT_TOKEN);

async function main(){
  await startUserbot();

  console.log("Bot ready");

  // START command
  bot.start(async ctx=>{
    const userId = ctx.from.id;
    if(!data.users.includes(userId)){
      data.users.push(userId); save();
    }

    const clientID = ctx.startPayload || "default";
    const channel = data.clients[clientID] || "AQUA_REALM";

    const joined = await isJoinedOrRequested(channel,userId);
    if(!joined){
      return ctx.reply(
        "Join channel to unlock 👇",
        Markup.inlineKeyboard([
          [Markup.button.url("Join Channel", `https://t.me/${channel}`)],
          [Markup.button.callback("I Joined ✅", `check_${clientID}`)]
        ])
      );
    }

    await sendContent(ctx);
  });

  // Check join callback
  bot.action(/check_(.+)/, async ctx=>{
    const clientID = ctx.match[1];
    const channel = data.clients[clientID] || "AQUA_REALM";
    const joined = await isJoinedOrRequested(channel, ctx.from.id);
    if(!joined) return ctx.answerCbQuery("Join first ❌");

    await ctx.deleteMessage();
    await sendContent(ctx);
  });

  // Send media with wait animation
  async function sendContent(ctx){
    const msg = await ctx.reply(
      "Please wait... .",
      Markup.inlineKeyboard([
        [Markup.button.url("📢 Uᴘᴅᴀᴛᴇ Cʜᴀɴɴᴇʟ", UPDATE_CHANNEL)]
      ])
    );

    const frames = [".","..","...","..","."];
    for(const f of frames){
      await new Promise(r=>setTimeout(r,300));
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        msg.message_id,
        null,
        `Please wait${f}`,
        Markup.inlineKeyboard([[Markup.button.url("📢 Uᴘᴅᴀᴛᴇ Cʜᴀɴɴᴇʟ", UPDATE_CHANNEL)]])
      );
    }

    await ctx.telegram.deleteMessage(ctx.chat.id,msg.message_id);

    if(data.media){
      const sent = await ctx.replyWithPhoto(data.media.file_id);
      const warn = await ctx.reply(
        "⚠️ Important:\nAll Messages will be deleted after 1 hours. Please save or forward these messages to your personal saved messages to avoid losing them!\n📢 Uᴘᴅᴀᴛᴇ Cʜᴀɴɴᴇʟ",
        Markup.inlineKeyboard([[Markup.button.url("📢 Uᴘᴅᴀᴛᴇ Cʜᴀɴɴᴇʟ", UPDATE_CHANNEL)]])
      );

      setTimeout(async()=>{
        try{
          await ctx.telegram.deleteMessage(ctx.chat.id,sent.message_id);
          await ctx.telegram.deleteMessage(ctx.chat.id,warn.message_id);
        }catch{}
      },3600000);
    }
  }

  // Admin check
  function isOwner(ctx){ return ctx.from.id === OWNER_ID; }

  // UPLOAD command
  bot.command("upload",ctx=>{
    if(!isOwner(ctx)) return;
    const msg = ctx.message.reply_to_message;
    if(!msg?.photo && !msg?.video) return;
    data.media = msg.photo?.pop() || msg.video;
    save();
    ctx.reply("Media saved ✅");
  });

  // ADD channel
  bot.command("add",ctx=>{
    if(!isOwner(ctx)) return;
    const args = ctx.message.text.split(" ").slice(1);
    if(args.length<2) return ctx.reply("Usage: /add <clientID> <channelName>");
    data.clients[args[0]] = args[1];
    save();
    ctx.reply("Channel added ✅");
  });

  // DELETE command
  bot.command("delete",ctx=>{
    if(!isOwner(ctx)) return;
    const args = ctx.message.text.split(" ").slice(1);
    if(!args[0]) return ctx.reply("Usage: /delete <clientID>");
    delete data.clients[args[0]];
    save();
    ctx.reply("Deleted ✅");
  });

  bot.launch();
}

main();

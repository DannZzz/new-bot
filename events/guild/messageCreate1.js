const config = require("../../config");
const rewards = require("../../rewards");
const translateAPI = require("@iamtraction/google-translate");
const embed = require("dann-embed");
const util = require("dann-util");
const Discord = require("discord.js");
const { adana } = require("../../JSON/responses");
const db = require("../../utils/db");
const magicStart = ['адана рифмуй']
const adananames = ["адана", "адану", "аданы", "адане", "adana"];
const open = "открой";
const close = "закрой";

let prefix = "a!";

const respMap = new Map();

const q1 = new Map();
const q2 = new Map();

module.exports = {
  name: "messageCreate",
  enabled: true,
  run: async (client, msg) => {
    let args = msg.content.slice(prefix.length).trim().split(/ +/g);
    let cmd = args.shift().toLowerCase();
    if (msg.author.bot || msg.channel.type !== "GUILD_TEXT") return;

    const splited = msg.content.toLowerCase().trim().split(/ +/g);

    const checkingName = msg.content.toLowerCase().trim().split(/ +/g);
    const filtered = checkingName.filter(message => adananames.includes(message));
    if (filtered && filtered.length > 0) {
      const toSend = adana[Math.floor(Math.random() * adana.length)];
      return msg.channel.send(toSend);
    }

    let toLang = "ru";

    const mainEmbed = embed(msg)
        .setColor(config.MAIN_COLOR)
        // .setFooter( `${await translate("Запрошенный")}: ${msg.author.username}`, msg.author.displayAvatarURL({dynamic: true}) )

    mainEmbed.author = {};

    const DATA = {
      Discord,
      db,
      getMember: (msg, obj = {
        member: "",
        guild: ""
      }) => {
        const member = msg.mentions.members.first() || (obj.guild || msg.guild).members.cache.get(obj.member || msg.member);
        return member;
      },
      util,
      embedCustom: embed,
      embed: mainEmbed,
      config,
      rewards,
      translate,
      serverData: async (id) => {}
    }

    async function translate(text = "") {
      const translated = await translateAPI(text, {to: (toLang || "en") });
      return translated.text;
    }

    const commandfile = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
    if (commandfile) {

      if (commandfile.disabled) return;
      if (commandfile.dev && !config?.DEVELOPER?.includes(msg.author.id)) return;
      if (commandfile.admin && !config?.ADMIN?.includes(msg.author.id)) return;


      commandfile.run(client, msg, args, DATA);

    }

  }
}

function response(msg) {
  const randInt = util.random(0, 100);
  if (randInt > 50) return;
  const cooldown = respMap.get(msg.guild.id);
  console.log(cooldown);
  if (cooldown && cooldown > new Date()) return;


  const content = msg.content;
  const capsed = msg.content.toUpperCase();
  const mained = capsed.toLowerCase();

  const toSendCapped = util.random(1, 100) > 50 ? true : false;

  if ( capsed === content && mained !== content && !content.startsWith("<")  && !content.startsWith(":") && msg.content && msg.content.length > 4 && isNaN(msg.content) ) {
    respMap.set(msg.guild.id, new Date(Date.now() + 5000));
    msg.channel.send(caps[Math.floor(Math.random() * caps.length)]);
    return
  } else {
    let done = false;
    const arr = content.toLowerCase().trim().split(/ +/g)
      for (let key in resp) {
        if (arr.includes(key)) {
          const toSend = resp[key][[Math.floor(Math.random() * resp[key].length)]]
          msg.channel.send(toSendCapped ? toSend.toUpperCase() : toSend);
          done = true;
          break;
        }
      }

      if (done) {
        respMap.set(msg.guild.id, new Date(Date.now() + 5000));
      }

      return;
  }

}

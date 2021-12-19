const config = require("../../config");
const translateAPI = require("@iamtraction/google-translate");
const embed = require("dann-embed");
const util = require("dann-util");
const Discord = require("discord.js");

let prefix = "a!";

const q1 = new Map();
const q2 = new Map();

module.exports = {
  name: "messageCreate",
  enabled: true,
  run: async (client, msg) => {
    let args = msg.content.slice(prefix.length).trim().split(/ +/g);
    let cmd = args.shift().toLowerCase();

    if (!msg.content.startsWith(prefix.toLowerCase())) return;

    let toLang = "ru";

    const mainEmbed = embed(msg)
        .setColor(config.MAIN_COLOR)
        // .setFooter( `${await translate("Запрошенный")}: ${msg.author.username}`, msg.author.displayAvatarURL({dynamic: true}) )

    mainEmbed.author = {};

    const DATA = {
      Discord,
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
      if (commandfile.dev && commandfile.dev !== config.DEVELOPER) return;
      if (commandfile.admin && commandfile.admin !== config.ADMIN) return;





      commandfile.run(client, msg, args, DATA);

    }

  }
}

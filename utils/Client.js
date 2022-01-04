const Discord = require("discord.js");
const util = require("dann-util");
const embed = require("dann-embed");
const { stripIndents } = require('common-tags');

class Client extends Discord.Client {
  constructor(obj = {}) {
    super({
      allowedMentions: obj.mentions || {parse: []},
      intents: obj.intents || ["GUILD_MESSAGES", "GUILDs", "GUILD_MEMBERS"]
    })
    this.dann = {
      util,
      embed
    };
    this.discord = Discord;
    this.indents = stripIndents;
    this.token = obj.token;
  }

  start() {
    console.log("Trying to connect with token")
    this.login(this.token).then(console.log("Connected")).catch(console.error);
  }
}

module.exports = Client;

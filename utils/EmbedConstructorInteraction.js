const { MessageEmbed } = require("discord.js");
const { MAIN_COLOR } = require("../config");
const { check, cross } = require('../assets/emojis');

const colors = {
	red: "#FF5440",
  green: "#7A912A",
  none: "#2f3136"
};

class EmbedConstructor extends MessageEmbed {
  constructor(interaction, author = false) {
    super();
    this.setColor(MAIN_COLOR || "#fff");

    this.i = interaction;
    author && this.base();
  }

  setText(description = "") {
    this.setDescription(description);
    return this;
  }
  setSuccess(description = "") {
    this.setDescription(`${check} | ${description}`);
    this.setColor(colors.green);
    return this;
  }
  setError(description = "") {
    this.setDescription(`${cross} | ${description}`);
    this.setColor(colors.red);
    return this;
  }
  send(reply = "reply", ephemeral = false) {
    return this.i[reply]({ embeds: [this], ephemeral });
  }

  base() {
    this.setAuthor(i.user.username, i.user.displayAvatarURL({dynamic: true}));
  }

};

module.exports = function (interaction, author) {
  return new EmbedConstructor(interaction, author);
};

const { SlashCommandBuilder } = require("@discordjs/builders");
const heroes = require("../../JSON/heroes");
const weapons = require("../../JSON/weapons");
const { add } = require("../../assets/emojis");
const { stripIndents } = require("common-tags");
const bonusArr = ["intelligence", "stamina", "defend", "attack"];

module.exports = {
  name:"profile",
  category: 4,
  data: new SlashCommandBuilder()
  .setName("профиль")
  .setDescription("Профиль пользователя.")
  .addUserOption(option =>
    option.setName("участник")
    .setDescription("Смотреть профиль участника сервера.")),

  run: async (client, int, Data) => {
    const { Discord, F, util, embed, db, emoji, config } = Data;

    const member = int.options.getMember("участник") || int.member;

    const data = await db.findOrCreate("profile", member.id);

    const emb = embed(int)
      .setAuthor(`Профиль — ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))
      .addField("Баланс:", `${emoji.coin}\`${util.formatNumber(data.coins || 0)}\``, true)
      .addField("Яблоки:", `${emoji.apple}\`${util.formatNumber(data.apples || 0)}\``, true)
      .addField("Токены:", `${emoji.token}\`${util.formatNumber(data.tokens || 0)}\``, true)
      .send();

  }
}

function itemInterfaceMaker (items, maxCount) {
  let text = "";
  items.forEach(i => text += i + " ");
  let toAdd = maxCount - items.length;
  while (toAdd > 0) {
    text += `${add} `;
    --toAdd;
  }
  return text;
}

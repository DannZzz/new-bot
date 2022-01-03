const { SlashCommandBuilder } = require("@discordjs/builders");
const heroes = require("../../JSON/heroes");
const weapons = require("../../JSON/weapons");
const { add } = require("../../assets/emojis");
const { stripIndents } = require("common-tags");
const bonusArr = ["intelligence", "stamina", "defend", "attack"];

module.exports = {
  name:"leaderboard",
  category: 4,
  data: new SlashCommandBuilder()
  .setName("лидеры")
  .setDescription("Посмотреть список лидеров."),
  run: async (client, int, Data) => {
    const { Discord, F, util, embed, db, emoji, config } = Data;


    const data = await db.findOrCreate("profile", int.member.id);
    const allDataSorted = await db.models.profile.find().sort({tokens: -1}).exec();

    const myIndex = allDataSorted.findIndex(obj => obj._id == int.user.id)
    console.log(myIndex)
    const sliced = allDataSorted.slice(0, 5);

    const texted = sliced.map((obj, i) => {
      const name = client.users.cache.get(obj._id)?.username ? client.users.cache.get(obj._id)?.username : "Неизвестный";

      return `\`${i+1}.\` **${name}** — ${emoji.token}\`${util.formatNumber(obj.tokens || 0)}\``;
    });

    embed(int)
    .setAuthor("Глобальный топ по токенам")
    .setText(stripIndents`
    ${texted.length > 1 ? texted.join("\n") : "Не найдены"}

    \`${myIndex + 1 || "Не найден"}.\` Ты(**${int.user.username}**) — ${emoji.token}\`${util.formatNumber(data.tokens || 0)}\`
    `)
    .send()
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

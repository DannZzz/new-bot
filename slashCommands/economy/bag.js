const { SlashCommandBuilder } = require("@discordjs/builders");
const { add } = require("../../assets/emojis");
const { stripIndents } = require("common-tags");

module.exports = {
  name: "bag",
  category: 4,
  data: new SlashCommandBuilder()
  .setName("сумка")
  .setDescription("Твоя сумка предметов!!"),
  run: async (client, int, Data) => {
    const { db, config, emoji, weapons, embed, util, F } = Data;

    const myData = await db.findOrCreate("game", int.user.id);
    const bag = myData.bag || [1, 2, 2, 1, 2, 1, 2];

    const count = config.MAX_BAG_COUNT;

    const text = bag.map(id => weapons.method.findWeapon(id).emoji);
    const itemText = bagInterfaceMaker(text, count);
    embed(int).setTitle(`Твои вещи [${text.length}]\nВместимость сумки: \`${count}\``).setThumbnail(int.user.displayAvatarURL({dynamic: true})).setText(itemText).send()

  }
}

function bagInterfaceMaker (items, maxCount) {
  let text = "";
  let n = 1;
  let m = 5;
  items.forEach(i => {
    text += i + " " + `${n % m === 0 ? "\n" : ""}`;
    ++n;
  });
  let toAdd = maxCount - items.length;
  while (toAdd > 0) {
    text += `${add} ` + `${n % m === 0 ? "\n" : ""}`;
    --toAdd;
    ++n;
  }
  return text;
}

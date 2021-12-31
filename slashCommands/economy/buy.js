const { SlashCommandBuilder } = require("@discordjs/builders");
const { add } = require("../../assets/emojis");
const { stripIndents } = require("common-tags");

module.exports = {
  name: "buy",
  category: 4,
  data: new SlashCommandBuilder()
  .setName("купить")
  .setDescription("Купить предмет.")
  .addNumberOption(option => option.setName("индекс")
    .setDescription("Индекс предмета.")
    .setRequired(true)),
  run: async (client, int, Data) => {
    const { db, emoji, embed, config, F, util, weapons } = Data;

    const index = int.options.getNumber("индекс");

    const game = await db.findOrCreate("game", int.user.id);
    const profile = await db.findOrCreate("profile", int.user.id);

    const maxSize = config.MAX_BAG_COUNT;

    const bag = game.bag || [];

    if (bag.length >= maxSize) return embed(int).setError("У тебя недостаточно звезд!").send();

    const weaponData = weapons.method.findWeapon(index);

    if (!weaponData) return embed(int).setError("Предмет с этим индексом не найден!").send();

    if (weapons.blocked.includes(weaponData.id)) return embed(int).setError("Этот предмет не доступен!").send();

    let costType = "apples";

    if (weaponData.costType) {
      costType = weaponData.costType;
    };

    if (!weaponData.cost) return embed(int).setError("Непонятная ошибка!").send();

    if (profile[costType] < weaponData.cost) return embed(int).setError(`У тебя недостаточно ${emoji[costType.slice(0, costType-1)]}!`).send();

    game.bag = [...bag, weaponData.id];
    game.save();

    await db[costType](int.user.id, -weaponData.cost);


    return embed(int).setSuccess(`Ты купил ${weaponData.emoji}`).send();

  }
}

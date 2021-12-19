const { SlashCommandBuilder } = require("@discordjs/builders");
const { add } = require("../assets/emojis");
const { stripIndents } = require("common-tags");

module.exports = {
  data: new SlashCommandBuilder()
  .setName("buy")
  .setDescription("Buy an item!")
  .addNumberOption(option => option.setName("index")
    .setDescription("Index of item!")
    .setRequired(true)),
  run: async (client, int, Data) => {
    const { db, emoji, embed, config, F, util, weapons } = Data;

    const index = int.options.getNumber("index");

    const game = await db.findOrCreate("game", int.user.id);
    const profile = await db.findOrCreate("profile", int.user.id);

    const maxSize = config.MAX_BAG_COUNT;

    const bag = game.bag || [];

    if (bag.length >= maxSize) return embed(int).setError("You do not have enough space in your bag!").send();

    const weaponData = weapons.method.findWeapon(index);

    if (!weaponData) return embed(int).setError("Item with this index not found!").send();

    if (weapons.blocked.includes(weaponData.id)) return embed(int).setError("This item is not available!").send();

    let costType = "apples";

    if (weaponData.costType) {
      costType = weaponData.costType;
    };

    if (!weaponData.cost) return embed(int).setError("Unexpected error!").send();

    if (profile[costType] < weaponData.cost) return embed(int).setError(`You do not have enough ${emoji[costType.slice(0, costType-1)]}!`).send();

    game.bag = [...bag, weaponData.id];
    game.save();

    await db[costType](int.user.id, -weaponData.cost);


    return embed(int).setSuccess(`You successfull bought ${weaponData.emoji}`).send();

  }
}
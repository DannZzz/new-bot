const { SlashCommandBuilder } = require("@discordjs/builders");
const { add } = require("../assets/emojis");
const { stripIndents } = require("common-tags");

module.exports = {
  data: new SlashCommandBuilder()
  .setName("equip")
  .setDescription("Equip an item to main hero!")
  .addNumberOption(option => option.setName("index")
  .setDescription("Index of item!")
  .setRequired(true))
  .addBooleanOption( option => option
  .setName("unequip")
  .setDescription("Choose true if you want to unequip item from hero!")
  ),
  run: async (client, int, Data) => {
    const { weapons, db, emoji, config, embed } = Data;
    const data = await db.findOrCreate("game", int.user.id);

    const index = Math.round(int.options.getNumber("index"));
    const unequip = int.options.getBoolean("unequip");
    const main = data.heroes[data.main || 0];
    const mainIndex = data.main || 0
    const maxItems = config.DEFAULT_ITEM_COUNT + (main.level || 1);
    const bag = data.bag || [];

    if (unequip) {
      const checkItem = (main.items || []).find(value => value == index);
      const checkItemIndex = (main.items || []).findIndex(value => value == index);
      if (!checkItem) return embed(int).setError("Item with this index not found! Check indexes by command `items`").send();
      if (bag.length + 1 > config.MAX_BAG_COUNT) return embed(int).setError("There are no more slots in your bag!").send();
      data.heroes[mainIndex].items.splice(checkItemIndex, 1);

      await db.models.game.updateOne({_id: int.user.id}, {$set: {
        [`heroes.${mainIndex}.items`]: data.heroes[mainIndex].items,
        bag: [index, ...bag]
      }});
      return embed(int).setSuccess("Item successfully unequiped!").send();
    }
    if (maxItems - main.items.length <= 0) return embed(int).setError("This hero have not enough slots!").send();

    const item = bag.findIndex(value => value == index);
    if (item < 0) return embed(int).setError("Item with this index not found! Check indexes by command `items`").send();

    const filtered = main.items.filter(value => value === index);
    if (filtered.length >= 2) return embed(int).setError("You can equip only 2 same items to one hero!").send();

    data.bag.splice(item, 1);

    await db.models.game.updateOne({_id: int.user.id}, {$set: {
      [`heroes.${mainIndex}.items`]: [...main.items, index],
      bag: data.bag
    } })

    return embed(int).setSuccess("Item successfully equiped!").send();
  }
}

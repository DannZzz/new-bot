const { SlashCommandBuilder } = require("@discordjs/builders");
const { add } = require("../../assets/emojis");
const { stripIndents } = require("common-tags");

module.exports = {
  name: "equip",
  category: 4,
  data: new SlashCommandBuilder()
  .setName("экипировать")
  .setDescription("Экипировать предмет на героя.")
  .addNumberOption(option => option.setName("индекс")
  .setDescription("Индекс предмета.")
  .setRequired(true))
  .addBooleanOption( option => option
  .setName("снять")
  .setDescription("Выбирай True если хочешь снять предмет с героя.")
  ),
  run: async (client, int, Data) => {
    const { weapons, db, emoji, config, embed } = Data;
    const data = await db.findOrCreate("game", int.user.id);

    const index = Math.round(int.options.getNumber("индекс"));
    const unequip = int.options.getBoolean("снять");
    const main = data.heroes[data.main || 0];
    const mainIndex = data.main || 0
    const maxItems = config.DEFAULT_ITEM_COUNT + (main.level || 1);
    const bag = data.bag || [];

    if (unequip) {
      const checkItem = (main.items || []).find(value => value == index);
      const checkItemIndex = (main.items || []).findIndex(value => value == index);
      if (!checkItem) return embed(int).setError("Предмет с этим индексом не найден, чекни индексы с помощью команды `предметы`!").send();
      if (bag.length + 1 > config.MAX_BAG_COUNT) return embed(int).setError("В сумке нет мест!").send();
      data.heroes[mainIndex].items.splice(checkItemIndex, 1);

      await db.models.game.updateOne({_id: int.user.id}, {$set: {
        [`heroes.${mainIndex}.items`]: data.heroes[mainIndex].items,
        bag: [index, ...bag]
      }});
      return embed(int).setSuccess("Предмет снят!").send();
    }
    if (maxItems - main.items.length <= 0) return embed(int).setError("Герой не имеет больше мест!").send();

    const item = bag.findIndex(value => value == index);
    if (item < 0) return embed(int).setError("Предмет с этим индексом не найден, чекни индексы с помощью команды `предметы`!").send();

    const filtered = main.items.filter(value => value === index);
    if (filtered.length >= 2) return embed(int).setError("Ты можешь экипировать только 2 одинаковые предметы!").send();

    data.bag.splice(item, 1);

    await db.models.game.updateOne({_id: int.user.id}, {$set: {
      [`heroes.${mainIndex}.items`]: [...main.items, index],
      bag: data.bag
    } })

    return embed(int).setSuccess("Предмет экипирован!").send();
  }
}

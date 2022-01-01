const { SlashCommandBuilder } = require("@discordjs/builders");
const { add } = require("../../assets/emojis");
const { stripIndents } = require("common-tags");

module.exports = {
  name: "add-money",
  category: 4,
  data: new SlashCommandBuilder()
  .setName("add")
  .setDescription("Добавить денег [для разработчика]!")
  .addSubcommand(command => command.setName("apples")
    .setDescription("Add apples!")
    .addStringOption(op => op.setName("id")
    .setDescription("The user Id to add!")
    .setRequired(true))
    .addNumberOption(op => op.setName("amount")
    .setDescription("Amount to add!")
    .setRequired(true))
  )
  .addSubcommand(command => command.setName("tokens")
    .setDescription("Add tokens!")
    .addStringOption(op => op.setName("id")
    .setDescription("The user Id to add!")
    .setRequired(true))
    .addNumberOption(op => op.setName("amount")
    .setDescription("Amount to add!")
    .setRequired(true))
  )
  .addSubcommand(command => command.setName("coins")
    .setDescription("Add coins!")
    .addStringOption(op => op.setName("id")
    .setDescription("The user Id to add!")
    .setRequired(true))
    .addNumberOption(op => op.setName("amount")
    .setDescription("Amount to add!")
    .setRequired(true))
  ),
  dev: true,
  run: async (client, int, Data) => {
    const { db, embed } = Data;
    const item = int.options.getSubcommand();
    const userId = int.options.getString("id");
    const amount = Math.round(int.options.getNumber("amount"));

    const user = client.users.cache.get(userId);
    if (!user) return embed(int).setError("User not found!").send();

    await db.findOrCreate("profile", user.id);
    await db[item](user.id, amount)
    embed(int).setSuccess("Successfully added!").send();

  }
}

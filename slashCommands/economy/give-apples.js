const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  name: "give-apples",
  category: 4,
  data: new SlashCommandBuilder()
    .setName("перевод")
    .setDescription("Передать яблоки, другому участнику.")
    .addUserOption(o => o
      .setName("участник")
      .setDescription("Участник сервера, которому нужно передавать яблоки.")
      .setRequired(true)
    )
    .addNumberOption(o => o
      .setName("количество")
      .setDescription("Количество яблок.")
      .setRequired(true)
    ),
  cooldown: 5,
  run: async (client, int, Data) => {
    const { emoji, db, util, embed } = Data;

    const member = int.options.getMember("участник");
    const amount = Math.round(int.options.getNumber("количество"));

    if (member.id === int.user.id || member.user.bot) return embed(int).setError("Ляя чел, укажи другого участника!").send()

    const myData = await db.findOrCreate("profile", int.user.id);

    if (amount <= 0) return embed(int).setError("Недопустимое количество!").send();
    if (amount > myData.apples) return embed(int).setError("Недостаточно яблок!").send();

    await Promise.all([
      db.findOrCreate("profile", member.id),
      db.apples(int.user.id, -amount),
      db.apples(member.id, amount)
    ]);

    embed(int).setSuccess(`Збс, ты отправил ${emoji.apple}\`${util.formatNumber(amount)}\` участнику **${member.user.username}**!`).send()

  }
}

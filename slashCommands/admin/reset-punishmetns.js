const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  name: "reset-punishment",
  category: 2,
  data: new SlashCommandBuilder()
  .setName("сбросить-случаи")
  .setDescription("Сбросить все предупреждения, участника или сервера.")
  .addSubcommand(cmd => cmd
    .setName("сервера")
    .setDescription("Сбросить все случаи сервера!")
  )
  .addSubcommand(cmd => cmd
    .setName("участника")
    .setDescription("Сбросить все предупреждения участника.")
    .addUserOption(o => o
      .setName("участник")
      .setDescription("Участник сервера.")
      .setRequired(true)
    )
  ),
  permissions: ["ADMINISTRATOR"],
  run: async (client, int, Data) => {
    const { embed, serverData, F, util, db } = Data;

    const guild = int.guild;
    const user = int.user;
    const target = int.options.getMember("участник");
    const cmd = int.options.getSubcommand()

    const obj = {
      "сервера": async () => {
        serverData.punishments = [];
        serverData.punishmentsCount = 1;
        serverData.save();

        return embed(int).setSuccess("Все случаи на сервере сброшены.").send();
      },
      "участника": async () => {
        if (!target) return embed(int).setError("Участник не найден!").send();

        const filtered = (serverData.punishments || []).filter(obj => obj.userId !== target.id);

        serverData.punishments = filtered;
        serverData.save();

        return embed(int).setSuccess(`Сброшены все случаи участника **${target.user.username}**.`).send();

      }
    }
    obj[cmd]();

  }
}

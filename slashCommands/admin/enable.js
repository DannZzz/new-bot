const { SlashCommandBuilder } = require('@discordjs/builders');
const { progressBar } = require("../../utils/functions");
module.exports = {
  name: "enable-command",
  category: 2,
  data: new SlashCommandBuilder()
  	.setName('включить')
  	.setDescription('Включить команду глобально.')
    .addStringOption(o => o
      .setName("команда")
      .setDescription("Название команды.")
      .setRequired(true)
    ),
  permissions: ['MANAGE_SERVER'],
  always: true,
  run: async (client, int, Data) => {
    const { Discord, embed, util, serverData, db } = Data;
    const commands = serverData.disabledCommands;
    if (!commands) {
      serverData.disabledCommands = {};
      await serverData.save();
    };

    const cmd = int.options.getString("команда");

    const check = client.slashCommands.find(c => c.data.name === cmd.toLowerCase());
    if (!check) return embed(int).setError("Команда не найдена!").send();

    await db.models.server.updateOne({_id: int.guild.id}, {$set: {[`disabledCommands.${check.name}`]: {} }});

    return embed(int).setSuccess(`Команда **${check.data.name}** теперь включена везде.`).send();

  }
}

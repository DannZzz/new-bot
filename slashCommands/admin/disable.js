const { SlashCommandBuilder } = require('@discordjs/builders');
const { progressBar } = require("../../utils/functions");

module.exports = {
  name: "disable-command",
  category: 2,
  data: new SlashCommandBuilder()
  	.setName('отключить')
  	.setDescription('Отключить команду.')
    .addStringOption(o => o
      .setName("команда")
      .setDescription("Название команды.")
      .setRequired(true)
    )
    .addChannelOption(o => o
      .setName("канал")
      .setDescription("Текстовый канал, где команды не будут работать.")
    )
    .addRoleOption(o => o
      .setName("роль")
      .setDescription("Запретить участникам с этой ролью, использовать эту команду.")
    ),
  permissions: ['MANAGE_SERVER'],
  always: true,
  run: async (client, int, Data) => {
    const { Discord, embed, util, serverData: sd, db } = Data;
    const commands = sd.disabledCommands;
    if (!commands) {
      sd.disabledCommands = {};
    };

    const cmd = (int.options.getString("команда")).toLowerCase();
    var role = int.options.getRole("роль");
    var channel = int.options.getChannel("канал");

    const check = client.slashCommands.find(command => command.data.name === cmd);
    if (!check) return embed(int).setError("Команда не найдена!").send();
    if (check.always) return embed(int).setError(`Команда **${check.data.name}** не может быть отключена.`).send();
    if (!sd.disabledCommands[check.name]) {
      sd.disabledCommands[check.name] = {};
      await sd.save();
    }
    const serverData = await db.findOrCreate("server", int.guild.id);
    if (!role && !channel) {
      if (serverData.disabledCommands[check.name]?.globalDisabled) return embed(int).setError(`Команда **${check.data.name}** уже отключена по всему серверу.`).send();
      await db.models.server.updateOne({_id: int.guild.id}, {$set: {
        [`disabledCommands.${check.name}.globalDisabled`]: true,
        [`disabledCommands.${check.name}.disabledChannels`]: [],
        [`disabledCommands.${check.name}.disabledRoles`]: [],
      }})
      return embed(int).setSuccess(`Команда **${check.data.name}** глобально отключена на сервере.`).send();
    } else if (channel) {
      channel = int.guild.channels.cache.get(channel.id);
      if (channel) {
        if (channel.type !== "GUILD_TEXT") return embed(int).setError("Укажи текстовый канал!").send();
        if (!serverData.disabledCommands[check.name].disabledChannels) {
          await db.models.server.updateOne({_id: int.guild.id}, {$set: {[`disabledCommands.${check.name}.disabledChannels`]: [channel.id]}})
        } else if (serverData.disabledCommands[check.name].disabledChannels.includes(channel.id)) {
          return embed(int).setError(`Команда **${check.data.name}** уже отключена на этом канале.`).send();
        } else {
          await db.models.server.updateOne({_id: int.guild.id}, {$set: {[`disabledCommands.${check.name}.disabledChannels`]: [channel.id, ... serverData.disabledCommands[check.name].disabledChannels]}})
        }
        return embed(int).setSuccess(`Команда **${check.data.name}** теперь отключена на канале ${channel}.`).send();
      }
    }

    if (role) {
      role = int.guild.roles.cache.get(role.id);
      if (role) {
        if (!serverData.disabledCommands[check.name].disabledRoles) {
          await db.models.server.updateOne({_id: int.guild.id}, {$set: {[`disabledCommands.${check.name}.disabledRoles`]: [role.id]}})
        } else if (serverData.disabledCommands[check.name].disabledRoles.includes(role.id)) {
          return embed(int).setError(`Команда **${check.data.name}** уже отключена для этой роли.`).send();
        } else {
          await db.models.server.updateOne({_id: int.guild.id}, {$set: {[`disabledCommands.${check.name}.disabledRoles`]: [role.id, ... serverData.disabledCommands[check.name].disabledRoles]}})
        }
        return embed(int).setSuccess(`Команда **${check.data.name}** теперь отключена для роли ${role}.`).send();
      }
    }


    return embed(int).setError(`Данные не найдены!`).send("reply", true);

  }
}

const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  name: "rempunishment",
  category: 2,
  data: new SlashCommandBuilder()
  .setName("убрать-случай")
  .setDescription("Убрать предупреждение, случай по номеру.")
  .addIntegerOption(o => o
    .setName("случай")
    .setDescription("Номер случая.")
    .setRequired(true)
  ),
  run: async (client, int, Data) => {
    const { embed, serverData, F, util, db } = Data;

    const guild = int.guild;
    const user = int.user;
    const _case = int.options.getInteger("случай");

    let hasAllowedRole = false;
    if (serverData.moderrole && serverData.moderrole.length > 1) {
      if (int.member.roles.cache.hasAny(...serverData.moderrole)) hasAllowedRole = true;
    }

    if (int.member.permissions.has("ADMINISTRATOR" || "MANAGE_SERVER")) hasAllowedRole = true

    if (!hasAllowedRole) return embed(int).setError("У тебя недостаточно прав, и не имеешь роль модератора.").send();

    if (!serverData.punishments) serverData.punishments = [];

    const isValidCase = serverData.punishments.findIndex(warn => warn.case === _case);

    if (isValidCase < 0) return embed(int).setError(`Случай по этому номеру не найден!`).send();

    serverData.punishments.splice(isValidCase, 1);
    serverData.save();

    embed(int).setSuccess(`Случай \`#${_case}\` убран!`).send();
  }
}

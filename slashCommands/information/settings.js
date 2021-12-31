const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  name: "settings",
  category: 3,
  data: new SlashCommandBuilder()
  .setName("настройки")
  .setDescription("Предупреждения участника."),
  run: async (client, int, Data) => {
    const { embed, serverData, F, util, db, Discord } = Data;

    const guild = int.guild;
    const user = int.user;

    let obj = {
      "модератор": "moderrole",
      "банер": "banAllowedRoles",
      "кикер": "kickAllowedRoles"
    };

    const moderrole = (serverData.moderrole || []).filter(roleId => guild.roles.cache.get(roleId));
    const banAllowedRoles = (serverData.banAllowedRoles || []).filter(roleId => guild.roles.cache.get(roleId));
    const kickAllowedRoles = (serverData.kickAllowedRoles || []).filter(roleId => guild.roles.cache.get(roleId));

    const mainEmbed = embed(int)
    .setAuthor("Настройки сервера")
    .addField("Роли модераторов:", moderrole.length > 0 ? moderrole.map(roleId => guild.roles.cache.get(roleId)).join(", ") : "Нет назначенных ролей" )
    .addField("Роли банеров:", banAllowedRoles.length > 0 ? banAllowedRoles.map(roleId => guild.roles.cache.get(roleId)).join(", ") : "Нет назначенных ролей" )
    .addField("Роли кикеров:", kickAllowedRoles.length > 0 ? kickAllowedRoles.map(roleId => guild.roles.cache.get(roleId)).join(", ") : "Нет назначенных ролей" )
    .send();
  }
}

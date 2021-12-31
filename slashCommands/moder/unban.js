const { SlashCommandBuilder } = require("@discordjs/builders");
const ms = require("ms");

module.exports = {
  name: "unban",
  category: 1,
  data: new SlashCommandBuilder()
  .setName("разбан")
  .setDescription("Разбанить участника из сервера!")
  .addUserOption(o => o
    .setName("участник")
    .setDescription("Участник сервера!")
    .setRequired(true)
  )
  .addStringOption(o => o
    .setName("причина")
    .setDescription("Причина разбана!")
  ),
  botPermissions: ["BAN_MEMBERS"],
  run: async (client, int, Data) => {
    //return console.log(int.member.permissions);
      const { embed, config, emoji, db, F, util, Discord, serverData } = Data;
      const guild = int.guild;
      const user = int.user;
      const target = int.options.getUser("участник");
      let reason = int.options.getString("причина");
      let reasonCheck = true;
      if (!reason) {
        reasonCheck = false;
        reason = "Причина не указана"};
      // checking permissions
      const hasUserPermission = int.member.permissions.has("BAN_MEMBERS");

      let hasBanAllowedRole = false;
      if (serverData.banAllowedRoles && serverData.banAllowedRoles.length > 0) {
        if (int.member.roles.cache.hasAny(...serverData.banAllowedRoles)) hasBanAllowedRole = true;
      }

      if (!hasUserPermission && !hasBanAllowedRole) return embed(int).setError("У тебя недостаточно прав, и не имеешь роль банера.").send();

      if (!target) return embed(int).setError("Участник не найден!").send();
      if (target.id === user.id) embed(int).setError("Ляя чел, укажи другого участника!").send();
      const bans = await guild.bans.fetch();
      const banned = bans.find(ban => ban.user.id === target.id)

      if (!banned) return embed(int).setError(`Забаненный участник не найден!`).send();

      if (reason && reason.length > 100) return embed(int).setError("Причина слишком длинная, максимально допустимая длина - 100 символов!").send();
      guild.bans.remove(target, `${user.tag}: ${reason}`)
      const emb = embed(int).setSuccess(`Участник **${target.username}** разбанен!`).addField('Модератор:', `${int.member}`);
      if (reasonCheck) {
        emb.addField("Причина:", reason);
      }
      emb.send();
  }
}

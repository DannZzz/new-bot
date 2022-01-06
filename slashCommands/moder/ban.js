const { SlashCommandBuilder } = require("@discordjs/builders");
const ms = require("ms");
const { warns } = require("../../JSON/choices");

module.exports = {
  name: "ban",
  category: 1,
  data: new SlashCommandBuilder()
  .setName("бан")
  .setDescription("Забанить участника из сервера!")
  .addUserOption(o => o
    .setName("участник")
    .setDescription("Участник сервера!")
    .setRequired(true)
  )
  .addIntegerOption(o => o
    .setName("дни")
    .setDescription("Сообщения в течении определённой времени, которые удалятся!")
  )
  .addStringOption(o => o
    .setName("причина")
    .setDescription("Причина бана!")
    .addChoices(warns)
  ),
  botPermissions: ["BAN_MEMBERS"],
  run: async (client, int, Data) => {
    //return console.log(int.member.permissions);
      const { embed, config, emoji, db, F, util, Discord, serverData } = Data;
      const guild = int.guild;
      const user = int.user;
      const target = int.options.getMember("участник") || int.options.getUser("участник");
      let days = int.options.getInteger("дни");
      let reason = int.options.getString("причина");

      let reasonCheck = true;
      if (!reason) {
        reasonCheck = false;
        reason = "Причина не указана";
      };
      // checking permissions
      const hasUserPermission = int.member.permissions.has("BAN_MEMBERS");

      if (!days) {
        days = 0;
      } else if (days < 0) {
        days = 1;
      } else if (days > 7) {
        days = 7;
      }

      let hasBanAllowedRole = false;
      if (serverData.banAllowedRoles && serverData.banAllowedRoles.length > 0) {
        if (int.member.roles.cache.hasAny(...serverData.banAllowedRoles)) hasBanAllowedRole = true;
      }

      if (!hasUserPermission && !hasBanAllowedRole) return embed(int).setError("У тебя недостаточно прав, и не имеешь роль банера.").send();

      if (!guild.members.cache.get(target.id)) {
        if (target.id === user.id) return embed(int).setError("Укажи другого пользователя!").send();
        if (reason && reason.length > 100) return embed(int).setError("Причина слишком длинная, максимально допустимая длина - 100 символов!").send();

        const banned = await guild.bans.create(target, {days, reason: `${user.tag}: ${reason}`});
        if (banned) {
          const emb = embed(int).setSuccess(`Пользователь **${target.username}** был забанен!`).addField('Модератор:', `${int.member}`);
          if (reasonCheck) {
            emb.addField("Причина:", reason);
          }
          emb.send();
        }
        return embed(int).setError("Пользователь не найден, проверь данные!").send();
      }

      if (!target) return embed(int).setError("Участник не найден!").send();
      if (target.id === user.id) embed(int).setError("Ляя чел, укажи другого участника!").send();
      if (guild.me.roles.highest.position <= target.roles.highest.position) return embed(int).setError("Я не могу забанить этого участника!").send();

      if (target.roles.highest.position >= int.member.roles.highest.position && user.id !== guild.ownerId) return embed(int).setError("Ты не можешь забанить участника с этой ролью!").send();
      if (target.id === guild.ownerId) return embed(int).setError("Это владелец сервера, невозможно забанить.").send();


      if (reason && reason.length > 100) return embed(int).setError("Причина слишком длинная, максимально допустимая длина - 100 символов!").send();
      target.ban({days, reason: `${user.tag}: ${reason}`})
      const emb = embed(int).setSuccess(`Участник **${target.user.username}** забанен!`).addField('Модератор:', `${int.member}`);

      if (reasonCheck) {
        emb.addField("Причина:", reason);
      }
      emb.send();
  }
}

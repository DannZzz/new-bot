const { SlashCommandBuilder } = require("@discordjs/builders");
const ms = require("ms");

module.exports = {
  name: "kick",
  category: 1,
  data: new SlashCommandBuilder()
  .setName("выгнать")
  .setDescription("Выгнать участника из сервера.")
  .addUserOption(o => o
    .setName("участник")
    .setDescription("Участник сервера.")
    .setRequired(true)
  )
  .addStringOption(o => o
    .setName("причина")
    .setDescription("Причина кика.")
    .addChoice("Неадекватное поведение", "Неадекватное поведение")
    .addChoice("Оскорбления", "Оскорбления")
    .addChoice("Пиар", "Пиар")
    .addChoice("Расизм, религизм", "Расизм, религизм")
    .addChoice("Спам и флуд", "Спам и флуд")
    .addChoice("Оффтоп", "Оффтоп")
    .addChoice("Распрострaнения ссылок", "Распрострaнения ссылок")
    .addChoice("18+ контент", "18+ контент")  
  ),
  botPermissions: ["KICK_MEMBERS"],
  run: async (client, int, Data) => {
    //return console.log(int.member.permissions);
      const { embed, config, emoji, db, F, util, Discord, serverData } = Data;
      const guild = int.guild;
      const user = int.user;
      const target = int.options.getMember("участник");
      let days = Math.round(int.options.getNumber("дни"));
      let reason = int.options.getString("причина");

      let reasonCheck = true;
      if (!reason) {
        reasonCheck = false;
        reason = "Причина не указана";
      };
      // checking permissions
      const hasUserPermission = int.member.permissions.has("KICK_MEMBERS");

      if (!days) {
        days = 0;
      } else if (days < 0) {
        days = 1;
      } else if (days > 7) {
        days = 7;
      }

      let hasKickAllowedRole = false;
      if (serverData.kickAllowedRoles && serverData.kickAllowedRoles.length > 0) {
        if (int.member.roles.cache.hasAny(...serverData.kickAllowedRoles)) hasKickAllowedRole = true;
      }

      if (!hasUserPermission && !hasKickAllowedRole) return embed(int).setError("У тебя недостаточно прав, и не имеешь роль кикера.").send();

      if (!target) return embed(int).setError("Участник не найден!").send();
      if (target.id === user.id) embed(int).setError("Ляя чел, укажи другого участника!").send();
      if (guild.me.roles.highest.position <= target.roles.highest.position) return embed(int).setError("Я не могу выгнать этого участника!").send();

      if (target.roles.highest.position >= int.member.roles.highest.position && user.id !== guild.ownerId) return embed(int).setError("Ты не можешь выгнать участника с этой ролью!").send();
      if (target.id === guild.ownerId) return embed(int).setError("Это владелец сервера, невозможно выгнать.").send();


      if (reason && reason.length > 100) return embed(int).setError("Причина слишком длинная, максимально допустимая длина - 100 символов!").send();
      target.kick(`${user.tag}: ${reason}`)
      const emb = embed(int).setSuccess(`Участник **${target.user.username}** выгнан!`).addField('Модератор:', `${int.member}`);

      if (reasonCheck) {
        emb.addField("Причина:", reason);
      }
      emb.send();
  }
}

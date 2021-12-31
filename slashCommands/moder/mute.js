const { SlashCommandBuilder } = require("@discordjs/builders");
const ms = require("ms");

module.exports = {
  name: "mute",
  category: 1,
  data: new SlashCommandBuilder()
  .setName("мьют")
  .setDescription("Замьютить участника на время.")
  .addUserOption(o => o
    .setName("участник")
    .setDescription("Участник сервера.")
    .setRequired(true)
  )
  .addStringOption(o => o
    .setName("время")
    .setDescription("Длительность мьюта. Формат: 1m, 1h, 1d, 1w")
  )
  .addStringOption(o => o
    .setName("причина")
    .setDescription("Причина мьюта.")
  ),
  botPermissions: ["MODERATE_MEMBERS"],
  run: async (client, int, Data) => {
    //return console.log(int.member.permissions);
      const { embed, config, emoji, db, F, util, Discord } = Data;
      const guild = int.guild;
      const user = int.user;
      const target = int.options.getMember("участник");
      const time = int.options.getString("время");
      let reason = int.options.getString("причина");
      let reasonCheck = true;
      if (!reason) {
        reasonCheck = false;
        reason = "Причина не указана"
      };

      const server = await db.findOrCreate("server", int.guild.id);

      let moderrole = false;

      // is moderator role specified and exists
      if (server.moderrole && server.moderrole.length > 0) {
        moderrole = server.moderrole;
      }
      // checking permissions
      const hasUserPermission = int.member.permissions.has("MODERATE_MEMBERS");
      let hasModerRole = false;
      let isTargetModer = false;
      const hasTargetPermission = target.permissions.has("MODERATE_MEMBERS");

      if (moderrole) {
        if (int.member.roles.cache.hasAny(...moderrole)) hasModerRole = true;
        if (target.roles.cache.hasAny(...moderrole)) isTargetModer = true;
        console.log(hasModerRole, isTargetModer)
      }

      if (!hasUserPermission && !hasModerRole) return embed(int).setError("У тебя недостаточно прав, и не имеешь роль модератора.").send();

      if (!target) return embed(int).setError("Участник не найден!").send();
      if (target.user.bot) return embed(int).setError("Нельзя замьютить ботов!").send()
      if (target.id === user.id) embed(int).setError("Ляя чел, укажи другого участника!").send();
      if (guild.me.roles.highest.position <= target.roles.highest.position) return embed(int).setError("Я не могу замьютить этого участника!").send();
      if (hasTargetPermission || isTargetModer) {
        if (target.roles.highest.position >= int.member.roles.highest.position && user.id !== guild.ownerId) return embed(int).setError("Ты не можешь замьютить участника с этой ролью!").send();
        if (target.id === guild.ownerId) return embed(int).setError("Это владелец сервера, невозможно замьютить.").send();
      }

      if (time && (!ms(time) || ms(time) <= 0)) return embed(int).setError('Время указана неправильно!\nДоступный формат: \`1m, 1h, 1d, 1w\`').send();

      if (reason && reason.length > 100) return embed(int).setError("Причина слишком длинная, максимально допустимая длина - 100 символов!").send();
      const correctTime = time ? ms(time) : 3600000;
      target.timeout(correctTime, `${user.tag}: ${reason || "причина не указана"}`);

      const emb = embed(int).setSuccess(`Участник **${target.user.username}** замучен до ${Discord.Formatters.time(F.timestamp(correctTime), "f")}`).addField('Модератор:', `${int.member}`);
      if (reasonCheck) {
        emb.addField("Причина:", reason);
      }
      emb.send();
  }
}

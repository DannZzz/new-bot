const { SlashCommandBuilder } = require("@discordjs/builders");
const ms = require("ms");
const { warns } = require("../../JSON/choices");

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
    .addChoice("5 минут", "5m")
    .addChoice("10 минут", "10m")
    .addChoice("30 минут", "30m")
    .addChoice("1 час", "1h")
    .addChoice("2 часа", "2h")
    .addChoice("3 часа", "3h")
    .addChoice("6 часов", "6h")
    .addChoice("12 часов", "12h")
    .addChoice("1 день", "1d")
    .addChoice("2 дня", "2d")
    .addChoice("5 дней", "5d")
    .addChoice("1 неделя", "1w")
  )
  .addStringOption(o => o
    .setName("причина")
    .setDescription("Причина мьюта.")
    .addChoices(warns)
  )
  .addStringOption(o => o
    .setName("своя-причина")
    .setDescription("Своя причина.")
  ),
  botPermissions: ["MODERATE_MEMBERS"],
  run: async (client, int, Data) => {
    //return console.log(int.member.permissions);
      const { embed, config, emoji, db, F, util, Discord, serverData: server } = Data;
      const guild = int.guild;
      const user = int.user;
      const target = int.options.getMember("участник");
      const time = int.options.getString("время");
      let reason = int.options.getString("своя-причина") || int.options.getString("причина");
      let reasonCheck = true;
      if (!reason) {
        reasonCheck = false;
        reason = "Причина не указана"
      };

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
      }

      let hasSomeMutes = false;
      let highRolePos = -1;
      let highRole = false;
      if (server.temporaryRolesForMute && server.temporaryRolesForMute.length > 0 && (server.premium && server.premium > new Date())) {
        const roles = server.temporaryRolesForMute.map(obj => obj.id);
        const validRoles = roles.filter(id => guild.roles.cache.get(id));
        validRoles.forEach(id => {
          if (int.member.roles.cache.has(id)) {
            const role = guild.roles.cache.get(id);
            if (!highRole || highRolePos < role.position) {
              highRole = id;
              highRolePos = role.position
              hasSomeMutes = true;
            }
          }
        })
      }

      if (!hasUserPermission && !hasModerRole && !hasSomeMutes) return embed(int).setError("У тебя недостаточно прав, и не имеешь роль модератора.").send();

      if (!target) return embed(int).setError("Участник не найден!").send();
      if (target.user.bot) return embed(int).setError("Нельзя замьютить ботов!").send()
      if (target.id === user.id) embed(int).setError("Ляя чел, укажи другого участника!").send();
      if (guild.me.roles.highest.position <= target.roles.highest.position) return embed(int).setError("Я не могу замьютить этого участника!").send();
      const mutes = server.allTemporaryMutes || [];

      const onlyMutes = !hasUserPermission && !hasModerRole && hasSomeMutes;
      let validMuteCount;
      if (onlyMutes) {
        const maxUses = server.temporaryRolesForMute.find(obj => obj.id === highRole).uses;
        const filtered = mutes.filter(i => i === user.id);
        validMuteCount = maxUses - filtered.length;
        if (filtered.length >= maxUses) return embed(int).setError("У вас не остались мьютов, дождитесь до завтра!").send();
      }

      if (hasTargetPermission || isTargetModer) {
        if (onlyMutes) return embed(int).setError("Ты не сможешь замьютить модератора!").send()
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
      await emb.send();
      if (onlyMutes) {
        int.followUp({content: `У тебя остались еще ${validMuteCount-1} мьютов(-а) сегодня.`, ephemeral: true});
        await db.models.server.updateOne({_id: guild.id}, {$set: {allTemporaryMutes: [...mutes, user.id]}});
      }
  }
}

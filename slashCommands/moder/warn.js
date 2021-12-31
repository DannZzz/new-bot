const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  name: "warn",
  category: 1,
  data: new SlashCommandBuilder()
  .setName("предупреждать")
  .setDescription("Предупреждать участника подумать о своём поведений.")
  .addUserOption(o => o
    .setName("участник")
    .setDescription("Участник сервера.")
    .setRequired(true)
  )
  .addStringOption(o => o
    .setName('причина')
    .setDescription("Причина предупреждений.")
  ),
  run: async (client, int, Data) => {
    const { embed, serverData, F, util, db } = Data;

    const guild = int.guild;
    const user = int.user;
    const target = int.options.getMember("участник");
    let reason = int.options.getString("причина");
    let reasonCheck = true;
    if (!reason) {
      reasonCheck = false;
      reason = "Причина не указана"
    };

    let moderrole = false;

    // is moderator role specified and exists
    if (serverData.moderrole && serverData.moderrole.length > 0) {
      moderrole = serverData.moderrole;
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

    if (!hasUserPermission && !hasModerRole) return embed(int).setError("У тебя недостаточно прав, и не имеешь роль модератора.").send();

    if (!target) return embed(int).setError("Участник не найден!").send();
    if (target.user.bot) return embed(int).setError("Нельзя предупреждать ботов!").send()
    if (target.id === user.id) embed(int).setError("Ляя чел, укажи другого участника!").send();
    if (hasTargetPermission || isTargetModer) {
      if (target.roles.highest.position >= int.member.roles.highest.position && user.id !== guild.ownerId) return embed(int).setError("Ты не можешь предупреждать участника с этой ролью!").send();
      if (target.id === guild.ownerId) return embed(int).setError("Это владелец сервера, невозможно предупреждать.").send();
    }
    if (reason && reason.length > 100) return embed(int).setError("Причина слишком длинная, максимально допустимая длина - 100 символов!").send();

    if (!serverData.punishments) serverData.punishments = [];
    if (!serverData.punishmentsCount) serverData.punishmentsCount = 1
    const _case = serverData.punishmentsCount;
    serverData.punishments.push({
      userId: target.id,
      moderator: user.id,
      reason,
      date: new Date(),
      case: _case
    });

    serverData.punishmentsCount += 1;
    serverData.save();

    const emb = embed(int).setSuccess(`\`#${_case}\` случай добавлен к участнику **${target.user.username}**`).addField("Модератор:", `${int.member}`);
    if (reasonCheck) {
      emb.addField("Причина:", reason);
    }
    emb.send();

  }
}

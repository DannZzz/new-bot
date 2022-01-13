const { SlashCommandBuilder } = require("@discordjs/builders");

const msToString = {
  "5m": "5 минут",
  "10m": "10 минут",
  "30m": "30 минут",
  "1h": "1 час",
  "2h": "2 часа",
  "3h": "3 часа",
  "6h": "6 часов",
  "12h": "12 часов",
  "1d": "1 день",
  "2d": "2 дня",
  "5d": "5 дней",
  "1w": "1 неделя"
}

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

    const commands = serverData.disabledCommands || {};
    const disabled = [];

    for (let commandKey in commands) {
      const commandData = commands[commandKey];
      if (commandData.globalDisabled) {
        const cmd = client.slashCommands.find(data => data.name === commandKey);
        if (cmd) disabled.push(`\`${cmd.data.name}\``);
      };
    };


    const temporaryMutes = (serverData.temporaryRolesForMute || []).map(obj => {
      const role = guild.roles.cache.get(obj.id);
      if (role) {
        return `${role} — \`${util.formatNumber(obj.uses)}\` — \`${obj.limit ? msToString[obj.limit] : msToString["1w"]}\``
      }
    })

    const moderrole = (serverData.moderrole || []).filter(roleId => guild.roles.cache.get(roleId));
    const banAllowedRoles = (serverData.banAllowedRoles || []).filter(roleId => guild.roles.cache.get(roleId));
    const kickAllowedRoles = (serverData.kickAllowedRoles || []).filter(roleId => guild.roles.cache.get(roleId));

    const answers = serverData.magicDisabledChannels || [];
    const mapped = answers.map(channelId => {
    const channel = guild.channels.cache.get(channelId);
      if (channel) return channel;
    });

    const mainEmbed = embed(int)
    .setAuthor("⚙ Настройки сервера")
    .addField("Премиум:", serverData.premium && serverData.premium > new Date() ? `До ${Discord.Formatters.time(F.timestamp(0, serverData.premium.getTime()))}` : "Нет")
    .addField("Отключённые каналы от ответов:", mapped.length > 0 ? mapped.join(", ") : "Не найдены")
    .addField("Роли модераторов:", moderrole.length > 0 ? moderrole.map(roleId => guild.roles.cache.get(roleId)).join(", ") : "Нет назначенных ролей" )
    .addField("Роли банеров:", banAllowedRoles.length > 0 ? banAllowedRoles.map(roleId => guild.roles.cache.get(roleId)).join(", ") : "Нет назначенных ролей" )
    .addField("Роли кикеров:", kickAllowedRoles.length > 0 ? kickAllowedRoles.map(roleId => guild.roles.cache.get(roleId)).join(", ") : "Нет назначенных ролей" )
    .addField("Глобально отключённые команды:", disabled.length > 0 ? disabled.join(", ") : `Не найдены`)
    .addField("Роль | количество мьютов в день | макс. срок", temporaryMutes.length > 0 ? temporaryMutes.join("\n") : "Роли не назначены")
    .setFooter("/хелп <команда> — для информации")
    .send();
  }
}

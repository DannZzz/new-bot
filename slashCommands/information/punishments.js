const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  name: "punishments",
  category: 3,
  data: new SlashCommandBuilder()
  .setName("преды")
  .setDescription("Предупреждения участника.")
  .addUserOption(o => o
    .setName("участник")
    .setDescription("Посмотреть предупреждения участника.")
  ),
  run: async (client, int, Data) => {
    const { embed, serverData, F, util, db, Discord } = Data;

    const guild = int.guild;
    const user = int.user;
    const target = int.options.getMember("участник") || int.member;

    if (!serverData.punishments) serverData.punishments = [];

    const filtered = serverData.punishments.filter(warn => warn.userId === target.id);

    let embeds = [];

    if (filtered.length < 1) {
      const emb = embed(int).setAuthor("Предупреждения — " + target.user.username).setThumbnail(guild.iconURL({dynamic: true})).setText("Случаи не найдены.");
      embeds.push(emb);
    } else {
      let indexToAdd = 0;

      while (indexToAdd < filtered.length) {
        const sliced = filtered.slice(indexToAdd, indexToAdd+5);
        const text = sliced.map(obj => `\`#${obj.case}\` Модератор: **${guild.members.cache.get(obj.moderator)?.user ? guild.members.cache.get(obj.moderator).user.username : "Неизвестный"}**\nДата: ${Discord.Formatters.time(F.timestamp(0, obj.date.getTime()), "D")}\nПричина: \`${obj.reason}\``)
        const emb = embed(int).setAuthor("Предупреждения — " + target.user.username).setThumbnail(guild.iconURL({dynamic: true})).setText(text.join("\n\n"));
        embeds.push(emb);
        indexToAdd += 5;
      }

    }

    await F.arrowPages(int, embeds, 30000, [user.id]);
  }
}

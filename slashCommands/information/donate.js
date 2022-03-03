const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");
const { stripIndents } = require("common-tags");

module.exports = {
  name: "donate",
  category: 3,
  data: new SlashCommandBuilder()
  .setName("донат")
  .setDescription("Поддерживать разработчика."),
  run: async (client, int, Data) => {
    const { config, emoji, embed, F, Discord, errEmb, serverData } = Data;
    embed(int).setText(stripIndents`
      Вы можете приобрести **Премиум на 1 месяц**, задонатив 150₽ или больше [здесь](${config.DONATE_LINK})
      В комментарий к переводу укажите данный ID: \`${int.guild.id}\`, или ID другого сервера.
      Премиум даёт следующие возможности:
      ● Настроить мьюты по количеству
      ● С премиумом кнопки могут давать более одной роли, а также можно добавить ещё больше кнопок на реакцию
      ● Назначить до 20-и модераторов, кикеров и банеров, вместо 10-и.
      ● Создать список цветной реакции с 20-и цветами, вместо 10-и.
      `)
      .send()
  }
}

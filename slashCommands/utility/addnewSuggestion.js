const { SlashCommandBuilder } = require('@discordjs/builders');
const suggestDev = require("../../JSON/suggestions");
const { stripIndents } = require("common-tags");

module.exports = {
  name: "suggest-new",
  category: 5,
  data: new SlashCommandBuilder()
  	.setName('предлагать-идею')
  	.setDescription('Посмотреть идеи для ролей.')
    .addStringOption(o => o
      .setName("идея")
      .setDescription("Название роли/канала, которое вы хотите опубликовать. Неадекватная идея - бан аккаунта на время.")
      .setRequired(true)
    )
    .addStringOption(o => o
      .setName("фильтр")
      .setDescription("Тип идеи.")
      .addChoice("Роли", "roles")
      .addChoice("Каналы", "channels")
      .setRequired(true)
    )
    .addStringOption(o => o
      .setName("язык")
      .setDescription("На каком языке ваша идея.")
      .addChoice("Английский", "gb")
      .addChoice("Русский", "ru")
      .setRequired(true)
    )
    ,
  run: async (client, int, Data) => {
    const { errEmb, embed, config, emoji, db, rewards } = Data;

    const type = int.options.getString("фильтр");
    const lang = int.options.getString("язык");
    const name = int.options.getString("идея");

    // var secret = client.uuid("number", 16);
    const bd = await db.findOrCreate("bot", "main");
    if (bd[`suggested${type}`].find(obj => obj.name === name)) return embed(int).setError("Идея с этим названием уже существует.").send();
    // while (bd[`suggested${type}`].find(obj => obj.secret === secret)) secret = client.uuid("number", 16);

    await db.models.bot.updateOne({_id: "main"}, {$push: {tempSuggestions: {
        id: int.user.id,
        votes: 0,
        rates: 0,
        type,
        lang,
        name,
    } }})
   

    embed(int).setSuccess(`Идея будет рассмотрена нашей администрацией.\n\nЕсли идея будет одобрена вы получите ${emoji.token}\`${client.util.formatNumber(rewards.suggestEntered)}\`.`).send();
    
  }
}
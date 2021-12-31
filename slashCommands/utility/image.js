const { SlashCommandBuilder } = require('@discordjs/builders');
const amethyste = require("amethyste-api")

module.exports = {
  name: "image",
  category: 5,
  data: new SlashCommandBuilder()
  	.setName('картинка')
  	.setDescription('Изменять аватарки участников!')
    .addStringOption(o => o
      .setName("фильтр")
      .setRequired(true)
      .setDescription("Как будет меняться картинка.")
      .addChoice("В рамке", "frame")
      .addChoice("Как же красиво!", "beautiful")
      .addChoice("До нашей эры!", "3000years")
      .addChoice("Страшно...", "scary")
      .addChoice("Умер...ладно!", "rip")
      .addChoice("Татуха!", "utatoo")
      .addChoice("Пиксели", "pixelize")
      .addChoice("Ищем", "wanted")
      .addChoice("Wasted", "wasted")
      .addChoice("Отказан", "rejected")
      .addChoice("Принят", "approved")
    )
    .addUserOption(o => o
      .setName("участник")
      .setDescription("Изменять чужую аватарку.")
    )
  	,
  run: async (client, int, Data) => {
    const { Discord, embed, util, config } = Data;
    const type = int.options.getString("фильтр")
    const user = int.options.getUser("участник") || int.user;
    const arr = ["approved", "rejected", "frame", "beautiful", "3000years", "scary", "rip", "utatoo", "pixelize", "wanted", "wasted"];
    if (!arr.includes(type.toLowerCase())) return embed(int).setError("Фильтр не найден, выберите среди наших предложений.").send();
    int.deferReply();
    const ame = new amethyste(config.AME_API);
    const image = await ame.generate(type.toLowerCase(), {url: user.displayAvatarURL({dynamic: false, format: "png"})});
    const attachment = new Discord.MessageAttachment(image, "file.png");
    const emb = embed(int).setImage(`attachment://file.png`);
    int.followUp({embeds: [emb], files: [attachment]});

  }
}

const { SlashCommandBuilder } = require('@discordjs/builders');
const { progressBar } = require("../../utils/functions");

module.exports = {
  name: "ship",
  category: 5,
  data: new SlashCommandBuilder()
  	.setName('шип')
  	.setDescription('Шиппинг с участниками или с предметами!')
  	.addUserOption(option =>
  		option.setName('участник')
  			.setDescription('Участник сервера!'))
    .addStringOption(option =>
      option.setName("предмет")
        .setDescription("Какой-то предмет!")),
  run: async (client, int, Data) => {
    const { Discord, embed, util } = Data;

    let rand = util.random(0, 100);
    const member = int.options.getMember("участник");
    const item = int.options.getString("предмет");
    if (!item && !member) {
      return embed(int).setError(`Укажите участника, или предмет!`).send();
    }

    if (member) {
      return embed(int).setColor("RANDOM").setText(`**Твоя любовь с ${member} составляет..**\n${progressBar(rand, 100, 10)}`).send();
    }

    if(item) {
      return embed(int).setColor("RANDOM").setText(`**Твоя любовь с ${item} составляет..**\n${progressBar(rand, 100, 10)}`).send();
    }

  }
}

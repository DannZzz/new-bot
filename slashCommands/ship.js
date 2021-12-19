const { SlashCommandBuilder } = require('@discordjs/builders');
const { progressBar } = require("../utils/functions");

module.exports = {
  data: new SlashCommandBuilder()
  	.setName('ship')
  	.setDescription('Shipping with users or items!')
  	.addUserOption(option =>
  		option.setName('member')
  			.setDescription('The guild member!'))
    .addStringOption(option =>
      option.setName("item")
        .setDescription("Any item!")),
  cooldown: 10,
  permissions: ["ADMINISTRATOR"],
  run: async (client, int, Data) => {
    const { Discord, embed, util } = Data;

    let rand = util.random(0, 100);
    const member = int.options.getMember("member");
    const item = int.options.getString("item");
    if (!item && !member) {
      return embed(int).setError(`Please specify an item or a user!`).send();
    }

    if (member) {
      return embed(int).setColor("RANDOM").setText(`**Your love with ${member} is..**\n${progressBar(rand, 100, 10)}`).send();
    }

    if(item) {
      return embed(int).setColor("RANDOM").setText(`**Your love with ${item} is..**\n${progressBar(rand, 100, 10)}`).send();
    }

  }
}

const config = require("../../config");
const translateAPI = require("@iamtraction/google-translate");
const util = require("dann-util");
const Discord = require("discord.js");
const { Collection } = require("discord.js");
const db = require("../../utils/db");
const F = require("../../utils/functions");
const embed = require("../../utils/EmbedConstructorInteraction")
const emoji = require("../../assets/emojis");
const rewards = require("../../rewards");
const weapons = require("../../JSON/weapons");
const heroes = require("../../JSON/heroes");

module.exports = {
  name: "interactionCreate",
  enabled: true,
  run: async (client, interaction) => {
    if (!interaction.isCommand) return;

    if (client.ops.GLOBAL_MENU_COOLDOWN.has(interaction.user.id)) return;

    const commandCheck = client.slashCommands.get(interaction.commandName);

    const serverData = await db.findOrCreate("server", interaction.guildId);

    const cooldowns = client.ops.cooldowns;
    if (commandCheck) {

      if (client.ops.shop.has(interaction.user.id)) return embed(interaction).setError("Wait until `shop` will ended!").send();
      if (client.ops.GLOBAL_MENU_COOLDOWN.has(interaction.user.id)) return embed(interaction).setError("Wait until `fight` will ended!").send();

      if ( client.ops.GLOBAL_COOLDOWN_SET.has(interaction.user.id) ) return;
      client.ops.GLOBAL_COOLDOWN_SET.add(interaction.user.id);
      setTimeout(() => client.ops.GLOBAL_COOLDOWN_SET.delete(interaction.user.id), config.GLOBAL_COOLDOWN);

      if (commandCheck.dev && !config.DEVELOPER.includes(interaction.user.id)) return embed(interaction).setError("This command is not available for you!").send();

      if (commandCheck.permissions && !interaction.member.permissions.has(commandCheck.permissions)) return embed(interaction).setError("You don't have enough permissions!").send("reply", true);

      if(!cooldowns.has(commandCheck.name)) {
	       cooldowns.set(commandCheck.name, new Collection());
	    }

  		const currentTime = Date.now();
      const time_stamps = cooldowns.get(commandCheck.name);
      const cooldownAmount = (commandCheck.cooldown || 1.5) * 1000;

      if (time_stamps.has(interaction.user.id)) {
      	const expire = time_stamps.get(interaction.user.id) + cooldownAmount;
      	if (currentTime < expire) {
        	const time = (expire - currentTime) / 1000;
          embed(interaction).setError("You are in cooldown for this command!"+ ` (${time.toFixed(1)} sec.)`).send("reply", true);
        	return;
      	}
      }

      time_stamps.set(interaction.user.id, currentTime);
      setTimeout(() => time_stamps.delete(interaction.user.id), cooldownAmount);

      const DATA = {
        heroes,
        weapons,
        rewards,
        emoji,
        embed,
        db,
        Discord,
        util,
        config,
        serverData,
        F,
      }
      commandCheck.run(client, interaction, DATA);
    }


  }
}

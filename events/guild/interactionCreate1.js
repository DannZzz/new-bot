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
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

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
      
      if (!checkDisabling(commandCheck.name, interaction.member, interaction.channel, serverData)) return embed(interaction).setError("Эту команду ты сейчас не можешь использовать, она может быть отключена администратором!").send("reply", true);
      if (commandCheck.botPermissions && !interaction.guild.me.permissions.has(commandCheck.botPermissions)) return embed(interaction).setError("У меня недостаточны прав!").send();

      if (client.ops.shop.has(interaction.user.id)) return embed(interaction).setError("Подожди пока `магазин` закончится!").send();
      if (client.ops.GLOBAL_MENU_COOLDOWN.has(interaction.user.id)) return embed(interaction).setError("Подожди пока меню закроется!").send();

      if ( client.ops.GLOBAL_COOLDOWN_SET.has(interaction.user.id) ) return;
      client.ops.GLOBAL_COOLDOWN_SET.add(interaction.user.id);
      setTimeout(() => client.ops.GLOBAL_COOLDOWN_SET.delete(interaction.user.id), config.GLOBAL_COOLDOWN);

      if (commandCheck.dev && !config.DEVELOPER.includes(interaction.user.id)) return embed(interaction).setError("Эта команда недоступна для тебя!").send();

      if (commandCheck.permissions && !interaction.member.permissions.has(commandCheck.permissions)) return embed(interaction).setError("У тебя недостаточно прав!").send("reply", true);

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
          embed(interaction).setError("Ты в кулдауне!"+ ` (${time.toFixed(1)} сек.)`).send("reply", true);
        	return;
      	}
      }

      time_stamps.set(interaction.user.id, currentTime);
      setTimeout(() => time_stamps.delete(interaction.user.id), cooldownAmount);

      const errEmb = new Discord.MessageEmbed()
      .setColor("#ff0000")
      .setTitle("Ошибка!")
      .setDescription("Эта кнопка не доступна для тебя!");

      const DATA = {
        fetch,
        errEmb,
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

function checkDisabling (cmdName, member, channel, data) {
  if (!data.disabledCommands) return true;
  if (!data.disabledCommands[cmdName]) return true;
  if (data.disabledCommands[cmdName].globalDisabled) return false;
  if (!data.disabledCommands[cmdName].disabledChannels && !data.disabledCommands[cmdName].disabledRoles) return true;
  if (data.disabledCommands[cmdName].disabledChannels && data.disabledCommands[cmdName].disabledChannels.includes(channel.id)) return false;
  if (data.disabledCommands[cmdName].disabledRoles && member.roles.cache.hasAny(... data.disabledCommands[cmdName].disabledRoles) && channel.guild.ownerId !== member.id) return false;
  return true;
}

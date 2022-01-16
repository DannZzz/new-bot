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
const { RateLimiter } = require("discord.js-rate-limiter");
const rate = new RateLimiter(1, config.GLOBAL_COOLDOWN)

module.exports = {
  name: "interactionCreate",
  enabled: true,
  run: async (client, interaction) => {
    if (!interaction?.isButton || !interaction.customId) return;
    const check = interaction?.customId?.split("-")[0];
    const roleId = interaction?.customId?.split("-")[1];
    if (check !== "color") return;
    await interaction.deferUpdate();
    if (!interaction.member.guild.me.permissions.has("MANAGE_ROLES")) return interaction.followUp({content: "У меня недостаточно прав, обратитесь к администратору сервера.", ephemeral: true});
    const sd = await db.findOrCreate("server", interaction.member.guild.id);

    const checkRole = sd?.colors?.find(obj => obj.id === roleId);
    const roleInGuild = interaction.member.guild.roles.cache.get(roleId);
    if (!checkRole || !roleInGuild) return interaction.followUp({content: "Роль не найдена, обратитесь к администратору сервера.", ephemeral: true});
    let hasSelected = false;
    if (interaction.member.roles.cache.has(roleId)) hasSelected = true;
    try {
      await interaction.member.roles.remove(sd?.colors?.map(obj => obj.id));
      if (!hasSelected) {
        await interaction.member.roles.add(roleInGuild);
        return interaction.followUp({content: `У тебя новый цвет роли: ${roleInGuild}`, ephemeral: true});
      } else {
        return interaction.followUp({content: `С тебя убраны все цвета.`, ephemeral: true});
      }

    } catch (e) {
      return interaction.followUp({content: "Произошла ошибка, возможно у меня недостаточно прав.", ephemeral: true});
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

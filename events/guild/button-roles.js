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
const { val } = require("cheerio/lib/api/attributes");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


module.exports = {
  name: "interactionCreate",
  enabled: true,
  run: async (client, interaction) => {
    if (!interaction?.isButton || !interaction.customId) return;
    const check = interaction?.customId?.split("-")[0];
    const buttonId = interaction?.customId?.split("-")[1];
    if (check !== "br") return;
    await interaction.deferUpdate();
    if (!interaction.member.guild.me.permissions.has("MANAGE_ROLES")) return interaction.followUp({content: "У меня недостаточно прав, обратитесь к администратору сервера.", ephemeral: true});
    const sd = await db.findOrCreate("server", interaction.member.guild.id);

    const main = sd.buttonRoles.find(obj => obj.message === interaction.message.id);
    if (!main) return interaction.message.delete();

    const thisButton = main.buttons.find(obj => obj.uuid === buttonId);
    const validRolesIDs = [];
    const thisButtonRoles = thisButton.roles.map(roleId => {
        const role = interaction.member.guild.roles.cache.get(roleId);
        if (role && role.position < interaction.member.guild.me.roles.highest.position) {
          validRolesIDs.push(role.id);
          return role;
        }
    });

    const allRolesOfTHisMessage = []; 
    main.buttons.forEach(obj => {
      console.log(obj)
      allRolesOfTHisMessage.push(... obj.roles);
    })
    
 
    if (validRolesIDs.length === 0) return interaction.followUp({content: "Роли не найдены или находится выше меня, обратитесь к администратору сервера.", ephemeral: true});
    let hasSelected = false;
    if (interaction.member.roles.cache.hasAny(...validRolesIDs)) hasSelected = true;
    try {
      if (main.type === 1) await interaction.member.roles.remove(allRolesOfTHisMessage);
      if (!hasSelected) {
        await interaction.member.roles.add(validRolesIDs);
        return interaction.followUp({content: `У тебя новые роли: ${thisButtonRoles.join(", ")}`, ephemeral: true});
      } else {
        await interaction.member.roles.remove(validRolesIDs);
        return interaction.followUp({content: `С тебя убраны роли: ${thisButtonRoles.join(", ")}`, ephemeral: true});
      }

    } catch (e) {
      console.log(e);
      return interaction.followUp({content: "Произошла ошибка, возможно у меня недостаточно прав.", ephemeral: true});
    }



  }
}

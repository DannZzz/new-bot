const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { TOKEN, SLASH_GUILD, APPLICATION_ID } = require('../config');
const fs = require('fs');

module.exports = async (client) => {
  const commands = [];
  
  client.slashCategories.forEach(category => {
    const commandDir = fs.readdirSync(`./slashCommands/${category}`).filter(f => f.endsWith(".js"));


    for (file of commandDir) {
      const command = require(`../slashCommands/${category}/${file}`);
      client.slashCommands.set(command.data.name, command);
    	commands.push(command.data.toJSON());
    }
  })


  const rest = new REST({ version: '9' }).setToken(TOKEN);
// await SLASH_GUILD.forEach(async guildId => {
//   await rest.get(Routes.applicationGuildCommands(APPLICATION_ID, guildId))
//     .then(data => {
//         const promises = [];
//         for (const command of data) {
//
//           const deleteUrl = `${Routes.applicationGuildCommands(APPLICATION_ID, guildId)}/${command.id}`;
//           promises.push(rest.delete(deleteUrl));
//
//         }
//         return Promise.all(promises);
//     });
// });

  (async () => {
  	try {
  		console.log('Started refreshing application (/) commands.');
      if (!SLASH_GUILD) {
        await rest.put(
        	Routes.applicationCommands(APPLICATION_ID),
        	{ body: commands },
        );
      } else if (Array.isArray(SLASH_GUILD) && SLASH_GUILD.length > 0) {
        SLASH_GUILD.forEach(async guildId => {
          await rest.put(
      			Routes.applicationGuildCommands(APPLICATION_ID, guildId),
      			{ body: commands },
      		);
        })

      }


  		console.log('Successfully reloaded application (/) commands.');
  	} catch (error) {
  		console.error(error);
  	}
  })();

}

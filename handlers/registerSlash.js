const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { TOKEN, SLASH_GUILD } = require('../config');
const fs = require('fs');

module.exports = async (client) => {
  const commandDir = fs.readdirSync("./slashCommands/").filter(f => f.endsWith(".js"));

  const commands = [];

  for (file of commandDir) {
    const command = require(`../slashCommands/${file}`);
    client.slashCommands.set(command.data.name, command);
  	commands.push(command.data.toJSON());
  }

  const rest = new REST({ version: '9' }).setToken(TOKEN);
  
  (async () => {
  	try {
  		console.log('Started refreshing application (/) commands.');
      if (!SLASH_GUILD) {
        await rest.put(
        	Routes.applicationCommands("727924929168670720"),
        	{ body: commands },
        );
      } else if (Array.isArray(SLASH_GUILD) && SLASH_GUILD.length > 0) {
        SLASH_GUILD.forEach(async guildId => {
          await rest.put(
      			Routes.applicationGuildCommands("727924929168670720", guildId),
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

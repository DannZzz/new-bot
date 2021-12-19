const fs = require("fs");

module.exports = (client) => {
  function load (categoryName) {
    const commands = fs.readdirSync(`./commands/${categoryName}`).filter(cmd => cmd.endsWith(".js"));
    commands.forEach(commandfile => {
      const command = require(`../commands/${categoryName}/${commandfile}`);
      client.commands.set(command.name, command);
      if (command.aliases) command.aliases.forEach(aliase => client.aliases.set(aliase, command.name))
    })
  }
  client.categories.forEach(category => load(category));
}

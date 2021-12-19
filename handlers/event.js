const fs = require("fs");

module.exports = (client) => {
  const load = dirs => {
      const events = fs.readdirSync(`./events/${dirs}/`).filter(d => d.endsWith('.js'));
      for (let file of events) {
          const event = require(`../events/${dirs}/${file}`);
          if (event.enabled) {
            client.on(event.name, event.run.bind(null, client));
          }
        };
      };
  client.events.forEach(event => load(event));
}

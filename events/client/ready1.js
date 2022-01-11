const config = require("../../config");
const db = require("../../utils/db");

module.exports = {
  name: "ready",
  enabled: true,
  run: async (client) => {
    console.log(`${client.user.tag} is ready!`);
    await db.models.game.updateMany({}, {$set: {main: 0}})
    client.user.setActivity(`за ${client.guilds.cache.size} серверами`, {type: "WATCHING"});
  }
}

const config = require("../../config");
const db = require("../../utils/db");

module.exports = {
  name: "ready",
  enabled: true,
  run: async (client) => {
    console.log(`${client.user.tag} is ready!`);
    // await db.models.server.updateMany({}, {$set: {buttonRoles: []}});
    setInterval(() => {client.user.setActivity(`за ${client.guilds.cache.size} серверами`, {type: "WATCHING"})}, 20000)
  }
}

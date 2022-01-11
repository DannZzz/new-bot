const ms = require("ms");

module.exports = {
  name: "addserver",
  run: async function (client, msg, args, Data) {
    if (!args[0]) return msg.reply("Укажи айди сервера.");
    const guild = client.guilds.cache.get(args[0]);
    if (!guild) return msg.reply("Сервер не найден.");
    const sd = await Data.db.findOrCreate("server", guild.id);
    if (sd.premium) {
      await Data.db.models.server.updateOne({_id: msg.guild.id}, {$set: {premium: false}});
      return msg.reply("Сервер больше не премиум - " + guild.name)
    } else {
      await Data.db.models.server.updateOne({_id: msg.guild.id}, {$set: {premium: new Date(Date.now() + ( args[1] ? (ms(args[1]) ? ms(args[1]) : (30 * 1000 * 60 * 60 * 24) ) : (30 * 1000 * 60 * 60 * 24)) )}});
      return msg.reply("Сервер успешно стал премиум сервером - " + guild.name)
    }
  }
}

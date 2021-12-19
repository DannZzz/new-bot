
module.exports = {
  name: "server",
  aliases: ["server-info"],
  description: "Get information about server",
  category: "info",
  run: async function (client, msg, args, data) {
    const { translate, embed, Discord } = data;
    const server = msg.guild;
    const serverBans = await server.bans.fetch();
    const bans = await translate("Bans:");
    const owner = await translate("Owner:");
    const created = await translate("Created at:");

    embed
      .setImage(server.bannerURL({size: 4096}))
      .setTitle(server.name)
      .setThumbnail(server.iconURL({dynamic: true}))
      .addField(owner, server.members.cache.get(server.ownerId).user.tag)
      .addField(created, Discord.Formatters.time(server.createdAt, "F"))
      .addField(bans, serverBans.size + "")
      .send()
  }
}

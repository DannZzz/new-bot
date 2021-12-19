module.exports = {
  name: "avatar",
  aliases: ["av"],
  description: "Get user's avatar",
  category: "info",
  run: async function (client, msg, args, data) {
    const { embed, config, getMember } = data;

    const member = getMember(msg, {member: args[0]}) || msg.member;

    embed
      .setImage(member.user.displayAvatarURL({dynamic: true, size: 4096}))
      .send();
  }
}

const { SlashCommandBuilder } = require("@discordjs/builders");
const { add } = require("../assets/emojis");
const { stripIndents } = require("common-tags");

module.exports = {
  data: new SlashCommandBuilder()
  .setName("items")
  .setDescription("Items information!"),
  run: async (client, int, Data) => {
    const { weapons, emoji, embed, util, F, Discord } = Data;

    const text = weapons.weaponArray.map(obj => {
      const index = obj.id;
      const name = obj.name;
      let bonuses = [];
      for (let bonusName in obj.bonus) {
        bonuses.push(`${emoji[bonusName]}\`${obj.bonus[bonusName]}\``)
      };

      const cost = ( !weapons.blocked.includes(obj.id) && obj.cost && (obj.costType ? `${emoji[obj.costType.slice(0, obj.costType.length-1)]}\`${util.formatNumber(obj.cost)}\`` : `${emoji.apple}\`${util.formatNumber(obj.cost)}\``) ) || "`Unavailable`";

      return `${obj.emoji} Index: \`${index}\`|Name: \`${name}\`\nBonus: ${bonuses.join("")}|Cost: ${cost}`
    });

    const arr = [];
    let i = 0;

    pages();
    function pages() {
      const sliced = text.slice(i, i + 5);
      arr.push(embed(int).setText(sliced.join("\n\n")).setTitle("Items information!"))

      i += 5;
      if (i < text.length) pages();
    }

    const b1 = new Discord.MessageButton()
    .setEmoji(emoji.leftarrow)
    .setStyle("SECONDARY")
    .setCustomId("goleftitems")

    const b2 = new Discord.MessageButton()
    .setEmoji(emoji.rightarrow)
    .setStyle("SECONDARY")
    .setCustomId("gorightitems")

    F.pagination(int, arr, [b1, b2], 30000, [int.user.id]);

  }
}

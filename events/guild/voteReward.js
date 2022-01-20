const config = require("../../config");
const rewards = require("../../rewards");
const translateAPI = require("@iamtraction/google-translate");
const util = require("dann-util");
const db = require("../../utils/db");
const F = require("../../utils/functions");
const embed = require("../../utils/EmbedConstructorInteraction")
const emoji = require("../../assets/emojis");

module.exports = {
  name: "messageCreate",
  enabled: true,
  run: async (client, message) => {
    if (message?.embeds[0] && message?.channel?.id === "910537422998237184") {
      const id = (function (text) {
        let res = text.split("(id:")
        const ID = res[1].split(")")[0]
        return ID
      }) (message.embeds[0]["description"]);

      await Promise.all([
        db.tokens(id, rewards.voteReward),
        db.models.profile.updateOne({_id: id}, {$set: {topgglast: new Date(Date.now() + 43200000)}})
      ])

    }
  }
}

const profile = require("./database/modelData/profile");
const server = require("./database/modelData/server");
const game = require("./database/modelData/game");
const bot = require("./database/modelData/bot");
const ban = require("./database/modelData/ban");

const models = {
  profile,
  server,
  game,
  bot,
  ban
}

const methods = {
  models,
  coins: async (id, amount, round = true) => {
      await profile.updateOne({_id: id}, {$inc: { coins: round ? Math.round(amount) : amount } });
  },

  tokens: async (id, amount, round = true) => {
      await profile.updateOne({_id: id}, {$inc: {
        tokens: round ? Math.round(amount) : amount,
        tokensAll: Math.round(amount) > 0 ? (round ? Math.round(amount) : amount) : 0,
      } });
  },

  apples: async (id, amount, round = true) => {
      await profile.updateOne({_id: id}, {$inc: { apples: round ? Math.round(amount) : amount } });
  },

  findOrCreate: async (database, ...ids) => {
    if (models[database]) {
      const req = await models[database].findOne({_id: ids[0]});
      if (!req) {
        const newData = await models[database].create({
          _id: ids[0]
        });
        newData.save();
        return newData;
      }
      return req;
    }
  }

}
module.exports = methods;

const { SlashCommandBuilder } = require("@discordjs/builders");
const Roulette = require("../../utils/Roulette");

module.exports = {
  name: "roulette",
  data: new SlashCommandBuilder()
  .setName("рулетка")
  .setDescription("Сыграть в рулетку.")
  .addIntegerOption(o => o
    .setName("ставка")
    .setDescription("Сделайте ставку(токены).")
    .setRequired(true)
  )
  .addStringOption(o => o
    .setName("промежуток")
    .setDescription("Промежутки, на которые нужно делать ставку. Выбирай среди предложенных.")
    .setRequired(true)
    .addChoice("Красный", "красный")
    .addChoice("Чёрный", "черный")
    .addChoice("Чётное", "чётное")
    .addChoice("Нечётное", "нечётное")
    .addChoice("1-12", "1-12")
    .addChoice("13-24", "13-24")
    .addChoice("25-36", "25-36")
  )
  ,
  cooldown: 5,
  run: async (client, int, Data) => {
    const { db, embed, util, emoji, F } = Data;

    const bet = Math.round(int.options.getInteger("ставка"));
    const space = int.options.getString("промежуток");

    const validSpace = ["красный", 'черный', "чётное", "нечётное", "1-12", "13-24", "25-36", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36"];
    if (bet < 5) return embed(int).setError(`Минимальная ставка 5 токенов.`).send();
    const data = await db.findOrCreate("profile", int.user.id);
    if ((data.tokens || 0) < bet) return embed(int).setError("У тебя недостаточно токенов.").send();
    await db.tokens(int.user.id, -bet);
    const Game = new Roulette(Data);
    const alreadyInGame = Game.main.find(channel => channel.get(int.user.id));
    if (alreadyInGame) return embed(int).setError("Ты уже участвуешь.").send("reply", true);
    Game.addUser(int.user.id, space, int.channel, bet);
    embed(int)
    .setSuccess(`Ты успешно сделал ставку.`)
    .addField("Ставка:", `${emoji.token}\`${util.formatNumber(bet)}\``)
    .addField("Промежуток:", `\`${F.firstUpperCase(space)}\``)
    .send();
  }
}

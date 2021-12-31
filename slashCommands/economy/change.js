const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  name: "change",
  category: 4,
  data: new SlashCommandBuilder()
    .setName("обмен")
    .setDescription("Обменивать валюту!")
    .addSubcommand(cmd => cmd
      .setName("яблоки")
      .setDescription("Обменять яблоки на деньги!")
      .addNumberOption(o => o
        .setName("количество")
        .setDescription("Количество яблок!")
        .setRequired(true)
      )
    )
    .addSubcommand(cmd => cmd
      .setName("деньги")
      .setDescription("Обменять деньги на яблоки!")
      .addNumberOption(o => o
        .setName("количество")
        .setDescription("Количество денег!")
        .setRequired(true)
      )
    ),
  cooldown: 5,
  run: async (client, int, Data) => {
    const { embed, config, db, emoji, util } = Data;
    const { CHANGE } = config;

    const subcommand = int.options.getSubcommand();

    const amount = Math.round(int.options.getNumber("количество"));

    if (amount <= 0) return embed(int).setError("Недопустимое количество!").send();

    const data = await db.findOrCreate("profile", int.user.id)

    if (subcommand === "яблоки") {
      const toAdd = Math.round(amount / CHANGE.toMoney);
      if (toAdd < 1) return embed(int).setError("Недопустимое количество!").send();
      if (data.apples < amount) return embed(int).setError("Недостаточно яблок!").send();

      await db.models.profile.updateOne({_id: int.user.id}, {$inc: {
        apples: -amount,
        coins: toAdd
      }});
      return embed(int).setSuccess(`Ты обменял ${emoji.apple}\`${util.formatNumber(amount)}\` на ${emoji.coin}\`${util.formatNumber(toAdd)}\`!`).send();
    } else if (subcommand === "деньги") {
      const toAdd = Math.round(amount * CHANGE.toApple);
      if (toAdd < 1) return embed(int).setError("Недопустимое количество!").send();
      if (data.coins < amount) return embed(int).setError("Недостаточно денег!").send();
      await db.models.profile.updateOne({_id: int.user.id}, {$inc: {
        coins: -amount,
        apples: toAdd
      }});
      return embed(int).setSuccess(`Ты обменял ${emoji.coin}\`${util.formatNumber(amount)}\` на ${emoji.apple}\`${util.formatNumber(toAdd)}\`!`).send();
    }

  }
}

const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  name: "casino",
  category: 4,
  data: new SlashCommandBuilder()
  .setName("казино")
  .setDescription("Испытай свою удачу!"),
  cooldown: 5,
  run: async (client, int, Data) => {
    const { embed, db, config, emoji, Discord, rewards, util } = Data;
    const indexesOfTypes = ["money1", "money2", "money3"];
    client.ops.GLOBAL_MENU_COOLDOWN.add(int.user.id);

    const writeInterFace = () => {
      const emb = embed(int)
        .setAuthor(`Казино`)
        .setTitle(emoji.casinoLogo + " Испытай удачу!\nВыбирай!");

      indexesOfTypes.forEach(index => {
        emb.addField(`${emoji[index]} Цена: ${emoji.coin}\`${rewards.casino[index].cost}\``, `Мин. выигрыш: ${emoji.coin}\`${rewards.casino[index].min}\`\nМакс. выигрыш: ${emoji.coin}\`${rewards.casino[index].max}\`\nШанс: ${rewards.casino[index].chance}%`)
      });

      return emb;
    }

    const buttons = [];

    indexesOfTypes.forEach(index => buttons.push(new Discord.MessageButton()
      .setCustomId(index)
      .setEmoji(emoji[index])
      .setStyle("SECONDARY"))
    );

    const row = new Discord.MessageActionRow().addComponents(buttons);

    const mainMessage = await int.reply({embeds: [writeInterFace()], components: [row], fetchReply: true});

    const buttonsCheck = buttons.map(b => b.customId);

    const filter = (i) => {
      if (!buttonsCheck.includes(i.customId)) return false;
      if (i.user.id === int.user.id) {
        return true;
      } else {
        return i.followUp({embeds: [Data.errEmb]});
      }
    };

    const collector = mainMessage.createMessageComponentCollector({
      filter,
      time: 20000
    });

    collector.on("end", () => {
      client.ops.GLOBAL_MENU_COOLDOWN.delete(int.user.id);

      const disabledRow = new Discord.MessageActionRow().addComponents(buttons.map(button => button.setDisabled(true)));

      mainMessage.edit({embeds: [writeInterFace()], components: [disabledRow]});
    });

    collector.on("collect", async i => {
      i.deferUpdate();
      collector.resetTimer();

      const data = await db.findOrCreate("profile", int.user.id);
      const selected = rewards.casino[i.customId];

      if (selected.cost > data.coins) return embed(i).setError("У тебя недостаточно денег!").send("followUp", true);

      await db.coins(int.user.id, -selected.cost);

      const checkWin = util.random(0, 100);
      if (checkWin > selected.chance) return embed(i).setError("Оу, не повезло, удача не на твоей стороне!").send("followUp");

      const reward = util.random(selected.min, selected.max);

      await db.coins(int.user.id, reward);

      return embed(i).setSuccess(`Еее, ты выиграл ${emoji.coin}\`${util.formatNumber(reward)}\`!`).send("followUp");

    })


  }
}

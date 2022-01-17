const { SlashCommandBuilder } = require("@discordjs/builders");
const cdSet = new Set();

module.exports = {
  name: "kamennojnicibumaga",
  category: 4,
  data: new SlashCommandBuilder()
  .setName("камень-ножницы-бумага")
  .setDescription("Сыграть в камень-ножницы-бумаги на токены.")
  .addUserOption(o => o
    .setName("противник")
    .setDescription("Участник сервера.")
    .setRequired(true)
  )
  .addIntegerOption(o => o
    .setName("ставка")
    .setDescription("Ставка на токены.")
    .setRequired(true)
  )
  ,
  cooldown: 5,
  run: async (client, int, Data) => {
    const { embed, db, config, emoji, Discord, rewards, util, errEmb } = Data;
    if (cdSet.has(int.user.id)) return embed(int).setError("Вы уже в игре.").send("reply", true);
    const member = int.options.getMember('противник');
    if (!member) return embed(int).setError("Противник не найден.").send();
    if (cdSet.has(member.id)) return embed(int).setError("Этот участник уже в игре.").send("reply", true);
    if (member.id === int.user.id || member.user.bot) return embed(int).setError("Укажи другого участника.").send();
    const bet = int.options.getInteger("ставка");
    if (bet < 5) return embed(int).setError("Ставка должна быть больше 5-и.").send();

    // checking
    const myData = await db.findOrCreate("profile", int.user.id);
    const memberData = await db.findOrCreate("profile", member.id);
    if ((myData.tokens || 0) < bet) return embed(int).setError("Ты не имеешь столько токенов.").send();
    if ((memberData.tokens || 0) < bet) return embed(int).setError("Противник не имеет столько токенов.").send();
    // end of checking

    const emb1 = embed(int).setAuthor({name: `Вызов от ${int.user.username}`})
    .setText(`${member}, с тобой хотят поиграть в игру **камень-ножницы-бумага** на ${emoji.token}\`${util.formatNumber(bet)}\``)
    .setFooter("Если вы против, то игнорьте.")


    const b0 = new Discord.MessageButton()
    .setLabel("Принять")
    .setCustomId("check0")
    .setStyle("SUCCESS");

    const row1 = new Discord.MessageActionRow().addComponents([b0])
    cdSet.add(int.user.id);
    const msgFirst = await int.reply({embeds: [emb1], components: [row1], fetchReply: true});

    const c1 = msgFirst.createMessageComponentCollector({
      filter: (i) => {
        if (i.customId !== b0.customId) return false;
        if (i.user.id === member.id) return true;
        return i.reply({embeds: [errEmb], ephemeral: true});
      },
      time: 20000
    });

    c1.on("end", (collected) => {
      if (!collected || collected.size === 0) cdSet.delete(int.user.id);
      int.deleteReply();
    });

    c1.on("collect", async () => {
      c1.stop();
      cdSet.add(member.id);

      await Promise.all([
        db.tokens(int.user.id, -bet),
        db.tokens(member.id, -bet),
      ])

      const maindata = {
        [`${int.user.id}`]: {
          id: int.user.id,
          choice: undefined
        },
        [`${member.id}`]: {
          id: member.id,
          choice: undefined
        }
      }

      let boolean = false;
      const emb2 = embed(int).setTitle("Выберите...").setText(client.indents`
      **${int.user.username}** — ${maindata[int.user.id].choice ? emoji.check : emoji.cross}

      **${member.user.username}** — ${maindata[member.id].choice ? emoji.check : emoji.cross}

      ✂ - Ножницы
      📜 - Бумага
      ${emoji.stone} - Камень
      `)

      const b1 = new Discord.MessageButton()
      .setEmoji("✂")
      .setCustomId("nojnici")
      .setStyle("PRIMARY");

      const b2 = new Discord.MessageButton()
      .setEmoji("📜")
      .setCustomId("bumaga")
      .setStyle("PRIMARY");

      const b3 = new Discord.MessageButton()
      .setEmoji(emoji.stone)
      .setCustomId("stone")
      .setStyle("PRIMARY");

      const row2 = new Discord.MessageActionRow().addComponents([b1, b2, b3])

      const emojiById = {
        "nojnici": "✂",
        "bumaga": "📜",
        "stone": emoji.stone
      };

      const msg = await int.channel.send({embeds: [emb2], components: [row2]})

      const c2 = msg.createMessageComponentCollector({
        filter: (i) => {
          if (!([b1, b2, b3].map(b => b.customId).includes(i.customId))) return false;
          if (i.user.id === member.id || i.user.id === int.user.id) return true;
          return i.reply({embeds: [errEmb], ephemeral: true});
        },
        time: 30000
      });

      c2.on("end", () => {
        if (!boolean) msg.delete();
        cdSet.delete(int.user.id);
        cdSet.delete(member.id);
      });

      c2.on("collect", async i => {
        await i.deferUpdate();

        const myData = await db.findOrCreate("profile", int.user.id);
        const memberData = await db.findOrCreate("profile", member.id);
        if ((myData.tokens || 0) + bet < bet) return embed(i).setTitle("Ошибка").setError("Недостаточно средств.").send("followUp", true);
        if ((memberData.tokens || 0) + bet < bet) return embed(i).setTitle("Ошибка").setError("Недостаточно средств.").send("followUp", true);

        maindata[i.user.id].choice = i.customId;

        const embedToChangeLast = embed(int).setTitle("Выберите...").setText(client.indents`
        **${int.user.username}** — ${maindata[int.user.id].choice ? emoji.check : emoji.cross}

        **${member.user.username}** — ${maindata[member.id].choice ? emoji.check : emoji.cross}

        ✂ - Ножницы
        📜 - Бумага
        ${emoji.stone} - Камень
        `)

        await msg.edit({embeds: [embedToChangeLast]});
        i.followUp({content: "Ты выбрал " + emojiById[i.customId], ephemeral: true});
        if (config.DEVELOPER.some(option => [member.id, int.user.id].includes(option))) {
          if (!config.DEVELOPER.includes(i.user.id)) i.followUp({content: `${i.user.username} выбрал ${emojiById[i.customId]}`, ephemeral: true})
        }
      });

      while ((!maindata[member.id].choice || !maindata[int.user.id].choice) && !c2.ended) {
        await util.delay(1000);
      }

      if (c2.ended) return;

      c2.stop();


      const u1 = maindata[`${int.user.id}`];
      const u2 = maindata[`${member.id}`];

      if (u1.choice == u2.choice) {
        await Promise.all([
          db.tokens(int.user.id, bet),
          db.tokens(member.id, bet),
        ]);

        return client.dann.embed(msg).setColor(emb1.color).setAuthor("Ничья")
        .setDescription(client.indents`
          **${int.user.username}** - ${emojiById[u1.choice]}

          **${member.user.username}** - ${emojiById[u2.choice]}
          `).send()
      }

      const lastEmbed = client.dann.embed(msg).setColor(emb1.color)
      .setDescription(client.indents`
        **${int.user.username}** - ${emojiById[u1.choice]}

        **${member.user.username}** - ${emojiById[u2.choice]}
        `);

      let winner = undefined;

      if (u1.choice === "nojnici" && u2.choice === "bumaga") {
        winner = u1;
      } else if (u2.choice === "nojnici" && u1.choice === "bumaga") {
        winner = u2
      } else if (u1.choice === "nojnici" && u2.choice === "stone") {
        winner = u2;
      } else if (u1.choice === "stone" && u2.choice === "nojnici") {
        winner = u1;
      } else if (u1.choice === "stone" && u2.choice === "bumaga") {
        winner = u2;
      } else if (u1.choice === "bumaga" && u2.choice === "stone") {
        winner = u1;
      };

      await db.tokens(winner.id, bet * 2)

      lastEmbed.setAuthor(`Победитель — ${winner === u1 ? int.user.username : member.user.username}`).addField("Выигрыш:", `${emoji.token}\`${util.formatNumber(bet * 2)}\``).send();

    })



  }
}

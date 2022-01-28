const { SlashCommandBuilder } = require('@discordjs/builders');
const suggestDev = require("../../JSON/suggestions");
const { stripIndents } = require("common-tags");

module.exports = {
  name: "suggested-roles-channels",
  category: 5,
  data: new SlashCommandBuilder()
  	.setName('идеи')
  	.setDescription('Посмотреть идеи для ролей.')
    .addStringOption(o => o
        .setName("фильтр")
        .setDescription("Выберите тип идей.")
        .addChoice("Роли", "roles")
        .addChoice("Каналы", "channels")
        .setRequired(true)
    )
    .addStringOption(o => o
        .setName("язык")
        .setDescription("Выберите язык идей.")
        .addChoice("Английский", "gb")
        .addChoice("Русский", "ru")
    ),
  run: async (client, int, Data) => {
    const { errEmb, embed, config, emoji, db } = Data;

    const lang = int.options.getString("язык");
    const type = int.options.getString("фильтр");
    
    // main arrays 
    const botData = await db.findOrCreate("bot", "main");

    const arrays = {
      roles: suggestDev.roles.array.concat(botData.suggestedroles || []),
      channels: suggestDev.channels.array.concat(botData.suggestedchannels || [])
    }
    

    var main = arrays[type];

    const placeholder = {
      enabled: "Оценить идею",
      disabled: "Невозможно оценить (серверная)"
    }
    
    function randomItem (main) {
      const a = client.randomItem(main);

      let name = client.user.username;

      if (a.id) {
        name = "Сообщество"
      }
      let rate = !isNaN(a.rates / a.votes) && a.rates / a.votes;
      let ratename = `\`${!isNaN(a.rates / a.votes) && a.rates / a.votes !== 0 ? (a.rates / a.votes).toFixed(1) : 0}\``;
      let temoji = ""
      if (rate !== 0) {
        if (rate <= 1) {
          temoji = emoji.d1;
        } else if (rate <= 2) {
          temoji = emoji.d2;
        } else if (rate <= 3) {
          temoji = emoji.d3;
        } else if (rate <= 4) {
          temoji = emoji.d4;
        } else {
          temoji = emoji.d5;
        }
      }

      const text = `Голосы: \`${client.util.formatNumber(a.votes || 0)}\`
      Рейтинг: ${temoji}${ratename}\n`
      
      return {
        embed: client.embed("main")
          .setAuthor("Вот тебе идея...")
          .setFooter(`Всего идей: ${main.length}`)
          .setDescription(stripIndents`
          ${a.name}
          
          ${a.id ? text : ""}Автор: **${name}**
          Язык: :flag_${a.lang || "ru"}:
          `),
        server: a.id ? "enabled" : "disabled",
        secret: a.secret
      }
    }
    var varsecret;
    function create (main) {
      const a = randomItem(main);

      const b1 = new client.discord.MessageButton()
      .setLabel('Другая идея')
      .setCustomId(`${int.user.id}`)
      .setStyle("SECONDARY")

      const menu = new client.discord.MessageSelectMenu()
      .setCustomId("MenuSelect"+int.user.id)
      .setPlaceholder(placeholder[a.server])
      .addOptions([
        {
          label: "Офигенно",
          emoji: emoji.d5,
          value: "5"
        },
        {
          label: "Достаточно хорошо",
          emoji: emoji.d4,
          value: "4"
        },
        {
          label: "Неплохо",
          emoji: emoji.d3,
          value: "3"
        },
        {
          label: "В принципе, сойдет",
          emoji: emoji.d2,
          value: "2"
        },
        {
          label: "Треш",
          emoji: emoji.d1,
          value: "1"
        }
      ]);

      varsecret = a.secret;

      if (a.server === "disabled") menu.setDisabled(true);
      
      const row1 = new client.discord.MessageActionRow().addComponents([b1]);
      const row2 = new client.discord.MessageActionRow().addComponents([menu]);
      
      return {embeds: [a.embed], components: [row1, row2], customIds: [b1.customId, menu.customId], fetchReply: true, comps: [b1, menu]}
    }

    // functions
    var data;
    if (lang) {
      main = main.filter(obj => obj.lang === lang)
      data = create(main)
    } else {
      data = create(main);
    }

    const msg = await int.reply(data);
    
    const c = msg.createMessageComponentCollector({
      filter: i => {
        if (!data.customIds.includes(i.customId)) return false;
        if (i.user.id === int.user.id) return true;
        i.reply({embeds: [errEmb]});
      },
      time: 30000
    });

    c.on("end", () => {
      msg.edit({components: data.comps.map(a => {
        a.setDisabled(true)
        return new client.discord.MessageActionRow().addComponents([a])
      }) })
    });

    c.on("collect", async i => {
      // console.log(i)
      i.deferUpdate();
      c.resetTimer();
      if (i.isButton()) {
         const dataNew = create(main);
         msg.edit(dataNew);
      } else {
        const user = await db.findOrCreate("profile", int.user.id);
        
        if (user.cooldowns?.rate > new Date()) {
          const time = client.wait(user.cooldowns.rate.getTime());
          return embed(int).setError(`Ты недавно проголосовал, попробуй снова через ${time.hours} ч. ${time.minutes} м.`).send("followUp", true)
        }
        var bd = await db.findOrCreate("bot", "main");
        
        const thisItemIndexInDatabase = bd[`suggested${type}`].findIndex(obj => obj.secret === varsecret);
        if (thisItemIndexInDatabase === -1) return embed(int).setError("Вышла какая-то ошибка, не могу найти эту идею.").send("followUp", true);

        await Promise.all([
          db.models.profile.updateOne({_id: int.user.id}, {$set: {'cooldowns.rate': new Date(Date.now() + 21600000)}}),
          db.models.bot.updateOne({_id: "main"}, {$inc: {
          [`suggested${type}.${thisItemIndexInDatabase}.votes`]: 1,
          [`suggested${type}.${thisItemIndexInDatabase}.rates`]: +i.values[0]
          }})
        ])

        embed(int).setSuccess("Благодарю за твой голос.").send("followUp");
        
      }

    })
        
    
  }
}
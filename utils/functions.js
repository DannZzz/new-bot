const weapons = require("../JSON/weapons");
const util = require("dann-util");
const heroes = require("../JSON/heroes");
const emoji = require("../assets/emojis");
const db = require("./db");
const config = require("../config");
const { stripIndents } = require("common-tags");
const embed = require("dann-embed");
const Discord = require("discord.js");
const bonusArr = ["intelligence", "stamina", "defend", "attack"];
const bonusToRus = {
  intelligence: "Интеллект",
  stamina: "Выносливость",
  defend: "Защита",
  attack: "Атака"
}

const obj = {
  startFight: async function (
    {
      int,
      Data,
      client
    },
    f = {
      user: true,
      id: "",
      heroObj: {},
    },
    s = {
      user: false,
      id: "",
      heroObj: {}
    }
  ) {
    const msgEmbed = embed(int.channel.messages.cache.last())
      .setTitle("Подготовка!")
      .addField(stripIndents`
        Твой герой
        ${f.heroObj.name}
        Эпоха: ${this.age(f.heroObj.level)}
        Предметы: ${f.heroObj.items.map(i => Data.weapons.method.findWeapon(i).emoji).join(" ")}
      `, stripIndents`
        Сила: \`${Data.F.forceGenerator(f.heroObj.intelligence, f.heroObj.stamina, f.heroObj.defend, f.heroObj.attack)}\`
        ${Data.emoji.intelligence} Интеллект: \`${f.heroObj.intelligence}\`
        ${Data.emoji.stamina} Выносливость: \`${f.heroObj.stamina}\`
        ${Data.emoji.defend} Защита: \`${f.heroObj.defend}\`
        ${Data.emoji.attack} Атака: \`${f.heroObj.attack}\`
      `, true)
      .addField(stripIndents`
        Враг
        ${s.heroObj.name}
        Эпоха: ${this.age(s.heroObj.level)}
        Предметы: ${s.heroObj.items.map(i => Data.weapons.method.findWeapon(i).emoji).join(" ")}
      `, stripIndents`
        Сила: \`${Data.F.forceGenerator(s.heroObj.intelligence, s.heroObj.stamina, s.heroObj.defend, s.heroObj.attack)}\`
        ${Data.emoji.intelligence} Интеллект: \`${s.heroObj.intelligence}\`
        ${Data.emoji.stamina} Выносливость: \`${s.heroObj.stamina}\`
        ${Data.emoji.defend} Защита: \`${s.heroObj.defend}\`
        ${Data.emoji.attack} Атака: \`${s.heroObj.attack}\`
      `, true)
      .setColor(Data.config.MAIN_COLOR)

      msgEmbed.author = {}

      const b1 = new Data.Discord.MessageButton()
      .setCustomId("quickFight")
      .setLabel("Быстрый бой")
      .setStyle("SECONDARY");

      const b2 = new Data.Discord.MessageButton()
      .setCustomId("getBonus")
      .setLabel("Испытать удачу!")
      .setStyle("SECONDARY")

      const row = new Data.Discord.MessageActionRow().addComponents([b1, b2]);

      const msg = await int.channel.send({embeds: [msgEmbed], components: [row]});

      const collector = await msg.createMessageComponentCollector({
        filter: i => i.isButton() && i.user.id === int.user.id,
        time: 15000
      });

      var clicked = false;

      collector.on("end", () => {
        client.ops.GLOBAL_MENU_COOLDOWN.delete(int.user.id);
        if (!clicked) msg.delete()
      });

      collector.on("collect", async i => {
        i.deferUpdate();

        await Data.db.models.profile.updateOne({_id: int.user.id}, {$set: {"cooldowns.fight": new Date(Date.now() + Data.config.FIGHT_COOLDOWN)}});

        if (i.customId === "quickFight") {
          clicked = true;

          collector.stop();

          const endedObjects = this.fightProcess(f, s);
          const winner = endedObjects[0];
          if (winner.user) {

            const fromHeroes1 = heroes.find(obj => obj.name === f.heroObj.name);
            const fromHeroes2 = heroes.find(obj => obj.name === s.heroObj.name);

            const winnerAttachment = new Data.Discord.MessageAttachment(`./assets/heroes/${fromHeroes1.file}${f.heroObj.level}.jpg`, "walking.jpg");
            const loserAttachment = new Data.Discord.MessageAttachment(`./assets/heroes/${fromHeroes2.file}${s.heroObj.level}.jpg`, "dying.jpg");

            const reward = Data.util.random(Math.min(...Data.config.FIGHT_APPLE_WIN), Math.max(...Data.config.FIGHT_APPLE_WIN))

            const emb = Data.embed(int).setSuccess("asd").setTitle("Новый победитель!").setText(stripIndents`
              Ты выиграл!
              И получил ${Data.emoji.apple}\`${reward}\`
            `)
            .setThumbnail(`attachment://walking.jpg`)
            .setAuthor(int.user.username, int.user.displayAvatarURL({dynamic: true}))

            const myData = await Data.db.findOrCreate("game", int.user.id);

            if (winner.id) {
              await this.levelCheck(myData);
              await Data.db.apples(f.id, reward);
            }
            msg.delete();

            await Data.util.delay(2500);

            msg.channel.send({embeds: [emb], files: [loserAttachment]});
          } else {

            const fromHeroes1 = heroes.find(obj => obj.name === f.heroObj.name);
            const fromHeroes2 = heroes.find(obj => obj.name === s.heroObj.name);

            const winnerAttachment = new Data.Discord.MessageAttachment(`./assets/heroes/${fromHeroes2.file}${s.heroObj.level}.jpg`, "walking.jpg");
            const loserAttachment = new Data.Discord.MessageAttachment(`./assets/heroes/${fromHeroes1.file}${f.heroObj.level}.jpg`, "dying.jpg");

            const emb = Data.embed(int).setError("asd").setTitle("Новый победитель!").setText(stripIndents`
              Но это не ты..
              Попробуй снова позже!
            `)
            .setThumbnail(`attachment://walking.jpg`)
            .setAuthor(int.user.username, int.user.displayAvatarURL({dynamic: true}))

            msg.delete();

            await Data.util.delay(2500);
            msg.channel.send({embeds: [emb], files: [loserAttachment]});
            };
        } else {
          const randomForReward = Data.util.random(1, 100);
          if (randomForReward > 50) {
            collector.resetTimer();
            const bonuses = ["intelligence", "stamina", "defend", "attack"];
            const item = bonuses[Math.floor(Math.random() * bonuses.length)];

            const forAdd = Data.util.random(1, (20 * f.heroObj.level));

            f.heroObj[item] += forAdd;

            embed(int.channel.messages.cache.last())
            .setSuccess(`Вау, ты получил ${Data.emoji[item]}\`${forAdd}\` как бонус!`)
            .setAuthor(int.user.username, int.user.displayAvatarURL({dynamic: true}))
            .send();

            const toChange = embed(int.channel.messages.cache.last())
            .setTitle("Подготовка!")
            .addField(stripIndents`
              Твой герой
              ${f.heroObj.name}
              Эпоха: ${this.age(f.heroObj.level)}
              Предметы: ${f.heroObj.items.map(i => Data.weapons.method.findWeapon(i).emoji).join(" ")}
            `, stripIndents`
              Сила: \`${Data.F.forceGenerator(f.heroObj.intelligence, f.heroObj.stamina, f.heroObj.defend, f.heroObj.attack)}\`
              ${Data.emoji.intelligence} Интеллект: \`${f.heroObj.intelligence}\`
              ${Data.emoji.stamina} Выносливость: \`${f.heroObj.stamina}\`
              ${Data.emoji.defend} Защита: \`${f.heroObj.defend}\`
              ${Data.emoji.attack} Атака: \`${f.heroObj.attack}\`
            `, true)
            .addField(stripIndents`
              Враг
              ${s.heroObj.name}
              Эпоха: ${this.age(s.heroObj.level)}
              Предметы: ${s.heroObj.items.map(i => Data.weapons.method.findWeapon(i).emoji).join(" ")}
            `, stripIndents`
              Сила: \`${Data.F.forceGenerator(s.heroObj.intelligence, s.heroObj.stamina, s.heroObj.defend, s.heroObj.attack)}\`
              ${Data.emoji.intelligence} Интеллект: \`${s.heroObj.intelligence}\`
              ${Data.emoji.stamina} Выносливость: \`${s.heroObj.stamina}\`
              ${Data.emoji.defend} Защита: \`${s.heroObj.defend}\`
              ${Data.emoji.attack} Атака: \`${s.heroObj.attack}\`
            `, true)
            .setColor(Data.config.MAIN_COLOR)
            .setAuthor(int.user.username, int.user.displayAvatarURL({dynamic: true}))

            const disabled = new Data.Discord.MessageActionRow().addComponents([b1, b2.setDisabled(true)]);

            msg.edit({embeds: [toChange], components: [disabled]});

          } else {
            collector.stop();
            const emb = Data.embed(int).setTitle("Ляяя тебе выпала бомба!").setError(stripIndents`
                Попробуй снова позже!
              `)
              .setAuthor(int.user.username, int.user.displayAvatarURL({dynamic: true}));

            return msg.channel.send({embeds: [emb]});
          }

        }
      });

  },
  firstUpperCase: function (text, split = ' ') {
    return text.split(split).map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(' ');
  },
  fightProcess: function (f = {}, s = {}) {
    let firstWalk, secondWalk;
    const first = Math.max(f.heroObj.intelligence, s.heroObj.intelligence);
    if (first === f.heroObj.intelligence) {
      firstWalk = f;
      secondWalk = s;
    } else {
      firstWalk = s;
      secondWalk = f;
    }

    let temp1 = firstWalk.heroObj,
      temp2 = secondWalk.heroObj;

    const fDamage = (temp1.attack - temp2.defend) > 0 ? (temp1.attack - temp2.defend) : 1;
    const sDamage = (temp2.attack - temp1.defend) > 0 ? (temp2.attack - temp1.defend) : 1;

    temp1.health = 1000;
    temp2.health = 1000;

    while (true) {
      temp1.health -= sDamage;
      temp2.health -= fDamage;
      if (temp2.health <= 0) {
        if (temp2.stamina > temp1.stamia) {
          temp1.health -= sDamage;
          if (temp1.health <= 0) secondWalk.winner = true;
        } else {
          firstWalk.winner = true;
        }
        break;
      } else if (temp1.health <= 0) {
        if (temp1.stamina > temp2.stamina) {
          temp2.health -= fDamage;
          if (temp2.health <= 0) firstWalk.winner = true;
        } else {
          secondWalk.winner = true;
        }
        break;
      }
    }

    if (firstWalk.winner) {
      return [firstWalk, secondWalk];
    } else {
      return [secondWalk, firstWalk];
    }
  },
  levelCheck: async function (gameData = {}) {
    const max = 3;
    const hero = gameData.heroes[gameData.main || 0];
    if (hero.level == 3) return false;
    const random = Math.random() * 100;
    if (random < 2) {
      await db.models.game.updateOne({_id: gameData._id}, {$inc: {[`heroes.${gameData.main || 0}.level`]: 1}});
      return true;
    }
    return false;
  },
  age: function(level) {
    let heroType = "Феодальная";
    switch (level) {
      case 2:
        heroType = "Замковая";
        break;
      case 3:
        heroType = "Имперская";
        break;
    }
    return heroType;
  },
  randomHero: function () {//
    const index = Math.floor(Math.random() * heroes.length)
    let hero = heroes[index];
    hero.level = util.random(1, 3);
    let maxitems = config.DEFAULT_ITEM_COUNT + hero.level;
    let currentItemCount = util.random(0, maxitems);
    let itemArr = [];

    while (currentItemCount > 0) {
      let weapon = weapons.method.randomWeapon();
      itemArr.push(weapon.id);
      --currentItemCount;
    }

    hero.items = itemArr;
    let finalHero = this.getFinalHeroData(hero, itemArr)
    // console.log(`FINAL HERO:`)
    // console.log(finalHero);
    return finalHero;
  },
  getFinalHeroData: function (heroObj, items) {
    items.forEach(id => {
      const data = weapons.method.findWeapon(id);
      for (let power in data.bonus) {
        heroObj[power] += data.bonus[power] || 0;
      }
    });

    return heroObj;
  },
  getTime: function (date) {
    const moreTime = new Date(date - new Date());
    return {
      hours: moreTime.getUTCHours(),
      minutes: moreTime.getMinutes(),
      seconds: moreTime.getSeconds()
    }
  },
  forceGenerator: function (...values) {
    const reduced = values.reduce((aggr, number) => aggr + number, 0);
    return (reduced / values.length).toFixed(1);
  },
  timestamp: function (add = 0, date = Date.now()) {
    return Math.round((date + add) / 1000)
  },
  bonusCollector: function (heroObj = {}, formatter = false) {
    const bonuses = [];
    for (let item of bonusArr) {
      bonuses.push(`${emoji[item]} ${bonusToRus[item]}: \`${formatter ? util.formatNumber(heroObj[item]) : heroObj[item]}\``)
    }
    return bonuses;
  },
  progressBar: function (perc, ofMaxValue, size, line = '❤', slider = '🖤') {
  if (!perc && perc !== 0) throw new Error('Perc value is either not provided or invalid');
  if (isNaN(perc)) throw new Error('Perc value is not an integer');
  if (isNaN(ofMaxValue)) throw new Error('ofMaxValue value is not an integer');
  if (isNaN(size)) throw new Error('Size is not an integer');
  const percentage = perc / ofMaxValue; // Calculate the percentage �f the bar
  const progress = Math.round((size * percentage)); // Calculate the number of square caracters to fill the progress side.
  const emptyProgress = size - progress; // Calculate the number of dash caracters to fill the empty progress side.

  const progressText = line.repeat(progress); // Repeat is creating a string with progress * caracters in it
  const emptyProgressText = slider.repeat(emptyProgress); // Repeat is creating a string with empty progress * caracters in it
  const percentageText = Math.round(percentage * 100) + '%'; // Displaying the percentage of the bar

  const bar = '**[' + progressText + emptyProgressText + ']' + percentageText + '**'; // Creating the bar
  return bar;
  },
  async pagination(interaction, pages, buttonList, timeout = 120000, ids) {
    //if (!msg && !msg.channel) throw new Error("Channel is inaccessible.");
    if (!pages) throw new Error("Pages are not given.");
    if (!buttonList) throw new Error("Buttons are not given.");
    if (buttonList[0].style === "LINK" || buttonList[1].style === "LINK")
      throw new Error(
        "Link buttons are not supported with discordjs-button-pagination"
      );
    if (buttonList.length !== 2) throw new Error("Need two buttons.");

    let page = 0;

    const row = new Discord.MessageActionRow().addComponents(buttonList);

    const curPage = await interaction.reply({
      embeds: [pages[page].setFooter(`${page + 1} / ${pages.length}`)],
      components: [row],fetchReply: true,
    });


    const filter = (i) => { if (
      (i.customId === buttonList[0].customId ||
      i.customId === buttonList[1].customId) &&
      ids.includes(i.user.id)) {
        return true;
      } else if (!ids.includes(i.user.id)) {
        const intEmbed = new Discord.MessageEmbed()
        .setColor("#ff0000")
        .setTitle("Ошибка!")
        .setDescription("Эта кнопка не доступна для тебя!");

          return i.reply({embeds: [intEmbed], ephemeral: true})
      }

    };

    const collector = await curPage.createMessageComponentCollector({
      filter,
      time: timeout,
    });

    collector.on("collect", async (i) => {
      switch (i.customId) {
        case buttonList[0].customId:
          page = page > 0 ? --page : pages.length - 1;
          break;
        case buttonList[1].customId:
          page = page + 1 < pages.length ? ++page : 0;
          break;
        default:
          break;
      }
      await i.deferUpdate();
      await i.editReply({
        embeds: [pages[page].setFooter(`${page + 1} / ${pages.length}`)],
        components: [row],
      }).catch(()=>interaction.react('❌'));
      collector.resetTimer();
    });

    collector.on("end", () => {
      if (curPage) {
        const disabledRow = new Discord.MessageActionRow().addComponents(
          buttonList[0].setDisabled(true),
          buttonList[1].setDisabled(true)
        );
        curPage.edit({
          embeds: [pages[page].setFooter(`${page + 1} / ${pages.length}`)],
          components: [disabledRow],
        });
      }
    });

    return curPage;
  },
  async arrowPages(interaction, pages, timeout = 120000, ids) {
    //if (!msg && !msg.channel) throw new Error("Channel is inaccessible.");
    if (!pages) throw new Error("Pages are not given.");
    let page = 0;

    const b1 = new Discord.MessageButton()
    .setEmoji(emoji.leftarrow)
    .setCustomId("arrowPageLeft")
    .setStyle("SECONDARY")

    const b2 = new Discord.MessageButton()
    .setEmoji(emoji.rightarrow)
    .setCustomId("arrowPageRight")
    .setStyle("SECONDARY")

    const b3 = new Discord.MessageButton()
    .setEmoji(emoji.cancel)
    .setCustomId("arrowPageClose")
    .setStyle("DANGER")

    if (pages.length === 1) {
      b1.setDisabled(true);
      b2.setDisabled(true);
    }
    let buttonList = [b1, b2, b3];
    const row = new Discord.MessageActionRow().addComponents(buttonList);

    const curPage = await interaction.reply({
      embeds: [pages[page].setFooter(`${page + 1} / ${pages.length}`)],
      components: [row],fetchReply: true,
    });


    const filter = (i) => { if (
      (i.customId === buttonList[0].customId ||
      i.customId === buttonList[1].customId ||
      i.customId === buttonList[2].customId) &&
      ids.includes(i.user.id)) {
        return true;
      } else if (!ids.includes(i.user.id)) {
        const intEmbed = new Discord.MessageEmbed()
        .setColor("#ff0000")
        .setTitle("Ошибка!")
        .setDescription("Эта кнопка не доступна для тебя!");

          return i.reply({embeds: [intEmbed], ephemeral: true})
      }

    };

    const collector = await curPage.createMessageComponentCollector({
      filter,
      time: timeout,
    });
    let toClose = false;
    collector.on("collect", async (i) => {
      await i.deferUpdate();
      switch (i.customId) {
        case buttonList[0].customId:
          page = page > 0 ? --page : pages.length - 1;
          break;
        case buttonList[1].customId:
          page = page + 1 < pages.length ? ++page : 0;
          break;
        case buttonList[2].customId:
          toClose = true;
          curPage.delete();
          collector.stop();
          return;
        default:
          break;
      }
      await i.editReply({
        embeds: [pages[page].setFooter(`${page + 1} / ${pages.length}`)],
        components: [row],
      }).catch(()=>interaction.react('❌'));
      collector.resetTimer();
    });

    collector.on("end", () => {
      if (curPage && !toClose) {
        const disabledRow = new Discord.MessageActionRow().addComponents(
          buttonList[0].setDisabled(true),
          buttonList[1].setDisabled(true),
          buttonList[2].setDisabled(true),
        );
        curPage.edit({
          embeds: [pages[page].setFooter(`${page + 1} / ${pages.length}`)],
          components: [disabledRow],
        });
      }
    });

    return curPage;
  }
};

module.exports = obj;

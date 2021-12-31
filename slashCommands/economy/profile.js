const { SlashCommandBuilder } = require("@discordjs/builders");
const heroes = require("../../JSON/heroes");
const weapons = require("../../JSON/weapons");
const { add } = require("../../assets/emojis");
const { stripIndents } = require("common-tags");
const bonusArr = ["intelligence", "stamina", "defend", "attack"];

module.exports = {
  name:"profile",
  category: 4,
  data: new SlashCommandBuilder()
  .setName("профиль")
  .setDescription("Профиль пользователя.")
  .addUserOption(option =>
    option.setName("участник")
    .setDescription("Смотреть профиль участника сервера.")),

  run: async (client, int, Data) => {
    const { Discord, F, util, embed, db, emoji, config } = Data;

    const member = int.options.getMember("участник") || int.member;

    const data = await db.findOrCreate("profile", member.id);

    const game = await db.findOrCreate("game", member.id);

    const mainHero = game.heroes[game.main || 0];
    const character = heroes.find(obj => obj.name === mainHero.name);

    const main = F.getFinalHeroData(mainHero, mainHero.items || []);





    const thisHeroMaxItemCount = config.DEFAULT_ITEM_COUNT + (mainHero.level || 1);
    const items = (mainHero.items || []).map(id => weapons.method.findWeapon(id).emoji);
    const itemText = itemInterfaceMaker(items, thisHeroMaxItemCount);

    const force = F.forceGenerator(main.stamina, main.intelligence, main.defend, main.attack);

    const attachment = new Discord.MessageAttachment(`./assets/heroes/${character.name}/${[mainHero.level]}/walking.gif`, `main.gif`);

    const emb = embed(int)
      .setAuthor(`Профиль — ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))
      .addField("Баланс:", `${emoji.coin}\`${util.formatNumber(data.coins || 0)}\``)
      .addField("Яблоки:", `${emoji.apple}\`${util.formatNumber(data.apples || 0)}\``)
      .setThumbnail(`attachment://main.gif`)
      .addField("Предметы:", itemText)
      .addField(`Герой: ${character.name}\nЭпоха: \`${F.age(main.level || 1)}\`\nСила: \`${force}\``, stripIndents`${emoji.intelligence} Интеллект: \`${util.formatNumber(main.intelligence)}\`
                                                        ${emoji.stamina} Выносливость: \`${util.formatNumber(main.stamina)}\`
                                                        ${emoji.defend} Защита: \`${util.formatNumber(main.defend)}\`
                                                        ${emoji.attack} Атака: \`${util.formatNumber(main.attack)}\``)

    let embeds = [];

    const buttonToStart = new Discord.MessageButton()
    .setStyle("SECONDARY")
    .setLabel("Мои герои")
    .setCustomId("StartCheckHeroes")

    const rowToStart = new Discord.MessageActionRow().addComponents(buttonToStart);

    let boolean = (game.heroes.length > 1 && int.user.id === member.id);

    const msg = await int.reply({embeds: [emb], files: [attachment], components: boolean ? [rowToStart] : [], fetchReply: true});

    const interaction = int;
    const ids = [int.user.id];

    if (boolean) {
      const coll = await msg.createMessageComponentCollector({
        filter: (i) => {
        if (
        buttonToStart.customId === i.customId &&
        ids.includes(i.user.id)) {
          return true;
        } else if (!ids.includes(i.user.id)) {
          const intEmbed = new Discord.MessageEmbed()
              .setColor("#ff0000")
              .setTitle("Ошибка!")
              .setDescription("Эта кнопка недоступна для вас!")

            return i.reply({embeds: [intEmbed], ephemeral: true})
        }

      },
      time: 30000
      });

      coll.on("end", () => {
        if (!msg.deleted) {
              const disabledRow = new Discord.MessageActionRow().addComponents(
                buttonToStart.setDisabled(true)
              );
              msg.edit({
                components: [disabledRow],
              });
            }
      })

      coll.on("collect", async i => {
        i.deferUpdate();
          for (heroObj of game.heroes) {
          const hero = heroes.find(obj => obj.name === heroObj.name);
          const bonuses = F.bonusCollector(heroObj);

          const thisHeroMaxItemCount = config.DEFAULT_ITEM_COUNT + (heroObj.level || 1);
          const items = (heroObj.items || []).map(id => weapons.method.findWeapon(id).emoji);
          const itemText = itemInterfaceMaker(items, thisHeroMaxItemCount);



          const embToArr = embed(int)
          .setAuthor(`Герой: ${hero.name}`)
          .addField("Предметы:", itemText)
          .addField(stripIndents`Эпоха: \`${F.age(heroObj.level || 1)}\`\nСила: \`${F.forceGenerator(...(bonusArr.map(a => heroObj[a])))}\``, stripIndents`
            ${bonuses.join("\n")}
          `)

          embToArr.Attachment = new Discord.MessageAttachment(`./assets/heroes/${heroObj.name}/${heroObj.level || 1}/walking.gif`, `${heroObj.name.split(" ").join("")}.gif`);

          embToArr.setThumbnail(`attachment://${heroObj.name.split(" ").join("")}.gif`)

          embeds.push(embToArr);
        }

        const b1 = new Discord.MessageButton()
        .setCustomId("myheroesleft")
        .setEmoji(emoji.leftarrow)
        .setStyle("SECONDARY")

        const b2 = new Discord.MessageButton()
        .setCustomId("myheroesright")
        .setEmoji(emoji.rightarrow)
        .setStyle("SECONDARY")

        const b3 = new Discord.MessageButton()
        .setCustomId("mainHero")
        .setLabel("Select as main")
        .setStyle("PRIMARY")



        const pages = embeds;
        const timeout = 30000;
        const buttonList = [b1, b2, b3];
        let page = 0;
        const row = new Discord.MessageActionRow().addComponents(buttonList);

        const curPage = await interaction.followUp({
          embeds: [pages[page].setFooter(`${page + 1} / ${pages.length}`)],
          components: [row], files: [pages[page].Attachment],fetchReply: true,
        });


        const filter = (i) => { if (
          (buttonList.map(b => b.customId).includes(i.customId)) &&
          ids.includes(i.user.id)) {
            return true;
          } else if (!ids.includes(i.user.id)) {
            const intEmbed = new Discord.MessageEmbed()
                .setColor("#ff0000")
                .setTitle("Ошибка!")
                .setDescription("Эта кнопка недоступна для вас!")

              return i.followUp({embeds: [intEmbed], ephemeral: true})
          }

        };

        const collector = await curPage.createMessageComponentCollector({
          filter,
          time: timeout,
        });


        collector.on("collect", async (i) => {
          let tryMe = true;
          await i.deferUpdate();
          switch (i.customId) {
            case buttonList[0].customId:
              page = page > 0 ? --page : pages.length - 1;
              break;
            case buttonList[1].customId:
              page = page + 1 < pages.length ? ++page : 0;
              break;
            case buttonList[2].customId: {
              tryMe = false;
              const nowData = await db.findOrCreate("game", int.user.id);
              const selectedHero = nowData.heroes[page];
              if (!selectedHero) return embed(int).setError("Непонятная ошибка!").send("followUp", true);
              if (page === nowData.main) return embed(int).setError("Этот герой уже выбран как основной!").send("followUp", true);
              await db.models.game.updateOne({_id: int.user.id}, {$set: {main: Math.round(page)}});
              embed(int).setSuccess(`Герой **${selectedHero.name}** успешно выбран как основной!`).send("followUp", true);
              break;
            }
            default:
              break;
          }

          if (tryMe){
            curPage.removeAttachments();
            await i.editReply({
              embeds: [pages[page].setFooter(`${page + 1} / ${pages.length}`)],
              components: [row], files: [pages[page].Attachment],
            }).catch(()=>interaction.react('❌'));
            collector.resetTimer();
          }
        });

        collector.on("end", () => {
              if (!curPage.deleted) {
                const disabledRow = new Discord.MessageActionRow().addComponents(
                  buttonList.map(b => b.setDisabled(true))
                );
                curPage.edit({
                  embeds: [pages[page].setFooter(`${page + 1} / ${pages.length}`)],
                  components: [disabledRow],
                });
              }
            });

            return curPage;

      })


    }

  }
}

function itemInterfaceMaker (items, maxCount) {
  let text = "";
  items.forEach(i => text += i + " ");
  let toAdd = maxCount - items.length;
  while (toAdd > 0) {
    text += `${add} `;
    --toAdd;
  }
  return text;
}

const { SlashCommandBuilder } = require("@discordjs/builders");
const { stripIndents } = require("common-tags");
const bonusArr = ["intelligence", "stamina", "defend", "attack"];
const bonusToRus = {
  intelligence: "Интеллект",
  stamina: "Выносливость",
  defend: "Защита",
  attack: "Атака"
}

module.exports = {
	name: "shop",
	category: 4,
	data: new SlashCommandBuilder()
	.setName("магазин")
	.setDescription("Наши магазин."),
	run: async (client, int, Data) => {

		const { config, embed, F, emoji, heroes, weapons, util, Discord, db } = Data;

		const obj = {
			"герои": async function () {
				client.ops.shop.add(int.user.id);
				let arr = []
				for (let heroObj of heroes) {
					const bonuses = [];
					for (let item of bonusArr) {
						bonuses.push(`${emoji[item]} ${F.firstUpperCase(bonusToRus[item])}: \`${heroObj[item]}\``)
					}

					const toAdd = embed(int)
						.setAuthor(`Герой: ${heroObj.name}`)
						.setTitle(`Доступен для покупки: ${heroObj.forBuy ? "Да" : "Нет"}\nЭпоха: ${F.age(1)}`)
						.setText(stripIndents`
							Сила: \`${F.forceGenerator(...(bonusArr.map(a => heroObj[a])))}\`
							${bonuses.join("\n")}
						`);

					if (heroObj.forBuy) {

						toAdd.addField("Цена:", `${emoji[heroObj.costType.slice(0, heroObj.costType.length-1)]}\`${util.formatNumber(heroObj.cost)}\``)
					}

					toAdd.Attachment = new Discord.MessageAttachment(`./assets/heroes/${heroObj.file}1.jpg`, `hero.jpg`);

					toAdd.setThumbnail(`attachment://hero.jpg`)

					arr.push(
						toAdd
					)
				};

				const b1 = new Discord.MessageButton()
				.setCustomId("heroesleft")
				.setEmoji(emoji.leftarrow)
				.setStyle("SECONDARY")

				const b2 = new Discord.MessageButton()
				.setCustomId("heroesright")
				.setEmoji(emoji.rightarrow)
				.setStyle("SECONDARY")

				const b3 = new Discord.MessageButton()
				.setCustomId("heroesbuy")
				.setLabel("Купить этого героя")
				.setStyle("PRIMARY")

        const b4 = new Discord.MessageButton()
        .setEmoji(emoji.cancel)
        .setCustomId("arrowPageClose")
        .setStyle("DANGER")

				let page = 0;


			    const interaction = int;
			    const ids = [int.user.id];
			    const pages = arr;
			    const timeout = 30000;
			    const buttonList = [b1, b2, b3, b4];

			    const row = new Discord.MessageActionRow().addComponents(buttonList);

			    const curPage = await interaction.reply({
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

			          return i.reply({embeds: [intEmbed], ephemeral: true})
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

				        	const hero = heroes[page];

				        	if (!hero.forBuy) return embed(int).setError("Этот герой недоступен!").send("followUp", true);
				        	const myData = await db.findOrCreate("profile", int.user.id);
				        	const gameData = await db.findOrCreate("game", int.user.id);
				        	if (hero.cost > myData[hero.costType]) return embed(int).setError(`У тебя недостаточно ${emoji[hero.costType.slice(0, hero.costType.length-1)]}!`).send("followUp", true);
				        	const checkHero = gameData.heroes.find(obj => obj.name === hero.name);
				        	if (checkHero) return embed(int).setError("Ты уже имеешь этого героя!").send("followUp", true);
				        	await db[hero.costType](int.user.id, -hero.cost);
				        	gameData.heroes.push({
						        name: hero.name,
						        level: 1,
						        ready: true,
						        intelligence: hero.intelligence,
						        defend: hero.defend,
						        attack: hero.attack,
						        stamina: hero.stamina,
						        items: [],
						    });
				        	gameData.save();
				        	embed(int).setSuccess(`Ты купил — **${hero.name}**!`).send("followUp")
				        	break;
				        }
                case buttonList[3].customId:
                  tryMe = true;
                  collector.stop();
                  break;
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
			    	client.ops.shop.delete(int.user.id);
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
			},
			"кредиты": async function () {
				embed(int)
				.setAuthor("Магазин кредитов!")
				.setText(stripIndents`
					Используй команду \`обмен\` для обмена валютой!
					${emoji.apple}\`${util.formatNumber(config.CHANGE.toMoney)}\` = ${emoji.coin}\`1\`
					${emoji.coin}\`1\` = ${emoji.apple}\`${util.formatNumber(config.CHANGE.toApple)}\`
          ${emoji.token}\`${client.tokenValue}\` = ${emoji.coin}\`1\`
          **Курс токенов (${emoji.token}) часто меняется.**

					Приобретать доллары.
					**${emoji.coin}[${util.formatNumber(config.CREDITS.basic.money)} = ${util.formatNumber(config.CREDITS.basic.rub)}₽](${config.DONATE_LINK})**
				`)
				.setFooter("Не забудь указать айди(ID)!")
				.send();
			}
		}


		obj["кредиты"]()



	}
}

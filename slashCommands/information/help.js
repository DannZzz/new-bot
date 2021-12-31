const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");
const { stripIndents } = require("common-tags");

module.exports = {
  name: "help",
  category: 3,
  data: new SlashCommandBuilder()
  .setName("хелп")
  .setDescription("Хелп команда, описания всех команд.")
  .addStringOption(o => o
    .setName("команда")
    .setDescription("Информация о команде.")
    .setRequired(true)
  ),
  run: async (client, int, Data) => {
    const { config, emoji, embed, F, Discord, errEmb, serverData } = Data;

    const cmdName = (int.options.getString("команда")).toLowerCase();

      if (cmdName) {
      const cmd = client.slashCommands.find(c => c.data.name === cmdName);
      if (!cmd) return embed(int).setError(`Команда **${cmdName}** не найдена.`).send();

      const optionTypes = {
        "1": "Подкоманда",
        "2": "Подкоманда",
        "3": "Текст",
        "4": "Число",
        "5": "Да/Нет",
        "6": "Пользователь Дискорда",
        "7": "Канал",
        "8": "Роль",
        "10": "Число"
      }

      const data = cmd.data;
      let options;
      if (data.options && data.options.length > 0) {
        options = data.options.map((obj, index) => {
          return `${index+1}. **${obj.name}** - ${optionTypes[obj.type + ""]}\n${obj.required ? emoji.check : emoji.cross}└ ${obj.description}`;
        })
      }
      var commandInGuild = false;
      if (serverData.disabledCommands) {
        commandInGuild = serverData.disabledCommands[cmd.name];
      }

      let disabledRoles, disabledChannels;

      if (commandInGuild) {
        if (commandInGuild.disabledChannels && commandInGuild.disabledChannels.length > 0) {
          disabledChannels = commandInGuild.disabledChannels.map(channelId => {
            const checkData = int.guild.channels.cache.get(channelId)
            if (checkData) return checkData;
          });
        }
        if (commandInGuild.disabledRoles && commandInGuild.disabledRoles.length > 0) {
          disabledRoles = commandInGuild.disabledRoles.map(roleId => {
            const checkData = int.guild.roles.cache.get(roleId)
            if (checkData) return checkData;
          });
        }
      }

      embed(int)
      .setAuthor("📑 Информация о команде")
      .setText(stripIndents`
        **${cmd.data.name}** — ${data.description || "Нет описания"}

        ${emoji.check} - Обязательный параметр
        ${emoji.cross} - Необязательный параметр
      `)
      .addField("# Параметры", stripIndents`
        ${options && options.length > 0 ? options.join("\n") : "Не найдены"}
      `)
      .addField("Глобально отключена:", `${commandInGuild && commandInGuild.globalDisabled === true ? `Да` : `Нет`}`)
      .addField("Отключённые каналы:", `${disabledChannels && disabledChannels.length > 0 ? `${disabledChannels.join(", ")}` : `Не найдены`}`)
      .addField("Отключённые роли:", `${disabledRoles && disabledRoles.length > 0 ? `${disabledRoles.join(", ")}` : `Не найдены`}`)
      .send();

      return;
    }

    let embeds = [];
    const categories = {
      "2": "Административные",
      "1": "Модераторские",
      "3": "Информационные",
      "4": "Роль Плей",
      "5": "Утилиты"
    };

    const categoriesEmojis = {
      "2": "👑",
      "1": "🔐",
      "3": "📃",
      "4": "🎭",
      "5": "🔗"
    };

    const categoriesDescription = {
      "1": "Модераторские команды",
      "2": "Команды для настройки бота",
      "3": "Информационные команды бота",
      "4": "Наша игра, в разработке",
      "5": "Весёлости и утилиты, в разработке"
    }

    const options = [];

    const mainEmbed = embed(int).setAuthor("Вот мои команды!").setText("Они все используются через **/**.\nАдминистраторам разрешается использовать команды: **Адана открой**, **Адана закрой** и **Адана рифмуй**.\nПервые 2 закрывают и открывают доступ к текстовому каналу, а последняя включает ответы от бота.").setThumbnail(client.user.avatarURL());

    for (index of [1, 2, 3, 4, 5]) {
      const filtered = client.slashCommands.filter(obj => obj.category === index);
      const textedCommands = filtered.map(obj => `\`${obj.data.name}\` - ${obj.data.description}`);
      const textNames = filtered.map(obj => `\`${obj.data.name}\``);
      options.push({
        label: categories["" + index],
        description: categoriesDescription["" + index],
        value: "" + index,
        emoji: categoriesEmojis["" + index]
      });
      mainEmbed.addField(`${categoriesEmojis["" + index]} ${categories["" + index]}`, textNames.join(", "))
      embeds.push(embed(int).setAuthor(categories["" + index]).setText(textedCommands.join("\n")))
    }

    const menu = new Discord.MessageSelectMenu({customId: "firstSelecetMenu", options, placeholder: "Категории"});

    const row = new Discord.MessageActionRow().addComponents(
      menu
    );

    const asd = await int.reply({embeds: [mainEmbed], components: [row], fetchReply: true})

    const collector = asd.createMessageComponentCollector({
      filter: i => {
        if (!i.isSelectMenu()) return false;
        if (i.user.id === int.user.id) {
          return true;
        } else {
          return i.reply({embeds: [errEmb], ephemeral: true})
        }
      },
      time: 30000
    });

    collector.on("collect", async i => {
      const index = +i.values[0] - 1;
      collector.resetTimer();
      await i.deferUpdate();
      await i.editReply({embeds: [embeds[index]], components: [row]})
    });

    collector.on("end", async i => {
      if (asd) {
        const disabledRow = new Discord.MessageActionRow().addComponents(
          menu.setDisabled(true)
        );
        asd.edit({embeds: [mainEmbed], components: [disabledRow]});
      }
    });

  }
}

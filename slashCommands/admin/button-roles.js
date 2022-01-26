const {
  SlashCommandBuilder
} = require("@discordjs/builders");

module.exports = {
  name: "button-roles",
  category: 2,
  permissions: ["ADMINISTRATOR"],
  data: new SlashCommandBuilder()
    .setName("реакция")
    .setDescription("Система выдачи ролей с помощью кнопок.")
    .addSubcommand(cmd => cmd
      .setName("создать")
      .setDescription("Создать новую реакцию с кнопкой для выдачи ролей.")
      .addStringOption(o => o
        .setName("тип-реакции")
        .setDescription("Тип реакции, изменения ролей.")
        .addChoice("Можно иметь только одну роль из этой реакции", "1")
        .addChoice("Можно иметь несколько ролей из этой реакции", "2")
        .setRequired(true)
      )
      .addStringOption(o => o
        .setName("название")
        .setDescription("Название кнопки.")
        .setRequired(true)
      )
      .addRoleOption(o => o
        .setName("роль")
        .setDescription("При нажатии кнопки участник получит эту роль")
        .setRequired(true)
      )

      .addStringOption(o => o
        .setName("стиль")
        .setDescription("Стиль(цвет) кнопки, ссылки не поддерживаются.")
        .setRequired(true)
        .addChoice("Синий", "PRIMARY")
        .addChoice("Серый", "SECONDARY")
        .addChoice("Зелёный", "SUCCESS")
        .addChoice("Красный", "DANGER")
      )
      .addStringOption(o => o
        .setName("эмодзи")
        .setDescription("Эмодзи для кнопки.")
      )
      .addStringOption(o => o
        .setName("описание")
        .setDescription("Сделать своё описание EMBED.")
      )
    )
    .addSubcommand(cmd => cmd
      .setName("добавить-кнопку")
      .setDescription("Добавить новую кнопку в готовою реакцию.")
      .addStringOption(o => o
        .setName("сообщение-id")
        .setDescription("ID готовой реакции.")
        .setRequired(true)
      )
      .addStringOption(o => o
        .setName("название")
        .setDescription("Название кнопки.")
        .setRequired(true)
      )
      .addRoleOption(o => o
        .setName("роль")
        .setDescription("При нажатии кнопки участник получит эту роль.")
        .setRequired(true)
      )
      .addStringOption(o => o
        .setName("стиль")
        .setDescription("Стиль(цвет) кнопки, ссылки не поддерживаются.")
        .setRequired(true)
        .addChoice("Синий", "PRIMARY")
        .addChoice("Серый", "SECONDARY")
        .addChoice("Зелёный", "SUCCESS")
        .addChoice("Красный", "DANGER")
      )
      .addStringOption(o => o
        .setName("эмодзи")
        .setDescription("Эмодзи для кнопки.")
      )
      .addStringOption(o => o
        .setName("описание")
        .setDescription("Сделать своё описание EMBED.")
      )
    )
    .addSubcommand(cmd => cmd
      .setName("добавить-роль-к-кнопку")
      .setDescription("Добавить роль к кнопку, для выдачи нескольких ролей.")
      .addStringOption(o => o
        .setName("сообщение-id")
        .setDescription("ID готовой реакции.")
        .setRequired(true)
      )
      .addIntegerOption(o => o
        .setName("номер")
        .setDescription("Номер кнопки в реакции.")
        .setRequired(true)
      )
      .addRoleOption(o => o
        .setName("роль")
        .setDescription("Если указанная роль будет в списке, то она уберётся, а если нет, то добавится.")
        .setRequired(true)
      )
    )
    .addSubcommand(cmd => cmd
      .setName("убрать")
      .setDescription("Убрать кнопку из готовой реакции.")
      .addStringOption(o => o
        .setName("сообщение-id")
        .setDescription("ID готовой реакции.")
        .setRequired(true)
      )
      .addIntegerOption(o => o
        .setName("номер")
        .setDescription("Номер кнопки в реакции.")
        .setRequired(true)
      )
    )
    .addSubcommand(cmd => cmd
      .setName("отключить-все")
      .setDescription("Отключить все реакции.")
    )
    .addSubcommand(cmd => cmd
      .setName("изменять-описание")
      .setDescription("Изменять описание у готовой реакции.")
      .addStringOption(o => o
        .setName("сообщение-id")
        .setDescription("ID готовой реакции.")
        .setRequired(true)
      )
    ),
  run: async (client, int, Data) => {
    const {
      embed,
      serverData,
      F,
      db
    } = Data;

    await int.deferReply();

    const guild = int.guild;
    const user = int.user;

    const msg = int.options.getString("сообщение-id");
    const label = int.options.getString("название");
    const role = int.options.getRole("роль");
    const type = int.options.getString("тип-реакции");
    const style = int.options.getString("стиль");
    const index = int.options.getInteger("номер") - 1;
    const emoji = int.options.getString("эмодзи") || undefined;
    const embedDescription = int.options.getString("описание") || undefined;

    if (role && role.position >= int.member.roles.highest.position) return embed(int).setError("Эта роль находится выше тебя.").send("followUp");

    const exampleData = {
      channel: "id",
      label: "label",
      message: "id",
      role: ["id"],
      style: "style",
      emoji: "emojiID",
      type: 1,
      description: "something",
      uuid: "button unique id"
    };

    if (!serverData.buttonRoles) await db.models.server.updateOne({
      _id: guild.id
    }, {
      $set: {
        buttonRoles: []
      }
    });
    const sd = await db.findOrCreate("server", guild.id);

    const functions = {
      "создать": async () => {
        const emojiRes = client.emojis.resolveIdentifier(emoji) || undefined;
        const emb = client.embed()
          .setColor("RANDOM")
          .setAuthor({
            name: "Нажми на кнопки, чтобы получать роли!"
          })
          .setFooter({
            text: client.user.username,
            iconURL: client.user.avatarURL()
          })

        const uuid = client.uuid("all", 20);

        embedDescription && emb.setDescription(client.util.shorten(embedDescription, 4000));

        const button = new client.discord.MessageButton()
          .setStyle(style)
          .setLabel(client.util.shorten(label, 50))
          .setCustomId(`br-${uuid}`)

        if (emojiRes) {
          console.log(emojiRes);
          button.setEmoji(emoji);
        }

        const row = new client.discord.MessageActionRow().addComponents([button]);

        await int.channel.send({
          embeds: [emb],
          components: [row]
        }).then(async (message) => {
          await db.models.server.updateOne({
            _id: guild.id
          }, {
            $push: {
              buttonRoles: {
                channel: int.channelId,
                message: message.id,
                buttons: [{
                  label,
                  roles: [role.id],
                  style,
                  emoji,
                  uuid
                }],
                description: embedDescription,
                type: +type,
              }
            }
          })

          int.followUp({
            content: "Реакция успешно создана.",
            ephemeral: true
          });

        })

      },
      "добавить-кнопку": async () => {
        await client.util.delay(1000);
        const reaction = sd.buttonRoles.find(o => o.message === msg);
        const reactionIndex = sd.buttonRoles.findIndex(o => o.message === msg);

        if (!reaction) return embed(int).setError('Реакция не найдена.').send("followUp");

        const channel = await guild.channels.fetch(reaction.channel);

        const thisMessage = await channel?.messages?.fetch(reaction.message);

        if (!thisMessage) return embed(int).setError('Реакция не найдена.').send("followUp");

        if (!checkPremium(reaction?.buttons?.length)) return;

        const emojiRes = client.emojis.resolveIdentifier(emoji) || undefined;

        const emb = client.embed()
          .setColor("RANDOM")
          .setAuthor({
            name: "Нажми на кнопки, чтобы получать роли!"
          })
          .setFooter({
            text: client.user.username,
            iconURL: client.user.avatarURL()
          })

        const uuid = client.uuid("all", 20);



        const button = new client.discord.MessageButton()
          .setStyle(style)
          .setLabel(client.util.shorten(label+"", 50))
          .setCustomId(`br-${uuid}`)

        emojiRes && button.setEmoji(emoji);

        let i = 1;

        const buttons = [];
        reaction.buttons.forEach(obj => {
          const b = new client.discord.MessageButton()
            .setLabel(client.util.shorten(obj.label+"", 50))
            .setStyle(obj.style)
            .setCustomId(`br-${obj.uuid}`);

          if (obj.emoji && client.emojis.resolveIdentifier(obj.emoji)) b.setEmoji(obj.emoji);

          buttons.push(
            b
          )
          i++;
        });
        buttons.push(button)

        // [button1, button2, buttonN]
        const rows = [];
        i = 0;

        function add() {
          const sliced = buttons.slice(i, i + 5)
          i += 5;
          rows.push(new client.discord.MessageActionRow().addComponents([sliced]));
          if (i < reaction.buttons.length + 1) {

            add();
          }
        }
        add();

        if (embedDescription) {
          emb.setDescription(client.util.shorten(embedDescription, 4000));
          await thisMessage.edit({
            components: rows,
            embeds: [emb]
          });
        } else {
          await thisMessage.edit({
            components: rows
          });
        };

        await db.models.server.updateOne({
          _id: guild.id
        }, {
          $push: {
            [`buttonRoles.${reactionIndex}.buttons`]: {
              label,
              roles: [role.id],
              style,
              emoji,
              uuid
            }
          },
          $set: {
            [`buttonRoles.${reactionIndex}.description`]: embedDescription,
          }
        })

        embed(int).setSuccess("Кнопка успешно добавлена.").send("followUp");
      },
      "добавить-роль-к-кнопку": async () => {
        const reaction = sd.buttonRoles.find(o => o.message === msg);
        const reactionIndex = sd.buttonRoles.findIndex(o => o.message === msg);

        if (!reaction) return embed(int).setError('Реакция не найдена.').send("followUp");

        const channel = await guild.channels.fetch(reaction.channel);

        const thisMessage = await channel?.messages?.fetch(reaction.message);

        if (!thisMessage) return embed(int).setError('Реакция не найдена.').send("followUp");

        const thisButton = reaction.buttons[index];
        if (!thisButton) return embed(int).setError("Кнопка с этим номером не найден.").send('followUp');

        if (thisButton.roles.includes(role.id) && thisButton.length === 1) return embed(int).setError("У этой кнопки только одна роль, невозможно её убрать, вы можете убрать кнопку.").send("followUp");
        if (thisButton.roles.includes(role.id)) {
          const roles = client.util.remove(thisButton.roles, undefined, role.id);
          await db.models.server.updateOne({_id: guild.id}, {$set: {[`buttonRoles.${reactionIndex}.buttons.${index}.roles`]: roles}});
          return embed(int).setSuccess(`Роль: ${role} успешно убрана.`).send("followUp");
        } else {
          if (!sd.premium || sd.premium < new Date()) return embed(int).setError("Только на Премиум серверах могут кнопки выдавать более одной роли.").send("followUp");
          if (thisButton.roles.length < 5) {
            await db.models.server.updateOne({_id: guild.id}, {$push: {[`buttonRoles.${reactionIndex}.buttons.${index}.roles`]: role.id}});
            return embed(int).setSuccess(`Роль: ${role} успешно добавлена.`).send("followUp");
          } else {
            return embed(int).setError("Можно добавить до 5-и ролей.").send("followUp");
          }
        }
        
      },
      "убрать": async () => {
        const reaction = sd.buttonRoles.find(o => o.message === msg);
        const reactionIndex = sd.buttonRoles.findIndex(o => o.message === msg);

        if (!reaction) return embed(int).setError('Реакция не найдена.').send("followUp");

        const channel = await guild.channels.fetch(reaction.channel);

        const thisMessage = await channel?.messages?.fetch(reaction.message);

        if (!thisMessage) return embed(int).setError('Реакция не найдена.').send("followUp");
        if (reaction.buttons.length === 1) return embed(int).setError()
        const thisButton = reaction.buttons[index];
        if (!thisButton) return embed(int).setError("Кнопка с этим номером не найден.").send('followUp');
        const removedArr = client.util.remove(reaction.buttons, index);
        

        let i = 1;

        const buttons = [];
        removedArr.forEach(obj => {
          const b = new client.discord.MessageButton()
            .setLabel(client.util.shorten(obj.label+"", 50))
            .setStyle(obj.style)
            .setCustomId(`br-${obj.uuid}`);

          if (obj.emoji && client.emojis.resolveIdentifier(obj.emoji)) b.setEmoji(obj.emoji);

          buttons.push(
            b
          )
          i++;
        });
       

        // [button1, button2, buttonN]
        const rows = [];
        i = 0;

        function add() {
          const sliced = buttons.slice(i, i + 5)
          i += 5;
          rows.push(new client.discord.MessageActionRow().addComponents([sliced]));
          if (i < reaction.buttons.length + 1) {

            add();
          }
        }
        add();

        await thisMessage.edit({components: rows});
        await db.models.server.updateOne({_id: guild.id}, {$set: {[`buttonRoles.${reactionIndex}.buttons`]: removedArr}});
        return embed(int).setSuccess("Кнопка успешно убрана.").send("followUp");
      },
      "отключить-все": async () => {
        await db.models.server.updateOne({_id: guild.id}, {$set: {buttonRoles: []}});
        return embed(int).setSuccess("Все реакции успешно отключены.").send("followUp");
      },
      "изменять-описание": async () => {
        const reaction = sd.buttonRoles.find(o => o.message === msg);
        const reactionIndex = sd.buttonRoles.findIndex(o => o.message === msg);

        if (!reaction) return embed(int).setError('Реакция не найдена.').send("followUp");

        const channel = await guild.channels.fetch(reaction.channel);

        const thisMessage = await channel?.messages?.fetch(reaction.message);

        if (!thisMessage) return embed(int).setError('Реакция не найдена.').send("followUp");

        embed(int).setText("Теперь напишите описание, у вас 30 секунд.").send("followUp");
        
        const c = int.channel.createMessageCollector({
          filter: m => m.author.id === user.id,
          time: 30000,
          max: 1
        });

        var b = false;

        c.on("collect", async message => {
          if (message.content) {
            b = true;
            c.stop();
            const emb = client.embed()
            .setColor("RANDOM")
            .setAuthor({
              name: "Нажми на кнопки, чтобы получать роли!"
            })
            .setFooter({
              text: client.user.username,
              iconURL: client.user.avatarURL()
            })
            .setDescription(client.util.shorten(message.content, 4000));

            await thisMessage.edit({embeds: [emb]})
            await db.models.server.updateOne({_id: guild.id}, {$set: {[`buttonRoles.${reactionIndex}.description`]: embedDescription}});
            return embed(int).setSuccess("Описание успешно обновлено.").send("followUp")
            }
        })
        
        c.on("end", () => {
          if (!b) {
            return embed(int).setError("Попробуйте снова.").send("followUp")
          }
        })
        
      }
    };

    functions[int.options.getSubcommand()]();

    function checkPremium(count) {
      if (count >= 10 && (!sd.premium || sd.premium < new Date())) {
        embed(int).setError("Это сервер не премиум, вы можете создавать до 10-и кнопок.").send("followUp");
        return false;
      } else if (count >= 20) {
        embed(int).setError("Вы можете создавать до 20-и кнопок.").send("followUp");
        return false;
      }
      return true;
    }

  }
}
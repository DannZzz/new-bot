const { SlashCommandBuilder } = require('@discordjs/builders');
const { progressBar } = require("../../utils/functions");
const { createCanvas } = require("canvas");
const canvasTxt = require("canvas-txt").default;

module.exports = {
  name: "colors",
  category: 2,
  data: new SlashCommandBuilder()
  	.setName('цвет')
  	.setDescription('Управление цветными ролями.')
    .addSubcommand(cmd => cmd
      .setName("создать-цветная-роль")
      .setDescription("Создать цветная роль и добавить в список.")
      .addStringOption(o => o
        .setName("название")
        .setDescription("Название цвета, напишите простое название, например: Red.")
        .setRequired(true)
      )
      .addStringOption(o => o
        .setName("цвет")
        .setDescription("Цвет роли, HEX код или например RANDOM, для рандомного выбора.")
        .setRequired(true)
      )
    )
    .addSubcommand(cmd => cmd
      .setName("список")
      .setDescription("Посмотреть все цветные роли.")
    )
    .addSubcommand(cmd => cmd
      .setName("создать-реакция")
      .setDescription("Создать реакцию на канале.")
    )
    .addSubcommand(cmd => cmd
      .setName("добавить-роль")
      .setDescription("Добавить существующая роль в список.")
      .addRoleOption(o => o
        .setName("роль")
        .setDescription("Роль сервера.")
        .setRequired(true)
      )
      .addStringOption(o => o
        .setDescription("Давать другое название в списке.")
        .setName("название")
      )
    )
    .addSubcommand(cmd => cmd
      .setName("удалить-цветная-роль")
      .setDescription("Удалить цветная роль.")
      .addIntegerOption(o => o
        .setName("номер")
        .setDescription("Номер из списка цветов.")
        .setRequired(true)
      )
      .addStringOption(o => o
        .setDescription("Выбирай \"Да\", если не хочешь удалить роль.")
        .setName("не-удалять-роль")
        .addChoice("Да", "yes")
        .addChoice("Нет", "no")
      )
    )
    .addSubcommand(cmd => cmd
      .setName("удалять-все")
      .setDescription("Удалять все цвета из списка, и роли(выбор).")
      .addStringOption(o => o
        .setDescription("Выбирай \"Да\", если не хочешь удалить роль.")
        .setName("не-удалять-роль")
        .addChoice("Да", "yes")
        .addChoice("Нет", "no")
      )
    )
    .addSubcommand(cmd => cmd
      .setName("создать-рандомный")
      .setDescription("Создать роль с рандомным цветом.")
    )
  ,
  permissions: ['ADMINISTRATOR'],
  run: async (client, int, Data) => {
    const { Discord, embed, util, serverData, db } = Data;
    await int.deferReply();
    const guild = int.guild;
    const cmd = int.options.getSubcommand();
    const name = int.options.getString("название");
    const color = int.options.getString("цвет");
    const dontDeleteRole = int.options.getString("не-удалять-роль");
    const indexSpec = int.options.getInteger("номер");
    const roleSpec = int.options.getRole("роль")

    var sd = serverData;
    if (!serverData.colors) {
      await db.models.server.update({_id: guild.id}, {$set: {colors: [] }});
      sd = await findOrCreate("server", guild.id);
    };

    class Main {
      constructor () {

      }

      async interfaceAll () {
        const colors = await this.validColors()
        let h = 80;
        const canvas = createCanvas(2000, (colors.length || 1) * 100)
        var ctx = canvas.getContext('2d')

        if ((!sd.premium || sd.premium < new Date()) && colors.length > 10) {
          colors.splice(0, 10);
          await db.models.server.updateOne({_id: guild.id}, {$set: {colors}})
        } else if (colors.length > 20) {
          colors.splice(0, 20);
          await db.models.server.updateOne({_id: guild.id}, {$set: {colors}})
        }

        colors.forEach((obj, i) => {
          let name = obj.name;
          if (!obj.name) {
            const role = guild.roles.cache.get(obj.id);
            name = role.name;
          };

          ctx.restore()
          ctx.save();

          ctx.fillStyle = obj.color;

          ctx.font = "100px Calibri";
          ctx.fillText(util.shorten(`${i+1}. ${name}`, 17), (i + 1) % 2 === 0 ? 1000 : 1, h)

          if ((i + 1) % 2 === 0) h += 150;


        })

        return canvas

      }

      async createColor (name, colorHex) {
          if (!this.checkPremium() || !this.checkMyPermission()) return;
          const role = await guild.roles.create({
            name,
            color: ["BLACK", "000", "000000", "#000", "#000000"].includes(colorHex.toUpperCase()) ? "#010101" : colorHex.toUpperCase(),
            position: guild.me.roles.highest.position,
            reason: "Цветная роль"
          });

          await db.models.server.updateOne({_id: guild.id}, {$set: { colors: [...sd.colors, {
            name,
            color: colorHex.toUpperCase(),
            id: role.id
          }] }})

          embed(int).setText(`Успешно добавлен цветная-роль: ${role}`).setColor(colorHex.toUpperCase()).send("followUp");
      }

      async deleteColor(index) {
        if (!this.checkMyPermission()) return;
        const colors = await this.validColors();
        const number = index - 1;
        const isExists = colors[number];
        if (!isExists) {
          return embed(int).setError("Роль с этим номером не найдена.").send("followUp");
        } else {
          const removed = util.remove(colors, number);
          await db.models.server.updateOne({_id: guild.id}, {$set: { colors: removed}});
          if (dontDeleteRole !== "yes") guild.roles.delete(isExists.id);
          embed(int).setSuccess("Цвет успешно удалён.").send("followUp");
        }
      }

      async addExistingRole(role, name = "") {
        if (!this.checkPremium() || !this.checkMyPermission()) return;
        const colors = await this.validColors();
        if (colors.find(obj => obj.id === role.id)) return embed(int).setError("Эта роль уже есть в списке.").send("followUp");
        await db.models.server.updateOne({_id: guild.id}, {$set: { colors: [...sd.colors, {
          name: name || role.name,
          color: role.hexColor,
          id: role.id
        }] }});

        embed(int).setText(`Успешно добавлен цветная-роль: ${role}`).setColor(role.hexColor).send("followUp");
      }

      async deleteColors() {
        if (!this.checkMyPermission()) return;
        const colors = await this.validColors();

        await db.models.server.updateOne({_id: guild.id}, {$set: { colors: [] }});
        if (dontDeleteRole !== "yes") {
          colors.forEach(obj => guild.roles.delete(obj.id))
        }
        embed(int).setSuccess("Все мне доступные цвета будут удалены.").send("followUp")
      }

      async createRandomColor() {
        if (!this.checkPremium() || !this.checkMyPermission()) return;
        const role = await guild.roles.create({
          name: "Рандом-Цвет",
          color: "RANDOM",
          position: guild.me.roles.highest.position,
          reason: "Цветная роль"
        });

        await db.models.server.updateOne({_id: guild.id}, {$set: { colors: [...sd.colors, {
          color: role.hexColor,
          id: role.id
        }] }})

        embed(int).setText(`Успешно добавлен цветная-роль: ${role}`).setColor(role.hexColor).send("followUp");
      }

      async createReaction() {
        const colors = await this.validColors();
        if (colors.length === 0) return embed(int).setError("Сначала создайте цвета.").send("followUp");
        const canva = await this.interfaceAll();

        if ((!sd.premium || sd.premium < new Date()) && colors.length > 10) {
          colors.splice(0, 10);
          await db.models.server.updateOne({_id: guild.id}, {$set: {colors}})
        } else if (colors.length > 20) {
          colors.splice(0, 20);
          await db.models.server.updateOne({_id: guild.id}, {$set: {colors}})
        }

        let i = 1;

        const buttons = [];
        colors.forEach(obj => {
          buttons.push(
            new Discord.MessageButton()
            .setLabel(`${i}`)
            .setStyle("SECONDARY")
            .setCustomId(`color-${obj.id}`)
          )
          i++;
        });

        // [button1, button2, buttonN]
        const rows = [];
        i = 0;

        function add () {
          const sliced = buttons.slice(i, i+5)
          i += 5;
          rows.push(new Discord.MessageActionRow().addComponents([sliced]));
          if (i < colors.length) {

            add();
          }
        }
        add();

        const att = new Discord.MessageAttachment(canva.toBuffer(), "main.png")

        const emb = new Discord.MessageEmbed()
        .setImage(`attachment://main.png`);

        await int.channel.send({embeds: [emb], files: [att], components: rows});
        int.followUp({content: "Реакция успешно создана!", ephemeral: true})

      }

      async validColors () {
        const filtered = sd?.colors?.filter(obj => guild.roles.cache.has(obj.id));
        if (filtered.length === sd?.colors?.length) return sd.colors;
        await db.models.server.updateOne({_id: guild.id}, {$set: {colors: filtered}});
        return filtered;
      }

      checkMyPermission() {
        if (!guild.me.permissions.has("MANAGE_ROLES")) {
          embed(int).setError("У меня недостаточно прав.").send("followUp");
          return false;
        }
        return true;
      }

      checkPremium() {
        const filtered = sd.colors.filter(obj => guild.roles.cache.has(obj.id));

        let count = filtered.length;

        if (count > 10 && (!sd.premium || sd.premium < new Date()) ) {
          embed(int).setError("Это сервер не премиум, вы можете создавать до 10-и ролей.").send("followUp");
          return false;
        } else if (count >= 20) {
          embed(int).setError("Вы можете создавать до 20-и ролей.").send("followUp");
          return false;
        }
        return true;

      }

    }
    const Class = new Main();
    switch (cmd) {
      case "создать-цветная-роль": {
        await Class.createColor(name, color);
        break;
      }
      case "список": {
        const image = await Class.interfaceAll();
        const att = new Discord.MessageAttachment(image.toBuffer(), "main.png")
        int.followUp({files: [att], ephemeral: true})
        break;
      }
      case "удалить-цветная-роль": {
        await Class.deleteColor(indexSpec);
        break;
      }
      case "создать-реакция": {
        await Class.createReaction();
        break;
      }
      case "добавить-роль": {
        await Class.addExistingRole(roleSpec, name);
        break;
      }
      case "удалять-все": {
        await Class.deleteColors()
        break;
      }
      case "создать-рандомный": {
        await Class.createRandomColor()
        break;
      }

    }






  }
}

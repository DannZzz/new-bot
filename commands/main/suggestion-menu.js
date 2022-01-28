const { stripIndents } = require("common-tags");
const ms = require("ms");
const F = require("../../utils/functions");

module.exports = {
  name: "menu",
  dev: true,
  run: async function (client, msg, args, Data) {
    const { db, rewards } = Data;

    var bd = await db.findOrCreate("bot", "main");

    console.log("started")
    
    var mainArr = bd.tempSuggestions || [];
    var interface = function () {
      return mainArr.map((obj, i) => {
        return `\`${i} .\` Тип: \`${obj.type}\` | Название: \`${obj.name}\` | Язык: :flag_${obj.lang}: \nID: \`${obj.id}\``;
     })
    }
    if (mainArr.length === 0) return msg.reply("Нет ничего")
    function make () {
        const embeds = [];
        for (let i = 0; i < mainArr.length; i+=5) {
          const arr = interface();
          const sliced = arr.slice(i, i+5);
          embeds.push(client.embed("main")
              .setDescription(stripIndents`
              \`ban <номер> <время>\`
              \`add <номер>\`
              \`remove <номер>\`
              
              ${sliced.length > 0 ? sliced.join("\n\n") : "Пока что ничего"}
              `)
          )
          
        }
        return embeds;
    }

    var message = await F.arrowPages(msg, make(), 30000, [msg.author.id]);

    const c = msg.channel.createMessageCollector({
      filter: m => m.author.id === msg.author.id,
      time: 30000
    });

    c.on("end", () => {
      msg.channel.send("Коллектор закончился")
    })

    c.on("collect", async m => {
      const content = m.content;  
      if (!content) {
      } else {
        c.resetTimer();
        const arg = content.toLowerCase().split(" ");

        if (arg[0] === "add") {
          if (mainArr[+arg[1]]) {
            const item = mainArr[+arg[1]]

            var secret = client.uuid("number", 16);
            bd = await db.findOrCreate("bot", "main");
            while (bd[`suggested${item.type}`].find(obj => obj.secret === secret)) secret = client.uuid("number", 16);
            item.secret = secret;
            
            await Promise.all([
              db.models.bot.updateOne({_id: "main"}, {$push: {[`suggested${item.type}`]: item}}),
              db.tokens(item.id, rewards.suggestEntered)
            ])
            mainArr = client.util.remove(mainArr, +arg[1]);
            m.reply("Добавлено.")
          } else {
            m.reply("Не найденo.")
          }
          message.delete();
          await db.models.bot.updateOne({_id: "main"}, {$set: {tempSuggestions: mainArr}})
          await F.arrowPages(msg, make(), 30000, [msg.author.id]);
        } else if (arg[0] === "remove") {
          if (mainArr[+arg[1]]) {

            mainArr = client.util.remove(mainArr, +arg[1]);
            m.reply("Убрано.")
          } else {
            m.reply("Не найденo.")
          }
          message.delete();
          await db.models.bot.updateOne({_id: "main"}, {$set: {tempSuggestions: mainArr}})
          await F.arrowPages(msg, make(), 30000, [msg.author.id]);
        } else if (arg[0] === "ban") {
          
          if (mainArr[+arg[1]]) {
            const item = mainArr[+arg[1]]
            await Promise.all([
              db.findOrCreate("ban", item.id),
              db.models.ban.updateOne({_id: item.id}, {$set: {
                time: new Date(Date.now() + (ms(arg[2]) ? ms(arg[2]) : 86400000 * 2) ),
                reason: ms(arg[2]) ? arg.slice(3).join(" ") : arg.slice(2).join(" "),
                moderator: msg.author.id
              } })
            ]);
            
            mainArr = client.util.remove(mainArr, +arg[1]);
            m.reply("Успешно забанен.")
          } else {
            m.reply("Не найденo.")
          }
          message.delete();
          await db.models.bot.updateOne({_id: "main"}, {$set: {tempSuggestions: mainArr}})
          await F.arrowPages(msg, make(), 30000, [msg.author.id]);
        }
        
        
      }
    })
    
  }
}

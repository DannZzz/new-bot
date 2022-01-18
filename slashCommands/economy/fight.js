const { SlashCommandBuilder } = require("@discordjs/builders");
const { stripIndents } = require("common-tags");

module.exports = {
  name: "fight",
  category: 4,
  data: new SlashCommandBuilder()
  .setName("бой")
  .setDescription("Начать бой."),
  cooldown: 15,
  run: async (client, int, Data) => {
    const { weapons, embed, util, F, db, emoji, config, heroes, Discord } = Data;

    const data = await db.findOrCreate("profile", int.user.id);
    if (data.cooldowns.fight && data.cooldowns.fight > new Date()) {
      const time = F.getTime(data.cooldowns.fight)
      return embed(int).setError(`Попробуй снова через ${time.minutes} мин. ${time.seconds} сек.`).send();
    }

    client.ops.GLOBAL_MENU_COOLDOWN.add(int.user.id);

    var hero, fighting;
    let i = 0;
    function chooseEnemy (replied) {
      if (replied) replied.removeAttachments()

      hero = F.randomHero();

      fighting = new Discord.MessageAttachment(`./assets/heroes/${hero.file}${hero.level}.jpg`, `hero${i}.jpg`);

      const embedMain = embed(int)
        .setTitle(`Выбирай противника!`)
        .addField(stripIndents`
          **Основной враг:**
          **Имя: ${hero.name}**
          **Эпоха: ${F.age(hero.level)}**
          **Предметы:**
          ${hero["items"].map(i => weapons.method.findWeapon(i).emoji).join(" ")}
          `, stripIndents`
          Сила: \`${F.forceGenerator(hero.intelligence, hero.stamina, hero.defend, hero.attack)}\`
          ${emoji.intelligence} Ителлект: \`${hero.intelligence}\`
          ${emoji.stamina} Выносливость: \`${hero.stamina}\`
          ${emoji.defend} Защита: \`${hero.defend}\`
          ${emoji.attack} Атака: \`${hero.attack}\`
          `)
        .setThumbnail(`attachment://hero${i}.jpg`);

      i++;
      return {embeds: [embedMain], files: [fighting], fetchReply: true };

    }

    let changed = 0;
    let clicked = false;
    let emb = chooseEnemy()

    const b1 = new Discord.MessageButton()
    .setCustomId("ThisEnemy")
    .setLabel("Этот враг")
    .setStyle("SECONDARY");

    const b2 = new Discord.MessageButton()
    .setCustomId("NextEnemy")
    .setLabel("Другой враг")
    .setStyle("SECONDARY")
    .setEmoji("➡");

    const row = new Discord.MessageActionRow().addComponents([b1, b2]);
    emb.components = [row];
    const msgInt = await int.reply(emb);

    const collector = msgInt.createMessageComponentCollector({
      filter: i => i.isButton() && i.user.id === int.user.id,
      time: 15000
    });

    collector.on("end", () => {
      if (clicked) return msgInt.edit({components: []});
      client.ops.GLOBAL_MENU_COOLDOWN.delete(int.user.id);
      const disabledArr = new Discord.MessageActionRow().addComponents([b1.setDisabled(true), b2.setDisabled(true)]);

      int.editReply({component: [disabledArr]})
      return;
    });

    collector.on("collect", async i => {
      i.deferUpdate();
      collector.resetTimer();
      switch (i.customId) {
        case "ThisEnemy": {
          clicked = true;
          collector.stop();
          msgInt.removeAttachments();
          const myData = await db.findOrCreate("game", int.user.id);
          const main = myData.heroes[myData.main || 0];
          const finalHero = F.getFinalHeroData(main, main.items);
          msgInt.delete();
          await F.startFight({int, Data, client}, {user: true, id: int.user.id, heroObj: finalHero}, {user: false, heroObj: hero});
          break;
        }
        case "NextEnemy": {

          if (changed <= 3) {
            emb = chooseEnemy(msgInt);
            emb.components = [row];
            changed++;
            int.editReply(emb)
            break;
          } else {
            embed(i).setError(`Ты можешь менять только 3 раза!`).send("followUp", true);
            break;
          }
        }

      }

    })


  }
}

const { Collection, MessageEmbed } = require("discord.js");
const main = new Collection();
const validSpace = ["red", 'black', "1-12", "13-24", "25-36"];
// mainMap.value = channel => {
//   values: {
//     userId,
//     bet,
//     choose
//   }
// }

const colors = {
	red: "#FF5440",
  green: "#7A912A",
  none: "#2f3136"
};

class Roulette {
  constructor(Data) {
    this.Data = Data;
    this.main = main;
    this.valid = validSpace;
  }

  addUser (userId, choose, channel, bet) {
    const checkChannel = main.get(channel.id);
    if (checkChannel) {
      checkChannel.set(userId, {id: userId, channel, bet, choose})
      main.set(channel.id, checkChannel)
    } else {
      this.start(channel.id);
      const user = new Collection();
      user.set(userId, {id: userId, channel, bet, choose})
      main.set(channel.id, user)
    }
  }

  async start(channelId) {
    setTimeout(async () => {
      const winObj = this.randomChoice();
      const thisChannel = main.get(channelId);

      if (!thisChannel) {
        return;
      };

      const winners = [];
      thisChannel.forEach(obj => {
        if (winObj.number == obj.choose) {
          obj.toAdd = 36;
          winners.push(obj);
        } else if (winObj.win === obj.choose) {
          obj.toAdd = 3;
          winners.push(obj);
        } else if (winObj.type === obj.choose || winObj.color === obj.choose) {
          obj.toAdd = 2;
          winners.push(obj);
        }
      });

      const texted = winners.map(obj => `<@${obj.id}> - ${this.Data.emoji.token}\`${this.Data.util.formatNumber(obj.toAdd * obj.bet)}\``);

      await Promise.all(
        winners.map( item => this.Data.db.tokens(item.id, item.bet * item.toAdd))
      )

      const embed = new MessageEmbed()
      .setAuthor({name: `Выпало: ${winObj.number} ${winObj.color ? this.Data.F.firstUpperCase(winObj.color) : ""}`})
      .setTitle("Победители:")
      .setDescription(texted.length > 0 ? texted.join("\n") : "Никто не победил...")
      .setColor(texted.length > 0 ? colors.green : colors.red)

      thisChannel.first().channel.send({embeds: [embed]});
      main.delete(channelId);
    }, 30 * 1000)
  }

  randomChoice() {
    const number = this.Data.util.random(0, 36);
    let final = {number: number + ""}
    if (number >= 1 && number <= 12) {
      final.win = "1-12";
    } else if (number >= 13 && number <= 24) {
      final.win = "13-24";
    } else if (number >= 25 && number <= 36) {
      final.win = "25-36";
    }

    if (number % 2 === 0 && number !== 0) {
      final.type = "чётное";
      final.color = "красный";
    } else if (number % 2 !== 0 && number !== 0) {
      final.type = "нечётное",
      final.color = "черный"
    }

    return final;
  }

}

module.exports = Roulette;

const DEVELOPER = ["382906068319076372"];
const ADMIN = [...DEVELOPER];

const obj = {
  TOKEN: process.env.TOKEN,
  MONGO: process.env.MONGO,
  APPLICATION_ID: "726784476377514045",
  DEVELOPER,
  ADMIN,
  GLOBAL_COOLDOWN: 1500,
  MAIN_COLOR: "#ffffff",
  CLIENT_STATUS: "Slash | Dann#1000",
  SLASH_GUILD: false, // or array of guild ids
  DEFAULT_ITEM_COUNT: 3,
  MAX_BAG_COUNT: 30,
  FIGHT_APPLE_WIN: [10, 30],
  FIGHT_COOLDOWN: 15 * 60 * 1000,
  CHANGE: {
    toMoney: 100,
    toApple: 25
  },
  CREDITS: {
    basic: {
      money: 100,
      rub: 50
    }
  },
  DONATE_LINK: "https://www.donationalerts.com/r/adanadiscord",
};

module.exports = obj;

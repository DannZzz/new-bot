const DEVELOPER = ["382906068319076372"];
const ADMIN = [...DEVELOPER];

const obj = {
  TOKEN: process.env.TOKEN || "NzI3OTI0OTI5MTY4NjcwNzIw.Xvy66w.Q_Qkp_aYGyJ2QfLaKY2EHejqljk",
  MONGO: process.env.MONGO || "mongodb+srv://DannDev:vard04mak@cluster0.fcdo0.mongodb.net/NewBot",
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
};

module.exports = obj;

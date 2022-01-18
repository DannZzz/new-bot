const DEVELOPER = ["382906068319076372"];
const ADMIN = [...DEVELOPER];

const obj = {
  TOKEN: process.env.TOKEN,
  MONGO: process.env.MONGO,
  APPLICATION_ID: "726784476377514045",
  DEVELOPER,
  ADMIN,
  GLOBAL_COOLDOWN: 1500,
  MAIN_COLOR: "#E1D7CF",
  CLIENT_STATUS: "/хелп | Dann#1000",
  SLASH_GUILD: false, // or array of guild ids
  DEFAULT_ITEM_COUNT: 3,
  MAX_BAG_COUNT: 30,
  FIGHT_APPLE_WIN: [30, 150],
  FIGHT_COOLDOWN: 10 * 60 * 1000,
  CHANGE: {
    toMoney: 100,
    toApple: 25
  },
  CREDITS: {
    basic: {
      money: 500,
      rub: 50
    }
  },
  DONATE_LINK: "https://www.donationalerts.com/r/adanadiscord",
  AME_API: '3229a6d1c6886228c8946c39e5a89f79e62ca7251c10a31fede7679ab8da35794c44a5beacd17993117918809096fec0aac9a1c973d3a42d7eb638eda77b6692',
};

module.exports = obj;

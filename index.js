const {Client} = require("client-discord")// require("./utils/Client");
const config = require("./config");
const fs = require("fs");
const util = require("dann-util");
const db = require("./utils/db");
require("./utils/database/connect")();

const client = new Client({allowedMentions: { parse: [] }, colors: {
	red: "#FF5440",
  green: "#7A912A",
  none: "#2f3136",
  main: config.MAIN_COLOR
}, token: process.env.TOKEN || config.TOKEN});

const { Collection } = client.discord;
client.commands = new Collection();
client.aliases = new Collection();
client.slashCommands = new Collection();
client.ops = {
  queue1: new Map(),
  queue2: new Map(),
  cooldowns: new Map(),
  GLOBAL_COOLDOWN_SET: new Set(),
  GLOBAL_MENU_COOLDOWN: new Set(),
  shop: new Set(),
};

client.tokenValue = 100;
client.events = fs.readdirSync("./events/");
client.categories = fs.readdirSync("./commands/");
client.slashCategories = fs.readdirSync("./slashCommands/");

["command", "event", "registerSlash"].forEach( handler => require(`./handlers/${handler}`)(client) );

client.on('error',function(err){});

process.on('unhandledRejection', error => {
  console.log('Test error:', error);
});

function changeTokenCost () {
  let timeToChange = util.random(2, 5) * 60000;

  const costToChange = util.random(10, 250);
  client.tokenValue = costToChange;
  timeToChange = util.random(2, 5) * 60000;

  setTimeout(changeTokenCost, timeToChange);
}
changeTokenCost();

setInterval(async () => {
  async function hasOneDayPassed() {
  // get today's date. eg: "7/37/2007"
  var date = new Date().toLocaleDateString("ru-RU", {timeZone: "Europe/Moscow"});
  var timeTwo = new Date().toLocaleTimeString("ru-RU", {timeZone: "Europe/Moscow"}).substring(0, 2);
  // if there's a date in localstorage and it's equal to the above:
  // inferring a day has yet to pass since both dates are equal.

  const botTime = await db.findOrCreate("bot", "main");
  if ( botTime.time == date ) return false;
  if ( timeTwo !== "00" ) return false;

  // this portion of logic occurs when a day has passed
  await db.models.bot.updateMany({}, {$set: {time: date}})
  return true;
}


// some function which should run once a day
async function runOncePerDay(){
  const asd = await hasOneDayPassed();
  if( !asd ) return;
  await db.models.server.updateMany({}, {$set: {allTemporaryMutes: []}});
  // your code below
}
runOncePerDay()
}, 1000 * 60 * 5)

client.login();

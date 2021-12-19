const { Schema, model } = require("mongoose");
const heroes = require("../../../JSON/heroes");

const newSchema = new Schema({
  _id: String,
  main: { type: Number, default: 0 },
  heroes: { type: Array, default: [
      {
        name: heroes[0].name,
        level: 1,
        ready: true,
        intelligence: heroes[0].intelligence,
        defend: heroes[0].defend,
        attack: heroes[0].attack,
        stamina: heroes[0].stamina,
        items: [],
      }
    ]
  },
  bag: { type: Array, default: [3, 7, 10, 6, 13] },

});

const newModel = model("game", newSchema);

module.exports = newModel;

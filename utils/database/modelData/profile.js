const { Schema, model } = require("mongoose");

const newSchema = new Schema({
  _id: String,
  status: { type: Number, default: 0 },
  coins: { type: Number, default: 0 },
  apples: { type: Number, default: 0 },
  cooldowns: { type: Object, default: {} }
});

const newModel = model("profile", newSchema);

module.exports = newModel;

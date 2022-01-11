const { Schema, model } = require("mongoose");

const newSchema = new Schema({
  _id: String,
  time: String,
});

const newModel = model("bot", newSchema);

module.exports = newModel;

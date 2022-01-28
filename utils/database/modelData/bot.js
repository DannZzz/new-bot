const { Schema, model } = require("mongoose");

const newSchema = new Schema({
  _id: String,
  time: String,
  suggestedroles: { type: Array, default: [] },
  suggestedchannels: { type: Array, default: [] },
  tempSuggestions: { type: Array, default: [] },
  moderators: { type: Array, default: [] },
});

const newModel = model("bot", newSchema);

module.exports = newModel;

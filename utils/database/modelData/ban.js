const { Schema, model } = require("mongoose");

const newSchema = new Schema({
  _id: String,
  reason: { type: String, default: undefined },
  time: { type: Date, default: undefined },
  moderator: { type: String, default: undefined },
});

const newModel = model("ban", newSchema);

module.exports = newModel;

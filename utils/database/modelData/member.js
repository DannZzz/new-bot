const { Schema, model } = require("mongoose");

const newSchema = new Schema({
  userId: { type: String, require: true },
  guildId: { type: String, require: true },
});

const newModel = model("profile", newSchema);

module.exports = newModel;

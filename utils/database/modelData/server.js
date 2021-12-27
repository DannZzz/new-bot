const { Schema, model } = require("mongoose");

const newSchema = new Schema({
  _id: String,
  magic: { type: Boolean, default: false },
});

module.exports = model("server", newSchema);

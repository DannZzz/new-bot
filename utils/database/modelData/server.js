const { Schema, model } = require("mongoose");

const newSchema = new Schema({
  _id: String,
});

module.exports = model("server", newSchema);

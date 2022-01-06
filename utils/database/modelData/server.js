const { Schema, model } = require("mongoose");

const newSchema = new Schema({
  _id: String,
  premium: { type: Date, default: undefined },
  magic: { type: Boolean, default: false },
  magicDisabledChannels: { type: Array, default: [] },
  moderrole: { type: Array, default: [] },
  banAllowedRoles: { type: Array, default: [] },
  kickAllowedRoles: { type: Array, default: [] },
  punishments: { type: Array, default: [] },
  punishmentsCount: { type: Number, default: 1 },
  disabledCommands: { type: Object, default: {} },
});

module.exports = model("server", newSchema);

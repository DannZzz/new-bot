const { Schema, model } = require("mongoose");

const newSchema = new Schema({
  _id: String,
  premium: { type: Date, default: undefined },
  moderrole: { type: Array, default: [] },
  banAllowedRoles: { type: Array, default: [] },
  kickAllowedRoles: { type: Array, default: [] },
  punishments: { type: Array, default: [] },
  punishmentsCount: { type: Number, default: 1 },
  disabledCommands: { type: Object, default: {} },
  allTemporaryMutes: { type: Array, default: [] },
  temporaryRolesForMute: { type: Array, default: [] },
  colors: { type: Array, default: [] },
  buttonRoles: { type: Array, default: [] }
});

module.exports = model("server", newSchema);

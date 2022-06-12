const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  createdBy: { type: mongoose.Types.ObjectId, ref: "Users", required: true },
  service: { type: mongoose.Types.ObjectId, ref: "Services", required: true },
  date: { type: Date, required: true },
  status: { type: Boolean, default: false },
});

module.exports = mongoose.model("Schedules", Schema);

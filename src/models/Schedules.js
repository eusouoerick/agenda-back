const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  createdBy: { type: mongoose.Types.ObjectId, ref: "Users", required: true },
  service: { type: mongoose.Types.ObjectId, ref: "Services", required: true },
  date: { type: Date, required: true },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "completed", "cancelled"],
  },
});

module.exports = mongoose.model("Schedules", Schema);

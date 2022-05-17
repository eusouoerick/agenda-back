const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  createdBy: {type: mongoose.Types.ObjectId, ref: "Users", required: true},
  service: {type: mongoose.Types.ObjectId, ref: "Services", required: true},
  month: {type: Number, required: true},
  day: {type: Number, required: true},
  hour: {type: Number, required: true},
})


module.exports = mongoose.model("Schedules", Schema);
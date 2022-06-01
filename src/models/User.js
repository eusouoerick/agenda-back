require("dotenv").config();
const mongoose = require("mongoose");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const Schema = new mongoose.Schema({
  adm: { type: Boolean, default: false },
  name: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, unique: true },
  phone: { type: String, unique: true },
  schedules: [{ type: mongoose.Types.ObjectId, ref: "Schedules" }],
});

Schema.pre("save", async function () {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
});

Schema.methods.createToken = function () {
  return JWT.sign({ id: this._id, adm: this.adm }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
};

Schema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("Users", Schema);

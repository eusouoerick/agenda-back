require("dotenv").config();
const User = require("../models/User");
const JWT = require("jsonwebtoken");

const tokenDecoderMiddleware = async (req, res, next) => {
  const auth = req.headers.authorization || "";
  try {
    const token = auth.split(" ")[1];
    const { id } = JWT.verify(token, process.env.JWT_SECRET);
    const { adm } = await User.findById(id);
    req.user = { id, adm };
  } catch (error) {
    req.user = null;
  }
  return next();
};

module.exports = tokenDecoderMiddleware;

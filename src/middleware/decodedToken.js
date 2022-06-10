require("dotenv").config();
const JWT = require("jsonwebtoken");

const tokenDecoderMiddleware = (req, res, next) => {
  const auth = req.headers.authorization || "";
  try {
    const token = auth.split(" ")[1];
    const decoded = JWT.verify(token, "secret");
    req.user = decoded;
  } catch (error) {
    console.log(error);
    req.user = null;
  }
  return next();
};

module.exports = tokenDecoderMiddleware;

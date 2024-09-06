const jwt = require("jsonwebtoken");
const generateToken = (user) => {
  return jwt.sign({ email: user.email, id: user._id }, "ganapa@3689");
};
module.exports.generateToken = generateToken;

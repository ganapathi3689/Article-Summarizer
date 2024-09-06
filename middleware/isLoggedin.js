const jwt = require("jsonwebtoken");
const userModel = require("../models/user");

module.exports = async function (req, res, next) {
  if (!req.cookies.token) {
    req.flash("error_msg", "You need to login");
    return res.redirect("/");
  }
  try {
    let decoded = jwt.verify(req.cookies.token, "ganapa@3689");
    let user = await userModel
      .findOne({ email: decoded.email })
      .select("-password");
    res.user = user;
    next();
  } catch (error) {
    req.flash("error_msg", "Something went wrong");
    res.redirect("/");
  }
};

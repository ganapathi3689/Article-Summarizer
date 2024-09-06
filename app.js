const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const userModel = require("./models/user");
const connectDb = require("./config/connectDb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("./utils/generatetoken");
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const isloggedin = require("./middleware/isLoggedin");
const app = express();
const port = 3000;
let login = true;

connectDb();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: "ganapa@3689",
    resave: false,
    saveUninitialized: true,
  })
);

// Set up connect-flash middleware
app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

const summarizeOptions = {
  method: "GET",
  url: "https://article-extractor-and-summarizer.p.rapidapi.com/summarize",
  params: {
    url: "",
    lang: "en",
    engine: "2",
  },
  headers: {
    "x-rapidapi-key": "af0c712163msh2217c73959f5544p1a0c54jsn693b17eb5bfd",
    "x-rapidapi-host": "article-extractor-and-summarizer.p.rapidapi.com",
  },
};

app.get("/", (req, res) => {
  res.render("index", { summary: null, login });
});

app.post("/summarize", isloggedin, async (req, res) => {
  const articleUrl = req.body.url;
  summarizeOptions.params.url = articleUrl;

  try {
    const response = await axios.request(summarizeOptions);
    const summary = response.data.summary;
    res.render("index", { summary, login });
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Error summarizing the article. Please try again.");
    res.redirect("/");
  }
});

app.post("/create", async (req, res) => {
  try {
    let { username, email, password } = req.body;
    let user = await userModel.findOne({ email: email });
    if (user) {
      req.flash("error_msg", "You already have an account");
      return res.redirect("/");
    }
    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(password, salt, async function (err, hash) {
        if (err) {
          req.flash("error_msg", err.message);
          return res.redirect("/");
        } else {
          await userModel.create({
            username,
            email,
            password: hash,
          });
          req.flash("success_msg", "User created successfully");
          res.redirect("/");
        }
      });
    });
  } catch (error) {
    console.log(error.message);
    req.flash("error_msg", "Something went wrong. Please try again.");
    res.redirect("/");
  }
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  let user = await userModel.findOne({ email: email });
  if (!user) {
    req.flash("error_msg", "Email doesn't exist");
    return res.redirect("/");
  }
  bcrypt.compare(password, user.password, function (err, result) {
    if (result) {
      let token = generateToken(user);
      res.cookie("token", token);
      req.flash("success_msg", "Logged in successfully");
      login = true;

      res.redirect("/");
    } else {
      req.flash("error_msg", "Email or password incorrect");
      res.redirect("/");
    }
  });
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  login = false;
  req.flash("success_msg", "Logged out successfully");
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

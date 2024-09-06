const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/aisummerizer");
    console.log("db connected");
  } catch (error) {
    console.log(error);
  }
};
module.exports = connectDb;

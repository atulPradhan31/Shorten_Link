const mongoose = require("mongoose");
require('dotenv').config()
const connectDB = () => {
  try {
    mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Database Connected Successfully"));
  } catch (err) {
    console.log(err.message);
  }

};

module.exports = connectDB;

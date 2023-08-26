const mongoose = require("mongoose");
require('dotenv').config()
const connectDB = () => {
  try {
    mongoose.connect(process.env.MONGO_URI)
    .then( () => console.log("Database connected successfully"));
  } catch (e) {
    console.log("Database connection error ",e.message);
  }
};

module.exports = connectDB;

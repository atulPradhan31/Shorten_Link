const mongoose = require("mongoose");
require('dotenv').config()
const connectDB = () => {
  try {
    mongoose.connect(process.env.MONGO_URI)
    .then( () => console.log("Database connected successfully"))
    .catch( err => console.log("Database Connection Failed ", err.message));
  } catch (e) {
    console.log("Database connection error ",e.message);
  }
};

module.exports = connectDB;

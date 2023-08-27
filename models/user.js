const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide user name"],
    minLength: 6,
    maxLength: 50,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide user email id"],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    ],
    maxLength: 50,
    unique: [
      true,
      "This email address is already taken. Please provide unique email address",
    ],
  },
  password: {
    type: String,
    required: [true, "Please provide user password"],
    minLength: 6,
  },
});

module.exports = mongoose.model("UsersData", UserSchema);

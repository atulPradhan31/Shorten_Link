const mongoose = require("mongoose");
const CustomError = require("../errors/custom-error");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserSchema = new mongoose.Schema({
  link_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Links",
  },
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
      "This email address is already in use. Please provide unique email address",
    ],
  },
  password: {
    type: String,
    required: [true, "Please provide user password"],
    minLength: 6,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  return userObject;
};

UserSchema.pre("save", async function () {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
});

UserSchema.statics.findByCredentails = async (email, password) => {
  const user = await UsersData.findOne({ email });
  if (!user) throw new CustomError("Email Not Found", 404);

  const checkPassworMatch = await bcrypt.compare(password, user.password);
  if (!checkPassworMatch) {
    throw new Error("Invalid Password");
  }
  return user;
};

UserSchema.methods.generateToken = async function () {
  const user = this;
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });

  user.tokens = user.tokens.concat({
    token,
  });
  await user.save();
  return token;
};

const UsersData = mongoose.model("Users", UserSchema);
module.exports = UsersData;

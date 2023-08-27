require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const CustomError = require("../errors/custom-error");
const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcryptjs");

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    throw new CustomError(
      "Data entry incomplete. Please provide complete data",
      StatusCodes.BAD_REQUEST
    );

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({ name, email, password: hashedPassword });
  if (!user)
    throw new CustomError(
      "Could not creat user entry. Please try again later",
      StatusCodes.INTERNAL_SERVER_ERROR
    );

  const token = jwt.sign(
    { userId: user._id, userEmail: user.email, userName: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "10d" }
  );
  res.status(200).json({ user, token });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new CustomError(
      "Please provide email and password",
      StatusCodes.BAD_REQUEST
    );
  const user = await User.findOne({ email: email });
  if (!user)
    throw new CustomError(
      "No user available with this email address. ",
      StatusCodes.UNAUTHORIZED
    );

  const passwordMatch = await bcrypt.compare(password, user.password);
  console.log(passwordMatch);
  if (!passwordMatch)
    throw new CustomError(
      "Invalid credentials. Please enter a valid email and password",
      StatusCodes.UNAUTHORIZED
    );

  const token = jwt.sign(
    { userId: user._id, userEmail: user.email, userName: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "10d" }
  );
  res.status(StatusCodes.OK).json({ user, token });
};

const dashboard = async (req, res) => {
  const luckyNumber = Math.round(Math.random() * 99);
  console.log(req.user);
  res.status(200).json({
    msg: `Hello ${req.user.userName}, login successfull with email address ${req.user.userEmail}. `,
    secret: `Here is your secret number ${luckyNumber}`,
  });
};

module.exports = { login, dashboard, register };

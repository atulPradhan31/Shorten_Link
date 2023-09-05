require("dotenv").config();
const User = require("../models/user");
const CustomError = require("../errors/custom-error");
const { StatusCodes } = require("http-status-codes");
const freelyEmail = require("freely-email");
const WelcomeEmailTemplate = require("../template/Welcome");
const ForgetPassword = require("../template/ForgetPassword");
const { APP_NAME, APP_EMAIL, APP_DOMAIN } = require("../config");
const randomKey = require("random-key");
const bcrypt = require("bcryptjs");

const sendWelcomeEmail = async (name, email) => {
  try {
    const emailBody = {
      recipient: email, //  use Array of String for multiple email
      app: APP_NAME,
      replyTo: APP_EMAIL, // User can directly reply to this email
      subject: "Welcome to linkify club",
      sender: APP_NAME, //eg: Your-App-Name // donot include @donot-reply.online // no space or special char
      message: "", //your Email containt
      HTMLfile: WelcomeEmailTemplate("https://google.com", name),
    };
    return await freelyEmail.sendEmail(emailBody);
  } catch (error) {
    return error;
  }
};

const sendForgetPassword = async (email, link) => {
  try {
    const emailBody = {
      recipient: email, //  use Array of String for multiple email
      app: APP_NAME,
      replyTo: APP_EMAIL, // User can directly reply to this email
      subject: "Reset your password",
      sender: APP_NAME, //eg: Your-App-Name // donot include @donot-reply.online // no space or special char
      message: "", //your Email containt
      HTMLfile: ForgetPassword(link),
    };
    return await freelyEmail.sendEmail(emailBody);
  } catch (error) {
    return error;
  }
};

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    throw new CustomError(
      "Data entry incomplete. Please provide complete data",
      StatusCodes.BAD_REQUEST
    );

  const user = await User.create({ name, email, password });
  if (!user)
    throw new CustomError(
      "Could not creat user entry. Please try again later",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  const token = await user.generateToken();
  console.log(token);
  const mailSender = await sendWelcomeEmail(user.name, user.email);
  console.log(mailSender);
  res.status(200).json({ user, token });
};

// ----------------------------- Login   -------------------------------- \\

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new CustomError(
      "Please provide email and password",
      StatusCodes.BAD_REQUEST
    );

  const user = await User.findByCredentails(email, password);

  const token = await user.generateToken();

  res.status(StatusCodes.OK).json({ user, token });
};

// ------------------------ Logout --------------------------------

const logout = async (req, res) => {
  req.user.tokens = req.user.tokens.filter(
    (token) => token.token !== req.token
  );
  await req.user.save();
  res.status(200).send({ msg: "Successfully logged out" });
};

// ------------------------ Logout from all device  --------------------------------

const logoutFromAll = async (req, res) => {
  req.user.tokens = [];
  await req.user.save();
  res.status(200).send({ msg: "Successfully logged out from all devices" });
};

// ------------------------ profile --------------------------------
const profile = async (req, res) => {
  res.status(200).json({
    msg: req.user,
  });
};

// ------------------------ Dashboard --------------------------------
const dashboard = async (req, res) => {
  const luckyNumber = Math.round(Math.random() * 99);
  res.status(200).json({
    msg: `Hello ${req.user.name}, login successfull with email address ${req.user.email}. `,
    secret: `Here is your secret number ${luckyNumber}`,
  });
};

// ------------------------ Dashboard --------------------------------
const forgetPasswordRequest = async (req, res) => {
  const { email } = req.body;
  if (!email) throw new CustomError("Enter Valid Email Address", 404);

  const tempPassword = randomKey.generate(10);
  const newHashedPassword = await bcrypt.hash(tempPassword, 8);

  const user = await User.findOneAndUpdate(
    { email },
    { password: newHashedPassword },
    { new: true, runValidators: true }
  );
  if (!user) throw new CustomError("User not found", 404);

  const msg = await sendForgetPassword(email, tempPassword);
  console.log(msg);
  res.status(200).send({ msg });
};

module.exports = {
  login,
  dashboard,
  register,
  logout,
  logoutFromAll,
  profile,
  forgetPasswordRequest,
};

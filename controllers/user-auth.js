require("dotenv").config();
const User = require("../models/user");
const CustomError = require("../errors/custom-error");
const { StatusCodes } = require("http-status-codes");
const freelyEmail = require("freely-email");
const WelcomeEmailTemplate = require("../template/WelcomeEmail");
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

  const mailSender = await sendWelcomeEmail(user.name, user.email);

  res.status(200).json({ message  : { user, token }});
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

  res.status(StatusCodes.OK).json({message  :{ user, token }});
};

// ------------------------ Logout --------------------------------

const logout = async (req, res) => {
  req.user.tokens = req.user.tokens.filter(
    (token) => token.token !== req.token
  );
  await req.user.save();
  res.status(200).send({ message: "Successfully logged out" });
};

// ------------------------ Logout from all device  --------------------------------

const logoutFromAll = async (req, res) => {
  req.user.tokens = [];
  await req.user.save();
  res.status(200).send({ message: "Successfully logged out from all devices" });
};

// ------------------------ profile --------------------------------
const profile = async (req, res) => {
  res.status(200).json({
    message: req.user,
  });
};

// ------------------------ Dashboard --------------------------------
const dashboard = async (req, res) => {
  const luckyNumber = Math.round(Math.random() * 99);
  res.status(200).json({
    message: `Hello ${req.user.name}, login successfull with email address ${req.user.email}. `,
    secret: `Here is your secret number ${luckyNumber}`,
  });
};

// ------------------------ Forget password --------------------------------
const forgetPasswordRequest = async (req, res) => {
  const { email } = req.body;
  if (!email) throw new CustomError("Enter Valid Email Address", 400);

  const tempPassword = randomKey.generate(10);
  const newHashedPassword = await bcrypt.hash(tempPassword, 8);

  const user = await User.findOneAndUpdate(
    { email },
    { password: newHashedPassword },
    { new: true, runValidators: true }
  );
  if (!user) throw new CustomError("User not found", 404);

  const message = await sendForgetPassword(email, tempPassword);

  res.status(200).send({ message });
};

// ------------------------ Update password --------------------------------
const updatePasswordRequest = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) throw new CustomError("Enter valid data", 400);

  const checkPassworMatch = await bcrypt.compare(oldPassword, req.user.password)
  if (!checkPassworMatch) throw new CustomError("Invalid password", 400);

  req.user.password = newPassword 
  await req.user.save();
  res.status(200).send({ message: "Password changed successfully" });
};

module.exports = {
  login,
  dashboard,
  register,
  logout,
  logoutFromAll,
  profile,
  forgetPasswordRequest,
  updatePasswordRequest
};

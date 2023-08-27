require("dotenv").config();
const User = require("../models/user");
const CustomError = require("../errors/custom-error");
const { StatusCodes } = require("http-status-codes");

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
  const token = user.generateToken();

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
  req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
  await req.user.save();
  res.status(200).send({msg : "Successfully logged out"})

};


// ------------------------ Logout from all device  --------------------------------

 const logoutFromAll = async (req, res) => {
  req.user.tokens = []
  await req.user.save();
  res.status(200).send({msg : "Successfully logged out from all devices"})

};


// ------------------------ Dashboard --------------------------------
const dashboard = async (req, res) => {
  const luckyNumber = Math.round(Math.random() * 99);
  res.status(200).json({
    msg: `Hello ${req.user.name}, login successfull with email address ${req.user.email}. `,
    secret: `Here is your secret number ${luckyNumber}`,
  });
};

module.exports = { login, dashboard, register, logout, logoutFromAll};

const mongoose = require("mongoose");
const jwt = require('jsonwebtoken')
require('dotenv').config();
const ClientTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ClientTokenSchema.methods.generateToken = async function () {
  const client = this;
  const token = jwt.sign({ clientId: client._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  client.token = token;
  return token;
};

const ClientToken = mongoose.model('ClientToken',ClientTokenSchema);
module.exports = ClientToken;

const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required : true,
    },
    clientId :{
      type: mongoose.Schema.Types.ObjectId,
    }, 
    clientCode : {
      type: String,
      required : true,
    },
  },
  { timestamps: true }
);


const Client = mongoose.model("Client", clientSchema);
module.exports = Client;

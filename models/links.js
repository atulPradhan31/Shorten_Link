const mongoose = require("mongoose");

const LinksSchema = new mongoose.Schema(
  {
    originalLink: {
      type: String,
      required: [true, "Please provide the original link"],
    },

    shortenedLink: {
      type: String,
      required: [true, "Please provide the shortened link"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Links", LinksSchema);

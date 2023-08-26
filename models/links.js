const mongoose = require("mongoose");

const LinksSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: [true, "Please provide the original url"],
      trim: true,
    },

    shortenedUrl: {
      type: String,
      required: [true, "Please provide the shortened url"],
    },

    urlId: {
      type: String,
      required: [true, "Please provide the unique url id"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Links", LinksSchema);

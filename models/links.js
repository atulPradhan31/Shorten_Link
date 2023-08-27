const mongoose = require("mongoose");

const LinksSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: [true, "Please provide the original url"],
      match: [
        /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?\/[a-zA-Z0-9]{2,}|((https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?)|(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})?/,
      ],
      trim: true,
    },

    shortenedUrl: {
      type: String,
      // required: [true, "Please provide the shortened url"],
    },

    urlId: {
      type: String,
      required: [true, "Please provide the unique url id"],
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Links", LinksSchema);

const mongoose = require("mongoose");

const LinksSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    originalUrl: {
      type: String,
      required: [true, "Please provide the original url"],
      match: [
        /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?\/[a-zA-Z0-9]{2,}|((https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?)|(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})?/,
      ],
      trim: true,
    },

    urlId: {
      type: String,
      required: [true, "Please provide the unique url id"],
      unique: true,
    },
    click: {
      type: Number,
      default: 0,
    },
    options: {
      type: Object,
      required : false,
    },
  },
  { timestamps: true }
);

LinksSchema.post("findOne", async function (doc, next) {
  if (doc !== null) {
    doc.click += 1;
    await doc.save();
  }

  next();
});

const Links = mongoose.model("Links", LinksSchema);
module.exports = Links;

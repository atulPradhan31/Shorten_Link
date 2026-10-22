const DOMAINS = require("./config/domain.config");

const APP_NAME = "MyLinkify";
const APP_EMAIL = DOMAINS.EMAIL.DEFAULT_FROM_EMAIL;
const APP_SUPPORT_EMAIL = DOMAINS.EMAIL.SUPPORT_EMAIL;
const APP_DOMAIN = process.env.APP_DOMAIN || (process.env.NODE_ENV === "production" ? DOMAINS.LINK_SHORTEN.API : "http://localhost:3000/");

module.exports = {
  APP_DOMAIN,
  APP_EMAIL,
  APP_SUPPORT_EMAIL,
  APP_NAME,
  DOMAINS,
};
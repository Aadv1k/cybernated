require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 4000,
  MODE: process.env.NODE_ENV || "development",
  ABSTRACT_API_KEY: process.env.ABSTRACT_API_KEY,
  MONGO_ATLAS_PWD: process.env.MONGO_ATLAS_PWD,
  MONGO_ATLAS_USER: process.env.MONGO_ATLAS_USER,
  MAIL_API_KEY: process.env.MAIL_API_KEY,

  MAIL_ADDR: "news.cybernated@outlook.com",
  ABSTRACT_API_URL: "https://emailvalidation.abstractapi.com/v1/",
  EMAIL_REG: /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/,
  CRON_TIMEZONE: "Asia/Kolkata",
  CRON_CMD: "00 07 * * *", // 7 AM IST

  STATUS: {
    emailRegistered: {
      code: "email-registered",
      msg: "the email was registered successfully",
      status: 200,
    },

    emailDeregistered: {
      code: "email-deregistered",
      msg: "the email was deregistered successfully",
      status: 200,
    },

    fakeEmail: {
      code: "fake-email",
      msg: "the email provided is not a real address",
      status: 400,
    },
    emailInvalid: {
      code: "email-invalid",
      msg: "the email provided is invalid",
      status: 400,
    },

    emailExists: {
      code: "email-exists",
      msg: "the email is already registered",
      status: 400,
    },

    invalidUserToDeregister: {
      code: "invalid-user-to-deregister",
      msg: "the user doesn't exist and hence cannot be deregistered",
      status: 400
    },

    internalError: {
      code: "internal-err",
      msg: "something went wrong on our end",
      status: 500,
    }
  },

  MIME: {
    json: "application/json",
    html: "text/html",
    css: "text/css",
    js: "text/javascript",
    png: "image/png"
  }
}

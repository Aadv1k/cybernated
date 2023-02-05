require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 4000,
  MODE: process.env.NODE_ENV || "development",
  ABSTRACT_API_KEY: process.env.ABSTRACT_API_KEY,
  ABSTRACT_API_URL: "https://emailvalidation.abstractapi.com/v1/",
  EMAIL_REG: /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/,

  STATUS: {
    emailNotExist: {
      code: "email-not-exist",
      msg: "the email does not exist",
      status: 400,
    },
    emailInvalid: {
      code: "email-invalid",
      msg: "the email provided is invalid",
      status: 400,
    },
    emailRegistered: {
      code: "email-already-registered",
      msg: "the email is already registered",
      status: 400,
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
    js: "text/javascript"
  }
}

require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 8080,
  MODE: process.env.NODE_ENV || "development",
  ABSTRACT_API_KEY: process.env.ABSTRACT_API_KEY || undefined,
  ABSTRACT_API_URL: "https://emailvalidation.abstractapi.com/v1/",
  EMAIL_REG: /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/,

  STATUS: {
    ok: 200,
    notFound: 404,
    badReq: 400,
    internalErr: 500,
  },

  MIME: {
    json: "application/json",
    html: "text/html",
  }
}

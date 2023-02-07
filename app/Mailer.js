const nodemailer = require("nodemailer");
const {MAIL_ADDR, MAIL_PWD} = require("./Constants");

const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: MAIL_ADDR,
    pass: MAIL_PWD
  },
});

function sendMail(to, subject, html) {
  return new Promise((resolve, reject) => {
    transporter.sendMail({
      from: MAIL_ADDR,
      to: to,
      subject: subject,
      html: html,
    }, (err, info) => {
      if (err) reject(err);
      resolve(info);
    })
  })
}

module.exports = sendMail;

const {SENDGRID_API_KEY, MAIL_ADDR} = require("./Constants");

const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(SENDGRID_API_KEY);

function sendMail(to, subject, html) {
  console.log(MAIL_ADDR);
  const mail = {
    to,
    from: MAIL_ADDR,
    subject,
    html
  }

  return new Promise((resolve, reject) => {
    sgMail
      .send(mail)
      .then(() => resolve("email sent"))
      .catch(err => reject(err));
  })
}

module.exports = sendMail;

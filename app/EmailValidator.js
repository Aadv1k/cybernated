const https = require('https');
const consts = require('./constants');

function isEmailReal(email) {
  return new Promise((resolve, reject) => {
    const verificationUrl =
      consts.ABSTRACT_API_URL +
      `?api_key=${consts.ABSTRACT_API_KEY}&email=${email}`;
    let verificationData = "";

    https.get(verificationUrl, (res) => {
      res.on("data", (data) => (verificationData += data));
      res.on("end", () => {
        verificationData = JSON.parse(verificationData);
        if (
          verificationData.is_disposable_email.value ||
          verificationData.deliverability === "UNDELIVERABLE"
        ) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
      res.on("error", (err) => reject(err));
    });

  })
}

function isEmailValid(email) {
  if (!consts.EMAIL_REG.test(email)) return false;
  if (email.length > 254) return false;
  let [id, tld] = email.split("@");
  if (id.length > 64) return false;
  return true;
}

module.exports = {isEmailReal, isEmailValid}

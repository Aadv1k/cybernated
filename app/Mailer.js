const { MAIL_API_KEY, MAIL_ADDR } = require("./Constants");
const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = MAIL_API_KEY;

function sendMail(to, subject, html) {
  return new Promise(async (resolve, reject) => {
    const contact = {
      email: to,
      attributes: { FNAME: to.split("@").shift(), LNAME: "" },
    };
    const senderName = MAIL_ADDR.split("@").shift();
    const receiverName = to.split("@").shift();

    try {
      SibApiV3Sdk.ContactsApi().createContact(contact);
    } catch (err) {}

    const mail = {
      to: [{ email: to, name: receiverName }],
      subject,
      sender: { email: MAIL_ADDR, name: senderName },
      replyTo: { email: MAIL_ADDR, name: senderName },
      htmlContent: html,
    };

    new SibApiV3Sdk.TransactionalEmailsApi()
      .sendTransacEmail(mail)
      .then(() => resolve(`sent email to ${mail}`))
      .catch((err) => reject(err));
  });
}

module.exports = sendMail;

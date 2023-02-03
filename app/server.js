const http = require("http");
const https = require("https");
const fs = require("fs");
const url = require("url");

const UserModel = require("../models/UserModel");
const { isEmailValid, isEmailReal } = require("./validation");
const consts = require("./constants");
const MODE = consts.ABSTRACT_API_KEY ? consts.MODE : "development";

function sendJsonErr(res, msg, code) {
  res.writeHead(code, { "Content-type": consts.MIME.json });
  res.write(JSON.stringify({ error: msg }));
}

function handleIndex(res) {
  res.writeHead(consts.STATUS.ok, { "Content-type": consts.MIME.html });
  const html = fs.readFileSync("./views/index.html");
  res.write(html);
}

async function handleRegister(req, res) {
  let registerURL = new URL("https://example.com/" + req.url);
  let registerParams = registerURL.searchParams;
  let regEmail = registerParams.get("email");

  const db = new UserModel();

  if (!regEmail) {
    sendJsonErr(res, "email is required", consts.STATUS.badReq);
    return;
  }

  if (db.userExists(regEmail)) {
    res.writeHead(consts.STATUS.ok, { "Content-type": consts.MIME.html });
    res.write(`<h1>${regEmail} </h1>`);
    return;
  }

  const emailValid = isEmailValid(regEmail);
  if (!emailValid) {
    sendJsonErr(res, "the email is not valid", consts.STATUS.internalErr);
    return;
  }

  // we do not waste our API calls in development mode; we can trust devs to test with real emails
  if (MODE == "production") {
    try {
      const emailReal = await isEmailReal(regEmail);
      if (!emailReal) {
        sendJsonErr(
          res,
          "the email is not a real address",
          consts.STATUS.badReq
        );
        return;
      }
    } catch (err) {
      sendJsonErr(
        res,
        "unable to verify the email, this might be a issue on our end",
        consts.STATUS.internalErr
      );
      return;
    }
  }

  db.pushUser(regEmail, []);
  res.writeHead(consts.STATUS.ok, { "Content-type": consts.MIME.html });
  res.write(`<h1> ADDED TO DB: ${regEmail} </h1>`);
  db.close();
}

const server = http.createServer(async (req, res) => {
  const url = req.url;
  if (url == "/") {
    handleIndex(res);
  } else if (url.startsWith("/register")) {
    await handleRegister(req, res);
  }
  res.end();
});

module.exports = server;

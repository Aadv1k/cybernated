const http = require("http");
const https = require("https");
const {existsSync, readFileSync} = require("fs");
const url = require("url");
const ejs = require("ejs")

const UserModel = require("../models/UserModel");
const { isEmailValid, isEmailReal } = require("./validation");
const {STATUS, MIME, MODE} = require("./constants");

function sendJsonErr(res, errObj) {
  res.writeHead(errObj.status, { "Content-type": MIME.json });
  res.write(JSON.stringify({ code: errObj.code, message: errObj.msg }));
}

function handleIndex(res) {
  const db = new UserModel();
  const users = db.getUsers();

  res.writeHead(200, { "Content-type": MIME.html });

  ejs.renderFile("./views/index.ejs", {users: users}, (err, htmlStr) => {
    if (err) console.error(err);
    res.write(htmlStr);
  })
}

function handle404(res) {
  res.writeHead(404, {"Content-type" : MIME.html})
  ejs.renderFile("./views/404.ejs", {}, (_, htmlStr) => {
    res.write(htmlStr);
  })
}

function handleJS(url, res) {
  const filename = url.split('/').pop();
  if (existsSync(`./public/${filename}`)) {
    let file = readFileSync(`./public/${filename}`)
    res.writeHead(200, {"Content-type" : MIME.js})
    res.write(file);
  } else {
    handle404(res);
  }
}

function handleCSS(url, res) {
  const filename = url.split('/').pop();
  if (existsSync(`./public/${filename}`)) {
    let file = readFileSync(`./public/${filename}`)
    res.writeHead(200, {"Content-type" : MIME.css})
    res.write(file);
  } else {
    handle404(res);
  }
}

async function handleRegister(reqURL, res) {
  let registerURL = new URL("https://example.com/" + reqURL);
  let registerParams = registerURL.searchParams;
  let regEmail = registerParams.get("email");

  const db = new UserModel();

  if (!regEmail) {
    sendJsonErr(res, STATUS.emailInvalid);
    return;
  }

  if (db.userExists(regEmail)) {
    sendJsonErr(res, STATUS.emailRegistered)
    return;
  }

  const emailValid = isEmailValid(regEmail);
  if (!emailValid) {
    sendJsonErr(res, STATUS.emailInvalid)
    return;
  }

  // we do not waste our API calls in development mode; we can trust devs to test with real emails
  if (MODE == "production") {
    try {
      const emailReal = await isEmailReal(regEmail);
      if (!emailReal) {
        sendJsonErr(res, STATUS.emailInvalid)
        return;
      }
    } catch (err) {
      sendJsonErr(
        res,
        STATUS.internalError
      );
      return;
    }
  }

  db.pushUser(regEmail, []);

  res.writeHead(200, { "Content-type": MIME.json });
  res.write(JSON.stringify({code: "email-registered", message: "the email was registered successfully"}));
  db.close();
}

const server = http.createServer(async (req, res) => {
  const url = req.url;
  const ext = req.url.split('.').pop();

  if (url === "/") {
    handleIndex(res);
  } else if (url.startsWith("/register")) {
    await handleRegister(url, res);
  } else if (ext === "css") {
    handleCSS(url, res);
  } else if (ext === "js") {
    handleJS(url, res);
  } else {
    handle404(res);
  }
  res.end();
});

module.exports = server;

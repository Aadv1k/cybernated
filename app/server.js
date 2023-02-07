const http = require("http");
const https = require("https");
const {existsSync, readFileSync} = require("fs");
const url = require("url");
const ejs = require("ejs")

const UserModel = require("../models/UserModel");
const NewsModel = require("../models/NewsModel");
const { isEmailValid, isEmailReal } = require("./EmailValidator");
const sendMail = require("./Mailer");
const {STATUS, MIME, MODE} = require("./Constants");

function sendJsonErr(res, errObj) {
  res.writeHead(errObj.status, { "Content-type": MIME.json });
  res.write(JSON.stringify({ code: errObj.code, message: errObj.msg, status: errObj.status}));
}

async function handleIndex(res) {
  res.writeHead(200, { "Content-type": MIME.html });
  const db = new NewsModel();
  await db.init();
  const news = await db.getNews();

  ejs.renderFile("./views/index.ejs", {news: news}, (err, htmlStr) => {
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


function handleFilepath(url, res) {
  const filename = url.split('/').pop();
  const ext = filename.split('.').pop();

  if (!MIME[ext]) {
    handle404(res) 
    return
  };

  if (existsSync(`./public/${filename}`)) {
    let file = readFileSync(`./public/${filename}`)
    res.writeHead(200, {"Content-type" : MIME[ext]})
    res.write(file);
  } else {
    handle404(res);
  }
}

async function sendWelcomeEmail(email) {
  const db = new NewsModel();
  await db.init()
  const news = await db.getNews();
  const prices = await db.getPrices();
  const html = await ejs.renderFile("./views/mailTemplate.ejs", {news: news, prices: prices, greeting: "Welcome to cybernated!", welcome: true});
  sendMail(email, "Welcome to cybernated!", html);
  await db.close();
}

async function handleDeregister(reqURL, res) {
  let registerURL = new URL("https://example.com/" + reqURL);
  let registerParams = registerURL.searchParams;
  let regEmail = registerParams.get("email");
  const db = new UserModel();
  await db.init()

  if (!regEmail) {
    sendJsonErr(res, STATUS.emailInvalid);
    return;
  }

  const emailExists = await db.userExists(regEmail);
  if (!emailExists) {
    sendJsonErr(res, STATUS.invalidUserToDeregister);
    return;
  }

  await db.rmUser(regEmail);
  sendJsonErr(res, STATUS.emailDeregistered);
  await db.close();
}

async function handleRegister(reqURL, res) {
  let registerURL = new URL("https://example.com/" + reqURL);
  let registerParams = registerURL.searchParams;
  let regEmail = registerParams.get("email");

  const db = new UserModel();
  try {
    await db.init();
  } catch (err) {
      sendJsonErr(
        res,
        STATUS.internalError
      );
  }

  if (!regEmail) {
    sendJsonErr(res, STATUS.emailInvalid);
    return;
  }

  const emailExists = await db.userExists(regEmail);
  if (emailExists) {
    sendJsonErr(res, STATUS.emailExists)
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
        sendJsonErr(res, STATUS.fakeEmail)
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

  await db.pushUser(regEmail);
  res.writeHead(200, { "Content-type": MIME.json });
  sendJsonErr(res, STATUS.emailRegistered);
  await sendWelcomeEmail(regEmail);
  await db.close();
}

const server = http.createServer(async (req, res) => {
  const url = req.url;
  const ext = req.url.split('.').pop();

  if (url === "/" || url === "/index") {
    await handleIndex(res);
  } else if (url.startsWith("/register")) {
    await handleRegister(url, res);
  } else if (url.startsWith("/deregister")) {
    await handleDeregister(url, res)
  } else if (ext) {
    handleFilepath(url, res);
  } else {
    handle404(res);
  }
  res.end();
});

module.exports = server;

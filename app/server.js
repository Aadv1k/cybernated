const http = require("http");
const https = require("https");
const { existsSync, readFileSync } = require("fs");
const url = require("url");
const ejs = require("ejs");

const UserModel = require("../models/UserModel");
const NewsModel = require("../models/NewsModel");
const { isEmailValid, isEmailReal } = require("./EmailValidator");
const sendMail = require("./Mailer");
const { STATUS, MIME, MODE } = require("./Constants");

const NEWS_DB = new NewsModel();
const USER_DB = new UserModel();

function sendJsonErr(res, errObj) {
  res.writeHead(errObj.status, { "Content-type": MIME.json });
  res.write(
    JSON.stringify({
      code: errObj.code,
      message: errObj.msg,
      status: errObj.status,
    })
  );
}

async function handlePost(url, res) {
  await NEWS_DB.init();
  const [pSource, pLink] = url.split("/").slice(-2);
  if (!["thedefiant", "cointelegraph", "theblock"].includes(pSource)) {
    res.writeHead(302, { Location: "/" });
    return;
  }

  const news = await NEWS_DB.getNews();
  const target = news.find((e) => e.url.split("/").pop() === pLink);
  if (!target) {
    if (existsSync(`./public/${pLink}`)) {
      handleFilepath(url, res);
      return;
    }

    res.writeHead(302, { Location: "/" });
    return;
  }

  res.writeHead(200, { "Content-type": MIME.html });
  ejs.renderFile("./views/post.ejs", { post: target }, (err, htmlStr) => {
    if (err) console.error(err);
    res.write(htmlStr);
  });
}

async function handleIndex(res) {
  res.writeHead(200, {
    "Content-type": MIME.html,
  });
  await NEWS_DB.init();
  const news = await NEWS_DB.getNews();
  const prices = await NEWS_DB.getPrices();

  ejs.renderFile(
    "./views/index.ejs",
    { news: news, prices: prices },
    (err, htmlStr) => {
      if (err) console.error(err);
      res.write(htmlStr);
    }
  );
}

function handle404(res) {
  res.writeHead(404, { "Content-type": MIME.html });
  ejs.renderFile("./views/404.ejs", {}, (_, htmlStr) => {
    res.write(htmlStr);
  });
}

function handleFilepath(url, res) {
  const filename = url.split("/").pop();
  const ext = filename.split(".").pop();

  if (!MIME[ext]) {
    handle404(res);
    return;
  }
  if (existsSync(`./public/${filename}`)) {
    let file = readFileSync(`./public/${filename}`);
    res.writeHead(200, { "Content-type": MIME[ext] });
    res.write(file);
  } else {
    handle404(res);
  }
}

async function sendWelcomeEmail(email, url) {
  await NEWS_DB.init();
  const news = await NEWS_DB.getNews();
  const prices = await NEWS_DB.getPrices();
  const baseURL = url.slice(0, url.lastIndexOf("/"));

  const html = await ejs.renderFile("./views/mailTemplate.ejs", {
    news: news,
    prices: prices,
    greeting: "Welcome to cybernated!",
    welcome: true,
    deregisterLink: `${baseURL}/deregister?email=${email}`,
    siteLink: baseURL,
  });

  await sendMail(email, "Welcome to cybernated!", html);
}

async function handleDeregister(reqURL, res) {
  let registerURL = new URL(reqURL);
  let registerParams = registerURL.searchParams;
  let regEmail = registerParams.get("email");
  await USER_DB.init();

  if (!regEmail) {
    sendJsonErr(res, STATUS.emailInvalid);
    return;
  }

  const emailExists = await USER_DB.userExists(regEmail);
  if (!emailExists) {
    sendJsonErr(res, STATUS.invalidUserToDeregister);
    return;
  }

  await USER_DB.rmUser(regEmail);
  sendJsonErr(res, STATUS.emailDeregistered);
}

async function handleRegister(reqURL, res) {
  let registerURL = new URL(reqURL);
  let registerParams = registerURL.searchParams;
  let regEmail = registerParams.get("email");

  try {
    await USER_DB.init();
  } catch (err) {
    sendJsonErr(res, STATUS.internalError);
  }

  if (!regEmail) {
    sendJsonErr(res, STATUS.emailInvalid);
    return;
  }

  const emailExists = await USER_DB.userExists(regEmail);
  if (emailExists) {
    sendJsonErr(res, STATUS.emailExists);
    return;
  }

  const emailValid = isEmailValid(regEmail);
  if (!emailValid) {
    sendJsonErr(res, STATUS.emailInvalid);
    return;
  }

  // we do not waste our API calls in development mode; we can trust devs to test with real emails
  if (MODE == "production") {
    try {
      const emailReal = await isEmailReal(regEmail);
      if (!emailReal) {
        sendJsonErr(res, STATUS.fakeEmail);
        return;
      }
    } catch (err) {
      sendJsonErr(res, STATUS.internalError);
      return;
    }
  }

  await USER_DB.pushUser(regEmail);
  res.writeHead(200, { "Content-type": MIME.json });
  sendJsonErr(res, STATUS.emailRegistered);
  await sendWelcomeEmail(regEmail, reqURL);
}

const server = http.createServer(async (req, res) => {
  const uri = req.url;
  const url = `https://${req.headers.host}${uri}`;
  const ext = req.url.split(".").pop();

  if (uri === "/" || uri === "/index") {
    await handleIndex(res);
  } else if (uri.match("/favicon")) {
    const img = readFileSync("public/favicon-16x16.png");
    res.writeHead(200, { "Content-Type": MIME.png });
    res.end(img, "binary");
  } else if (uri.startsWith("/register")) {
    await handleRegister(url, res);
  } else if (uri.startsWith("/deregister")) {
    await handleDeregister(url, res);
  } else if (uri.startsWith("/post")) {
    await handlePost(url, res);
  } else if (ext) {
    handleFilepath(url, res);
  } else {
    handle404(res);
  }
  res.end();
});

module.exports = server;

const { renderFile } = require("ejs");
const cron = require("node-cron");

const sendMail = require("./Mailer");
const { getNewsData, getCoinPrices } = require("./NewsAggregator");
const { CRON_TIMEZONE, CRON_CMD } = require("./Constants");
const NewsModel = require("../models/NewsModel");
const UserModel = require("../models/UserModel");

async function pushDataToDb() {
  const db = new NewsModel();
  await db.init();

  const news = await getNewsData();
  const prices = await getCoinPrices();
  await db.clearNewsDB();
  await db.clearPricesDB();

  await db.pushNews(news);
  await db.pushPrices(prices.slice(0, 10));
  console.log("[INFO] updated DB with latest feed");

  await db.close();
}

async function mailAndPush() {
  const maildb = new UserModel();
  const newsdb = new NewsModel();

  await maildb.init();
  await newsdb.init();

  const news = await newsdb.getNews();
  const prices = await newsdb.getPrices();

  await maildb.close();
  await newsdb.close();

  const date = new Date();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  const today = "dd/mm"
    .replace("mm", month < 10 ? `0${month}` : month)
    .replace("dd", day < 10 ? `0${day}` : day);
  console.log("[INFO] Sending mail");

  const mailCollection = await maildb.getUsers();

  mailCollection.forEach(async ({ mail }) => {
    const html = await renderFile("./views/mailTemplate.ejs", {
      news: news,
      prices: prices,
      greeting: "Good morning! " + mail.split("@")[0],
      welcome: false,
      deregisterLink: "",
      siteLink: "",
    });

    sendMail(mail, `Cybernated feed for ${today}`, html)
      .then(async () => {
        console.log("[INFO] Sent mail to", mail);
      })
      .catch(async (err) => {
        console.error(`[ERROR] Couldn't send to ${mail} due to ${err}`);
      });
  });
}

cron.schedule(
  CRON_CMD,
  async () => {
    console.log("[INFO] Cron job started");
    try {
      await pushDataToDb();
      await mailAndPush();
    } catch (err) {
      console.error(err);
    }
  },
  {
    scheduled: true,
    timezone: CRON_TIMEZONE,
  }
);

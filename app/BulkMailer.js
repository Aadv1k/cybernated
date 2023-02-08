const { renderFile } = require("ejs");

const sendMail = require("./Mailer");
const { getNewsData, getCoinPrices } = require("./NewsAggregator");
const { CRON_TIMEZONE, CRON_CMD } = require("./Constants");
const NewsModel = require("../models/NewsModel");
const UserModel = require("../models/UserModel");
const cron = require("node-cron");


async function pushDataToDb() {
  const db = new NewsModel();
  await db.init();

  const news = await getNewsData();
  const prices = await getCoinPrices();

  await db.clearNewsDB();
  await db.clearPricesDB();

  await db.pushNews(news);
  await db.pushPrices(prices.slice(0, 10));

  console.log("[INFO] updated DB with latest feed")

  await db.close();
}

async function mailAndPush() {
  const maildb = new UserModel();
  const newsdb = new NewsModel();

  await maildb.init();
  await newsdb.init();

  const mailCollection = await maildb.getUsers()
  let emails = mailCollection.map(e => e.email);

  const news = await newsdb.getNews();
  const prices = await newsdb.getPrices();

  const date = new Date();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  const today = "dd/mm".replace('mm', month < 10 ? `0${month}` : month).replace('dd', day < 10 ? `0${day}` : day);
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

  console.log("[INFO] Sending mail")
  emails.forEach(async (mail) => {
    await delay(3000)
    const html = await renderFile("./views/mailTemplate.ejs", {news: news, prices: prices, greeting: "Good morning! " + mail.split('@')[0], welcome: false});
    sendMail(mail, `Cybernated feed for ${today}`, html)
      .then((suc) => { console.log("[INFO] Sent mail to", mail)})
      .catch(err => { console.error(`[ERROR] Couldn't send to ${mail} due to ${err}`) 
      })
    await delay(3000)
  });

  await maildb.close();
  await newsdb.close();
}


cron.schedule("02 10 * * *", async () => {
  console.log("[INFO] Cron job started")
  await pushDataToDb();
  await mailAndPush();
}, {
   scheduled: true,
   timezone:CRON_TIMEZONE
});


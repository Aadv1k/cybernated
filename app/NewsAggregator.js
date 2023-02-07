// don't sue pls //
const https = require("https");
const qs = require("querystring");
const url = require("url");
const cheerio = require("cheerio");
const NewsModel = require("../models/NewsModel.js")
const { requestCloudflare } = require('request-cloudflare');

//function getCurrencyExchangeRates() { const url = "https://production.api.coindesk.com/v2/exchange-rates" }

function getCoinPrices() {
  const url = "https://ticker-api.cointelegraph.com/rates/?full=true";
  let data = "";

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      res.on("data", d => data += d);
      res.on("end", () => {
        let parsed = JSON.parse(data);
        let dat = []        
        for (const elem in parsed.data) {
          dat.push({ 
            coin: elem,
            price: parsed.data[elem].USD.price,
            change24h: parsed.data[elem].USD.change24h,
            up: parsed.data[elem].USD.change24h > 0 
          })
        }
        resolve(dat);
      });
    })
  })
}


function scrapeTheBlock() {
  const siteURL = "https://theblock.co/";
  let html = "";
  let finalData = [];

  return new Promise((resolve, reject) => {
    requestCloudflare.get(siteURL + "/latest", (err, res, body) => {
      const $ = cheerio.load(body);
      const latestStories = $('#__layout > div > section > section > div.collectionFeed > div.collectionLatest');
      latestStories.children().each((idx, elem) => {
        const tag = $(elem).find('a').text();
        const title = $(elem).find('div > .headline > a > h2 > span').text();
        const url = $(elem).find('a').attr('href');
        finalData.push({ title: title, url: siteURL + url, source: "theblock" })
      })
      resolve(finalData);
    }, {})
  })
}

function scrapeTheDefiant() {
  const siteURL = "https://thedefiant.io";
  let html = "";
  let finalData = [];

  return new Promise((resolve, reject) => {
    https.get(siteURL, (res) => {
      res.on("data", d => html += d);
      res.on("end", () => {
        const $ = cheerio.load(html);
        const latestStories = $('#__next > main > div.mb-14 > section:nth-child(1) > div');
        latestStories.children().each((idx, elem) => {
          const tag = $(elem).find('a').text();
          const title = $(elem).find('div > a > h3').text();
          const url = $(elem).find('a:nth-child(2)').attr('href');

          if (title.toLowerCase().includes("sponsored")) return;
          //if (!tag.toLowerCase().includes("news")) return;

          finalData.push({
            title: title,
            url: siteURL + url,
            source: "thedefiant"
          })
        })
        resolve(finalData);
      });
    })
  })
}

function scrapeTheCoinTelegraph() {
  const siteURL = "https://cointelegraph.com/"
  let html = "";
  let finalData = [];

  return new Promise((resolve, reject) => {
    https.get(siteURL, (res) => {
      res.on("data", d => html += d);
      res.on("end", () => {

        const $ = cheerio.load(html);
        const editorsChoice = $('#__layout > div > div.layout__wrp > main > div > div > div.main-page__hero > div.main-news__row > div.main-news-controls > ul')
        const articles = $('#__layout > div > div.layout__wrp > main > div > div > div.main-page__posts > div > ul')

        editorsChoice.children().each((idx, elem) => {
          const item = $(elem).find('div').find('a');
          finalData.push({
            title: item.text(),
            url: siteURL + item.attr('href'),
            source: "cointelegraph"
          })
        })

        articles.children().each((idx, elem) => {
          const item = $(elem).find('header').find('a');
          const tag = $(elem).find('span.post-card__badge').text();
          if (tag.toLowerCase().trim() != "news") return;
          finalData.push({
            title: item.text(),
            url: siteURL + item.attr('href'),
            source: "cointelegraph"
          })
        })
        resolve(finalData);
      });
    })
  })

}

function scrapeCoindesk() {
  const siteURL = "https://www.coindesk.com"
  const baseURL = "https://www.coindesk.com/pf/api/v3/content/fetch/websked-collections";
  const uri = qs.stringify({query: '{"content_alias":"policyweek2023f","format":"layer-2-homepage","size":200}'});
  let data = "";
  const cookedURL = `${baseURL}?${uri}`;

  return new Promise((resolve, reject) => {
    https.get(cookedURL, (res) => {
      res.on("data", d => data += d);
      res.on("end", () => {
        let parsed = JSON.parse(data);
        let dat = parsed.map(e => {
          return {
            title: e.title, 
            url: siteURL + e.url,
            date: e.date,
            source: "coindesk"
          }
        });
        resolve(dat);
      });
    })
  })
}

(async () => {
})()

async function getNewsData() {
  let data1 = await scrapeCoindesk();
  let data2 = await scrapeTheDefiant();
  let data3 = await scrapeTheCoinTelegraph();
  let data4 = await scrapeTheBlock();

  return new Promise((resolve, reject) => {
    resolve([
      ...data1.slice(0, 8), 
      ...data2.slice(0, 8), 
      ...data3.slice(0, 8), 
      ...data4.slice(0, 8)
  ]);
  })
}


module.exports = {getNewsData, getCoinPrices};

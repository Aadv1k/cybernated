// don't sue pls //
const https = require("https");
const qs = require("querystring");
const {writeFileSync} = require("fs");
const url = require("url");

function getCurrencyExchangeRates() {
  const url = "https://production.api.coindesk.com/v2/exchange-rates"
}

function getCoinRates() {
  const url = "https://ticker-api.cointelegraph.com/rates/";
  let data = "";

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      res.on("data", d => data += d);
      res.on("end", () => {
        let parsed = JSON.parse(data);
        let dat = []        
        for (const elem in parsed.data) {
          dat.push({ coin: elem, price: parsed.data[elem].USD[0], up: parsed.data[elem].USD[1] > 0 })
        }
        resolve(dat);
      });
    })
  })
}

function scrapeTheDefiant() {
  const url = "https://thedefiant.io/_next/data/Ir74lIcOsMySgYfKv21l0/category/news.json?slug=news";
  const siteURL = "https://thedefiant.io/"
  let data = "";

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      res.on("data", d => data += d);
      res.on("end", () => {
        let parsed = JSON.parse(data);
        let dat = parsed.pageProps.data.trending.map(e => {
          return {
            title: e.title, 
            url: siteURL + e.uri,
            date: e.date,
            img: e.featuredImage.src
          }
        });
        resolve(dat);
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
            date: e.date
          }
        });
        resolve(dat);
      });
    })
  })
}

function generateJsonForAllData() {
  return new Promise((resolve, reject) => {
    Promise.all([scrapeTheDefiant(), scrapeCoindesk(), getCoinRates()]).then(data => {
      resolve({theDefiant: data[0], coinDesk: data[1], rates: data[2]});
    })
  }) 

}

//generateJsonForAllData().then(e => writeFileSync("./news.json", JSON.stringify(e)))

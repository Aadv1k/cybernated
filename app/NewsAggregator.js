// don't sue pls //
const https = require("https");
const qs = require("querystring");
const url = require("url");
const cheerio = require("cheerio");
const NewsModel = require("../models/NewsModel.js");
const { requestCloudflare } = require("request-cloudflare");

//function getCurrencyExchangeRates() { const url = "https://production.api.coindesk.com/v2/exchange-rates" }

function getCoinPrices() {
  const url = "https://ticker-api.cointelegraph.com/rates/?full=true";
  let data = "";

  return new Promise((resolve, _) => {
    https.get(url, (res) => {
      res.on("data", (d) => (data += d));
      res.on("end", () => {
        let parsed = JSON.parse(data);
        let dat = [];
        for (const elem in parsed.data) {
          dat.push({
            coin: elem,
            price: parsed.data[elem].USD.price,
            change24h: parsed.data[elem].USD.change24h,
            up: parsed.data[elem].USD.change24h > 0,
          });
        }
        resolve(dat);
      });
    });
  });
}

/* Credit to ChatGPT, still won't take my job tho */
function scrapeTheBlock() {
  const siteURL = "https://theblock.co/";
  let finalData = [];

  return new Promise(async (resolve, reject) => {
    requestCloudflare.get(
      siteURL + "/latest",
      async (err, res, body) => {
        const $ = cheerio.load(body);
        const latestStories = $(
          "#__layout > div > section > section > div.collectionFeed > div.collectionLatest"
        );
        const requests = [];
        latestStories.children().each((_, elem) => {
          const postUrl = siteURL + $(elem).find("a").attr("href");

          requests.push(
            new Promise(async (resolve, _) => {
              let title,
                imgURL,
                content = [];
              requestCloudflare.get(postUrl, (_err, _res, body) => {
                const $post = cheerio.load(body);
                title = $post("h1").text();
                imgURL = $post(
                  "#__layout > div > div:nth-child(5) > div > section > div.articleContent > article > div.articleFeatureImage"
                )
                  .find("img")
                  .attr("src");
                $post("div#articleContent")
                
                  .find("#articleContent > span:not(.copyright) > p")
                  .each((_idx, elem) => {
                    content.push($(elem).text());
                  });
                resolve({
                  title: title,
                  img: imgURL,
                  content: content.join(''),
                  paras: content,
                  url: postUrl,
                  source: "theblock",
                });
              });
            })
          );
        });
        Promise.all(requests)
          .then((data) => {
            finalData = data;
            resolve(finalData);
          })
          .catch((error) => reject(error));
      },
      {}
    );
  });
}

async function scrapeTheDefiant() {
  const siteURL = "https://thedefiant.io";
  let html = "";

  return new Promise((resolve, reject) => {
    https.get(siteURL, (res) => {
      res.on("data", (d) => {
        html += d;
      });

      res.on("end", async () => {
        const $ = cheerio.load(html);
        const latestStories = $(
          "#__next > main > div.mb-14 > section:nth-child(1) > div"
        );
        let requests = [];
        latestStories.children().each((_, elem) => {
          const postURL = siteURL + $(elem).find("a:nth-child(2)").attr("href");
          requests.push(
            new Promise((resolve, _) => {
              let postHtml = "";
              https.get(postURL, (res) => {
                res.on("data", (d) => {
                  postHtml += d;
                });
                res.on("end", () => {
                  let post$ = cheerio.load(postHtml);
                  let title = post$("article > h1").text();

                  if (title.toLowerCase().includes("sponsored")) resolve();

                  let imgURL = post$(
                    "article.relative.mx-auto.mb-12.w-full.max-w-3xl > div.my-10 > img"
                  ).attr("src");
                  let content = [];
                  post$("article > .prose > p").each((_, e) => {
                    content.push($(e).text());
                  });
                  resolve({
                    title,
                    img: siteURL + imgURL,
                    content: content.join(''),
                    paras: content,
                    url: postURL,
                    source: "thedefiant",
                  });
                });
              });
            })
          );
        });
        Promise.all(requests)
          .then((data) => {
            resolve(data);
          })
          .catch((err) => {
            reject(err);
          });
      });
    });
  });
}


async function scrapeCoinTelegraph() {
  const siteURL = "https://cointelegraph.com";
  let html = "";

  return new Promise((resolve, reject) => {
    https.get(siteURL, (res) => {
      res.on("data", (d) => {
        html += d;
      });

      res.on("end", async () => {
        const $ = cheerio.load(html);
        const latestStories = $(
          "#__layout > div > div.layout__wrp > main > div > div > div.main-page__posts > div > ul"
        );
        let requests = [];
        latestStories.children().each((_, elem) => {
          let uri = $(elem).find("li > div > article a").attr("href");
          if (uri === undefined || uri.startsWith("https")) return;
          let postURL = siteURL + uri;

          requests.push(
            new Promise(async (resolve, _) => {
              requestCloudflare.get(postURL, (_err, res, body) => {
                if (res.statusCode != 200) resolve();
                const $post = cheerio.load(body);
                let title = $post("h1").text();
                let imgURL = $post(
                  "div.post-cover.post__block > div > div > picture > img"
                ).attr("src");

                let content = [];
                $post("div.post__content-wrapper > div.post-content").children().each((_, e) => {
                  content.push($(e).text());
                });

                resolve({
                  title,
                  img: imgURL,
                  content: content.join(''),
                  paras: content,
                  url: postURL,
                  source: "cointelegraph",
                });
              });
            })
          );
        });

        Promise.all(requests)
          .then((data) => {
            resolve(data.filter(e => e));
          })
          .catch((err) => {
            reject(err);
          });
      });
    });
  });
}

function scrapeCoindesk() {
  const siteURL = "https://www.coindesk.com";
  const baseURL =
    "https://www.coindesk.com/pf/api/v3/content/fetch/websked-collections";
  const uri = qs.stringify({
    query:
      '{"content_alias":"policyweek2023f","format":"layer-2-homepage","size":200}',
  });
  let data = "";
  const cookedURL = `${baseURL}?${uri}`;

  return new Promise((resolve, reject) => {
    https.get(cookedURL, (res) => {
      res.on("data", (d) => (data += d));
      res.on("end", () => {
        let parsed = JSON.parse(data);
        let dat = parsed.map((e) => {
          return {
            title: e.title,
            url: siteURL + e.url,
            date: e.date,
            source: "coindesk",
          };
        });
        resolve(dat);
      });
    });
  });
}

async function getNewsData() {
  //let data1 = await scrapeCoindesk();
  let data2 = await scrapeTheDefiant();
  let data3 = await scrapeCoinTelegraph();
  let data4 = await scrapeTheBlock();

  return new Promise((resolve, _) => {
    resolve([
      //...data1.slice(0, 8),
      ...data2.slice(0, 8),
      ...data3.slice(0, 8),
      ...data4.slice(0, 8),
    ].filter(e => e));
  });
}

module.exports = { getNewsData, getCoinPrices };

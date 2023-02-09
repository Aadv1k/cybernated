const { MONGO_ATLAS_USER, MONGO_ATLAS_PWD } = require("../app/Constants.js");
const { MongoClient } = require("mongodb");

const atlasURL = `mongodb+srv://${MONGO_ATLAS_USER}:${MONGO_ATLAS_PWD}@cybr-user-list.vtqs3hz.mongodb.net/?retryWrites=true&w=majority`
const DB_NAME = "Newsdb"

class NewsModel {
  constructor() {
    this.client = new MongoClient(atlasURL);
    this.db = null;
  }


  async init() {
    await this.client.connect();
    this.db = this.client.db("Newsdb");

    this.prices = this.db.collection("coinPrices");
    this.news = this.db.collection("news");
  }

  async pushSingleNews(title, url, source, img, date) {
    await this.news.insertOne({ title: title, url: url, source: source, img: img ?? "", date: date})
  }

  async pushNews(data) {
    await this.news.insertMany(data)
  }

  async clearNewsDB() {
    await this.news.deleteMany({});
  }

  async clearPricesDB() {
    await this.prices.deleteMany({});
  }

  async pushPrices(data) {
    await this.prices.insertMany(data)
  }

  async getNews() {
    const data = await this.news.find({}).toArray();
    return data;
  }

  async getPrices() {
    const data = await this.prices.find({}).toArray();
    return data;
  }

  async close() {
    await this.client.close();
  }
}
module.exports = NewsModel;

const { MONGO_ATLAS_USER, MONGO_ATLAS_PWD } = require("../app/Constants.js");
const { MongoClient } = require("mongodb");

const atlasURL = `mongodb+srv://${MONGO_ATLAS_USER}:${MONGO_ATLAS_PWD}@cybr-user-list.vtqs3hz.mongodb.net/?retryWrites=true&w=majority`
const DB_NAME = "users"
const COLLECTION_NAME = "users"

class UserModel {
  constructor() {
    this.client = new MongoClient(atlasURL);
    this.db = null;
    this.users = null;
  }

  async init() {
    await this.client.connect();
    this.db = this.client.db(DB_NAME);
    this.users = this.db.collection(COLLECTION_NAME);
  }

  async pushUser(userEmail) {
    await this.users.insertOne({
      email: userEmail, 
    })
  }

  async rmUser(userEmail) {
    await this.users.deleteOne({email: userEmail})
  }

  async getUsers() {
    const data = await this.users.find({}).toArray();
    return data;
  }

  async userExists(userEmail) {
    let elem = await this.users.findOne({email: userEmail});
    if (elem) return true;
    return false;
  }

  async close() {
    await this.client.close();
  }
}
module.exports = UserModel;

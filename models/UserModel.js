const {readFileSync, writeFileSync, existsSync} = require("fs");

class UserModel {
  constructor() {
    let exists = existsSync("data.json")
    if (!exists) writeFileSync("data.json", "[]");
    let file = readFileSync("data.json");

    try {
      this.db = JSON.parse(file);
    } catch (err) {
      this.db = [];
    }
  }

  pushUser(userEmail, userSites) {
    this.db.push({
      email: userEmail, 
      sites: userSites
    })
    return this.db;
  }

  rmUser(userEmail) {
    let idx = this.db.findIndex(e => e.email == userEmail)
    if (idx) this.db.splice(idx, 1);
    return this.db;
  }

  updateUser(oldEmail, newData) {
    let idx = this.db.findIndex(e => e.email == oldEmail)
    if (!idx) return undefined;
    this.db[idx] = newData;
    return this.db;
  }

  getUsers() {
    return this.db;
  }

  userExists(userEmail) {
    let elem = this.db.find(e => e.email == userEmail)
    if (elem) return true;
    return false;
  }

  close() {
    writeFileSync("./data.json", JSON.stringify(this.db));
  }
}
module.exports = UserModel;

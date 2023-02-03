const {readFileSync, writeFileSync} = require("fs");

class UserModel {
  constructor() {
    let file = readFileSync("./data.json");
    try {
      this.db = JSON.parse(file);
    } catch (_) {
      this.db = JSON.parse("[]");
    }
  }


  // TODO: Get this done

  close() {
    writeFileSync("./data.json", JSON.stringify(this.db));
  }
}

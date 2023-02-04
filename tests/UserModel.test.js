const UserModel = require("../models/UserModel.js")

describe("The wrapper class works as intended", () => {
  const mockEmail = "example@example.org"
  const mockEmail2 = "foo@example.org"
  const mockSites = [];
  const db =  new UserModel();

  afterAll(() => {
    db.close();
  })

  it("Should add a new user", () => {
    db.pushUser(mockEmail, mockSites)
    expect(db.getUsers().find(e => e.email == mockEmail)).not.toBeUndefined();
  })

  it("Should remove a user", () => {
    db.rmUser(mockEmail, mockSites)
    expect(db.getUsers().find(e => e.email == "example@example.org")).toBeUndefined();
  })

  it("Should update user email to another email", () => {
    db.pushUser(mockEmail, mockSites)
    db.updateUser(mockEmail, {email: mockEmail2, sites: []});
    expect(db.getUsers().find(e => e.email == mockEmail2)).not.toBeUndefined();
  })
})

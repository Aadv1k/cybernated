const { isEmailValid } = require("../app/validation");

describe("Test to see if email validation work", () => {
  it("Should validate the email syntax", () => {
    expect(isEmailValid("foo@example.com")).toBe(true);
    expect(isEmailValid("foo@.com")).toBe(false);
  });
});

const http = require("http");
const consts = require("../app/constants");
const { setup: setupDevServer }= require("jest-dev-server")

const TEST_PORT = consts.PORT;

describe("Test to check the API", () => {
  let baseURL = `http://localhost:${TEST_PORT}/`

  beforeAll(() => {
    setupDevServer({
      command: `npm run start`,
      launchTimeout: 50000,
      port: TEST_PORT,
    });
  })

  test("No email", () => {
    http.get(baseURL + "?email=", (res) => {
      res.on("end", () => expect(res.status).toBe(400));
    })
  })

  test("Bad email", () => {
    http.get(baseURL + "?email=incorrect", (res) => {
      res.on("end", () => expect(res.status).toBe(400));
    })
  })

})

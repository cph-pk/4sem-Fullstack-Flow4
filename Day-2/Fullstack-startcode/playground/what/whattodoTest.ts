const expect = require("chai").expect;
import app from "./whattodo";
const request = require("supertest")(app);
import nock from "nock";

describe("What to do endpoint", function () {
  before(() => {
        nock('https://www.boredapi.com')
        .get("/api/activity")
        .reply(200, {

            "activity": "Go for a run",
            "type": "recreational",
            "participants": 1,
            "price": 0,
            "link": "",
            "key": "6852505",
            "accessibility": 0.9
        
        })
    })

  it("Should eventually provide 'Go for a run'", async function () {
    const response = await request.get("/whattodo")
    expect(response.body.activity).to.be.equal("Go for a run");
  })
})

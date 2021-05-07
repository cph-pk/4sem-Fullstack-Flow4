import chai from "chai";
const expect = chai.expect;
import app from "./infoForNameServer";
const request = require("supertest")(app);
import nock from "nock";

describe("While attempting to get Donald", async function () {
    beforeEach(function () {
        nock.cleanAll()
    })

    it("Should provide gender 'male'", async function () {
        nock('https://api.genderize.io')
            .get("/?name=donald")
            .reply(200, {
                "name": "donald",
                "gender": "male",
                "probability": 0.98,
                "count": 12059
            })

        const result = await request.get("/nameinfo/donald")
        expect(result.body.gender).to.be.equal("male");

    })

    it("Should provide country 'US'", async function () {
        nock('https://api.nationalize.io')
            .get("/?name=donald")
            .reply(200, {
                "name": "donald",
                "country": [
                    {
                        "country_id": "US",
                        "probability": 0.17438037455929797
                    },
                    {
                        "country_id": "CA",
                        "probability": 0.07862034551799452
                    },
                    {
                        "country_id": "BW",
                        "probability": 0.0760385272676348
                    }
                ]
            })
        const result = await request.get("/nameinfo/donald")
        expect(result.body.country).to.be.equal("US");
    })

    it("Should provide age '61'", async function () {
        nock('https://api.agify.io')
            .get("/?name=donald")
            .reply(200, {
                "name": "donald",
                "age": 61,
                "count": 10771
            })
        const result = await request.get("/nameinfo/donald")
        expect(result.body.age).to.be.equal(61);
    })
})
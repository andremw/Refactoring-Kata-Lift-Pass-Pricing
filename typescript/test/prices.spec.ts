import request from 'supertest-as-promised';
import {createApp} from "../src/prices"

describe('Lift Pass Pricing', () => {
    let app, connection

    beforeEach(async () => {
        ({app, connection} = await createApp());
    });

    afterEach(async () => {
        await connection.end()
    });

    it('cost is 0 if age is less than 6', async () => {

        const response = await request(app)
            .get('/prices?age=5')

        var expectedResult = {cost: 0} // change this to make the test pass
        expect(response.body).toEqual(expectedResult)
    });

    describe("night pass", () => {
        it('cost is forty percent (ceiling) of base price if age is greater than 64', async () => {
            const response = await request(app)
                .get('/prices?age=65&type=night')

            var expectedResult = {cost: 8}
            expect(response.body).toEqual(expectedResult)
        })

        it('cost is standard if age is less than 65', async () => {
            const response = await request(app)
                .get('/prices?age=64&type=night')

            var expectedResult = {cost: 19}
            expect(response.body).toEqual(expectedResult)
        })
    })

    describe("day pass", () => {
        it('cost is seventy percent (ceiling) of base price if age is less than 15', async () => {
            const response = await request(app)
                .get('/prices?age=14&type=1jour')

            var expectedResult = {cost: 25}
            expect(response.body).toEqual(expectedResult)
        })

        it('cost is standard if age is greater than 14', async () => {
            const response = await request(app)
                .get('/prices?age=15&type=1jour')

            var expectedResult = {cost: 35}
            expect(response.body).toEqual(expectedResult)
        })

        it("cost is reduced by 25% for people older than 64", async () => {
            const response = await request(app)
                .get('/prices?age=65&type=1jour')

            var expectedResult = {cost: 27}
            expect(response.body).toEqual(expectedResult)
        })

        it("cost is unchanged if age is not specified", async () => {
            const response = await request(app)
                .get('/prices?type=1jour')

            var expectedResult = {cost: 35}
            expect(response.body).toEqual(expectedResult)
        })

        it("cost is reduced by 35% on Mondays", async () => {
            const response = await request(app)
                .get('/prices?date=2020-01-06&type=1jour')

            var expectedResult = {cost: 23}
            expect(response.body).toEqual(expectedResult)
        })

        it("cost is unchanged on holidays", async () => {
            const response = await request(app)
                .get('/prices?date=2019-02-18&type=1jour&age=15')

            var expectedResult = {cost: 35}
            expect(response.body).toEqual(expectedResult)
        })

        it("cost is reduced by 25% plus 35% on Mondays for people older than 64", async () => {
            const response = await request(app)
                .get('/prices?date=2020-01-06&type=1jour&age=65')

            var expectedResult = {cost: 18}
            expect(response.body).toEqual(expectedResult)
        })
    })
});

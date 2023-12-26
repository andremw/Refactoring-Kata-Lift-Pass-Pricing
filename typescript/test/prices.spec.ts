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

        it ('cost is standard if age is less than 65', async () => {
            const response = await request(app)
                .get('/prices?age=64&type=night')

            var expectedResult = {cost: 19}
            expect(response.body).toEqual(expectedResult)
        })
    })
});

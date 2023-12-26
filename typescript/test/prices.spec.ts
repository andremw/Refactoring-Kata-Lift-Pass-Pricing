import request from 'supertest-as-promised';
import {createApp} from "../src/prices"

describe('prices', () => {

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
});

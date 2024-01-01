import express from "express";
import mysql from "mysql2/promise"

type ParamsDTO = {
    age: any,
    liftPassType: any,
    date?: any,
    basePrice: { cost: number },
}

type PassCostCalculatorDeps = {
    getHolidays: () => Promise<any[]>,
}

type PassCost = {
    cost: number
}

async function createApp() {
    const app = express()

    let connectionOptions = {host: 'localhost', user: 'root', database: 'lift_pass', password: 'mysql'}
    const connection = await mysql.createConnection(connectionOptions)

    app.put('/prices', async (req, res) => {
        const liftPassCost = req.query.cost
        const liftPassType = req.query.type
        const [rows, fields] = await connection.query(
            'INSERT INTO `base_price` (type, cost) VALUES (?, ?) ' +
            'ON DUPLICATE KEY UPDATE cost = ?',
            [liftPassType, liftPassCost, liftPassCost]);

        res.json()
    })

    const calculatePassCost =
        ({ getHolidays }: PassCostCalculatorDeps) =>
        async ({ age, liftPassType, date, basePrice }: ParamsDTO): Promise<PassCost> => {
        if (age as any < 6) {
            return {cost: 0}
        } else {
            if (liftPassType !== 'night') {
                const holidays = await getHolidays();

                let isHoliday;
                let reduction = 0
                for (let row of holidays) {
                    let holiday = row.holiday
                    if (date) {
                        let d = new Date(date as string)
                        if (d.getFullYear() === holiday.getFullYear()
                            && d.getMonth() === holiday.getMonth()
                            && d.getDate() === holiday.getDate()) {

                            isHoliday = true
                        }
                    }

                }

                if (!isHoliday && new Date(date as string).getDay() === 1) {
                    reduction = 35
                }

                // TODO apply reduction for others
                if (age as any < 15) {
                    return {cost: Math.ceil(basePrice.cost * .7)}
                } else {
                    if (age === undefined) {
                        let cost = basePrice.cost * (1 - reduction / 100)
                        return {cost: Math.ceil(cost)}
                    } else {
                        if (age as any > 64) {
                            let cost = basePrice.cost * .75 * (1 - reduction / 100)
                            return {cost: Math.ceil(cost)}
                        } else {
                            let cost = basePrice.cost * (1 - reduction / 100)
                            return {cost: Math.ceil(cost)}
                        }
                    }
                }
            } else {
                if (age as any >= 6) {
                    if (age as any > 64) {
                        return {cost: Math.ceil(basePrice.cost * .4)}
                    } else {
                        return basePrice
                    }
                } else {
                    return {cost: 0}
                }
            }
        }
    }

    app.get('/prices', async (req, res) => {
        const { age, type: liftPassType, date } = req.query;
        const sendResponse = res.json.bind(res);

        const getBasePrice = async (liftPassType) => {
            return (await connection.query(
                'SELECT cost FROM `base_price` ' +
                'WHERE `type` = ? ',
                [liftPassType]))[0][0]
        }

        const getHolidays = async () => {
            return (await connection.query(
                'SELECT * FROM `holidays`'
            ))[0] as mysql.RowDataPacket[]
        }

        const basePrice = await getBasePrice(liftPassType)

        const passCost = await calculatePassCost({ getHolidays })({ age, liftPassType, date, basePrice})

        sendResponse(passCost)
    })
    return {app, connection}
}

export {createApp}

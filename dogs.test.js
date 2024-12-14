const request = require("supertest");
const app = require("./app");
const mongoose = require("mongoose");
const User = require("./models/users");
const Dog = require("./models/dogs");

let testUser = null
let newDog = null

beforeAll(async () => {
    testUser = await User.findOne() // import random test user
    // console.log('testUser', testUser)
})


it("GET /dogs", async () => {
    const res = await request(app).post("/dogs");
    expect(res.body.result).toBe(false);
});


it('POST /dogs', async () => {
    const resDog = await request(app).post('/dogs').send({
        name: 'testDog',
        sex: 'male',
    });
    newDog = resDog.body // set new dog for next tests
    // console.log( resDog.body )
    const resUser = await request(app).put(`/users/${testUser.token}/newdog`).send({ dogId: resDog.body.data._id }) // add new dog in test user dogs list
    // console.log('resUser', resUser.body)
    expect(resDog.statusCode).toBe(200);
    expect(resDog.body.result).toBe(true);
    expect(resDog.body.data.isFake).toBe(false);

    expect(resUser.body.result).toBe(true)
});


it('DELETE /dogs/:token', async () => {
    const res = await request(app).delete(`/dogs/${testUser.token}`).send({
        _id: newDog.data._id,
    });
    // console.log(res.body)
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.userDogs.includes(newDog._id)).toBe(false);
});


afterAll(async () => {
    mongoose.connection.close();
});

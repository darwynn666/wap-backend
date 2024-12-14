const request = require("supertest");
const app = require("./app");
const mongoose = require("mongoose");
const User = require("./models/users");
const Dog = require("./models/dogs");

let testUser = null
let newDog = null

beforeAll(async () => {
    testUser = await User.findOne()
    console.log('testUser', testUser)
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
    newDog = resDog.body
    console.log( resDog.body )
    const resUser = await request(app).post(`/users/${testUser.token}/newdog`).send({ dogId: resDog.body.data._id })
    console.log('resUser', resUser.body)
    expect(resDog.statusCode).toBe(200);
    expect(resDog.body.result).toBe(true);
    expect(resDog.body.data.isFake).toBe(false);
    expect(resUser.body.result).toBe(true)
});


it('DELETE /dogs/:token', async () => {
    const res = await request(app).delete(`/dogs/${testUser.token}`).send({
        _id: newDog.data._id,
    });
    console.log(res.body)
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.userDogs.includes(newDog._id)).toBe(false);
});


/*

it("POST /generatedata/users", async () => {
  const res = await request(app).post("/generatedata/users");
  expect(res.body.result).toBe(false);
});

it("POST /generatedata/users?nbUser", async () => {
  const res = await request(app).post("/generatedata/users?nbUser");
  expect(res.body.result).toBe(true);
  expect(res.body.data.length).toBe(10);
  User.deleteMany()
});

it("POST /generatedata/users?nbUser=10&longitude=50.6&latitude=3&longitudeDelta=0.05&latitudeDelta=0.05", async () => {
    const res = await request(app).post("/generatedata/users?nbUser=10&longitude=50.6&latitude=3&longitudeDelta=0.05&latitudeDelta=0.05");
    expect(res.body.result).toBe(true);
    expect(res.body.data.length).toBe(10);
    User.deleteMany()
  });


  */
afterAll(async () => {
    mongoose.connection.close();
});

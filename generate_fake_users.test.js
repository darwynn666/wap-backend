const request = require("supertest");
const app = require("./app");
const mongoose = require("mongoose");
const User = require("./models/users");

beforeEach(async () => await User.findOne());
it("POST /generatedata/users", async () => {
  const res = await request(app).post("/generatedata/users");
  expect(res.statusCode).toBe(200);
});

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

afterAll(async () => {
  mongoose.connection.close();
});

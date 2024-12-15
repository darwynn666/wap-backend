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
  //check the properties
  const firstUser = res.body.data[0]
  expect(firstUser.infos.firstname).not.toBeNull();
  expect(firstUser.infos.lastname).not.toBeNull();
  expect(firstUser.infos.telephone).not.toBeNull();
  expect(firstUser.infos.email).not.toBeNull();
  expect(firstUser).toHaveProperty(['infos.photo']);
  expect(firstUser).toHaveProperty(['infos.isDogSitter']);
  expect(firstUser).toHaveProperty(['infos.isSearchingDogSitter']);
  expect(firstUser.password).not.toBeNull();
  expect(firstUser.token).not.toBeNull();
  expect(firstUser.status).toMatch(/(walk|pause|off)/i);
  expect(firstUser).toHaveProperty(['currentLocation.type']);
  expect(firstUser).toHaveProperty(['currentLocation.coordinates']);
  expect(firstUser).toHaveProperty(['homeLocation.type']);
  expect(firstUser).toHaveProperty(['homeLocation.coordinates']);
  expect(firstUser.dogs.length).toBeGreaterThanOrEqual(1);
  expect(firstUser).toHaveProperty('friends');
  expect(firstUser.isFake).toBe(true);

  User.deleteMany()
});

it("POST /generatedata/users?nbUser=10&longitude=50.6&latitude=3&longitudeDelta=0.05&latitudeDelta=0.05", async () => {
    const longitude = 50.6;
    const latitude = 3;
    const longitudeDelta= 0.05;
    const latitudeDelta= 0.05;
    const res = await request(app).post("/generatedata/users")
    .query({
        longitude:longitude,
        latitude:latitude,
        longitudeDelta:longitudeDelta,
        latitudeDelta:latitudeDelta
      });
    expect(res.body.result).toBe(true);
    expect(res.body.data.length).toBe(10);
    for (let user of res.body.data)
    {
      expect(user.currentLocation.coordinates[0]).toBeGreaterThanOrEqual(longitude-longitudeDelta/2)
      expect(user.currentLocation.coordinates[0]).toBeLessThanOrEqual(longitude+longitudeDelta/2)
      expect(user.currentLocation.coordinates[1]).toBeGreaterThanOrEqual(latitude-latitudeDelta/2)
      expect(user.currentLocation.coordinates[1]).toBeLessThanOrEqual(latitude+latitudeDelta/2)
    }
    User.deleteMany()
  });

afterAll(async () => {
  User.deleteMany()
  mongoose.connection.close();
});

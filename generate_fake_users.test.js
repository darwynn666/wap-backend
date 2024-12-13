const request = require('supertest');
const app = require('./app');
const mongoose = require('mongoose');
const User = require('./models/users')

beforeEach (async () =>await User.findOne())
it('POST /generatedata/users', async () => {
 const res = await request(app).post(' /generatedata/users');

 expect(res.statusCode).toBe(200);
//  expect(res.body.stock).toEqual(['iPhone', 'iPad', 'iPod']);
});

afterAll( async() => {mongoose.connection.close})

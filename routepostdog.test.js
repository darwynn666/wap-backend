const request = require('supertest');
const app = require('./app');
const mongoose = require('mongoose');
const User = require('./models/users')

//exemple  eviter crash connexion mongoose
beforeEach (async () =>await User.findOne())

//test route post:fake user
// 1.ma route doit creer un nouveau chien dans la base dogs et remonter l'object id dans le tableau dogs de users
//le chien doit avoir au moins un nom et un sexe
it('PUT/users/token/newdog', async () => {
 const res = await request(app).put('/users/MnBDTFc_2IlL81hS8MjjWcu8v0wZeora/newdog').send({
    name: 'patapouf',
    sex: 'male',
    token: 'MnBDTFc_2IlL81hS8MjjWcu8v0wZeora',
 });

 expect(res.statusCode).toBe(200);
 expect(res.body.result).toBe(true);
//  expect(res.body.stock).toEqual(['iPhone', 'iPad', 'iPod']);
});

// it('PUT /users/newdog', async () => {
//     const res = (await request(app).put(' /users/newdog')).setEncoding({
//        name: '',
//        sex: 'male',
//        token: 'MnBDTFc_2IlL81hS8MjjWcu8v0wZeora',
//     });
//     expect(res.statusCode).toBe(200);
//  expect(res.body.result).toBe(false);
// });

afterAll( async() => {mongoose.connection.close})

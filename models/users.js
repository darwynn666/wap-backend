const mongoose = require('mongoose');

const pointSchema = mongoose.Schema({
     type : {
        type: String,
        enum:['Point'],
        required: true
    },
    coordinates: {
        type : [Number],
        required: true,
    }
});

const users_friendsSchema= mongoose.Schema({
    accepted:[{type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    incoming:[{type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    outcoming:[{type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    blocked: [{type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
});

const users_infosSchema= mongoose.Schema({
    firstname: String,
    lastname: String,
    telephone: String,
    email: String,
    photo: String,
    isDogSitter: Boolean,
    isSearchingDogSitter: Boolean,
})

const usersSchema = mongoose.Schema({
    name: String,
    infos: users_infosSchema,
    password: String,
    token: String,
    Status: String,
    currentLocation:{type : pointSchema, require: true},
    homeLocation:{type : pointSchema, required: true},
    dogs:[{type: mongoose.Schema.Types.ObjectId, ref: 'dogs' }],
    friends: [users_friendsSchema],
    isFake:Boolean,
});
const User = mongoose.model('users', usersSchema);

module.exports = User;
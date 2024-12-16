const mongoose = require('mongoose');

const pointSchema = mongoose.Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number],
        required: true,
    }
});

const users_friendsSchema = mongoose.Schema({
    accepted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    incoming: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    outcoming: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
});

const usersinfosSchema = mongoose.Schema({
    firstname: String,
    lastname: String,
    telephone: String,
    email: String,
    photo: String,
    photo_public_id:String,
    isDogSitter: Boolean,
    isSearchingDogSitter: Boolean,
})

const usersSchema = mongoose.Schema({
    //name: String,
    infos: usersinfosSchema,
    password: String,
    token: String,
    status: String,
    currentLocation: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
        }
    },
    homeLocation: { type: pointSchema, required: false },
    dogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'dogs' }],
    friends: users_friendsSchema,
    isFake: Boolean,
});

// usersSchema.index({ currentLocation: '2dsphere' });


const User = mongoose.model('users', usersSchema);

module.exports = User;
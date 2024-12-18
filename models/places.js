const mongoose = require('mongoose');

// const pointSchema = mongoose.Schema({
//     type: {
//         type: String,
//         enum: ['Point'],
//         required: true
//     },
//     coordinates: {
//         type: [Number],
//         required: true,
//     }
// });

const placesSchema = mongoose.Schema({
    name: String,
    photo: String,
    photo_public_url:String,
    houseNumber: String,
    street: String,
    postcode: Number,
    city: String,
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number,Number],
            required: true
        },
    },
    description: String,
    type: String,
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    isFake: Boolean,
});

// placesSchema.index({ location: '2dsphere' });

const Places = mongoose.model('places', placesSchema);

module.exports = Places;
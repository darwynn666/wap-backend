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

const placesSchema = mongoose.Schema({
    name: String,
    photo: String,
    houseNumber: Number,
    street: String,
    postcode: Number,
    city: String,
    location:{type : pointSchema, required: true},
    description:String,
    type: String,
    users:[{type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    isFake: Boolean,
});
const Places = mongoose.model('places', placesSchema);

module.exports = Places;
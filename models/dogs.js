const mongoose = require('mongoose');

const dogsSchema = mongoose.Schema({
    name: String,
    photo: String,
    sex: String,
    race: String,
    birthday: Date,
    status:String,
    chipid:String,
    isTaken:Boolean,
    isFake: Boolean,
});
const Dog = mongoose.model('dogs', dogsSchema);

module.exports = Dog;
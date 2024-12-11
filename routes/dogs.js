var express = require('express');
var router = express.Router();
require('../models/connexion');
const { checkBody } = require('../modules/checkBody');
const Dog = require('../models/dogs');
const User = require('../models/users')


// default
router.get('/', (req, res) => {
    res.json({ result: false, error: 'Missing token, try /dogs/token' })
})

// GET /dogs/id : get user's dogs array
router.get('/:token', (req, res) => {
    const token = req.params.token
    User.findOne({ token: token })
        .populate('dogs')
        .then(user => {
            if (user) { res.json({ result: true, data: user.dogs }) }
            else { res.json({ result: false, error: 'No user found, bad token' }) }
        })
})

// POST /dogs : add a new dog, returns the new dog
router.post('/', (req, res) => {
    if (!checkBody(req.body, ['name', 'sex'])) {
        res.json({ result: false, error: 'Missing or empty fields' });
        return;
    }
    const newDog = new Dog({
        name: req.body.name,
        sex: req.body.sex,
        isTaken: false,
        isFake: false,
    });

    newDog.save().then(() => {
        res.json({ result: true, data: newDog })
    })
})

// PUT /dogs/id : update a dog (infos), returns boolean
router.put('/:id', (req, res) => {

    const id = req.params.id
    const { name, photo, sex, race, birthday, chipid } = req.body

    if (!name || !photo || !sex || !race || !birthday || !chipid) {
        res.json({ result: false, error: 'Invalid form data' })
        return
    }
    Dog.updateOne({ _id: id }, { $set: { name, photo, sex, race, birthday, chipid } })
        .then(data => {
            // console.log(data)
            res.json({ result: true, data: data })
        })
        .catch(error => {
            res.json({ result: false, error: error })
        })
})

// PUT /dogs/id/status : update dog's status and isTaken
router.put('/:id/status', (req, res) => {
    const id = req.params.id
    const { status, isTaken } = req.body

    if (!status || !isTaken) {
        res.json({ result: false, error: 'Invalid form data' })
        return
    }
    Dog.updateOne({ _id: id }, { $set: { status, isTaken } })
        .then(data => {
            console.log(data)
            res.json({ result: true, data: data })
        })
        .catch(error => {
            res.json({ result: false, error: error })
        })
})


module.exports = router;
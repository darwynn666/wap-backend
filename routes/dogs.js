var express = require('express');
var router = express.Router();
require('../models/connexion');
const { checkBody } = require('../modules/checkBody');
const Dog = require('../models/dogs');
const User = require('../models/users')


// default
router.get('/', (req, res) => {
    res.json({ message: 'test route' })
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
    const { name, sex } = req.body
    if (!name || !sex) {
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
router.put('/:token', (req, res) => {
    const token = req.params.token
    const { _id, name, sex, race, birthday, chipid } = req.body

    if (!_id || !name || !sex) { // required
        res.json({ result: false, error: 'Invalid form data' })
        return
    }

    const dogId = _id
    User.findOne({ token: token })
        .then(user => {
            if (user && user?.dogs.includes(dogId)) { // check if user owns this dog
                Dog.updateOne({ _id: dogId }, { $set: { name, sex, race, birthday, chipid } })
                    .then(() => { Dog.findOne({ _id: dogId }).then(dog => { res.json({ result: true, dog }) }) })
                    .catch(error => { res.json({ result: false, error }); return })
            }
            else { res.json({ result: false, error: 'not your dog' }) }
        })
        .catch(error => { res.json({ result: false, error }); return })
})

// PUT /dogs/id/status : update dog's status and isTaken    //    VERIF TOKEN CHECK IF IS MY DOG
router.put('/:token/status', (req, res) => {
    const token = req.params.token
    const { _id, status, isTaken } = req.body

    if (!_id || !status || typeof isTaken !== 'boolean') { // required
        res.json({ result: false, error: 'Invalid form data' })
        return
    }

    const dogId = _id
    User.findOne({ token: token }).then(user => {
        if (user && user?.dogs.includes(dogId)) { // check if user owns this dog
            Dog.updateOne({ _id: dogId }, { $set: { status, isTaken } })
                .then(() => { Dog.findOne({ _id: dogId }).then(dog => { res.json({ result: true, dog }) }) })
                .catch(error => { res.json({ result: false, error }); return })
        }
        else { res.json({ result: false, error: 'not your dog' }) }
    })
        .catch(error => { res.json({ result: false, error }); return })

})

// DELETE /dogs/id : delete a dog
router.delete('/:token', (req, res) => {
    const token = req.params.token
    const { _id } = req.body

    if (!_id) { // required
        res.json({ result: false, error: 'Invalid form data' })
        return
    }

    const dogId = _id
    User.findOne({ token: token }).then(user => {
        if (user && user?.dogs.includes(dogId)) { // check if user owns this dog
            user.dogs = user.dogs.filter(id => !id.equals(dogId))
            const promises = []
            promises.push(
                User.updateOne({ token }, { $set: { dogs: user.dogs } }).catch(error => { res.json({ result: false, error }); return }),
                Dog.deleteOne({ _id: dogId }).catch(error => { res.json({ result: false, error }); return })
            )
            Promise.all(promises).then(() => {
                res.json({ result: true, userDogs: user.dogs })
            })
                .catch(error => { res.json({ result: false, error }); return })
        }
        else { res.json({ result: false, error: 'not your dog' }) }
    })
        .catch(error => { res.json({ result: false, error }); return })

})


module.exports = router;
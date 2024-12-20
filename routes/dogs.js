var express = require('express');
var router = express.Router();
require('../models/connexion');
const { checkBody } = require('../modules/checkBody');
const Dog = require('../models/dogs');
const User = require('../models/users')
const cloudinary = require('cloudinary').v2;


// reset (for dev) : delete all true dogs
router.get('/reset', (req, res) => {
    Dog.deleteMany({ isFake: false }).then(data => {
        res.json({ data })
    })
        .catch(error => { res.json({ error }) })
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
    const { name, sex, race, birthday, chipid } = req.body
    if (!name || !sex) {
        res.json({ result: false, error: 'Missing or empty fields' });
        return;
    }
    const newDog = new Dog({
        name: name,
        sex: sex,
        race: race || '',
        birthday: birthday || '',
        chipid: chipid || '',
        isTaken: false,
        isFake: false,
    });
    newDog.save().then(() => {
        res.json({ result: true, data: newDog })
    })
})

// PUT /dogs/id : update a dog (infos)
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

// PUT /dogs/id/status : update dog's status and isTaken  
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

// PUT /dogs/id/photo : update dogs photo
router.put('/:id/photo', async (req, res) => {
    const _id = req.params.id
    const photo = req.files.photo
    if (!photo) { res.json({ result: false, error: 'photo required' }); return }

    const options = { folder: 'wap/dogs' }

    // Uploader le fichier vers Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) {
            console.error('Erreur Cloudinary:', error)
            res.json({ result: false, error })
            return
        }
        let old_public_id = null
        Dog.findById(_id)
            .then(dog => {
                if (dog) {
                    old_public_id = dog.photo_public_id
                    dog.photo = result.secure_url
                    dog.photo_public_id = result.public_id
                    // console.log(dog)
                    return dog.save()
                }
            })
            .then(savedDog => {
                if (savedDog) {
                    console.log(savedDog.photo_public_id)
                    const resultDestroy = cloudinary.uploader.destroy(old_public_id)
                    // console.log(resultDestroy)
                    res.json({ result: true, data: savedDog })
                }
            })
    })

    // Envoyer les données du fichier au stream
    uploadStream.end(photo.data);
})


module.exports = router;
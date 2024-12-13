var express = require('express');
var router = express.Router();

require('../models/connexion');
const User = require('../models/users');
const Dog = require('../models/dogs');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');
const { convertRegionToMeters } = require('../modules/convertRegionToMeters')
const uniqid = require('uniqid')

// POST /users/signup : sign up
router.post('/signup', (req, res) => {
  const { firstname, lastname, email, telephone, password, dogs } = req.body

  if (!firstname || !lastname || !email || !telephone || !password) { // check body
    res.json({ result: false, error: 'Missing or empty fields' })
    return
  }

  User.findOne({ "infos.email": req.body.email }).then(data => { // Check if the user has not already been registered
    if (data) { res.json({ result: false, error: 'User already exists' }) }
    return
  })

  const hash = bcrypt.hashSync(req.body.password, 10)
  const newUser = new User({
    infos: { firstname, lastname, telephone, email },
    password: hash,
    token: uid2(32),
    dogs: req.body.dogs,
    isFake: false,
    status: 'off',
    friends: { accepted: [], incoming: [], outcoming: [], blocked: [] },
    currentLocation: { type: 'Point', coordinates: [0, 0] }
  })

  newUser.save().then(newDoc => {
    res.json({ result: true, token: newDoc.token });
    console.log(newDoc)
  })
    .catch(error => { res.json({ result: false, error: error }) })
})

// POST /users/checkmail : check if email exists before sign up
router.post('/checkmail', (req, res) => {
  User.findOne({ 'infos.email': req.body.email }).then(data => {
    if (!data) { res.json({ result: false }) }
    else { res.json({ result: true }) }
  });
});

// POST /users/signin : sign in
router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ "infos.email": req.body.email }).then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, data: data });
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
  });
});




// GET /users
router.get('/', (req, res) => {

  const longitude = parseFloat(req.query.longitude)
  const latitude = parseFloat(req.query.latitude)
  const longitudeDelta = parseFloat(req.query.longitudeDelta)
  const latitudeDelta = parseFloat(req.query.latitudeDelta)
  // console.log({ longitude, latitude, longitudeDelta, latitudeDelta })

  let usersQuery = null

  if (longitude && latitude && latitudeDelta && longitudeDelta) {

    const { widthInMeters, heightInMeters } = convertRegionToMeters(latitudeDelta, longitudeDelta, latitude) // map width & height in meters
    const maxDistance = Math.floor((widthInMeters > heightInMeters) ? widthInMeters : heightInMeters)
    // console.log('max distance', maxDistance)
    const location = { type: "Point", coordinates: [longitude, latitude] }
    // console.log('location', location)

    usersQuery = {
      currentLocation: {
        $near: {
          $geometry: location,
          $minDistance: 0,
          $maxDistance: maxDistance,
        }
      }
    }
  }

  User.find(usersQuery, { _id: 1, token: 1, currentLocation: 1 }).then(data => {
    if (data) {
      console.log('users', data.length)
      res.json({ result: true, data: data })
    }
    else {
      res.json({ result: true, data: [] }) // returns an empty array if no results
    }
  })

})


// GET unique user
router.get('/:token', (req, res) => {
  const token = req.params.token

  User.findOne({ token: token }).then(data => {
    if (data) {
      res.json({ result: true, data: data })
    }
    else {
      res.json({ result: false, error: `Token not found : ${token}` })
    }
  })

})


// PUT /users/id      update user infos (password optional)
router.put('/:id', (req, res) => {
  const token = req.params.id
  const { firstname, lastname, telephone, email, isDogSitter, isSearchingDogSitter, password } = req.body

  if ((!firstname || !lastname || !telephone || !email) || (typeof isDogSitter !== 'boolean' || typeof isSearchingDogSitter !== 'boolean')) { // check body
    res.json({ result: false, error: 'Invalid form data' })
    return
  }

  if (password !== '') { // update password if not empty
    const hash = bcrypt.hashSync(password, 10);
    console.log('update password', hash)
    User.updateOne({ token: token }, { $set: { password: hash } }).catch(error => res.json({ return: false, error }))
  }


  User.updateOne({ token: token }, { $set: { infos: { firstname, lastname, telephone, email, isDogSitter, isSearchingDogSitter } } })
    .then(data => {
      console.log(data)
      if (data.matchedCount > 0) { res.json({ result: true, data: data }) }
      else { res.json({ result: false, data: data }) }
    })
    .catch(error => res.json({ result: false, error: error }))
})

// PUT /users/id/status : update users status
router.put('/:id/status', (req, res) => {
  const token = req.params.id
  const { status } = req.body

  if (!status) {
    res.json({ result: false, error: 'Invalid form data : missing status field' })
    return
  }

  User.updateOne({ token: token }, { $set: { status } })
    .then(data => {
      console.log(data)
      if (matchedCount > 0) {
        res.json({ result: true, data: data })
      }
      else {
        res.json({ result: false, data: data })
      }
    })
    .catch(error => {
      res.json({ result: false, error: error })
    })
})


// PUT /users/id/photo : update users photo
router.put('/:token/photo', async (req, res) => {
  const token = req.params.token
  const photo = req.files.userPhoto
  const photoPath = `../tmp/${uniqid()}.jpg`
  const resultMove = await photo.mv(photoPath)

  if (!resultMove) {

    res.json({ result: true });
  }
  else { res.json({ result: false, error: resultMove }) }
})


module.exports = router;

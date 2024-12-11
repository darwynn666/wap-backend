var express = require('express');
var router = express.Router();

require('../models/connexion');
const User = require('../models/users');
const Dog = require('../models/dogs');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');
const { convertRegionToMeters } = require('../modules/convertRegionToMeters')

// sign up
router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['lastname', 'firstname', 'email', 'telephone', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // Check if the user has not already been registered
  User.findOne({ "infos.email": req.body.email }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);
      const newUser = new User({
        infos: {
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          telephone: req.body.telephone,
          email: req.body.email,
        },
        password: hash,
        token: uid2(32),
        dogs: req.body.dogs,
        isFake: false,

      });

      newUser.save().then(newDoc => {
        res.json({ result: true, token: newDoc.token });
        console.log(newDoc)
      });

    } else {
      // User already exists in database
      res.json({ result: false, error: 'User already exists' });
    }
  });
});

// check if email exists before sign up
router.post('/checkmail', (req, res) => {
  User.findOne({ 'infos.email': req.body.email }).then(data => {
    if (data === null) {
      res.json({ result: false });
    } else {
      res.json({ result: true });
      console.log(data)
    }
  });
});

// sign in
router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ "infos.email": req.body.email }).then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, token: data.token });
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

  User.find(usersQuery).then(data => {
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


// PUT /users/id      update user
router.put('/:id', (req, res) => {
  const token = req.params.id
  const { firstname, lastname, telephone, email, photo, isDogSitter, isSearchingDogSitter } = req.body
  console.log(req.body)

  if (!firstname || !lastname || !telephone || !email || !photo || !isDogSitter || !isSearchingDogSitter) {
    res.json({ result: false, error: 'Invalid form data' })
    return
  }

  User.updateOne({ token: token }, { $set: { infos: { firstname, lastname, telephone, email, photo, isDogSitter, isSearchingDogSitter } } })
    .then(data => {
      console.log(data)
      if (data.matchedCount > 0) {
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
      res.json({ result: true, data: data })
    })
    .catch(error => {
      res.json({ result: false, error: error })
    })
})



module.exports = router;

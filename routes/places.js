var express = require('express');
var router = express.Router();

require('../models/connexion');
const Places = require('../models/places');
const { checkBody } = require('../modules/checkBody');
const { convertRegionToMeters } = require('../modules/convertRegionToMeters')

// POST /places
router.post('/', (req, res) => {

  if (!checkBody(req.body, ['name', 'houseNumber', 'street', 'postcode', 'city', 'longitude', 'latitude', 'description', 'type'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  const newPlace = new Places({
    name: req.body.name,
    houseNumber: req.body.houseNumber,
    street: req.body.street,
    postcode: req.body.postcode,
    city: req.body.city,
    description: req.body.description,
    type: req.body.type,
    isFake: false,
    photo: '',
    users: [],
    location: { type: 'Point', coordinates: [req.body.longitude, req.body.latitude] }
  });

  console.log(newPlace)
  // res.json({ result: true })

  newPlace.save().then(() => {
    res.json({ result: true })
    // console.log(newPlace);
  });

});


// GET /places
router.get('/', (req, res) => {

  const longitude = parseFloat(req.query.longitude)
  const latitude = parseFloat(req.query.latitude)
  const longitudeDelta = parseFloat(req.query.longitudeDelta)
  const latitudeDelta = parseFloat(req.query.latitudeDelta)
  // console.log({ longitude, latitude, longitudeDelta, latitudeDelta })

  let placesQuery = null

  if (longitude && latitude && latitudeDelta && longitudeDelta) {

    const { widthInMeters, heightInMeters } = convertRegionToMeters(latitudeDelta, longitudeDelta, latitude) // map width & height in meters
    const maxDistance = Math.floor((widthInMeters > heightInMeters) ? widthInMeters : heightInMeters)
    // console.log('max distance', maxDistance)
    const location = { type: "Point", coordinates: [longitude, latitude] }
    // console.log('location', location)

    placesQuery = {
      location: {
        $near: {
          $geometry: location,
          $minDistance: 0,
          $maxDistance: maxDistance,
        }
      }
    }
  }

  Places.find(placesQuery).then(data => {
    if (data) {
      console.log('places: ', data.length)
      res.json({ result: true, data: data })
    } else {
      res.json({ result: false })
    }
  })
})

// GET /places/id/users : get users of one place
router.get('/:id/users', (req, res) => {
  const _id = req.params.id

  Places.findOne({ _id })
    .then(place => {
      console.log(place.users)
      res.json({ ressult: true, users: place.users })
    })
    .catch(error => { res.json({ error }); return })
})



//  PUT /places/id/users/user_id : add or remove (toggle) an user from a place
// body{ user_id }
router.put('/:place_id/users/:user_id', async (req, res) => {
  const { place_id, user_id } = req.params

  // get users
  const place = await Places.findOne({ _id: place_id })
  console.log(place)
  if (place.users) {
    if (place.users.includes(user_id)) { place.users = place.users.filter(e => e != user_id) }
    else { place.users.push(user_id) }
    //update bdd
    response = await Places.updateOne({ _id: place_id }, { $set: { users: place.users } })
    console.log(response)
    res.json({result:true,users:place.users})
  }
  else {
    res.json({ result: false, error: 'place not found' })
  }


})
module.exports = router;
var express = require('express');
var router = express.Router();

require('../models/connexion');
const Places = require('../models/places');
const { checkBody } = require('../modules/checkBody');
const { convertRegionToMeters } = require('../modules/convertRegionToMeters')

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


module.exports = router;
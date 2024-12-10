var express = require('express');
var router = express.Router();

require('../models/connexion');
const Places = require('../models/places');
const { checkBody } = require('../modules/checkBody');

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

router.get('/', (req, res) => {
  const { lon, lat } = parseFloat(req.query)
  if (lon && lat) {
    console.log('filter', lon, lat)

    Places.find(
      {
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [lon, lat] },
            $minDistance: 0,
            $maxDistance: 10000
          }
        }
      }
    )

      .then(data => {
        if (data) {
          console.log('places: ', data.length)
          res.json({ result: true, data: data })
        } else {
          res.json({ result: false })
        }
      })
  }
  else {
    Places.find().then(data => {
      if (data) {
        console.log('places: ', data.length)
        res.json({ result: true, data: data })
      } else {
        res.json({ result: false })
      }
    })
  }
})


module.exports = router;
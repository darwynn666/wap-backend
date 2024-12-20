var express = require('express');
var router = express.Router();

require('../models/connexion');
const Places = require('../models/places');
const { checkBody } = require('../modules/checkBody');
const { convertRegionToMeters } = require('../modules/convertRegionToMeters')
const cloudinary = require('cloudinary').v2;

// reset (for dev) : reset all places
router.get('/reset', (req, res) => {
  Places.deleteMany({ isFake: false }).then(data => {
    res.json({ data })
})
    .catch(error => { res.json({ error }) })
})


// POST /places : add a place EXCEPT description and photo
router.post('/', (req, res) => {

  const { name, type, longitude, latitude, housenumber, street, postcode, city } = req.body


  if (!checkBody(req.body, ['name', 'housenumber', 'street', 'postcode', 'city', 'longitude', 'latitude', 'type'])) {
    res.json({ result: false, error: 'Missing or empty fields' })
    return
  }

  const newPlace = new Places({
    name: name,
    houseNumber: housenumber,
    street: street,
    postcode: postcode,
    city: city,
    type: type,
    isFake: false,
    photo: '',
    description: '',
    users: [],
    location: { type: 'Point', coordinates: [longitude, latitude] }
  })

  console.log(newPlace)

  newPlace.save().then(() => {
    res.json({ result: true, place: newPlace })
  })

})

// PUT /places/id/step2 : update photo and description (final step for a new place)
router.put('/:id/step2', (req, res) => {
  const _id = req.params.id
  const description = req.body.description

  Places.updateOne({ _id: _id }, { $set: { description } }).then(data => {
    console.log(data)
    res.json({ result: true, data })
  })
})

// PUT /places/id/photo : update place's photo
router.put('/:id/photo', (req, res) => {
  console.log('route put')
  const _id = req.params.id
  const photo = req.files.photo
  if (!photo) { res.json({ result: false, error: 'photo required' }); return }

  const options = { folder: 'wap/places' }

  // Uploader le fichier vers Cloudinary
  const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
    if (error) {
      console.error('Erreur Cloudinary:', error)
      res.json({ result: false, error })
      return
    }
    let old_public_id = null
    Places.findById(_id)
      .then(place => {
        if (place) {
          old_public_id = place.photo_public_id
          place.photo = result.secure_url
          place.photo_public_id = result.public_id
          // console.log(place)
          return place.save()
        }
      })
      .then(savedPlace => {
        if (savedPlace) {
          console.log(savedPlace.photo_public_id)
          const resultDestroy = cloudinary.uploader.destroy(old_public_id)
          // console.log(resultDestroy)
          res.json({ result: true, data: savedPlace })
        }
      })
  })

  // Envoyer les données du fichier au stream
  uploadStream.end(photo.data);
})

// PUT /place/id : update a place





// GET /places : get all lplaces
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

// GET /places/near/longitude/latitude/distance : get all places near given coordinates
router.get('/near/:longitude/:latitude/:distance', (req, res) => {
  const { longitude, latitude, distance } = req.params
  if (!longitude || !latitude || !distance) {
    res.json({ result: false, error: 'required params : GET /places/near/longitude/latitude/distance' })
    return
  }
  if (isNaN(Number(longitude)) || isNaN(Number(latitude)) || isNaN(Number(distance))) {
    res.json({ result: false, error: 'must be numbers : { longitude, latitude, distance }' })
    return
  }

  console.log(req.params)
  const location = { type: "Point", coordinates: [longitude, latitude] }


  const placeQuery = {
    location: {
      $near: {
        $geometry: location,
        $minDistance: 0,
        $maxDistance: distance,
      }
    }
  }

  Places.find(placeQuery).then(places => {
    if (places) {
      console.log('places', places.length)
      res.json({ result: true, places: places })
    }
    else {
      res.json({ result: false, error: 'no place found' })
    }
  })
    .catch(error => { res.json({ result: false, error }); return })
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
    res.json({ result: true, users: place.users })
  }
  else {
    res.json({ result: false, error: 'place not found' })
  }


})



module.exports = router;
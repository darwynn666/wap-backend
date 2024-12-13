var express = require('express');
var router = express.Router();
const {generateDogsData} = require ('../modules/generate_data_dogs')
const {generateUsersData} = require('../modules/generate_data_users')
const {generatePlacesData} = require('../modules/generate_data_places')

/* GET users listing. */
router.get('/dogs/:nbDogs', async (req, res) => {
  const nbDogs=req.params.nbDogs;
  //res.send('genereate dogs');
  const reponse = await generateDogsData(nbDogs);
  console.log('rep',reponse)
  res.json(reponse)
});

router.get('/users/:nbUsers', async (req, res) => {
  const nbUsers=req.params.nbUsers;
  const reponse = await generateUsersData(nbUsers);
  console.log('rep',reponse)
  res.json(reponse)
});

router.get('/places/:nbPlaces', async (req, res) => {
  const nbPlaces=req.params.nbPlaces;
  const reponse = await generatePlacesData(nbPlaces);
  console.log('rep',reponse)
  res.json(reponse)
});

router.post('/users', async (req, res) => {
  res.json({result:"test"})
  console.log("post")
 });


module.exports = router;

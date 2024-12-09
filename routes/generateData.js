var express = require('express');
var router = express.Router();
const {generateDogsData} = require ('../modules/generate_data_dogs')
const {generateUsersData} = require('../modules/generate_data_users')

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
  res.json({result:"under test"})
});

module.exports = router;

var express = require('express');
var router = express.Router();
const {generateData} = require ('../modules/generate_data')

/* GET users listing. */
router.get('/dogs/:nbDogs', async (req, res) => {
  const nbDogs=req.params.nbDogs;
  //res.send('genereate dogs');
  const reponse = await generateData(nbDogs);
  console.log('rep',reponse)
  res.json(reponse)
});

module.exports = router;

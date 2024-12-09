var express = require('express');
var router = express.Router();
const {generateData} = require ('../modules/generate_data')

/* GET users listing. */
router.get('/dogs/:nbDogs', function(req, res, next) {
  const nbDogs=req.params.nbDogs;
  res.send('genereate dogs');
  generateData(nbDogs)
});

module.exports = router;

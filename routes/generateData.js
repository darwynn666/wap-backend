var express = require('express');
var router = express.Router();
const {generateData} = require ('../modules/generate_data')

/* GET users listing. */
router.get('/', function(req, res, next) {

  res.send('genereate data');
  generateData(100)
});

module.exports = router;

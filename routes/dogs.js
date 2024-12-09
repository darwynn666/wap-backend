var express = require('express');
var router = express.Router();
require('../models/connexion');
const { checkBody } = require('../modules/checkBody');
const Dog = require('../models/dogs');


router.post('/', (req, res) => {
    if (!checkBody(req.body, ['name', 'sex'])) {
        res.json({ result: false, error: 'Missing or empty fields' });
        return;
      }
    //Dog.findOne().then(data => {
        const newdog = new Dog({
            name: req.body.name,
            sex: req.body.sex,
            race: req.body.race,
            birthday: req.body.birthday,
            status: req.body.status,
            chipid: req.body.chipid,
            isTaken: false,
            isFake:false,
        });
       
        newdog.save().then(() => {
            res.json({ result: true , data: newdog})
            console.log(Dog)
        })


        //   else {
        // res.json({ result: false, error: "veuillez saisir le nom" })
    })
//});
module.exports = router;
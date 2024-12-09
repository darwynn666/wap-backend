var express = require('express');
var router = express.Router();
require('../models/connexion');
const Dog = require('../models/dogs');


router.post('/', (req, res) => {
    //Dog.findOne().then(data => {
        const newdog = new Dog({
            name: req.body.name,
            sex: req.body.sex,
            race: req.body.race,
            birthday: req.body.birthday,
            status: req.body.status,
            chipid: req.body.chipid,
            isTaken: false,
        });
       
        newdog.save().then(() => {
            res.json({ result: true, Dog: data })
            console.log(Dog)
        })


        //   else {
        // res.json({ result: false, error: "veuillez saisir le nom" })
    })
//});
module.exports = router;
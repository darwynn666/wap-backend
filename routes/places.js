var express = require('express');
var router = express.Router();

require('../models/connexion');
const Places = require('../models/places');

router.post('/', (req, res) => {
   // console.log(req.body.location)
        const newplace = new Places({
            name: req.body.name,
            houseNumber: req.body.number,
            street: req.body.street,
            postcode: req.body.postcode,
            city: req.body.city,
            location: req.body.location,
            description: req.body.description,
            type: req.body.type,
            isFake: false,
            photo: req.body.photo,
            users: req.body.id,
        });
       
        newplace.save().then(() => {
            res.json({ result: true })
            console.log(newplace);
        });
    });

    router.get('/',(req, res) => {
        Places.find().then(data=>{
          console.log(data)
          if (data) {
            res.json({result: true,data})
          } else {
            res.json({result: false})
          }
        })
      })
      

    module.exports = router;
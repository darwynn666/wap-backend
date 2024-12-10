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
    const newDog = new Dog({
        name: req.body.name,
        sex: req.body.sex,
        race: req.body.race,
        birthday: req.body.birthday,
        status: req.body.status,
        chipid: req.body.chipid,
        isTaken: false,
        isFake: false,
    });

    newDog.save().then(() => {
        res.json({ result: true, data: newDog })
        console.log(Dog)
    })

})

router.put('/updatedog/:_id', (req, res) => {
    id=req.params.id
    Dog.findOne({id}).then(data=>{
        console.log(data)
        data.name=req.body.name;
        data.photo=req.body.photo;
        data.sex=req.body.sex;
        data.race=req.body.race;
        data.birthday=req.body.birthday;
        data.status=req.body.status;
        data.chipid=req.body.chipid;
        data.isTaken=req.body.isTaken;
    
        data.save().then(dataupdated => {
            res.json({ result: true, message: "modifications effectuées", data: dataupdated })
          })
    })

})


module.exports = router;
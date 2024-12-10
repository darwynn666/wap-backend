var express = require('express');
var router = express.Router();

require('../models/connexion');
const User = require('../models/users');
const Dog = require('../models/dogs');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');

router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['lastname', 'firstname', 'email', 'telephone', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // Check if the user has not already been registered
  User.findOne({ "infos.email": req.body.email }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);
      const newUser = new User({
        infos: {
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          telephone: req.body.telephone,
          email: req.body.email,
        },
        password: hash,
        token: uid2(32),
        dogs: req.body.dogs,
        isFake: false,

      });

      // const newDog = new Dog ({
      //   name:req.body.name,
      //   sex: req.body.sex,
      // })

      newUser.save().then(newDoc => {
        res.json({ result: true, token: newDoc.token });
        console.log(newDoc)
      });

    } else {
      // User already exists in database
      res.json({ result: false, error: 'User already exists' });
    }
  });
});

router.post('/signin', (req, res) => {
  if (!checkBody(req.body, [ 'email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  } cd

  User.findOne({ "infos.email": req.body.email }).then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, token: data.token });
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
  });
});

router.post('/checkmail', (req, res) => {
  User.findOne({ 'infos.email': req.body.email }).then(data => {
    if (data === null) {
      res.json({ result: false });
    } else {
      res.json({ result: true});
      console.log(data)
    }
  });
});

router.get('/:token',(req, res) => {
  User.findOne({'token':req.body.token}).then(data=>{
    console.log(data)
    if (data=== null) {
      res.json({result: false,error: 'user not found'})
    } else {
      res.json({result: true, data})
    }
  });
});

router.put('/:token',(req, res) =>{

})




module.exports = router;

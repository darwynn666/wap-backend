var express = require('express');
var router = express.Router();
require('../models/connexion');
const { checkBody } = require('../modules/checkBody');
const Dog = require('../models/dogs');
const User = require('../models/users')


// default
router.get('/', (req, res) => {
    res.json({ result: false, error: 'missing token, try /friends/token' })
})

// GET /friends/token returns user's friends
router.get('/:token', (req, res) => {
    const token = req.params.token
    User.findOne({ token: token })
        .populate('friends')
        .then(user => {
            console.log(user)
            if (user) { res.json({ result: true, data: user.friends }) }
            else { res.json({ result: false, error: 'No user found, bad token' }) }
        })
})



module.exports = router;
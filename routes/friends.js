var express = require('express');
var router = express.Router();
require('../models/connexion');
const { checkBody } = require('../modules/checkBody');
const Dog = require('../models/dogs');
const User = require('../models/users')


// default
router.get('/', (req, res) => {
    res.json({ message: 'test route' })
})

// GET /friends/id returns user's friends
router.get('/:token', (req, res) => {
    const token = req.params.token
    User.findOne({ token: token })
        // .populate('friends')
        .then(user => {
            // console.log(user.friends)
            if (user) { res.json({ result: true, data: user.friends }) }
            else { res.json({ result: false, error: 'No user found, bad token' }) }
        })
        .catch(error => { res.json({ error: error }) })
})

// POST /friend/id/outcoming
router.post('/:token/outcoming', async (req, res) => {
    const token = req.params.token
    const { friendFrom, friendTo } = req.body
    if (!friendFrom || !friendTo) { res.json({ result: false, error: 'missing form fields' }); return }

    // get friends from both users (FROM and TO)
    const userFrom = await User.findOne({ token: token }).catch(error => { res.json({ error: error }) })
    const userTo = await User.findById(friendTo).catch(error => { res.json({ error: error }) })
    if (!userFrom || !userTo) { res.json({ result: false, error: 'unknown user' }); return }

    let modifCount = 0
    if (!userFrom.friends.outcoming.includes(friendTo)) {
        userFrom.friends.outcoming.push(friendTo)
        console.log('update', token, userFrom.friends.outcoming, friendTo)
        User.updateOne({ token: token }, { $set: { 'friends.outcoming': userFrom.friends.outcoming } })
            .then((data) => { modifCount++ })
            .catch(error => { res.json({ error: error }) })
    }
    if (!userTo.friends.incoming.includes(friendFrom)) {
        userTo.friends.incoming.push(friendFrom)
        User.updateOne({ _id: friendTo }, { $set: { 'friends.incoming': userTo.friends.incoming } })
            .then((data) => {modifCount++})
            .catch(error => { res.json({ error: error }) })
    }


    if (modifCount === 2) {
        res.json({ result: true, userFrom, userTo })
    }
    else {
        res.json({ result: false, modifCount })
    }


})

module.exports = router;
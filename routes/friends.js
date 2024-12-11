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

    let success = 0
    if (!userFrom.friends.outcoming.includes(friendTo)) {
        userFrom.friends.outcoming.push(friendTo)
        User.updateOne({ token: token }, { $set: { 'friends-outcoming': userFrom.friends.outcoming } })
            .then(success++)
            .catch(error => { res.json({ error: error }) })
    }
    if (!userTo.friends.incoming.includes(friendFrom)) {
        userTo.friends.incoming.push(friendFrom)
        User.updateOne({ _id: friendTo }, { $set: { 'friends-incoming': userTo.friends.incoming } })
            .then(success++)
            .catch(error => { res.json({ error: error }) })
    }


    if(success===2) {
        res.json({ result:true,userFrom, userTo })
    }

    // User.updateOne({ token: token }, { $push: { 'friends.outcoming': friendTo } })
    //     .then(data1 => {
    //         if (data1.matchedCount > 0) {
    //             User.updateOne({ _id: friendTo }, { $push: { 'friends.incoming': friendFrom } })
    //                 .then(data2 => {
    //                     if (data2.matchedCount > 0) {
    //                         res.json({ result: true, data: { data1, data2 } })
    //                     }
    //                     else { res.json({ result: false, error: 'unable to update user TO' }) }
    //                 })
    //                 .catch(error => { res.json({ error: error }) })
    //         }
    //         else { res.json({ result: false, error: 'unable to update user FROM' }) }
    //     })
    //     .catch(error => { res.json({ error: error }) })
})

module.exports = router;
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
        .then(user => {
            console.log(user.friends)
            if (user) { res.json({ result: true, data: user.friends }) }
            else { res.json({ result: false, error: 'No user found, bad token' }) }
        })
        .catch(error => { res.json({ result: false, error }) })
})


// GET /friends/id/incoming : get list of incoming friend's demands
router.get('/:token/incoming', (req, res) => {
    const token = req.params.token
    User.findOne({ token: token }).then(user => {
        res.json({ result: true, incoming: user.friends.incoming })
    })
        .catch(error => { res.json({ result: false, error }) })
})

// GET /friends/id/outcoming : get list of outcoming friend's demands
router.get('/:token/outcoming', (req, res) => {
    const token = req.params.token
    User.findOne({ token: token }).then(user => {
        res.json({ result: true, outcoming: user.friends.outcoming })
    })
        .catch(error => { res.json({ result: false, error }) })
})


// POST /friend/id/outcoming, send a demand to a friend // AJOUTER VERIF SI FRIEND TO PAS BLOQUE
router.post('/:token/outcoming', async (req, res) => {
    const token = req.params.token
    const { friendFrom, friendTo } = req.body
    if (!friendFrom || !friendTo) { res.json({ result: false, error: 'missing form fields' }); return }

    const userFrom = await User.findOne({ token: token }).catch(error => { res.json({ result: false, error }) }) // me
    const userTo = await User.findById(friendTo).catch(error => { res.json({ result: false, error }) }) // the friend
    if (!userFrom || !userTo) return

    const myId = userFrom._id
    const hisId = userTo._id
    const userToIsFake = userTo.isFake
    const myFriends = userFrom.friends
    const hisFriends = userTo.friends
    const hisToken = userTo.token

    if (myFriends.accepted.includes(hisId) || hisFriends.accepted.includes(myId)) { // check if relation already exists
        res.json({ result: false, error: 'this relation already exists', myFriends, hisFriends })
        return
    }

    if (myFriends.outcoming.includes(hisId) && hisFriends.incoming.includes(myId)) { // check if this demand exists
        res.json({ result: false, error: 'this demand already exists' })
        return
    }

    myFriends.outcoming.push(hisId)
    hisFriends.incoming.push(myId)

    const promises = []

    promises.push(
        User.updateOne({ token: token }, { $set: { friends: myFriends } }).catch(error => { res.json({ result: false, error }); return }),
        User.updateOne({ _id: hisId }, { $set: { friends: hisFriends } }).catch(error => { res.json({ result: false, error }); return })
    )

    Promise.all(promises).then(async () => { // execute two queries
        // if fake user automate the response
        if (userToIsFake)
        {
            const delay = 15000 //5 secondes


            setTimeout(async () => {
                //get the server url
                const baseUrl = `${req.protocol}://${req.get('host')}`;
                console.log(baseUrl)
                const response = await fetch(`${baseUrl}/friends/${hisToken}/incoming`, {
                    method: 'PUT',
                    headers: {
                        'Content-type': 'application/json'
                       },
                   body: JSON.stringify({friendFrom:myId,accept:true}) 
                }); 
            }, delay);
        }
            

        res.json({ result: true, userFromFriends: userFrom.friends, userToFriends: userTo.friends })
    })
        .catch(error => { res.json({ result: false, error }) }); return

})


// PUT /friends/id/incoming : accept or refuse a demand
router.put('/:token/incoming', async (req, res) => {
    const token = req.params.token
    const { friendFrom, accept } = req.body
    if (!friendFrom || typeof accept !== 'boolean') { res.json({ result: false, error: 'missing fields' }) }

    const userTo = await User.findOne({ token: token }).catch(error => { res.json({ result: false, error }) }) // it's me
    const userFrom = await User.findById(friendFrom).catch(error => { res.json({ result: false, error }) }) // the other one
    if (!userTo || !userFrom) return

    const myId = userTo._id
    const hisId = userFrom._id
    const myFriends = userTo.friends
    const hisFriends = userFrom.friends
    console.log(myFriends, hisFriends)

    if (!myFriends.incoming.includes(hisId) || !hisFriends.outcoming.includes(myId)) { // check if demand really exists
        res.json({ result: false, error: 'this demand doesnt exists', myFriends, hisFriends })
        return
    }

    console.log('myId', myId, 'hisId', hisId)

    const promises = []

    if (accept) {
        myFriends.accepted.push(hisId) // add his id to my friends
        hisFriends.accepted.push(myId) // add my id to his friends
    }

    myFriends.incoming = myFriends.incoming.filter(id => !id.equals(hisId)) // remove his id from my incoming
    hisFriends.outcoming = hisFriends.outcoming.filter(id => !id.equals(myId)) // remove my id from his outcoming

    console.log('my friends', myFriends)
    console.log('his friends', hisFriends)

    promises.push(
        User.updateOne({ token: token }, { $set: { friends: myFriends } }).catch(error => { res.json({ result: false, error }) }), // update my friends
        User.updateOne({ _id: hisId }, { $set: { friends: hisFriends } }).catch(error => { res.json({ result: false, error }) }) // update his friendss
    )

    Promise.all(promises).then(() => {
        res.json({ result: true, userFromFriends: myFriends, userToFriends: hisFriends })
    })
        .catch(error => { res.json({ result: false, error }) })
})


// DELETE /friends/id/outcoming : cancel an outcoming demand
router.delete('/:token/outcoming', async (req, res) => {
    const token = req.params.token
    const { friendTo } = req.body
    if (!friendTo) { res.json({ result: false, error: 'missing field friendTo' }) }

    const userFrom = await User.findOne({ token: token }).catch(error => { res.json({ result: false, error }) }) // me
    const userTo = await User.findById(friendTo).catch(error => { res.json({ result: false, error }) }) // the friend
    if (!userFrom || !userTo) return

    
    const myId = userFrom._id
    const hisId = userTo._id
    const myFriends = userFrom.friends
    const hisFriends = userTo.friends
    console.log(myId,userTo)

    if (!myFriends.outcoming.includes(hisId) || !hisFriends.incoming.includes(myId)) { // check if demand really exists
        res.json({ result: false, error: 'this demand doesnt exists', myFriends, hisFriends })
        return
    }

    myFriends.outcoming = myFriends.outcoming.filter(id => !id.equals(hisId)) // remove his id from my outcoming
    hisFriends.incoming = hisFriends.incoming.filter(id => !id.equals(myId)) // remove my id from his intcoming

    console.log('my friends', myFriends)
    console.log('his friends', hisFriends)

    const promises = []
    promises.push(
        User.updateOne({ token: token }, { $set: { friends: myFriends } }).catch(error => { res.json({ result: false, error }) }), // update my friends
        User.updateOne({ _id: hisId }, { $set: { friends: hisFriends } }).catch(error => { res.json({ result: false, error }) }) // update his friendss
    )

    Promise.all(promises).then(() => {
        res.json({ result: true, userFromFriends: myFriends, userToFriends: hisFriends })
    })
        .catch(error => { res.json({ result: false, error }) })
})


// DELETE /friends/id : delete a friend
router.delete('/:token', async (req, res) => {
    const token = req.params.token
    const { friendToDelete } = req.body
    if (!friendToDelete) { res.json({ result: false, error: 'missing field friendToDelete' }) }

    const user = await User.findOne({ token: token }).catch(error => { res.json({ result: false, error }) }) // me
    const userToDelete = await User.findById(friendToDelete).catch(error => { res.json({ result: false, error }) }) // the friend
    if (!user || !userToDelete) return

    const myId = user._id
    const hisId = userToDelete._id
    const myFriends = user.friends
    const hisFriends = userToDelete.friends

    if (!myFriends.accepted.includes(hisId) || !hisFriends.accepted.includes(myId)) { // check if relation really exists
        res.json({ result: false, error: 'this relation doesnt exists', myFriends, hisFriends })
        return
    }

    myFriends.accepted = myFriends.accepted.filter(id => !id.equals(hisId)) // remove his id from my friends
    hisFriends.accepted = hisFriends.accepted.filter(id => !id.equals(myId)) // remove my id from his friends

    console.log('my friends', myFriends)
    console.log('his friends', hisFriends)

    const promises = []
    promises.push(
        User.updateOne({ token: token }, { $set: { friends: myFriends } }).catch(error => { res.json({ result: false, error }) }), // update my friends
        User.updateOne({ _id: hisId }, { $set: { friends: hisFriends } }).catch(error => { res.json({ result: false, error }) }) // update his friendss
    )

    Promise.all(promises).then(() => {
        res.json({ result: true, userFriends: myFriends, userToDeleteFriends: hisFriends })
    })
        .catch(error => { res.json({ result: false, error }) })
})


// POST /friends/id/block : block a person
router.post('/:token/block', async (req, res) => {
    const token = req.params.token
    const { friendToBlock } = req.body
    if (!friendToBlock) { res.json({ result: false, error: 'missing field friendToBlock' }) }

    const user = await User.findOne({ token: token }).catch(error => { res.json({ result: false, error }) }) // me
    const userToBlock = await User.findById(friendToBlock).catch(error => { res.json({ result: false, error }) }) // the friend
    if (!user || !userToBlock) return

    const myId = user._id
    const hisId = userToBlock._id
    const myFriends = user.friends
    const hisFriends = userToBlock.friends

    if (myFriends.blocked.includes(hisId)) { // check if relation really exists
        res.json({ result: false, error: 'this friend has already been blocked', myFriends, hisFriends })
        return
    }

    myFriends.blocked.push(hisId) // add him to my block list
    myFriends.accepted = myFriends.accepted.filter(id => !id.equals(hisId)) // remove his id from my friends
    hisFriends.accepted = hisFriends.accepted.filter(id => !id.equals(myId)) // remove my id from his friends

    const promises = []

    promises.push(
        User.updateOne({ token: token }, { $set: { friends: myFriends } }).catch(error => { res.json({ result: false, error }) }), // update my friends
        User.updateOne({ _id: hisId }, { $set: { friends: hisFriends } }).catch(error => { res.json({ result: false, error }) }) // update his friendss
    )

    Promise.all(promises).then(() => {
        res.json({ result: true, userFriends: myFriends, userToBlockFriends: hisFriends })
    })
        .catch(error => { res.json({ result: false, error }) })

})

// DELETE /friends/id/block : unblock a person
router.delete('/:token/block', async (req, res) => {
    const token = req.params.token
    const { friendToUnBlock } = req.body
    if (!friendToUnBlock) { res.json({ result: false, error: 'missing field friendToBlock' }) }

    const user = await User.findOne({ token: token }).catch(error => { res.json({ result: false, error }) }) // me
    const userToUnBlock = await User.findById(friendToUnBlock).catch(error => { res.json({ result: false, error }) }) // the friend
    if (!user || !userToUnBlock) return

    const myId = user._id
    const hisId = userToUnBlock._id
    const myFriends = user.friends
    const hisFriends = userToUnBlock.friends

    myFriends.blocked = myFriends.blocked.filter(id => !id.equals(hisId)) // remove him from my block list

    User.updateOne({ token: token }, { $set: { friends: myFriends } }).catch(error => { res.json({ result: false, error }) }) // update my friends
        .then(() => {
            res.json({ result: true, userFriends: myFriends, userToUnBlockFriends: hisFriends })
        })
        .catch(error => { res.json({ result: false, error }) })

})

module.exports = router;
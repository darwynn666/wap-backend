var express = require("express");
var router = express.Router();

require("../models/connexion");
const User = require("../models/users");
const Dog = require("../models/dogs");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const { convertRegionToMeters } = require("../modules/convertRegionToMeters");
const uniqid = require("uniqid");
const cloudinary = require("cloudinary").v2;

// POST /users/signup : sign up
router.post("/signup", (req, res) => {
  const { firstname, lastname, email, telephone, password, dogs } = req.body;
  if (!firstname || !lastname || !email || !telephone || !password) {
    // check body
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  User.findOne({ "infos.email": req.body.email }).then((data) => {
    // Check if the user has not already been registered
    if (data) {
      res.json({ result: false, error: "User already exists" });
    }
    return;
  });

  const hash = bcrypt.hashSync(req.body.password, 10);
  const _newUser = {
    infos: { firstname, lastname, telephone, email },
    password: hash,
    token: uid2(32),
    dogs: req.body.dogs,
    isFake: false,
    status: "off",
    friends: { accepted: [], incoming: [], outcoming: [], blocked: [] },
    currentLocation: { type: "Point", coordinates: [0, 0] },
  };

  const newUser = new User(_newUser);

  newUser.save().then((newDoc) => {
    //remove password
    delete _newUser.password;
    res.json({ result: true, data: _newUser });
  });
  //   .catch(error => { res.json({ result: false, error: error }) })
});

// POST /users/checkmail : check if email exists before sign up
router.post("/checkmail", (req, res) => {
  User.findOne({ "infos.email": req.body.email }).then((data) => {
    if (!data) {
      res.json({ result: false });
    } else {
      res.json({ result: true });
    }
  });
});

// POST /users/signin : sign in
router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  User.findOne({ "infos.email": req.body.email })
    // .populate('dogs')
    .then((data) => {
      if (data && bcrypt.compareSync(req.body.password, data.password)) {
        res.json({ result: true, data: data });
        console.log(data);
      } else {
        res.json({ result: false, error: "User not found or wrong password" });
      }
    });
});

// GET /users
router.get("/", (req, res) => {
  const longitude = parseFloat(req.query.longitude);
  const latitude = parseFloat(req.query.latitude);
  const longitudeDelta = parseFloat(req.query.longitudeDelta);
  const latitudeDelta = parseFloat(req.query.latitudeDelta);
  // console.log({ longitude, latitude, longitudeDelta, latitudeDelta })

  let usersQuery = null;

  if (longitude && latitude && latitudeDelta && longitudeDelta) {
    const { widthInMeters, heightInMeters } = convertRegionToMeters(
      latitudeDelta,
      longitudeDelta,
      latitude
    ); // map width & height in meters
    const maxDistance = Math.floor(
      widthInMeters > heightInMeters ? widthInMeters : heightInMeters
    );
    // console.log('max distance', maxDistance)
    const location = { type: "Point", coordinates: [longitude, latitude] };
    // console.log('location', location)

    usersQuery = {
      currentLocation: {
        $near: {
          $geometry: location,
          $minDistance: 0,
          $maxDistance: maxDistance,
        },
      },
    };
  }

  User.find(usersQuery, { _id: 1, currentLocation: 1 }).then((data) => {
    if (data) {
      console.log("users", data.length);
      res.json({ result: true, data: data });
    } else {
      res.json({ result: true, data: [] }); // returns an empty array if no results
    }
  });
});

// GET /users/id : get unique user by his id
router.get("/:id", (req, res) => {
  const id = req.params.id;

  User.findById(id, { password: 0, token: 0, friends: 0 })
    .populate("dogs")
    .then((data) => {
      if (data) {
        res.json({ result: true, data: data });
      } else {
        res.json({ result: false, error: `Id not found : ${id}` });
      }
    })
    .catch((error) => {
      res.json({ result: false, error });
      return;
    });
});

// GET /users/me/token : get connected user by his token
router.get("/me/:token", (req, res) => {
  const token = req.params.token;

  User.findOne({ token: token }, { password: 0 })
    // .populate('dogs')
    .then((data) => {
      if (data) {
        res.json({ result: true, data: data });
      } else {
        res.json({ result: false, error: `Token not found : ${token}` });
      }
    })
    .catch((error) => {
      res.json({ result: false, error });
      return;
    });
});

// PUT /users/id      update user infos (password optional)
router.put("/:id", (req, res) => {
  const token = req.params.id;
  const {
    firstname,
    lastname,
    telephone,
    email,
    isDogSitter,
    isSearchingDogSitter,
    password,
    photo,
    photo_public_id,
  } = req.body;

  if (
    !firstname ||
    !lastname ||
    !telephone ||
    !email ||
    typeof isDogSitter !== "boolean" ||
    typeof isSearchingDogSitter !== "boolean"
  ) {
    // check body
    res.json({ result: false, error: "Invalid form data" });
    return;
  }

  if (password !== "") {
    // update password if not empty
    const hash = bcrypt.hashSync(password, 10);
    console.log("update password", hash);
    User.updateOne({ token: token }, { $set: { password: hash } }).catch(
      (error) => res.json({ return: false, error })
    );
  }

  User.updateOne(
    { token: token },
    {
      $set: {
        "infos.firstname": firstname,
        "infos.lastname": lastname,
        "infos.telephone": telephone,
        "infos.email": email,
        "infos.isDogSitter": isDogSitter,
        "infos.isSearchingDogSitter": isSearchingDogSitter,
      },
    }
  )
    .then((data) => {
      console.log(data);
      if (data.matchedCount > 0) {
        res.json({ result: true, data: data });
      } else {
        res.json({ result: false, data: data });
      }
    })
    .catch((error) => res.json({ result: false, error: error }));
});

// PUT /users/id/status : update users status
router.put("/:id/status", (req, res) => {
  const token = req.params.id;
  const { status } = req.body;

  if (!status) {
    res.json({
      result: false,
      error: "Invalid form data : missing status field",
    });
    return;
  }

  User.updateOne({ token: token }, { $set: { status } })
    .then((data) => {
      // console.log(data)
      if (data.matchedCount > 0) {
        res.json({ result: true, data: data });
      } else {
        res.json({ result: false, data: data });
      }
    })
    .catch((error) => {
      res.json({ result: false, error: error });
    });
});

// PUT /users/id/newdog : update users dogs list
router.put("/:token/newdog", (req, res) => {
  const token = req.params.token;
  const { dogId } = req.body;
  if (!dogId) {
    res.json({ result: false, error: "required dog_id" });
  }

  User.findOne({ token: token })
    .then((user) => {
      if (user) {
        const myDogs = user.dogs;
        if (myDogs.includes(dogId)) {
          res.json({ result: false, error: "user already owns this dog" });
          return;
        } else {
          myDogs.push(dogId);
          User.updateOne({ token: token }, { $set: { dogs: myDogs } })
            .then(() => {
              res.json({ result: true, data: myDogs });
            })
            .catch((error) => {
              res.json({ result: false, error });
              return;
            });
        }
      } else {
        res.json({ result: false, error: "user doesnt exists" });
      }
    })
    .catch((error) => {
      res.json({ result: false, error });
      return;
    });
});

// PUT /users/id/photo : update users photo
router.put("/:token/photo", async (req, res) => {
  const token = req.params.token;
  const photo = req.files.photo;
  if (!photo) {
    res.json({ result: false, error: "photo required" });
    return;
  }

  const options = { folder: "wap/users" };

  // Uploader le fichier vers Cloudinary
  const uploadStream = cloudinary.uploader.upload_stream(
    options,
    (error, result) => {
      if (error) {
        console.error("Erreur Cloudinary:", error);
        res.json({ result: false, error });
        return;
      }
      let old_public_id = null;
      User.findOne({ token: token })
        .then((user) => {
          if (user) {
            old_public_id = user.infos.photo_public_id;
            user.infos.photo = result.secure_url;
            user.infos.photo_public_id = result.public_id;
            // console.log(user)
            return user.save();
          }
        })
        .then((savedUser) => {
          if (savedUser) {
            console.log(savedUser.infos.photo_public_id);
            const resultDestroy = cloudinary.uploader.destroy(old_public_id);
            console.log(resultDestroy);
            res.json({ result: true, data: savedUser });
          }
        });
    }
  );

  // Envoyer les données du fichier au stream
  uploadStream.end(photo.data);
});

// PUT /users/id/coordinates : update users coordinates
router.put("/:token/coordinates", (req, res) => {
  const token = req.params.token;
  const { longitude, latitude } = req.body;
  if (
    !longitude ||
    !latitude ||
    isNaN(Number(longitude)) ||
    isNaN(Number(latitude))
  ) {
    res.json({
      result: false,
      error: "Invalid params : { Number(longitude), Number(latitude) }",
    });
    return;
  }
  const currentLocation = {
    type: "Point",
    coordinates: [longitude, latitude],
  };
  User.updateOne({ token }, { $set: { currentLocation } })
    .then((user) => {
      if (user.matchedCount > 0) {
        res.json({ result: true, currentLocation });
      } else {
        res.json({ result: false, error: "user not found" });
      }
    })
    .catch((error) => {
      res.json({ result: false, error });
    });
});
module.exports = router;

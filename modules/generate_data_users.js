const cloudinary = require("cloudinary").v2;

const uid2 = require("uid2");

const { CLOUDINARY_MEN_PATH, CLOUDINARY_WOMEN_PATH } = require("./config");
const { lastname, womenFirstname, menFirstname } = require("./name_src");

const Dog = require("../models/dogs");
const User = require("../models/users");

const {
  getRandomElement,
  removeAccents,
  getRandomInt,
  getRandomLocationInFrance,
} = require("./tools");


const getImagesUrl = async (cloudinaryFolders) => {
  try {
    const Pictures = await cloudinary.api.resources_by_asset_folder(
      cloudinaryFolders,
      { max_results: 500 }
    );
    return await Pictures.resources.map((x) => x.url);
  } catch (e) {
    console.log(e);
  }
};

const generateUsersData = async (nbUsers) => {
  //delete previous users
  const responseDelete = await User.deleteMany({ isFake: true });

  const fakeDogs = await Dog.find({ isFake: true });
  const fakeDogsId = fakeDogs.map((dog) => dog._id);
  const fakeDogIdRandom = getRandomElement(fakeDogsId);

  const menPictures = await getImagesUrl(CLOUDINARY_MEN_PATH);
  const womenPictures = await getImagesUrl(CLOUDINARY_WOMEN_PATH);

  const lastnameRandom = getRandomElement(lastname);
  const menFirstnameRandom = getRandomElement(menFirstname);
  const womenFirstnameRandom = getRandomElement(womenFirstname);
  const menPhotoRandom = getRandomElement(menPictures);
  const womenPhotoRandom = getRandomElement(womenPictures);

  console.log(`create ${nbUsers} users documents`);

  const users = [];

  for (let i = 0; i < nbUsers; i++) {
    console.log('create user '+i)
    const user = {};
    const infos = {};
    infos.lastname = lastnameRandom();
    //alternate man/woman
    if (i % 2) {
      //man
      infos.firstname = menFirstnameRandom();
      infos.photo = menPhotoRandom();
    } else {
      //women
      infos.firstname = womenFirstnameRandom();
      infos.photo = womenPhotoRandom();
    }
    infos.telephone = `06${getRandomInt(99999999)}`;
    infos.email = `${removeAccents(
      infos.firstname
    ).toLowerCase()}.${removeAccents(
      infos.lastname
    ).toLowerCase()}@example.com`;
    const isDogSitter = [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      true,
    ];
    infos.isDogSitter = isDogSitter[getRandomInt(isDogSitter.length)];
    const isSearchingDogSitter = [false, false, false, false, true];
    infos.isSearchingDogSitter =
      isSearchingDogSitter[getRandomInt(isSearchingDogSitter.length)];
    user.infos = infos;
    user.password = uid2(24);
    user.token = uid2(32);
    const status = ["off", "walk", "pause"];
    user.status = status[getRandomInt(status.length)];
    const randomGeo = await getRandomLocationInFrance();
    user.homeLocation = randomGeo.geometry;
    user.currentLocation = user.homeLocation;
    user.dogs = [];
    const dogsNumbers = [1, 1, 1, 1, 1, 1, 2, 2, 3];
    let dogsNumber = dogsNumbers[getRandomInt(dogsNumbers.length)];
    for (let i = 0; i < dogsNumber; i++)
      user.dogs.push(fakeDogIdRandom())
    user.friends={accepted:[],incoming:[],outcoming:[],blocked:[]}
    user.isFake=true
    users.push(user)
  }

  //insert in db
  const response = await User.insertMany(users);
  // console.log(response);
  console.log("generate users Done");
  if (response.length > 0)
    return ({ result: true, status: `${response.length} created in bdd` });
  else return ({ result: false, status: `error` });
};

module.exports = { generateUsersData };

//import
const cloudinary = require("cloudinary").v2;
const uid2 = require("uid2");

require("../models/connexion");
const Dog = require("../models/dogs");

const { dog_male_name, dog_female_name } = require("./name_src");
const { getRandomInt, getRandomElement, getRandomDate } = require("./tools");

//constants
const {CLOUDINARY_DOGS_PATH} = require('./config')

const generateDogsData = async (nbDogs) => {
  //delete all fakeData
  // const await Dog.deleteMany({ lastName: 'Awesome' })
  const responseDelete = await Dog.deleteMany({ isFake: true });
  console.log(responseDelete);

  console.log(`create ${nbDogs} dogs documents`);
  //get the numbers of folder in cloudinary that corresponding to breed of dog
  //be carrefull to set max_results to 500 , 10 is the value by default
  const dogBreed = await cloudinary.api.sub_folders(CLOUDINARY_DOGS_PATH, {
    max_results: 500,
  });
  // get the folders array
  const dogBreedArray = dogBreed.folders;
  //construct on objct with the breedName as key and array of pictures in value
  // const dogImagesByBreed = await (async (dogBreedArrayFolder) => {
  let dogImagesByBreed = {};
  const responses = await Promise.all(
    dogBreedArray.map(async (breed) => {
      const Pictures = await cloudinary.api.resources_by_asset_folder(
        breed.path,
        { max_results: 500 }
      );
      dogImagesByBreed[breed.name] = Pictures.resources.map((x) => x.url);
    })
  );

  //get the keys of the object
  const breedName = Object.keys(dogImagesByBreed);

  //
  const dogSexRandom = getRandomElement(["male", "female"]);
  const dogMaleNameRandom = getRandomElement(dog_male_name);
  const dogFemaleNameRandom = getRandomElement(dog_female_name);
  const dogRaceRandom = getRandomElement(breedName);
  const statusArr = [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "malade",
    "en chaleur",
    "jeune",
    "vieux",
    "joueur",
  ];
  const dogStatusRandom = getRandomElement(statusArr);

  const dogs = [];
  for (let i = 0; i < nbDogs; i++) {
    const dog = {};
    //random sex
    dog.sex = dogSexRandom();
    // get random name by sex
    if (dog.sex === "male") dog.name = dogMaleNameRandom();
    else dog.name = dogFemaleNameRandom();
    //get the random breed
    dog.race = dogRaceRandom();
    //get a random photo
    dog.photo =
      dogImagesByBreed[dog.race][
        getRandomInt(dogImagesByBreed[dog.race].length)
      ];
    //birthday
    dog.birthday = getRandomDate(7);
    //status
    dog.status = dogStatusRandom();
    //chipId
    dog.chipId = uid2(6);
    //isTaken with his owner
    dog.isTaken = true;
    //isFalse
    dog.isFake = true;
    dogs.push(dog);
  }
  //insert in db
  const response = await Dog.insertMany(dogs);
  // console.log(response);
  console.log("generate dogs Done");
  if (response.length > 0)
    return ({ result: true, status: `${response.length} dogs created in bdd` });
  else return ({ result: false, status: `error` });
};

module.exports = { generateDogsData };

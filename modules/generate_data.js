//import
const cloudinary = require("cloudinary").v2;
const uid2 = require('uid2');

const { dog_male_name, dog_female_name } = require("./name_src");
const { getRandomInt, getRandomElement,getRandomDate } = require("./tools");

//constants
const CLOUDINARY_APP_PATH = "wap";
const CLOUDINARY_DOGS_PATH = `${CLOUDINARY_APP_PATH}/dogs`;

const generateDogsData = async (nbDogs) => {
  console.log(`create ${nbDogs} dogs documents`);
  //get the numbers of folder in cloudinary that corresponding to breed of dog
  //be carrefull to set max_results to 500 , 10 is the value by default
  const dogBreed = await cloudinary.api.sub_folders(CLOUDINARY_DOGS_PATH, {
    max_results: 500,
  });
  // get the folders array
  const dogBreedArray = dogBreed.folders;
  //construct on objct with the breedName as key and array of pictures in value
  const dogImagesByBreed = await (async (dogBreedArrayFolder) => {
    try {
      let dogImagesByBreedTmp = {};
      const responses = await Promise.all(
        dogBreedArray.map(async (breed) => {
          const breedImage = {};
          const Pictures = await cloudinary.api.resources_by_asset_folder(
            breed.path,
            { max_results: 500 }
          );
          dogImagesByBreedTmp[breed.name] = Pictures.resources.map(
            (x) => x.url
          );
        })
      );
      return dogImagesByBreedTmp;
    } catch (error) {
      console.error("Erreur dans le fetch :", error);
    }
  })(dogBreedArray);

  //get the keys of the object
  const breedName = Object.keys(dogImagesByBreed);
  console.log(breedName);

  //
  const dogSexRandom = getRandomElement(["male", "female"]);
  const dogMaleNameRandom = getRandomElement(dog_male_name);
  const dogFemaleNameRandom = getRandomElement(dog_female_name);
  const dogRaceRandom = getRandomElement(breedName);
  const statusArr=["","","","","","","","","","","","","malade","en chaleur","jeune","vieux","joueur"]
  const dogStatusRandom = getRandomElement(statusArr);

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
    dog.birthday = getRandomDate(7)
    //status
    dog.status = dogStatusRandom()
    //chipId
    dog.chipId = uid2(6)
    //isTaken with his owner
    dog.isTaken = false
    //isFalse 
    dog.isFalse = true
    console.log(dog);
  }
};

const generateData = async (nbDogs) => {
  generateDogsData(nbDogs);
};

module.exports = { generateData };

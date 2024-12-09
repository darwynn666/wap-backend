//import
const cloudinary = require("cloudinary").v2;

const { dog_male_name, dog_female_name } = require("./name_src");
const {getRandomInt, getRandomElement} = require('./tools')

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

  const dogPhotosByBreed = {}
  console.log(dogBreed)
  //
  const dogSexRandom = getRandomElement(['male','female']);
  const dogMaleNameRandom = getRandomElement(dog_male_name);
  const dogFemaleNameRandom = getRandomElement(dog_female_name);
  const dogRaceRandom = getRandomElement(dog_female_name);

  for (let i = 0; i < nbDogs; i++) {
    const dog = {};
    //random sex
    dog.sex = dogSexRandom();
    // get random name by sex
    if (dog.sex==='male')
      dog.name = dogMaleNameRandom();
    else
      dog.name = dogFemaleNameRandom();
    //get the random breed
    // dog.race = dogFemaleNameRandom();
    console.log(dog);
  }
};

const generateData = async (nbDogs) => {
  generateDogsData(nbDogs);
};

module.exports = { generateData };

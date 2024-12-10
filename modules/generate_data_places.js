//import
const cloudinary = require("cloudinary").v2;

require("../models/connexion");
const Places = require("../models/places");
const User = require("../models/users");

const {
  generateDescriptionRestaurant,
  generateDescriptionBar,
  generateDescriptionPark,
  genererDescriptionShops,
} = require("./description_generator");

const {
  restaurants_name,
  bars_name,
  shops_name,
  parks_name,
} = require("./name_src");
const {
  getRandomInt,
  getRandomElement,
  getRandomLocationInFrance,
} = require("./tools");

//constants
const { CLOUDINARY_PLACES_PATH } = require("./config");

const generatePlacesData = async (nbPlaces) => {
  //delete all fakeData
  // const await Dog.deleteMany({ lastName: 'Awesome' })
  const responseDelete = await Places.deleteMany({ isFake: true });
  console.log(responseDelete);

  const fakeUsers = await User.find({ isFake: true });
  const fakeUserRandom = getRandomElement(fakeUsers);

  console.log(`create ${nbPlaces} places documents`);
  //get the numbers of folder in cloudinary that corresponding to places
  //be carrefull to set max_results to 500 , 10 is the value by default
  const placesTypesResponse = await cloudinary.api.sub_folders(
    CLOUDINARY_PLACES_PATH,
    {
      max_results: 500,
    }
  );
  // get the folders array
  const placesTypes = placesTypesResponse.folders;
  //construct on objct with the placesTypeName as key and array of pictures in value
  let placesImagesByType = {};
  const responses = await Promise.all(
    placesTypes.map(async (place) => {
      const Pictures = await cloudinary.api.resources_by_asset_folder(
        place.path,
        { max_results: 500 }
      );
      placesImagesByType[place.name] = Pictures.resources.map((x) => x.url);
    })
  );

  //get the keys of the object
  const placeName = Object.keys(placesImagesByType);

  const probabilitiesType = [
    "restaurants",
    "restaurants",
    "restaurants",
    "restaurants",
    "bars",
    "bars",
    "bars",
    "bars",
    "parks",
    "parks",
    "garbages",
    "garbages",
    "garbages",
    "shops",
  ];

  const restaurantsNameRandom = getRandomElement(restaurants_name);
  const barsNameRandom = getRandomElement(bars_name);
  const parksNameRandom = getRandomElement(parks_name);
  const shopsNameRandom = getRandomElement(shops_name);

  const location = await getRandomLocationInFrance();

  let places = []

  for (let i = 0; i < nbPlaces; i++) {
    console.log("create place "+i)
    const place = {};
    place.type = probabilitiesType[getRandomInt(probabilitiesType.length)];
    switch (place.type) {
      case "restaurants":
        place.name = restaurantsNameRandom();
        place.description = generateDescriptionRestaurant();
        break;
      case "bars":
        place.name = barsNameRandom();
        place.description = generateDescriptionBar();
        break;
      case "parks":
        place.name = parksNameRandom();
        place.description = generateDescriptionPark();
        break;
      case "garbages":
        place.name = "";
        place.description = "";
        break;
      case "shops":
        place.name = shopsNameRandom();
        place.description = genererDescriptionShops();
        break;
      default:
        console.log(`error of type`);
    }
    place.photo =
      placesImagesByType[place.type][
        getRandomInt(placesImagesByType[place.type].length)
      ];
    place.location = location.geometry;
    place.houseNumber = location.properties.housenumber;
    place.street = location.properties.street;
    place.postcode = location.properties.postcode;
    place.city = location.properties.city;
    place.isFake = true;
    const probabilitiesUser = [0, 0, 1, 1, 1, 1, 2, 2];
    const placeUsers = [];
    for (
      let i = 0;
      i < probabilitiesUser[getRandomInt(probabilitiesUser.length)];
      i++
    ) {
      const user = fakeUserRandom();
      placeUsers.push(user._id);
      //change user location
      user.currentLocation = place.location;
      const responseUser = await user.save();
    }

    place.users = placeUsers;
    
    places.push(place)
  }

  //insert in db
  const response = await Places.insertMany(places);
  // console.log(response);
  console.log("generate places done");
  if (response.length > 0)
    return { result: true, status: `${response.length} places created in bdd` };
  else return { result: false, status: `error` };
};

module.exports = { generatePlacesData };

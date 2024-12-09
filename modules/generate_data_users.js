const cloudinary = require("cloudinary").v2;
const uid2 = require("uid2");
const { CLOUDINARY_MEN_PATH, CLOUDINARY_WOMEN_PATH } = require("./config");
const { lastname, womenFirstname, menFirstname } = require("./name_src");
const { getRandomElement ,removeAccents,getRandomInt, getRandomLocationInFrance } = require("./tools");

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
  const menPictures = await getImagesUrl(CLOUDINARY_MEN_PATH);
  const womenPictures = await getImagesUrl(CLOUDINARY_WOMEN_PATH);

  const lastnameRandom = getRandomElement(lastname);
  const menFirstnameRandom = getRandomElement(menFirstname);
  const womenFirstnameRandom = getRandomElement(womenFirstname);
  const menPhotoRandom = getRandomElement(menPictures);
  const womenPhotoRandom = getRandomElement(womenPictures);

  console.log(`create ${nbUsers} users documents`);

  for (let i = 0; i < nbUsers; i++) {
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
    infos.telephone = `06${getRandomInt(99999999)}`
    infos.email = `${removeAccents(infos.firstname).toLowerCase()}.${removeAccents(infos.lastname).toLowerCase()}@example.com`
    const isDogSitter = [false,false,false,false,false,false,false,false,false,true]
    infos.isDogSitter = isDogSitter[getRandomInt(isDogSitter.length)];
    const isSearchingDogSitter = [false,false,false,false,true]
    infos.isSearchingDogSitter = isSearchingDogSitter[getRandomInt(isSearchingDogSitter.length)]
    user.infos = infos
    user.password = uid2(24)
    user.token=uid2(32)
    const status=['off','walk','pause']
    user.status = status[getRandomInt(status.length)]
    console.log(await getRandomLocationInFrance())
    user.currentLocation = await getRandomLocationInFrance()
    // console.log(user);
  }
};

module.exports = { generateUsersData };

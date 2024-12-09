const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
};

const getRandomElement = (array) => {
  //get a copy
  let remaining = [];

  const getRandomElementInside = () => {
    if (remaining.length == 0) remaining = [...array];
    //get an element
    const randomIndex = getRandomInt(remaining.length);
    const randomElement = remaining.splice(randomIndex, 1)[0]; // delete and return element
    return randomElement;
  };

  return getRandomElementInside;
};

function getRandomDate(nbYear) {
  const now = new Date(); // Date actuelle
  const sevenYearsAgo = new Date();
  sevenYearsAgo.setFullYear(now.getFullYear() - nbYear); // Date d'il y a 7 ans

  // Convertir en timestamps
  const nowTimestamp = now.getTime();
  const sevenYearsAgoTimestamp = sevenYearsAgo.getTime();

  // Générer un timestamp aléatoire
  const randomTimestamp =
    Math.random() * (nowTimestamp - sevenYearsAgoTimestamp) +
    sevenYearsAgoTimestamp;

  // Retourner une date à partir du timestamp
  return new Date(randomTimestamp);
}

const removeAccents = (str) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

async function getRandomLocationInFrance() {
  const apiUrl = "https://api-adresse.data.gouv.fr/reverse/";
  
  while (true) {
      //  generate coord France
      const randomCoordinates = {
          lat: (Math.random() * (51.089 - 42.33) + 42.33).toFixed(6), // Latitude entre le Nord et le Sud de la France
          lon: (Math.random() * (9.56 - (-4.86)) + (-4.86)).toFixed(6) // Longitude entre l'Est et l'Ouest de la France
      };

      try {
          // try to find
          const response = await fetch(`${apiUrl}?&limit=1&lat=${randomCoordinates.lat}&lon=${randomCoordinates.lon}`);
          const data = await response.json();
          // console.log(data)

          // if find
          if (data.features && data.features.length > 0) {
              const feature = data.features[0]; // first result
              return  feature.geometry;
          }
      } catch (error) {
          // console.error("Erreur lors de la requête à l'API :", error);
      }
  }
}


module.exports = {
  getRandomInt,
  getRandomElement,
  getRandomDate,
  removeAccents,
  getRandomLocationInFrance,
};

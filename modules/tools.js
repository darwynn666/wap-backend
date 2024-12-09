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
    const randomTimestamp = Math.random() * (nowTimestamp - sevenYearsAgoTimestamp) + sevenYearsAgoTimestamp;
  
    // Retourner une date à partir du timestamp
    return new Date(randomTimestamp);
  }

module.exports = {getRandomInt,getRandomElement,getRandomDate}
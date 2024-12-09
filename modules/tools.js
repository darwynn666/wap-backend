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

module.exports = {getRandomInt,getRandomElement}
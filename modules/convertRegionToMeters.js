const convertRegionToMeters = (latitudeDelta, longitudeDelta, latitude) => {

  const earthRadiusAtEquator = 111320; // En mètres, distance approximative pour 1° de latitude/longitude à l'équateur

  // Calcul de la largeur et de la hauteur de la région en mètres
  const heightInMeters = latitudeDelta * earthRadiusAtEquator;
  const widthInMeters = longitudeDelta * earthRadiusAtEquator * Math.cos((latitude * Math.PI) / 180);

  return { widthInMeters, heightInMeters };
}

module.exports = { convertRegionToMeters }

// Exemple d'utilisation
// const region = {
//   latitudeDelta: 0.1, // Exemple
//   longitudeDelta: 0.1,
//   latitude: 48.8566, // Latitude pour Paris
// };

// const result = convertRegionToMeters(region.latitudeDelta, region.longitudeDelta, region.latitude);
// console.log(`Width: ${result.widthInMeters} meters, Height: ${result.heightInMeters} meters`);

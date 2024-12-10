// Générateur de descriptions de restaurants
function generateDescriptionRestaurant() {
  const typesCuisine = [
    "italienne",
    "japonaise",
    "française",
    "mexicaine",
    "indienne",
    "thaïlandaise",
    "méditerranéenne",
    "américaine",
  ];

  const ambiances = [
    "chaleureuse et conviviale",
    "moderne et élégante",
    "intimiste et romantique",
    "animée et familiale",
    "raffinée et luxueuse",
    "authentique et traditionnelle",
  ];

  const specialites = [
    "des pizzas cuites au feu de bois",
    "des sushis frais et savoureux",
    "des plats gastronomiques exquis",
    "des tacos épicés et gourmands",
    "des currys parfumés et colorés",
    "des woks riches en saveurs",
    "des burgers généreux et faits maison",
  ];

  const emplacements = [
    "au cœur de la ville",
    "dans une ruelle pittoresque",
    "près d'un parc tranquille",
    "sur une place animée",
    "dans un quartier historique",
  ];

  const pointsForts = [
    "un service attentionné",
    "une terrasse ensoleillée",
    "une carte des vins exceptionnelle",
    "une ambiance musicale apaisante",
    "des produits frais et locaux",
    "des options végétariennes et véganes",
  ];

  // Sélection aléatoire d'éléments
  const typeCuisine =
    typesCuisine[Math.floor(Math.random() * typesCuisine.length)];
  const ambiance = ambiances[Math.floor(Math.random() * ambiances.length)];
  const specialite =
    specialites[Math.floor(Math.random() * specialites.length)];
  const emplacement =
    emplacements[Math.floor(Math.random() * emplacements.length)];
  const pointFort = pointsForts[Math.floor(Math.random() * pointsForts.length)];

  // Construction de la description
  return `Découvrez ce restaurant ${typeCuisine}, offrant une ambiance ${ambiance}. Situé ${emplacement}, il propose ${specialite} et ${pointFort}. Une expérience culinaire inoubliable vous attend !`;
}

// Générateur de descriptions de bars
function generateDescriptionBar() {
  const typesBar = [
    "cocktail-bar",
    "bar à bières artisanales",
    "wine-bar",
    "pub irlandais",
    "bar à tapas",
    "bar lounge",
    "bar à thèmes",
    "speakeasy caché",
  ];

  const ambiances = [
    "cosy et intimiste",
    "festive et animée",
    "chic et sophistiquée",
    "décontractée et conviviale",
    "électrique et vibrante",
    "bohème et artistique",
  ];

  const specialites = [
    "des cocktails signature créatifs",
    "une sélection de vins d'exception",
    "des bières artisanales locales",
    "des spiritueux rares",
    "des tapas savoureuses",
    "des mocktails rafraîchissants",
  ];

  const emplacements = [
    "au cœur du centre-ville",
    "dans un quartier branché",
    "dans une ruelle cachée",
    "sur une terrasse avec vue panoramique",
    "dans un espace industriel réaménagé",
  ];

  const pointsForts = [
    "un happy hour incontournable",
    "une ambiance musicale live",
    "un DJ résident pour des soirées inoubliables",
    "un décor original et instagrammable",
    "des événements thématiques chaque semaine",
    "un personnel chaleureux et accueillant",
  ];

  // Sélection aléatoire d'éléments
  const typeBar = typesBar[Math.floor(Math.random() * typesBar.length)];
  const ambiance = ambiances[Math.floor(Math.random() * ambiances.length)];
  const specialite =
    specialites[Math.floor(Math.random() * specialites.length)];
  const emplacement =
    emplacements[Math.floor(Math.random() * emplacements.length)];
  const pointFort = pointsForts[Math.floor(Math.random() * pointsForts.length)];

  // Construction de la description
  return `Bienvenue dans ce ${typeBar} offrant une ambiance ${ambiance}. Situé ${emplacement}, il vous propose ${specialite} et ${pointFort}. Venez vivre une soirée mémorable dans un cadre unique !`;
}

// Générateur de descriptions de parcs
function generateDescriptionPark() {
  const typesParc = [
    "parc naturel",
    "parc urbain",
    "jardin botanique",
    "réserve écologique",
    "parc à thème",
    "parc forestier",
    "promenade au bord d’un lac",
    "espace vert communautaire",
  ];

  const ambiances = [
    "calme et apaisante",
    "animée et familiale",
    "sauvage et préservée",
    "romantique et fleurie",
    "énergique et sportive",
    "culturelle et éducative",
  ];

  const activites = [
    "des sentiers de randonnée pittoresques",
    "des aires de jeux pour enfants",
    "des espaces pour pique-niquer",
    "des parcours sportifs en plein air",
    "des jardins thématiques",
    "un lac pour des balades en barque",
    "des événements culturels et musicaux",
    "des zones dédiées à l’observation de la faune",
  ];

  const emplacements = [
    "au cœur de la ville",
    "dans une vallée verdoyante",
    "au sommet d’une colline",
    "au bord d’un lac scintillant",
    "dans une forêt luxuriante",
    "près d’une rivière paisible",
  ];

  const pointsForts = [
    "des paysages magnifiques",
    "une biodiversité exceptionnelle",
    "un cadre idéal pour se ressourcer",
    "des installations modernes et bien entretenues",
    "des zones accessibles à tous",
    "un décor parfait pour les amateurs de photographie",
  ];

  // Sélection aléatoire d'éléments
  const typeParc = typesParc[Math.floor(Math.random() * typesParc.length)];
  const ambiance = ambiances[Math.floor(Math.random() * ambiances.length)];
  const activite = activites[Math.floor(Math.random() * activites.length)];
  const emplacement =
    emplacements[Math.floor(Math.random() * emplacements.length)];
  const pointFort = pointsForts[Math.floor(Math.random() * pointsForts.length)];

  // Construction de la description
  return `Découvrez ce ${typeParc} offrant une ambiance ${ambiance}. Situé ${emplacement}, il propose ${activite} et ${pointFort}. Une destination idéale pour petits et grands, en quête de nature et de sérénité !`;
}

// Générateur de descriptions pour des magasins d'accessoires pour chiens
function genererDescriptionShops() {
    const typesProduits = [
      "des colliers et laisses élégants",
      "des jouets interactifs et robustes",
      "des coussins et paniers confortables",
      "des vêtements stylés pour toutes les saisons",
      "des friandises naturelles et saines",
      "des gamelles modernes et pratiques",
      "des produits d’hygiène adaptés",
    ];
  
    const ambiances = [
      "chaleureuse et accueillante",
      "moderne et design",
      "conviviale et familiale",
      "raffinée et spécialisée",
      "dynamique et colorée",
    ];
  
    const services = [
      "un service de conseil personnalisé",
      "des ateliers pour l'éducation canine",
      "un espace dédié aux soins et au toilettage",
      "une livraison rapide et efficace",
      "un programme de fidélité avantageux",
      "des produits sur-mesure pour votre chien",
    ];
  
    const emplacements = [
      "au cœur du centre-ville",
      "dans un quartier commerçant animé",
      "près d’un parc où promener vos chiens",
      "dans une zone facile d’accès avec parking",
      "dans une charmante ruelle piétonne",
    ];
  
    const pointsForts = [
      "une large sélection de produits premium",
      "des marques reconnues pour leur qualité",
      "des prix compétitifs pour tous les budgets",
      "des articles respectueux de l’environnement",
      "des nouveautés régulières à découvrir",
      "un accueil chaleureux pour vous et votre chien",
    ];
  
    // Sélection aléatoire d'éléments
    const typeProduit = typesProduits[Math.floor(Math.random() * typesProduits.length)];
    const ambiance = ambiances[Math.floor(Math.random() * ambiances.length)];
    const service = services[Math.floor(Math.random() * services.length)];
    const emplacement = emplacements[Math.floor(Math.random() * emplacements.length)];
    const pointFort = pointsForts[Math.floor(Math.random() * pointsForts.length)];
  
    // Construction de la description
    return `Bienvenue dans ce magasin d’accessoires pour chiens, avec une ambiance ${ambiance}. Situé ${emplacement}, nous proposons ${typeProduit}, ${service}, et ${pointFort}. Tout pour le bonheur de votre fidèle compagnon !`;
  }

  


module.exports = { generateDescriptionRestaurant, generateDescriptionBar,generateDescriptionPark,genererDescriptionShops };

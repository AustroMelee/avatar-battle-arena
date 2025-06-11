'use strict';

export const terrainTags = {
    "eastern-air-temple": ["air_rich", "vertical", "exposed", "open"],
    "northern-water-tribe": ["water_rich", "ice_rich", "slippery", "cold", "cramped"],
    "ba-sing-se": ["urban", "dense", "earth_rich", "cover_rich", "cramped"],
    "si-wong-desert": ["sandy", "open", "hot", "exposed", "shifting_ground"],
    "foggy-swamp": ["water_rich", "earth_rich", "plants_rich", "dense", "low_visibility", "slippery", "cramped"],
    "boiling-rock": ["industrial", "hot", "metal_rich", "precarious", "cramped", "exposed"],
    "fire-nation-capital": ["urban", "dense", "earth_rich", "hot", "cramped", "metal_rich"],
    "omashu": ["urban", "dense", "earth_rich", "vertical", "cramped", "cover_rich"],
    "great-divide": ["open", "exposed", "rocky", "vertical", "precarious"],
    "kyoshi-island": ["coastal", "open", "water_rich", "earth_rich", "cover_rich"]
};

export const locations = {
    'eastern-air-temple': { 
        name: "Eastern Air Temple", 
        terrain: "rocky outcrops and tiered platforms", 
        featureA: "rushing wind currents",
        featureB: "treacherous tiered platforms",
    },
    'northern-water-tribe': { 
        name: "Northern Water Tribe", 
        terrain: "intricate ice canals and slippery bridges", 
        featureA: "swirling water of the canals",
        featureB: "slippery ice bridges",
    },
    'ba-sing-se': { 
        name: "Ba Sing Se", 
        terrain: "crowded city streets and massive stone walls", 
        featureA: "towering stone walls",
        featureB: "labyrinthine city streets",
    },
    'si-wong-desert': { 
        name: "Si Wong Desert", 
        terrain: "vast, shifting sand dunes", 
        featureA: "scorching desert heat",
        featureB: "disorienting shimmering heat haze",
    },
    'foggy-swamp': { 
        name: "Foggy Swamp", 
        terrain: "dense, twisting vines and murky water", 
        featureA: "thick, disorienting fog",
        featureB: "gnarled, twisting vines",
    },
    'boiling-rock': { 
        name: "The Boiling Rock", 
        terrain: "narrow metal walkways over a boiling lake", 
        featureA: "scalding steam vents",
        featureB: "precarious metal walkways",
    },
    'fire-nation-capital': { 
        name: "Fire Nation Capital", 
        terrain: "tiered city of black rock and industrial zones", 
        featureA: "oppressive industrial heat",
        featureB: "narrow, dark alleyways",
    },
    'omashu': { 
        name: "Omashu", 
        terrain: "tiered city levels and giant stone buildings", 
        featureA: "towering stone buildings",
        featureB: "winding tiered pathways",
    },
    'great-divide': { 
        name: "Great Divide", 
        terrain: "sheer rocky cliffs and narrow ledges", 
        featureA: "echoing chasms",
        featureB: "sheer rocky cliffs",
    },
    'kyoshi-island': { 
        name: "Kyoshi Island", 
        terrain: "coastal village and open plains", 
        featureA: "crashing ocean waves",
        featureB: "quaint village houses",
    },
};
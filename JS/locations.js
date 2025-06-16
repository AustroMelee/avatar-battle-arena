'use strict';

export const terrainTags = {
    "eastern-air-temple": ["air_rich", "vertical", "exposed", "open", "precarious", "high_altitude"],
    "northern-water-tribe": ["water_rich", "ice_rich", "slippery", "cold", "cramped", "urban", "cover_rich"],
    "ba-sing-se": ["urban", "dense", "earth_rich", "cover_rich", "cramped", "vertical"],
    "si-wong-desert": ["sandy", "open", "hot", "exposed", "shifting_ground", "low_visibility"],
    "foggy-swamp": ["water_rich", "earth_rich", "plants_rich", "dense", "low_visibility", "slippery", "cramped"],
    "boiling-rock": ["industrial", "hot", "metal_rich", "precarious", "cramped", "exposed", "water_rich"],
    "fire-nation-capital": ["urban", "dense", "earth_rich", "hot", "cramped", "metal_rich", "industrial"],
    "omashu": ["urban", "dense", "earth_rich", "vertical", "cramped", "cover_rich", "precarious", "rocky"],
    "great-divide": ["open", "exposed", "rocky", "vertical", "precarious", "earth_rich"],
    "kyoshi-island": ["coastal", "open", "water_rich", "earth_rich", "cover_rich", "plants_rich"]
};

export const locations = {
    'eastern-air-temple': { 
        name: "Eastern Air Temple", 
        imageUrl: 'https://static.wikia.nocookie.net/avatar/images/1/13/Restored_Eastern_Air_Temple.png',
        featureA: "rushing wind currents",
        featureB: "treacherous tiered platforms",
    },
    'northern-water-tribe': { 
        name: "Northern Water Tribe City", 
        imageUrl: 'https://static1.cbrimages.com/wordpress/wp-content/uploads/2020/07/Northern-Water-Tribe-Caiptol.jpg',
        featureA: "swirling water of the canals",
        featureB: "slippery ice bridges",
    },
    'ba-sing-se': { 
        name: "Ba Sing Se (Lower Ring)", 
        imageUrl: 'https://64.media.tumblr.com/70504a59db039b4d070b9cd425274773/tumblr_n87buy49nr1rpfi93o1_1280.jpg',
        featureA: "towering stone walls",
        featureB: "labyrinthine city streets",
    },
    'si-wong-desert': { 
        name: "Si Wong Desert", 
        imageUrl: 'https://static.wikia.nocookie.net/avatar/images/1/1b/Si_Wong_rock.png',
        featureA: "scorching desert heat",
        featureB: "disorienting shimmering heat haze",
    },
    'foggy-swamp': { 
        name: "The Foggy Swamp", 
        imageUrl: 'https://static.wikia.nocookie.net/avatar/images/a/a7/Banyan-grove_tree.png',
        featureA: "thick, disorienting fog",
        featureB: "gnarled, twisting vines",
    },
    'boiling-rock': { 
        name: "The Boiling Rock", 
        imageUrl: 'https://static.wikia.nocookie.net/avatar/images/3/32/Boiling_Rock.png',
        featureA: "scalding steam vents",
        featureB: "precarious metal walkways",
    },
    'fire-nation-capital': { 
        name: "Fire Nation Capital Plaza", 
        imageUrl: 'https://static.wikia.nocookie.net/avatar/images/d/d3/Royal_Plaza_full.png',
        featureA: "oppressive industrial heat",
        featureB: "narrow, dark alleyways",
    },
    'omashu': { 
        name: "Omashu Delivery Chutes", 
        imageUrl: 'https://i.ytimg.com/vi/IRTDAJY93z4/maxresdefault.jpg',
        featureA: "towering stone buildings",
        featureB: "unpredictable delivery chutes",
    },
    'great-divide': { 
        name: "The Great Divide", 
        imageUrl: 'https://static.wikia.nocookie.net/avatar/images/f/f8/Great_Divide.png',
        featureA: "echoing chasms",
        featureB: "loose, crumbling scree",
    },
    'kyoshi-island': { 
        name: "Kyoshi Island Village", 
        imageUrl: 'https://static.wikia.nocookie.net/avatar/images/f/f3/Kyoshi_Island_overview.png',
        featureA: "crashing ocean waves",
        featureB: "quaint village houses",
    },
};

export const locationPhaseOverrides = {
    'eastern-air-temple': {
        pokingDuration: 2 // Air temple battles tend to start more aggressively
    },
    'northern-water-tribe': {
        pokingDuration: 3 // Water tribe battles are more methodical
    },
    'ba-sing-se': {
        pokingDuration: 2 // Urban environment leads to quicker escalation
    },
    'si-wong-desert': {
        pokingDuration: 1 // Desert heat makes fighters more aggressive
    },
    'foggy-swamp': {
        pokingDuration: 3 // Fog makes fighters more cautious
    },
    'boiling-rock': {
        pokingDuration: 1 // Dangerous environment forces quick action
    },
    'fire-nation-capital': {
        pokingDuration: 2 // Urban environment with industrial hazards
    },
    'omashu': {
        pokingDuration: 2 // Vertical environment encourages quick action
    },
    'great-divide': {
        pokingDuration: 1 // Open environment leads to quick engagement
    },
    'kyoshi-island': {
        pokingDuration: 2 // Balanced environment
    }
};
'use strict';

export const kyoshiIsland = {
    id: 'kyoshi-island',
    name: 'Kyoshi Island',
    description: "A tranquil island known for its fierce warriors and the giant Unagi that prowls its shores.",
    envDescription: "the traditional village and rocky shores of Kyoshi Island",
    envImpactVariants: [
        "Splinters fly as a wooden house takes the hit.",
        "The ocean spray mists the air, stinging their eyes.",
        "A Kyoshi Warrior statue seems to watch silently."
    ],
    envTags: ["island", "coastal", "traditional", "wooden", "water"],
    environmentalModifiers: {
        air: { damage: 0, energy: 0, reason: "The temperate climate has little effect on airbending." },
        fire: { damage: -10, energy: 5, reason: "The wooden buildings are vulnerable, but the sea air is damp." },
        earth: { damage: 5, energy: 0, reason: "The island provides ample earth for bending." },
        water: { damage: 15, energy: -10, reason: "Being surrounded by the sea is a massive advantage for waterbenders." },
        ice: { damage: 10, energy: -5, reason: "The sea provides a vast source for icebending." },
        physical: { damage: 10, energy: -5, reason: "The close quarters of the village favor physical combat." },
        mobility_move: { damage: -15, energy: 10, reason: "The buildings and narrow streets can restrict broad movements." },
        evasive: { damage: 20, energy: -15, reason: "The rooftops and alleys of the village are perfect for evasive maneuvers." },
        ranged_attack: { damage: -20, energy: 15, reason: "The buildings provide significant cover, hindering ranged attacks." }
    },
    fragility: 65,
    background: 'https://64.media.tumblr.com/3ab423cde2d3526736ec70e55b844eba/88d557d930392bf4-aa/s1280x1920/4e1a6134355302c2dfbcfc216ceef07dbdcfe49a.jpg',
}; 
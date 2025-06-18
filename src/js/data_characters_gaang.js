// FILE: js/data_characters_gaang.js
"use strict";

/**
 * @fileoverview Character data for members of Team Avatar.
 * @description Contains the character definition for Aang.
 */

export const gaangCharacters = {
    "aang": {
        id: "aang", 
        name: "Aang",
        archetype: "aang-airbending-only",
        title: "The Last Airbender",
        element: "air",
        nation: "air_nomads",
        imageUrl: "img/img_aang.avif",
        description: "A fun-loving, 12-year-old boy who is the last Airbender and the current incarnation of the Avatar.",
        baseStats: {
            maxHp: 90,
            maxEnergy: 120,
            attack: 40,
            defense: 60,
            speed: 95
        },
        moveIds: [
            "air-scooter",
            "focused-air-blast",
            "wind-dome",
            "sweeping-gale"
        ],
        abilities: {
            isAvatar: true
        },
        personality: {
            aggression: 0.2,
            patience: 0.8,
            riskTolerance: 0.3,
            opportunism: 0.7,
            defensiveBias: 0.6
        }
    }
};
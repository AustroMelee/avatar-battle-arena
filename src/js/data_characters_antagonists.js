"use strict";

/**
 * @fileoverview Character data for antagonists.
 * @description Contains the character definition for Azula.
 */

export const antagonistCharacters = {
    "azula": {
        id: "azula",
        name: "Azula",
        archetype: "azula",
        title: "Crown Princess of the Fire Nation",
        element: "fire",
        nation: "fire_nation",
        imageUrl: "img/img_azula.avif",
        description: "A Firebending prodigy and a ruthless, perfectionistic princess of the Fire Nation.",
        baseStats: {
            maxHp: 85,
            maxEnergy: 100,
            attack: 90,
            defense: 50,
            speed: 80
        },
        moveIds: [
            "blue-flame-daggers",
            "fire-lash",
            "lightning-generation",
            "precision-flame-strike"
        ],
        abilities: {
            canGenerateLightning: true,
            isManipulative: true
        },
        personality: {
            aggression: 0.9,
            patience: 0.2,
            riskTolerance: 0.8,
            opportunism: 0.9,
            defensiveBias: 0.1
        }
    }
};
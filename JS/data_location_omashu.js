// FILE: data_location_omashu.js
'use strict';

// Environmental conditions for Omashu Delivery Chutes.

export const omashuConditions = {
    id: 'omashu',
    isUrban: true,
    isDense: true,
    earthRich: true,
    isVertical: true,
    hasCover: true,
    isPrecarious: true,
    isCramped: true, // NEW: Explicitly define for tight spaces within the city/chutes
    fragility: 0.65, 
    damageThresholds: {
        minor: 10, moderate: 25, severe: 50, catastrophic: 75
    },
    environmentalImpacts: {
        minor: [
            "A delivery chute rattles violently, nearly dislodging its contents.",
            "Loose stones rain down from the towering buildings.",
            "The ground shudders beneath the impact."
        ],
        moderate: [
            "Sections of stone pathways collapse, revealing dizzying drops below.",
            "The unique delivery chute system is severely damaged, sending packages crashing.",
            "Dust clouds engulf entire sections of the tiered city."
        ],
        severe: [
            "Massive support columns crack and begin to give way.",
            "Entire sections of the cliffside city slide and crumble.",
            "The once-bustling city is eerily silent, covered in a thick layer of rock dust."
        ],
        catastrophic: [
            "Omashu, the great Earth Kingdom city, is a testament to raw, unchecked power, its tiers shattered and collapsing.",
            "The air rings with the sounds of grinding earth and the groans of dying stone.",
            "What once stood as a symbol of peace is now a monument to the battle's destructive power."
        ]
    },
    environmentalModifiers: {
        earth: { damageMultiplier: 1.5, energyCostModifier: 0.8, description: "Earthbending tears Omashu apart with ease and low energy cost." },
        metal: { damageMultiplier: 1.2, energyCostModifier: 0.95, description: "Metalbending can warp the city's infrastructure." }, // Re-added metal modifier
        fire: { damageMultiplier: 1.0, energyCostModifier: 1.0, description: "Fire performs at baseline, but collateral impact varies by bender's ethics." }, // Neutral, but affected by character ethics
        lightning: { damageMultiplier: 1.0, energyCostModifier: 1.0, description: "Lightning performs at baseline, but collateral impact varies by bender's ethics." }, // Neutral, but affected by character ethics
        water: { damageMultiplier: 0.5, energyCostModifier: 1.5, description: "Waterbending is severely limited by scarce water sources." }, // UPDATED: Severe penalty for water
        ice: { damageMultiplier: 0.5, energyCostModifier: 1.5, description: "Ice bending is severely limited by scarce water sources." }, // NEW: Consistent with water
        physical: { damageMultiplier: 1.0, energyCostModifier: 1.05, description: "Verticality and precarious footing can hinder physical combat." },
        // NEW: Modifiers for general move tags affected by environment
        ranged_attack: { damageMultiplier: 0.6, energyCostModifier: 1.3, description: "Chute systems and urban verticality create severe line-of-sight disruptions for ranged attacks." }, // NEW: Severe penalty for ranged
        mobility_move: { damageMultiplier: 1.5, energyCostModifier: 0.7, description: "The delivery chutes and platforms offer maximum agility exploitation." }, // NEW: Major buff for mobility
        evasive: { damageMultiplier: 1.5, energyCostModifier: 0.7, description: "The delivery chutes and platforms offer maximum evasive opportunities." } // NEW: Major buff for evasive
    },
    disabledElements: [],
    notes: "A massive, tiered city of stone perfect for earthbenders. Gravity is a significant factor. Water is scarce. Offers excellent parkour and evasive opportunities, but severely hinders ranged attacks."
};
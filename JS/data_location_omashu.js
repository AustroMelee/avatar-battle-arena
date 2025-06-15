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
            "What remains is a perilous landscape of broken rock and treacherous chasms."
        ]
    },
    environmentalModifiers: {
        earth: { damageMultiplier: 1.5, energyCostModifier: 0.8, description: "Earthbending can tear Omashu apart with ease and low energy cost." },
        metal: { damageMultiplier: 1.2, energyCostModifier: 0.95, description: "Metalbending can warp the city's infrastructure." },
        fire: { damageMultiplier: 0.9, energyCostModifier: 1.1, description: "Fire has less effect on solid stone and can be diffused." },
        air: { damageMultiplier: 1.05, energyCostModifier: 0.95, description: "Airbending can utilize verticality for increased mobility." },
        physical: { damageMultiplier: 1.0, energyCostModifier: 1.05, description: "Verticality and precarious footing can hinder physical combat." }
    },
    disabledElements: [],
    notes: "A massive, tiered city of stone perfect for earthbenders. Gravity is a significant factor."
};
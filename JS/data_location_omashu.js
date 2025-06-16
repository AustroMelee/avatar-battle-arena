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
        air: { damage: 10, energy: -5, reason: "The open chutes and verticality create strong air currents." },
        fire: { damage: -10, energy: 5, reason: "The stone and metal environment offers little to burn." },
        earth: { damage: 25, energy: -20, reason: "The entire city of Omashu is a paradise for earthbenders." },
        water: { damage: -40, energy: 30, reason: "Water sources are very limited in the stone city." },
        ice: { damage: -50, energy: 40, reason: "The lack of water makes icebending nearly impossible." },
        physical: { damage: 5, energy: 0, reason: "The chutes and structures provide many opportunities for unconventional attacks." },
        mobility_move: { damage: 25, energy: -20, reason: "The delivery system is a playground for highly mobile fighters." },
        evasive: { damage: 15, energy: -10, reason: "The complex network of chutes offers endless escape routes." },
        ranged_attack: { damage: -25, energy: 15, reason: "The twisting chutes make it difficult to maintain line of sight." }
    },
    disabledElements: [],
    notes: "A massive, tiered city of stone perfect for earthbenders. Gravity is a significant factor. Water is scarce. Offers excellent parkour and evasive opportunities, but severely hinders ranged attacks."
};
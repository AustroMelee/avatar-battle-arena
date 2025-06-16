// FILE: data_location_ba-sing-se.js
'use strict';

// Environmental conditions for Ba Sing Se (Lower Ring).

export const baSingSeConditions = {
    id: 'ba-sing-se',
    isUrban: true,
    isDense: true,
    earthRich: true,
    hasCover: true,
    waterRich: true, // NEW: Added to indicate accessible water sources
    isCramped: true, // NEW: Added for tight spaces
    fragility: 0.7, 
    damageThresholds: {
        minor: 10, moderate: 25, severe: 50, catastrophic: 75
    },
    environmentalImpacts: {
        minor: [
            "Dust rises from cracked cobblestones.",
            "A street vendor's cart is overturned, cabbages scattering.",
            "A small section of a building facade crumbles."
        ],
        moderate: [
            "Roofs buckle and glass shatters as buildings take direct hits.",
            "Deep fissures appear in the packed earth of the streets.",
            "Civilians flee in terror as the battle intensifies, leaving debris-strewn alleys."
        ],
        severe: [
            "Entire sections of city blocks begin to collapse, sending dust clouds skyward.",
            "The once-impenetrable walls show alarming cracks and structural failure.",
            "The urban landscape is transformed into a maze of rubble and falling masonry."
        ],
        catastrophic: [
            "Ba Sing Se's lower ring is reduced to a smoking, crumbling ruin, barely recognizable.",
            "The air chokes with dust and the cries of the displaced, a testament to utter devastation.",
            "What once stood as a symbol of peace is now a monument to the battle's destructive power."
        ]
    },
    environmentalModifiers: {
        earth: { damageMultiplier: 1.3, energyCostModifier: 0.9, description: "Earthbending tears through stone and pavement." },
        fire: { damageMultiplier: 1.0, energyCostModifier: 1.0, description: "Fire causes fires in urban settings." },
        air: { damageMultiplier: 0.9, energyCostModifier: 1.05, description: "Airbending primarily pushes, less structural damage." },
        water: { damageMultiplier: 1.1, energyCostModifier: 0.9, description: "Waterbending thrives with accessible urban water sources." }, // NEW: Added buff for water
        physical: { damageMultiplier: 1.0, energyCostModifier: 1.05, description: "Tight spaces can impact physical combat." }, // Slight energy cost increase for physical
        // NEW: Modifiers for ranged and mobility moves
        ranged_attack: { damageMultiplier: 0.7, energyCostModifier: 1.15, description: "Dense urban cover hinders ranged attacks." },
        mobility_move: { damageMultiplier: 1.15, energyCostModifier: 0.9, description: "Verticality and tight spaces enhance agile movement." }
    },
    disabledElements: [],
    notes: "Tight streets and abundant earth favor tactical and earthbending combat. Urban structures are vulnerable. Water accessible. Agile movement is favored."
};
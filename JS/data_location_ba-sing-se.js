// FILE: data_location_ba-sing-se.js
'use strict';

// Environmental conditions for Ba Sing Se (Lower Ring).

export const baSingSe = {
    id: 'ba-sing-se',
    name: 'Ba Sing Se (Lower Ring)',
    description: "The sprawling urban environment of Ba Sing Se's Lower Ring, with tight alleys, workshops, and dense housing.",
    isUrban: true,
    isDense: true,
    earthRich: true,
    hasCover: true,
    waterRich: true, // NEW: Added to indicate accessible water sources
    isCramped: true, // NEW: Added for tight spaces
    fragility: 70,
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
        air: { damage: -15, energy: 10, reason: "Airbending is difficult in the confined streets." },
        fire: { damage: 10, energy: -5, reason: "Firebenders can use buildings for cover and create chaos." },
        earth: { damage: 25, energy: -15, reason: "Earthbenders are masters of the urban environment." },
        water: { damage: -10, energy: 5, reason: "Limited water sources are available from wells and pipes." },
        ice: { damage: -10, energy: 5, reason: "Limited water sources are available for icebending." },
        physical: { damage: 5, energy: 0, reason: "Close-quarters combat is common in the tight streets." },
        mobility_move: { damage: -20, energy: 20, reason: "Movement is restricted by the dense urban layout." },
        evasive: { damage: 15, energy: -10, reason: "The alleys and rooftops provide ample opportunities for evasion." },
        ranged_attack: { damage: -25, energy: 15, reason: "Buildings and corners obstruct long-range attacks." }
    },
    disabledElements: [],
    notes: "Tight streets and abundant earth favor tactical and earthbending combat. Urban structures are vulnerable. Water accessible. Agile movement is favored.",
    background: 'images/locations/ba_sing_se.webp',
};
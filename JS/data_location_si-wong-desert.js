// FILE: data_location_si-wong-desert.js
'use strict';

// Environmental conditions for Si Wong Desert.

export const siWongDesertConditions = {
    id: 'si-wong-desert',
    isSandy: true,
    isHot: true,
    hasShiftingGround: true,
    lowVisibility: true, // Though your plan says "no visual obstructions," heat haze provides low visibility.
    isDesert: true, // NEW: Marker for global heat exhaustion mechanic
    fragility: 0.2, 
    damageThresholds: {
        minor: 10, moderate: 25, severe: 50, catastrophic: 75
    },
    environmentalImpacts: {
        minor: [
            "Sand whips up into stinging gusts.",
            "Small dunes are displaced.",
            "The ground shudders, creating minor sand geysers."
        ],
        moderate: [
            "Large sandstorms are stirred, reducing visibility further.",
            "Deeper fissures appear in the desert floor.",
            "Oasis flora is uprooted and buried under shifting sands."
        ],
        severe: [
            "Massive sand whirlwinds tear across the landscape, obscuring everything.",
            "Canyons widen and shift as the very ground gives way.",
            "The desert environment becomes a chaotic, blinding maelstrom of sand and heat."
        ],
        catastrophic: [
            "The desert is utterly transformed, vast dunes are flattened, and new canyons carved by destructive forces.",
            "A blinding sandstorm rages, making continued combat almost impossible.",
            "The once featureless expanse is now a scarred, tortured wasteland."
        ]
    },
    environmentalModifiers: {
        air: { damage: 10, energy: -5, reason: "The open desert winds empower airbending." },
        fire: { damage: 15, energy: -10, reason: "The intense sun and dry air are ideal for firebending." },
        earth: { damage: 20, energy: -15, reason: "The endless sand provides a unique and powerful medium for earthbenders." },
        water: { damage: -80, energy: 80, reason: "The desert is devoid of water, making waterbending nearly impossible." },
        ice: { damage: -90, energy: 90, reason: "Ice instantly sublimates in the scorching heat." },
        physical: { damage: -15, energy: 10, reason: "The shifting sands make movement and physical attacks difficult." },
        mobility_move: { damage: -10, energy: 5, reason: "The soft sand hinders agile movements." },
        evasive: { damage: -20, energy: 15, reason: "The open desert offers little cover for evasion." },
        ranged_attack: { damage: 10, energy: -5, reason: "The flat, open terrain offers clear lines of sight." }
    },
    disabledElements: [], // Elements are heavily modified, not disabled
    notes: "Scorching heat and lack of water severely penalize waterbenders. Firebending is amplified. Earthbending (especially Toph's seismic sense) is impaired by sand. Favors ranged and highly mobile combatants in open space."
};
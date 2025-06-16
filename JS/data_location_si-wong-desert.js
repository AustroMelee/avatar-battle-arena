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
        fire: { damageMultiplier: 1.2, energyCostModifier: 0.8, solar_amplification: true, description: "Fire is significantly amplified by the sun and heat." }, // UPDATED: Major buff
        lightning: { damageMultiplier: 1.2, energyCostModifier: 0.8, solar_amplification: true, description: "Lightning is significantly amplified by the sun and heat." }, // NEW: Consistent with fire
        earth: { damageMultiplier: 1.5, energyCostModifier: 0.85, sensory_impairment: true, description: "Earthbending can reshape the sandy terrain dramatically, but seismic sense is impaired." }, // UPDATED: Sensory impairment for Toph
        water: { damageMultiplier: 0.3, energyCostModifier: 2.0, description: "Waterbending is critically hindered by extreme scarcity." }, // UPDATED: Critically hindered
        ice: { damageMultiplier: 0.3, energyCostModifier: 2.0, description: "Icebending is critically hindered by extreme scarcity." }, // NEW: Consistent with water
        air: { damageMultiplier: 1.0, energyCostModifier: 0.95, description: "Airbending can manipulate sand, but costs energy." },
        physical: { damageMultiplier: 0.9, energyCostModifier: 1.1, description: "Heat and shifting sand drain physical stamina." },
        // NEW: Modifiers for general move tags affected by environment
        ranged_attack: { damageMultiplier: 1.2, energyCostModifier: 0.9, description: "Open terrain provides perfect line-of-sight for ranged attacks." }, // NEW: Buff for ranged
        mobility_move: { damageMultiplier: 1.1, energyCostModifier: 0.95, description: "Wide open spaces allow for effective pursuit and mobile maneuvers." }, // NEW: Buff for mobility
        evasive: { damageMultiplier: 1.1, energyCostModifier: 0.95, description: "Wide open spaces allow for effective evasive maneuvers." } // NEW: Buff for evasive
    },
    disabledElements: [], // Elements are heavily modified, not disabled
    notes: "Scorching heat and lack of water severely penalize waterbenders. Firebending is amplified. Earthbending (especially Toph's seismic sense) is impaired by sand. Favors ranged and highly mobile combatants in open space."
};
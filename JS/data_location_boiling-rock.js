// FILE: data_location_boiling-rock.js
'use strict';

// Environmental conditions for The Boiling Rock.

export const boilingRockConditions = {
    id: 'boiling-rock',
    isIndustrial: true,
    isHot: true,
    metalRich: true,
    isPrecarious: true,
    waterRich: true, // Existing: confirms water is present
    isVertical: true, // NEW: For multi-level structures, gondolas, wires
    isCramped: true, // NEW: For walkways, tight spaces
    hotWaterSource: true, // NEW: Explicitly marks the water as boiling, for specific moral/tactical choices
    fragility: 0.8, 
    damageThresholds: {
        minor: 10, moderate: 25, severe: 50, catastrophic: 75
    },
    environmentalImpacts: {
        minor: [
            "Sparks fly as metal walkways are dented.",
            "A geyser of scalding steam erupts from a damaged pipe.",
            "The precarious walkways vibrate dangerously."
        ],
        moderate: [
            "Metal scaffolding collapses into the boiling lake below.",
            "Pipes rupture, spraying superheated water and steam across the arena.",
            "The industrial complex groans under immense structural strain."
        ],
        severe: [
            "Entire sections of the prison's outer structure begin to buckle and fall.",
            "The air becomes thick with toxic steam and smoke from damaged machinery.",
            "The boiling lake itself seems to churn more violently, threatening to overflow."
        ],
        catastrophic: [
            "The Boiling Rock is a twisted ruin of molten metal and scalding water, a testament to ultimate destruction.",
            "The prison, once a symbol of the Fire Nation's might, is now a burning, sinking wreck.",
            "Survival itself becomes a challenge amidst the collapsing industrial nightmare."
        ]
    },
    environmentalModifiers: {
        fire: { damageMultiplier: 1.2, energyCostModifier: 0.9, description: "Fire melts and warps metal, thriving in the heat." },
        lightning: { damageMultiplier: 1.3, energyCostModifier: 0.85, description: "Lightning arcs effectively through metal structures and steam." }, // NEW: Specific for lightning in metal/steam
        earth: { damageMultiplier: 1.1, energyCostModifier: 1.0, specialModifier: 'vertical_threat_vulnerability', description: "Earthbending causes structural collapse of metal but struggles with vertical threats." }, // UPDATED: Special modifier for Toph
        water: { damageMultiplier: 0.6, energyCostModifier: 1.4, specialModifier: 'moral_restraint_potential', description: "Waterbending is limited to personal reserves or dangerous steam; offensive use of boiling water is rare due to moral restraint." }, // UPDATED: Severe penalty + moral restraint tag
        ice: { damageMultiplier: 0.5, energyCostModifier: 1.5, description: "Icebending is highly inefficient due to constant heat and limited water sources." }, // NEW: Severe penalty for ice
        metal: { damageMultiplier: 1.3, energyCostModifier: 0.85, description: "Metalbending is empowered by the abundant metal structures." },
        physical: { damageMultiplier: 1.0, energyCostModifier: 1.1, description: "Precarious footing and extreme heat impact physical combat." },
        // NEW: Modifiers for general move tags affected by environment
        ranged_attack: { damageMultiplier: 1.1, energyCostModifier: 0.9, description: "Open gondolas and strategic perches offer strong projectile positions." }, // NEW: Buff for ranged
        mobility_move: { damageMultiplier: 1.3, energyCostModifier: 0.8, description: "Wires, gondolas, and verticality allow extreme agility exploitation." }, // NEW: Major buff for mobility
        evasive: { damageMultiplier: 1.3, energyCostModifier: 0.8, description: "The complex vertical layout offers excellent evasive opportunities." } // NEW: Major buff for evasive
    },
    disabledElements: [],
    notes: "Metal and heat are abundant, and the terrain is highly vertical and precarious. Water is present but boiling and potentially ethically problematic for waterbenders. Favors agile, aggressive benders and those who thrive on chaos or exploit verticality."
};
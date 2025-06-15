// FILE: data_location_boiling-rock.js
'use strict';

// Environmental conditions for The Boiling Rock.

export const boilingRockConditions = {
    id: 'boiling-rock',
    isIndustrial: true,
    isHot: true,
    metalRich: true,
    isPrecarious: true,
    waterRich: true, 
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
        earth: { damageMultiplier: 1.1, energyCostModifier: 1.0, description: "Earthbending causes structural collapse of metal." },
        water: { damageMultiplier: 1.0, energyCostModifier: 1.0, description: "Waterbending can disturb the boiling lake, causing steam explosions." },
        metal: { damageMultiplier: 1.3, energyCostModifier: 0.85, description: "Metalbending is empowered by the abundant metal structures." },
        physical: { damageMultiplier: 1.0, energyCostModifier: 1.1, description: "Precarious footing and extreme heat impact physical combat." }
    },
    disabledElements: [],
    notes: "Metal and heat are abundant, but the terrain is treacherous. Extremely volatile environment. Water is present but dangerous."
};
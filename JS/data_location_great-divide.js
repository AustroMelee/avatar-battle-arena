// FILE: data_location_great-divide.js
'use strict';

// Environmental conditions for The Great Divide.

export const greatDivideConditions = {
    id: 'great-divide',
    isExposed: true,
    isRocky: true,
    isVertical: true,
    isPrecarious: true,
    earthRich: true,
    fragility: 0.3, 
    damageThresholds: {
        minor: 10, moderate: 25, severe: 50, catastrophic: 75
    },
    environmentalImpacts: {
        minor: [
            "Small pebbles dislodge from the canyon walls.",
            "The echo of impacts rings through the chasm.",
            "Dust puffs up from the dry riverbed."
        ],
        moderate: [
            "A significant rockslide thunders down the cliff face.",
            "New cracks appear in the sheer rock walls, revealing deeper fissures.",
            "The chasm itself seems to widen under the pressure."
        ],
        severe: [
            "Massive boulders detach and plummet to the canyon floor, shaking the very ground.",
            "Sections of the canyon wall begin to collapse entirely.",
            "The air is thick with rock dust, making breathing difficult."
        ],
        catastrophic: [
            "The Great Divide is transformed into a chaotic abyss of shifting rock and active landslides.",
            "The canyon's sheer walls are now crumbled, treacherous slopes.",
            "The raw power of the battle has irrevocably reshaped the natural landscape."
        ]
    },
    environmentalModifiers: {
        air: { damageMultiplier: 1.3, energyCostModifier: 0.7, description: "Airbending thrives with strong canyon updrafts and open space." }, // Major buff for Aang
        earth: { damageMultiplier: 1.4, energyCostModifier: 0.8, description: "Earthbending commands the abundant rock and sheer canyon walls." }, // Major buff for Bumi/Toph
        fire: { damageMultiplier: 1.25, energyCostModifier: 0.8, solar_amplification: true, description: "Fire is amplified by the dry, exposed environment and sun." }, // Major buff for firebenders
        lightning: { damageMultiplier: 1.3, energyCostModifier: 0.75, solar_amplification: true, description: "Lightning is highly effective and amplified by the open, dry air." }, // Major buff for lightning
        water: { damageMultiplier: 0.1, energyCostModifier: 3.0, description: "Waterbending is critically hindered by extreme scarcity; minimal effect." }, // Major debuff for water
        ice: { damageMultiplier: 0.1, energyCostModifier: 3.0, description: "Ice bending is critically hindered by extreme scarcity; minimal effect." },   // Major debuff for ice
        physical: { damageMultiplier: 0.9, energyCostModifier: 1.1, description: "Precarious footing and verticality hinder physical combat." }, // Slight penalty
        
        // General move tag modifiers influenced by terrain
        ranged_attack: { damageMultiplier: 0.6, energyCostModifier: 1.3, description: "Irregular terrain creates many line-of-sight obstructions for ranged attacks." }, // Major debuff for Mai
        mobility_move: { damageMultiplier: 1.5, energyCostModifier: 0.7, description: "Extreme verticality and open space offer excellent agile movement." }, // Major buff for Ty Lee
        evasive: { damageMultiplier: 1.5, energyCostModifier: 0.7, description: "Extreme verticality and open space offer excellent evasive maneuvers." },   // Major buff for Ty Lee
        
        // NEW MECHANIC: Toph's aerial vulnerability
        aerialAttackVulnerability: { 
            appliesToElement: "earth", // Only applies to earthbenders like Toph
            condition: "defender_grounded_attacker_airborne", // Specific condition for activation
            damageMultiplier: 1.3, // Earthbender takes 30% more damage from airborne attacks
            momentumChangeDefender: -1, // Small momentum loss for defender
            description: "An earthbender vulnerable to attacks from above."
        }
    },
    disabledElements: ['water', 'ice'], // Explicitly disable water/ice moves if not using canteen/specific moves
    notes: "A sheer canyon with little cover, favoring those with high mobility or powerful earthbending. Very stable but provides specific vulnerabilities."
};
// FILE: data_location_fire-nation-capital.js
'use strict';

// Environmental conditions for Fire Nation Capital Plaza.

export const fireNationCapitalConditions = {
    id: 'fire-nation-capital',
    isUrban: true,
    isDense: true,
    earthRich: true, 
    isHot: true,
    metalRich: true,
    isIndustrial: true,
    fragility: 0.75, 
    damageThresholds: {
        minor: 10, moderate: 25, severe: 50, catastrophic: 75
    },
    environmentalImpacts: {
        minor: [
            "Cracks appear in the elaborate pavement designs.",
            "Statues are chipped by stray attacks.",
            "The air shimmers with distorted heat from impacts."
        ],
        moderate: [
            "Ornate buildings are scorched and their facades crumble.",
            "Sections of the plaza pavement explode outwards, sending debris flying.",
            "The very air seems to crackle with uncontrolled energy."
        ],
        severe: [
            "Grand arches collapse, sending shockwaves through the plaza.",
            "The central fountain shatters, its waters turning to scalding steam.",
            "Once pristine streets are choked with rubble and smoke."
        ],
        catastrophic: [
            "The Fire Nation Capital Plaza, a symbol of empire, is reduced to a smoking, ravaged ruin.",
            "The air is thick with ash and the smell of burning stone, a true inferno.",
            "A once-majestic urban landscape is now a monument to chaos and unchecked power."
        ]
    },
    environmentalModifiers: {
        fire: { damageMultiplier: 1.2, energyCostModifier: 0.85, description: "Fire spreads rapidly in a dry, urban setting and is empowered." },
        lightning: { damageMultiplier: 1.3, energyCostModifier: 0.9, description: "Lightning arcs, causing widespread damage and fires." },
        earth: { damageMultiplier: 1.1, energyCostModifier: 1.0, description: "Earthbending causes widespread structural damage." },
        water: { damageMultiplier: 0.8, energyCostModifier: 1.2, description: "Waterbending struggles against the dry, hot environment." }
    },
    disabledElements: [],
    notes: "The heart of the Fire Nation empowers firebenders. Grand but still destructible."
};
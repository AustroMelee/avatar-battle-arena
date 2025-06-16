// FILE: data_location_fire-nation-capital.js
'use strict';

// Environmental conditions for Fire Nation Capital Plaza.

export const fireNationCapital = {
    id: 'fire-nation-capital',
    name: 'Fire Nation Capital Plaza',
    description: "The grand plaza of the Fire Nation Capital, an imposing symbol of military might and industrial power.",
    isUrban: true,
    isDense: true,
    earthRich: true, 
    isHot: true,
    metalRich: true,
    isIndustrial: true,
    hasCover: true, // NEW: Added for line-of-sight obstacles
    isCramped: true, // Confirmed: Already exists for tight spaces/alleyways
    fragility: 60,
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
        air: { damage: -15, energy: 10, reason: "The oppressive, controlled environment stifles free-flowing air currents." },
        fire: { damage: 20, energy: -15, reason: "The heart of the Fire Nation empowers its benders." },
        earth: { damage: 10, energy: -5, reason: "The paved streets and stone structures are prime for earthbending." },
        water: { damage: -25, energy: 20, reason: "Water is scarce, limited to decorative fountains." },
        ice: { damage: -30, energy: 25, reason: "Icebending is difficult with limited water and warm climate." },
        physical: { damage: 5, energy: 0, reason: "The open plaza is a straightforward combat arena." },
        mobility_move: { damage: -10, energy: 5, reason: "The open space offers little for complex maneuvering." },
        evasive: { damage: -15, energy: 10, reason: "Lack of cover makes evasion challenging." },
        ranged_attack: { damage: 15, energy: -10, reason: "The wide-open plaza favors long-range attacks." }
    },
    disabledElements: [],
    notes: "The heart of the Fire Nation empowers firebenders. Grand but still destructible. Offers opportunities for agile movement and close-quarters combat, but hinders long-range precision.",
    background: 'images/locations/fire_nation_capital.webp',
};
'use strict';

export const foggySwamp = {
    id: 'foggy-swamp',
    name: 'The Foggy Swamp',
    description: "A vast, mystical wetland teeming with unique flora and fauna, home to an isolated tribe of waterbenders.",
    environmentalModifiers: {
        air: { damage: -15, energy: 10, reason: "The dense, heavy fog dampens air currents." },
        fire: { damage: -25, energy: 20, reason: "The dampness of the swamp makes firebending difficult." },
        earth: { damage: 10, energy: -5, reason: "The soft, muddy ground is easily manipulated." },
        water: { damage: 25, energy: -20, reason: "The entire swamp is a massive source of water." },
        ice: { damage: 20, energy: -15, reason: "The abundant water can be readily frozen." },
        physical: { damage: -10, energy: 5, reason: "The murky water and tangled roots hinder movement." },
        mobility_move: { damage: -20, energy: 15, reason: "The swamp's terrain makes agile movements difficult." },
        evasive: { damage: 15, energy: -10, reason: "The fog and dense vegetation provide excellent cover for hiding." },
        ranged_attack: { damage: -30, energy: 25, reason: "The thick fog severely obscures visibility for ranged attacks." }
    },
    fragility: 40,
    background: 'https://static.wikia.nocookie.net/avatar/images/d/d9/Foggy_Swamp_Tribe.png',
}; 
// FILE: data_location_eastern-air-temple.js
'use strict';

// Represents the battle conditions for the Eastern Air Temple location.
export const easternAirTemple = {
    id: 'eastern-air-temple',
    name: 'Eastern Air Temple',
    description: "A serene temple on a remote mountain peak, with open courtyards and strong winds.",
    environmentalEffects: [
        "Strong winds",
        "Unstable footing",
        "Sudden updrafts",
        "Falling rocks"
    ],
    // REFACTOR: Store modifiers as raw numbers, not strings.
    environmentalModifiers: {
        air: { 
            damage: 15, 
            energy: -10, 
            reason: "Airbending flows freely with the winds." 
        },
        fire: { 
            damage: -20, 
            energy: 20, 
            reason: "Fire struggles against the high winds." 
        },
        earth: { 
            damage: 0,
            energy: 5, 
            reason: "Earthbending is challenging on unstable platforms." 
        },
        water: { 
            damage: -70, 
            energy: 80, 
            reason: "Waterbending is severely hindered by lack of water sources." 
        },
        ice: { 
            damage: -70, 
            energy: 80, 
            reason: "Ice bending is severely hindered by lack of water sources." 
        },
        physical: { 
            damage: -10, 
            energy: 5, 
            reason: "Physical attacks are hindered by footing and wind." 
        },
        mobility_move: { 
            damage: 20, 
            energy: -20, 
            reason: "Verticality and air currents enhance agile movement." 
        },
        evasive: { 
            damage: 20, 
            energy: -20, 
            reason: "Verticality and air currents enhance evasive maneuvers." 
        },
        ranged_attack: { 
            damage: -30, 
            energy: 15, 
            reason: "Cover and verticality hinder clear line of sight for ranged attacks." 
        },
    },
    specialConditions: {
        description: "The high altitude and strong winds favor airbenders and agile fighters, while hindering others.",
        effects: [
            {
                type: 'elemental_advantage',
                element: 'air',
                bonus: 0.15,
                details: "Airbenders feel at home here, their abilities enhanced by the natural air currents."
            },
            {
                type: 'agility_bonus',
                bonus: 0.1,
                details: "The complex terrain rewards agile movements and quick repositions."
            }
        ]
    },
    interactibles: [
        {
            name: "Wind Chutes",
            description: "Natural wind tunnels that can be used for rapid traversal or to redirect projectiles.",
            actions: ['propel', 'redirect']
        },
        {
            name: "Unstable Ledges",
            description: "Precarious rock formations that can be targeted to crumble under an opponent.",
            actions: ['destabilize', 'collapse']
        }
    ],
    fragility: 50,
    background: 'images/locations/eastern_air_temple.webp',
};
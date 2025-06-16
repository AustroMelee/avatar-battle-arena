'use strict';

export const baSingSe = {
    id: 'ba-sing-se',
    name: 'Ba Sing Se (Lower Ring)',
    description: "The sprawling lower ring of Ba Sing Se, a place of tight alleys and precarious structures.",
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
    fragility: 70,
    background: 'images/locations/ba_sing_se.webp',
}; 
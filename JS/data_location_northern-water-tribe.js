'use strict';

export const northernWaterTribe = {
    id: 'northern-water-tribe',
    name: 'Northern Water Tribe City',
    description: "A majestic city of ice and water, the stronghold of the Northern Water Tribe, under a perpetual twilight during the winter.",
    environmentalModifiers: {
        air: { damage: -10, energy: 5, reason: "The frigid air is thin and difficult to manipulate." },
        fire: { damage: -20, energy: 15, reason: "The intense cold severely weakens firebending." },
        earth: { damage: -50, energy: 50, reason: "There is no earth to bend, only ice and snow." },
        water: { damage: 30, energy: -25, reason: "The city itself is a masterpiece of waterbending, empowering its masters." },
        ice: { damage: 35, energy: -30, reason: "Ice is the fundamental element of the city, granting unparalleled control." },
        physical: { damage: -5, energy: 5, reason: "The icy surfaces make footing treacherous for physical combat." },
        mobility_move: { damage: 10, energy: -10, reason: "The canals and ice slides allow for unique and rapid movement." },
        evasive: { damage: 5, energy: 0, reason: "The ice architecture provides ample cover." },
        ranged_attack: { damage: -15, energy: 10, reason: "The glittering ice and constant flurries can obscure vision." }
    },
    fragility: 30,
    background: 'https://static.wikia.nocookie.net/avatar/images/3/33/Northern_Water_Tribe.png',
}; 
'use strict';

export const omashu = {
    id: 'omashu',
    name: 'Omashu Delivery Chutes',
    description: "A vast, city-wide network of stone and metal chutes for transporting goods, creating a chaotic and unpredictable battlefield.",
    locationTags: ['city', 'mountain', 'industrial', 'earth_kingdom'],
    environmentalEffects: [
        "Rattling delivery carts",
        "Grinding gears",
        "Steep vertical drops",
        "Surprise cabbage deliveries"
    ],
    environmentalModifiers: {
        air: { damage: 10, energy: -5, reason: "The open chutes and verticality create strong air currents." },
        fire: { damage: -10, energy: 5, reason: "The stone and metal environment offers little to burn." },
        earth: { damage: 25, energy: -20, reason: "The entire city of Omashu is a paradise for earthbenders." },
        water: { damage: -40, energy: 30, reason: "Water sources are very limited in the stone city." },
        ice: { damage: -50, energy: 40, reason: "The lack of water makes icebending nearly impossible." },
        physical: { damage: 5, energy: 0, reason: "The chutes and structures provide many opportunities for unconventional attacks." },
        mobility_move: { damage: 25, energy: -20, reason: "The delivery system is a playground for highly mobile fighters." },
        evasive: { damage: 15, energy: -10, reason: "The complex network of chutes offers endless escape routes." },
        ranged_attack: { damage: -25, energy: 15, reason: "The twisting chutes make it difficult to maintain line of sight." }
    },
    specialConditions: {
        description: "The city's unique delivery system is a paradise for earthbenders and highly mobile fighters.",
        effects: [
            {
                type: 'elemental_advantage',
                element: 'earth',
                bonus: 0.25,
                details: "The entire city is constructed from bendable stone."
            },
            {
                type: 'mobility_advantage',
                bonus: 0.25,
                details: "The chutes and carts can be used for rapid and unpredictable movement."
            }
        ]
    },
    interactibles: [
        {
            name: "Delivery Carts",
            description: "Can be ridden for transport or sent careening into an opponent.",
            actions: ['ride_cart', 'launch_cart']
        },
        {
            name: "Chute Levers",
            description: "Control the direction of the delivery chutes, allowing for tactical redirection of fighters or carts.",
            actions: ['redirect_chute', 'trap_opponent']
        }
    ],
    fragility: 50,
    background: 'https://static.wikia.nocookie.net/avatar/images/1/18/Omashu.png',
}; 
'use strict';

export const fireNationCapital = {
    id: 'fire-nation-capital',
    name: 'Fire Nation Capital',
    description: "The heart of the Fire Nation, a city built in a volcanic caldera, teeming with industrial might and imperial architecture.",
    locationTags: ['urban', 'volcanic', 'imperial', 'fire_nation'],
    environmentalEffects: [
        "Oppressive heat",
        "Sootfall",
        "Roaring furnaces",
        "Strictly disciplined guards"
    ],
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
    specialConditions: {
        description: "The heart of the Fire Nation empowers its native benders and offers strategic advantages in its wide-open plazas.",
        effects: [
            {
                type: 'elemental_advantage',
                element: 'fire',
                bonus: 0.20,
                details: "The ambient heat and imperial pride empower firebenders."
            },
            {
                type: 'combat_style_advantage',
                style: 'ranged_attack',
                bonus: 0.15,
                details: "The open plazas provide clear lines of sight, favoring ranged combat."
            }
        ]
    },
    interactibles: [
        {
            name: "Imperial Statues",
            description: "Large, imposing statues that can be used for cover or toppled for massive damage.",
            actions: ['take_cover', 'topple']
        },
        {
            name: "Fountain Courtyards",
            description: "One of the few sources of water, offering a small advantage to waterbenders who can secure them.",
            actions: ['secure_water', 'disrupt_fountain']
        }
    ],
    fragility: 60,
    background: 'https://static.wikia.nocookie.net/avatar/images/f/f3/Fire_Nation_Capital.png',
}; 
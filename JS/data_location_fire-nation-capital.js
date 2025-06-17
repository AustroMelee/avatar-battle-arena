'use strict';

export const fireNationCapital = {
    id: 'fire-nation-capital',
    name: 'Fire Nation Capital',
    description: "The heart of the Fire Nation, a city built in a volcanic caldera, teeming with industrial might and imperial architecture.",
    envDescription: "the grand, volcanic plaza of the Fire Nation Capital",
    envImpactVariants: [
        "The plaza shudders as stone fragments fly.",
        "Red banners whip in the sudden blast.",
        "Ash falls softly, settling on the scorched tiles."
    ],
    envTags: ["urban", "fiery", "volcanic", "stone", "imperial"],
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
    fragility: 60,
    background: 'https://i.redd.it/mqr12b0n9vw41.jpg',
}; 
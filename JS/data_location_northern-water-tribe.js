'use strict';

export const northernWaterTribe = {
    id: 'northern-water-tribe',
    name: 'Northern Water Tribe City',
    description: "A majestic city of ice and water, the stronghold of the Northern Water Tribe, under a perpetual twilight during the winter.",
    envDescription: "the majestic, frozen city of the Northern Water Tribe",
    envImpactVariants: [
        "Ice shards explode from the impact point.",
        "The frozen canals crack under the strain.",
        "A flurry of snow whips up, obscuring the view."
    ],
    envTags: ["ice", "water", "arctic", "city", "frozen"],
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
    background: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fpm1.narvii.com%2F5963%2F88998a3121cffe02d7ec1f27e9c1de133618dfbd_hq.jpg&f=1&nofb=1&ipt=4ca3377d2a0cb8744b37fedaa952c2d8abc5f6d6822376ba54cb4e4ebf0f9375',
}; 
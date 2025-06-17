'use strict';

export const siWongDesert = {
    id: 'si-wong-desert',
    name: 'Si Wong Desert',
    description: "A vast and treacherous desert, where the sand itself can be a weapon.",
    envDescription: "endless golden dunes under a white sun",
    envImpactVariants: [
        "The sands shift violently underfoot.",
        "A sudden gust sends grit swirling into eyes.",
        "Heat ripples shimmer above the parched earth."
    ],
    envTags: ["sand", "desert", "sunny", "open", "arid"],
    environmentalModifiers: {
        air: { damage: 10, energy: -5, reason: "The open desert winds empower airbending." },
        fire: { damage: 15, energy: -10, reason: "The intense sun and dry air are ideal for firebending." },
        earth: { damage: 20, energy: -15, reason: "The endless sand provides a unique and powerful medium for earthbenders." },
        water: { damage: -80, energy: 80, reason: "The desert is devoid of water, making waterbending nearly impossible." },
        ice: { damage: -90, energy: 90, reason: "Ice instantly sublimates in the scorching heat." },
        physical: { damage: -15, energy: 10, reason: "The shifting sands make movement and physical attacks difficult." },
        mobility_move: { damage: -10, energy: 5, reason: "The soft sand hinders agile movements." },
        evasive: { damage: -20, energy: 15, reason: "The open desert offers little cover for evasion." },
        ranged_attack: { damage: 10, energy: -5, reason: "The flat, open terrain offers clear lines of sight." }
    },
    fragility: 10,
    background: 'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fvignette1.wikia.nocookie.net%2Favatar%2Fimages%2F8%2F84%2FSi_Wong_Dunes.png%2Frevision%2Flatest%3Fcb%3D20090924182600%26path-prefix%3Dnl&f=1&nofb=1&ipt=ae96b0349753ac5d17eab260be68b812fae1fa5bfa529a8b2511fa3771f9192a',
}; 
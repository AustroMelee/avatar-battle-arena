'use strict';

export const siWongDesert = {
    id: 'si-wong-desert',
    name: 'Si Wong Desert',
    description: "A vast, sun-scorched desert where the sand itself can be a powerful weapon or a deadly trap.",
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
    background: 'images/locations/si_wong_desert.webp',
}; 
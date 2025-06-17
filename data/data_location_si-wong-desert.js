'use strict';

export const siWongDesert = {
    id: 'si-wong-desert',
    name: 'Si Wong Desert',
    description: "A vast and treacherous desert, where the sand itself can be a weapon.",
    locationTags: ['desert', 'vast', 'arid', 'earth_kingdom'],
    environmentalEffects: [
        "Scorching sun",
        "Swirling sandstorms",
        "Mirages in the distance",
        "Bleached bones"
    ],
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
    specialConditions: {
        description: "The scorching desert empowers firebenders and sandbenders, but is a death sentence for waterbenders.",
        effects: [
            {
                type: 'elemental_advantage',
                element: 'fire',
                bonus: 0.15,
                details: "The intense sun makes firebending more potent."
            },
            {
                type: 'elemental_advantage',
                element: 'earth',
                bonus: 0.20,
                details: "Skilled earthbenders can turn the endless sand into a deadly weapon."
            },
            {
                type: 'elemental_disadvantage',
                element: 'water',
                penalty: 0.8,
                details: "The desert heat and lack of water are crippling for waterbenders."
            }
        ]
    },
    interactibles: [
        {
            name: "Sand Dunes",
            description: "Can be used for cover, to launch surprise attacks, or manipulated by earthbenders.",
            actions: ['take_cover', 'trigger_sandslide']
        },
        {
            name: "Giant Rock Formations",
            description: "Occasional outcrops of rock that provide the only solid ground and cover in the area.",
            actions: ['take_cover', 'destabilize']
        }
    ],
    fragility: 10,
    background: 'https://static.wikia.nocookie.net/avatar/images/1/1a/Si_Wong_Desert.png',
}; 
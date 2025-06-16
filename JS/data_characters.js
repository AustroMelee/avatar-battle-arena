// FILE: js/data_characters.js
'use strict';

// Import individual character data
import { aangArchetypeData as aangArchetype } from './data_archetype_aang.js';
import { azulaArchetypeData as azulaArchetype } from './data_archetype_azula.js';
import { bumiArchetypeData as bumiArchetype } from './data_archetype_bumi.js';
import { jeongjeongArchetypeData as jeongJeongArchetype } from './data_archetype_jeong-jeong.js';
import { kataraArchetypeData as kataraArchetype } from './data_archetype_katara.js';
import { maiArchetypeData as maiArchetype } from './data_archetype_mai.js';
import { ozaiArchetypeData as ozaiArchetype } from './data_archetype_ozai.js';
import { pakkuArchetypeData as pakkuArchetype } from './data_archetype_pakku.js';
import { sokkaArchetypeData as sokkaArchetype } from './data_archetype_sokka.js';
import { tophArchetypeData as tophArchetype } from './data_archetype_toph.js';
import { tyleeArchetypeData as tyLeeArchetype } from './data_archetype_ty-lee.js';
import { zukoArchetypeData as zukoArchetype } from './data_archetype_zuko.js';

const createCharacter = (archetype, overrides) => {
    const combinedTechniques = [
        ...(archetype.techniques || []),
        ...(archetype.techniquesFull || []),
        ...(archetype.techniquesCanteen || []),
        ...(archetype.techniquesEasternAirTemple || []),
        ...(archetype.techniquesNorthernWaterTribe || []),
        ...(archetype.techniquesOmashu || []),
        ...(archetype.techniquesSiWongDesert || []),
        ...(archetype.techniquesBoilingRock || [])
    ];

    return {
        ...archetype,
        ...overrides,
        techniques: combinedTechniques,
    };
};

export const characters = {
    "aang": createCharacter(aangArchetype, { mentalResilience: 1.2 }),
    "azula": createCharacter(azulaArchetype, { mentalResilience: 0.7 }),
    "bumi": createCharacter(bumiArchetype, { mentalResilience: 2.5 }),
    "jeong-jeong": createCharacter(jeongJeongArchetype, { mentalResilience: 1.8 }),
    "katara": createCharacter(kataraArchetype, { mentalResilience: 1.1 }),
    "mai": createCharacter(maiArchetype, { mentalResilience: 1.5, susceptibilities: ['foggy-swamp'] }),
    "ozai": createCharacter(ozaiArchetype, { mentalResilience: 2.0 }),
    "pakku": createCharacter(pakkuArchetype, { mentalResilience: 1.7 }),
    "sokka": createCharacter(sokkaArchetype, { mentalResilience: 1.3 }),
    "toph": createCharacter(tophArchetype, { mentalResilience: 1.9 }),
    "ty-lee": createCharacter(tyLeeArchetype, { mentalResilience: 1.4 }),
    "zuko": createCharacter(zukoArchetype, { mentalResilience: 0.9 })
};
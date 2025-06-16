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

    // Extract the character ID from the archetype's own data, if it exists
    const id = archetype.id || (overrides.id || 'unknown');
    // Simple capitalization for the name from the ID
    const name = id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return {
        ...archetype,
        ...overrides,
        id: id,
        name: archetype.name || name,
        techniques: combinedTechniques,
    };
};

export const characters = {
    "aang": createCharacter(aangArchetype, { id: 'aang', mentalResilience: 1.2 }),
    "azula": createCharacter(azulaArchetype, { id: 'azula', mentalResilience: 0.7 }),
    "bumi": createCharacter(bumiArchetype, { id: 'bumi', mentalResilience: 2.5 }),
    "jeong-jeong": createCharacter(jeongJeongArchetype, { id: 'jeong-jeong', mentalResilience: 1.8 }),
    "katara": createCharacter(kataraArchetype, { id: 'katara', mentalResilience: 1.1 }),
    "mai": createCharacter(maiArchetype, { id: 'mai', mentalResilience: 1.5, susceptibilities: ['foggy-swamp'] }),
    "ozai": createCharacter(ozaiArchetype, { id: 'ozai', mentalResilience: 2.0 }),
    "pakku": createCharacter(pakkuArchetype, { id: 'pakku', mentalResilience: 1.7 }),
    "sokka": createCharacter(sokkaArchetype, { id: 'sokka', mentalResilience: 1.3 }),
    "toph": createCharacter(tophArchetype, { id: 'toph', mentalResilience: 1.9 }),
    "ty-lee": createCharacter(tyLeeArchetype, { id: 'ty-lee', mentalResilience: 1.4 }),
    "zuko": createCharacter(zukoArchetype, { id: 'zuko', mentalResilience: 0.9 })
};
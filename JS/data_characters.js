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

export const characters = {
    "aang": {
        ...aangArchetype,
        mentalResilience: 1.2,
    },
    "azula": {
        ...azulaArchetype,
        mentalResilience: 0.7,
    },
    "bumi": {
        ...bumiArchetype,
        mentalResilience: 2.5,
    },
    "jeong-jeong": {
        ...jeongJeongArchetype,
        mentalResilience: 1.8,
    },
    "katara": {
        ...kataraArchetype,
        mentalResilience: 1.1,
    },
    "mai": {
        ...maiArchetype,
        mentalResilience: 1.5,
        susceptibilities: ['foggy-swamp'],
    },
    "ozai": {
        ...ozaiArchetype,
        mentalResilience: 2.0,
    },
    "pakku": {
        ...pakkuArchetype,
        mentalResilience: 1.7,
    },
    "sokka": {
        ...sokkaArchetype,
        mentalResilience: 1.3,
    },
    "toph": {
        ...tophArchetype,
        mentalResilience: 1.9,
    },
    "ty-lee": {
        ...tyLeeArchetype,
        mentalResilience: 1.4,
    },
    "zuko": {
        ...zukoArchetype,
        mentalResilience: 0.9,
    }
};
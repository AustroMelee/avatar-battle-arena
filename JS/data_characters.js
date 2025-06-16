// FILE: js/data_characters.js
'use strict';

// Import individual character data
import { aangArchetype } from './data_archetype_aang.js';
import { azulaArchetype } from './data_archetype_azula.js';
import { bumiArchetype } from './data_archetype_bumi.js';
import { jeongJeongArchetype } from './data_archetype_jeong-jeong.js';
import { kataraArchetype } from './data_archetype_katara.js';
import { maiArchetype } from './data_archetype_mai.js';
import { ozaiArchetype } from './data_archetype_ozai.js';
import { pakkuArchetype } from './data_archetype_pakku.js';
import { sokkaArchetype } from './data_archetype_sokka.js';
import { tophArchetype } from './data_archetype_toph.js';
import { tyLeeArchetype } from './data_archetype_ty-lee.js';
import { zukoArchetype } from './data_archetype_zuko.js';

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
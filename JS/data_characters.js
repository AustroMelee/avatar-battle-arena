// FILE: js/data_characters.js
'use strict';

// This file serves as the central assembler for all character data.
// It imports character objects from modular files and combines them
// into a single 'characters' object for the rest of the application.

import { gaangCharacters } from './data_characters_gaang.js';
import { antagonistCharacters } from './data_characters_antagonists.js';
import { masterCharacters } from './data_characters_masters.js';

export const characters = {
    ...gaangCharacters,
    ...antagonistCharacters,
    ...masterCharacters,
};
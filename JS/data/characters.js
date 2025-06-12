// FILE: data/characters.js
'use strict';

// This file serves as the central assembler for all character data.
// It imports character objects from modular files and combines them
// into a single 'characters' object for the rest of the application.
// This approach keeps the data organized without requiring changes to
// any other part of the engine.

import { gaangCharacters } from './characters/gaang.js';
import { antagonistCharacters } from './characters/antagonists.js';
import { masterCharacters } from './characters/masters.js';

export const characters = {
    ...gaangCharacters,
    ...antagonistCharacters,
    ...masterCharacters,
};
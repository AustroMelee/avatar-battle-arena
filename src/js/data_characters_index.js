"use strict";

/**
 * @fileoverview Central index for all character data modules.
 * @description This module imports and re-exports all character data sets, providing a single point of entry for the character registry.
 */

import { gaangCharacters } from "./data_characters_gaang.js";
import { antagonistCharacters } from "./data_characters_antagonists.js";

export const allCharacterData = {
    ...gaangCharacters,
    ...antagonistCharacters,
}; 
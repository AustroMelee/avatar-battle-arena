"use strict";

// This file dynamically imports all archetype data files
// from the data_archetype_*.js series and exports them
// as a single, consolidated object.

import { aangArchetypeData } from "./data_archetype_aang.js";
import { azulaArchetypeData } from "./data_archetype_azula.js";

export const allArchetypes = {
    "aang-airbending-only": aangArchetypeData,
    "azula": azulaArchetypeData,
}; 
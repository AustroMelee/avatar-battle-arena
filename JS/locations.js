'use strict';

// Import individual location condition objects
import { baSingSe } from './data_location_ba-sing-se.js';
import { boilingRock } from './data_location_boiling-rock.js';
import { easternAirTemple } from './data_location_eastern-air-temple.js';
import { fireNationCapital } from './data_location_fire-nation-capital.js';
import { foggySwamp } from './data_location_foggy-swamp.js';
import { greatDivide } from './data_location_great-divide.js';
import { kyoshiIsland } from './data_location_kyoshi-island.js';
import { northernWaterTribe } from './data_location_northern-water-tribe.js';
import { omashu } from './data_location_omashu.js';
import { siWongDesert } from './data_location_si-wong-desert.js';

/**
 * A comprehensive list of all available battle locations.
 * This object is used to populate the location selection UI.
 */
export const locations = {
    'ba-sing-se': baSingSe,
    'boiling-rock': boilingRock,
    'eastern-air-temple': easternAirTemple,
    'fire-nation-capital': fireNationCapital,
    'foggy-swamp': foggySwamp,
    'great-divide': greatDivide,
    'kyoshi-island': kyoshiIsland,
    'northern-water-tribe': northernWaterTribe,
    'omashu': omashu,
    'si-wong-desert': siWongDesert
};

// This can be expanded with location-specific overrides for battle phases, etc.
export const locationPhaseOverrides = {
    'eastern-air-temple': {
        pokingDuration: 2 // Shorter poking phase due to verticality
    },
    'great-divide': {
        pokingDuration: 1 // Very short poking phase; the danger is immediate
    }
    // Add other locations here
};
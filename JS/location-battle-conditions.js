// FILE: location-battle-conditions.js
'use strict';

// Import individual location condition objects
import { allLocations } from './data_locations_index.js';

/**
 * A map of location IDs to their battle conditions.
 * This is the central export used by the battle engine to get location data.
 */
export const locationConditions = allLocations;
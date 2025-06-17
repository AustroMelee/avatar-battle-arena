'use strict';

// Import individual location condition objects
import { allLocations } from './data_locations_index.js';

/**
 * A comprehensive list of all available battle locations.
 * This object is used to populate the location selection UI.
 */
export const locations = allLocations;

// This can be expanded with location-specific overrides for battle phases, etc.
export const locationPhaseOverrides = {
    // This can be left empty for the stripped-down version
};
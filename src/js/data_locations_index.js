"use strict";

// This file dynamically imports all location data files
// from the data_location_*.js series and exports them
// as a single, consolidated object.

import { fireNationCapital } from "./data_location_fire-nation-capital.js";

export const allLocations = {
    "fire-nation-capital": fireNationCapital,
}; 
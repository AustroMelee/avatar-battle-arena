// FILE: js/move-interaction-matrix.js
'use strict';

// This file defines weighted interactions between specific moves.
// A higher value means the key move is more effective against the value move.
// Default weighting is 1.0 if no specific interaction is listed.

export const moveInteractionMatrix = {
    // Water vs. Fire
    'Water Whip': {
        counters: { 'Fire Whip': 1.2, 'Fire Daggers': 1.1 },
        counteredBy: { 'Lightning Generation': 1.2 }
    },
    'Tidal Wave': {
        counters: { 'Flame Tornado': 1.5, 'Controlled Inferno': 1.4 },
        counteredBy: {}
    },
    // Fire vs. Ice
    'Fire Daggers': {
        counters: { 'Ice Spears': 1.2, 'Ice Prison': 1.3 },
        counteredBy: { 'Water Whip': 1.1 }
    },
    'Dragon\'s Breath': {
        counters: { 'Ice Armor': 1.4 },
        counteredBy: {}
    },
    // Earth vs. Air
    'Boulder Throw': {
        counters: {},
        counteredBy: { 'Air Scooter': 1.3, 'Gust Push': 1.2 } // Hard to hit a mobile target
    },
    'Earth Wave': {
        counters: {},
        counteredBy: { 'Tornado Whirl': 1.2 }
    },
    // Bending vs. Non-Bending
    'Pressure Point Strike': {
        counters: { 'Rock Armor': 1.5, 'Fire Shield': 1.4 }, // Gets past brute force defense
        counteredBy: { 'Sword Strike': 1.1 } // Out-ranged
    },
    'Knife Barrage': {
        counters: { 'Gust Push': 1.2 }, // Hard to deflect projectiles
        counteredBy: { 'Water Shield': 1.2, 'Fire Wall': 1.3 }
    }
    // Add more specific interactions as the roster expands...
};
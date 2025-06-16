// FILE: js/engine_archetype-engine.js
'use strict';

// Import all individual character archetype data files
// NOTE: You will need to add an import for EACH character file as you create them.
// For now, we'll assume only Sokka, Aang, Katara, Toph, Zuko, Azula, Mai, Ty Lee, Ozai, Pakku, Bumi, and Jeong Jeong exist.

import { characters as characterData } from './data_characters.js';
import { locations as locationData } from './locations.js';

import { sokkaArchetypeData } from './data_archetype_sokka.js';
import { aangArchetypeData } from './data_archetype_aang.js';
import { kataraArchetypeData } from './data_archetype_katara.js';
import { tophArchetypeData } from './data_archetype_toph.js';
import { zukoArchetypeData } from './data_archetype_zuko.js';
import { azulaArchetypeData } from './data_archetype_azula.js';
import { maiArchetypeData } from './data_archetype_mai.js';
import { tyleeArchetypeData } from './data_archetype_ty-lee.js';
import { ozaiArchetypeData } from './data_archetype_ozai.js';
import { pakkuArchetypeData } from './data_archetype_pakku.js';
import { bumiArchetypeData } from './data_archetype_bumi.js';
import { jeongjeongArchetypeData } from './data_archetype_jeong-jeong.js';


// Combine all imported archetype data into a single map.
// The structure will be: { fighterA_id: { fighterB_id: { location_id: {label, introA, introB} } } }
const combinedArchetypeMap = {
    'sokka': sokkaArchetypeData,
    'aang-airbending-only': aangArchetypeData,
    'katara': kataraArchetypeData,
    'toph-beifong': tophArchetypeData,
    'zuko': zukoArchetypeData,
    'azula': azulaArchetypeData,
    'mai': maiArchetypeData,
    'ty-lee': tyleeArchetypeData,
    'ozai-not-comet-enhanced': ozaiArchetypeData,
    'pakku': pakkuArchetypeData,
    'bumi': bumiArchetypeData,
    'jeong-jeong': jeongjeongArchetypeData,
    // Add other characters here as their files are created
    // e.g., 'characterId': characterArchetypeData,
};

// Global Fallback (if Fighter A's data isn't even in combinedArchetypeMap)
const GLOBAL_DEFAULT_ARCHETYPE = {
    label: "An Epic Confrontation Awaits",
    introA: (name1) => `${name1 || 'A skilled fighter'} prepares for battle.`,
    introB: (name2) => `${name2 || 'An unknown challenger'} steps into the arena.`,
    error: "Global default matchup."
};

const SELECT_PLACEHOLDER_TITLE = "Choose Your Destiny";
const SELECT_PLACEHOLDER_INTRO = "Select fighters and a battlefield to reveal their story.";
const ERROR_TITLE = "Matchup Anomaly";
const ERROR_INTRO = "There was an issue determining the matchup details. Please try again.";


export function resolveArchetypeLabel(fighter1Id, fighter2Id, locationId) {
    if (!fighter1Id || !fighter2Id || !locationId) {
        return {
            label: SELECT_PLACEHOLDER_TITLE,
            introA: SELECT_PLACEHOLDER_INTRO,
            introB: "", // Keep B blank for placeholder
            error: null
        };
    }

    const fighter1Name = characterData[fighter1Id]?.name || "Fighter 1";
    const fighter2Name = characterData[fighter2Id]?.name || "Fighter 2";
    // const locationName = locationData[locationId]?.name || "Battlefield"; // Not directly used in default strings anymore

    let entry = null;
    const fighterAData = combinedArchetypeMap[fighter1Id];

    if (fighterAData) {
        // Most specific lookup: [F1_Data][F2][LOC]
        if (fighterAData[fighter2Id] && fighterAData[fighter2Id][locationId]) {
            entry = fighterAData[fighter2Id][locationId];
        }
        // Fallback 1: [F1_Data][F2][_DEFAULT_LOCATION_]
        else if (fighterAData[fighter2Id] && fighterAData[fighter2Id]['_DEFAULT_LOCATION_']) {
            entry = fighterAData[fighter2Id]['_DEFAULT_LOCATION_'];
        }
        // Fallback 2: [F1_Data][_DEFAULT_OPPONENT_][_DEFAULT_LOCATION_] (Default within Fighter A's data)
        else if (fighterAData['_DEFAULT_OPPONENT_'] && fighterAData['_DEFAULT_OPPONENT_']['_DEFAULT_LOCATION_']) {
            entry = fighterAData['_DEFAULT_OPPONENT_']['_DEFAULT_LOCATION_'];
            // Specific default intros using names if possible
            if (entry) {
                entry = {
                    ...entry, // spread to keep original label
                    introA: entry.introA || `${fighter1Name} prepares for an unknown challenge.`,
                    introB: entry.introB ? entry.introB.replace("this fighter", fighter2Name).replace("this opponent", fighter2Name) : `${fighter2Name} steps up to face ${fighter1Name}.`
                };
            }
        }
    }

    // Fallback 3: Global Default (if no specific entry for fighterA or the specific combo)
    if (!entry) {
        return {
            label: GLOBAL_DEFAULT_ARCHETYPE.label,
            introA: GLOBAL_DEFAULT_ARCHETYPE.introA(fighter1Name),
            introB: GLOBAL_DEFAULT_ARCHETYPE.introB(fighter2Name),
            error: GLOBAL_DEFAULT_ARCHETYPE.error
        };
    }
    
    // Ensure entry has all parts, or use character-specific defaults if available in entry, else global defaults
    return {
        label: entry.label || GLOBAL_DEFAULT_ARCHETYPE.label,
        introA: entry.introA || GLOBAL_DEFAULT_ARCHETYPE.introA(fighter1Name),
        introB: entry.introB || GLOBAL_DEFAULT_ARCHETYPE.introB(fighter2Name),
        error: null // If we found an entry, even a default one from character file, it's not an error state.
    };
}
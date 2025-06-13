// FILE: js/engine_archetype-engine.js
'use strict';

import { archetypeMap } from './data_archetype-titles.js';
import { characters as characterData } from './data_characters.js'; // To get names for default intros
import { locations as locationData } from './locations.js'; // To get names for default intros


const DEFAULT_TITLE = "An Epic Confrontation Awaits";
const DEFAULT_INTRO_A = "A skilled fighter prepares for battle.";
const DEFAULT_INTRO_B = "An unknown challenger steps into the arena.";
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
    // const locationName = locationData[locationId]?.name || "Battlefield";


    let entry = null;

    // Most specific lookup: [F1][F2][LOC]
    if (archetypeMap[fighter1Id] && archetypeMap[fighter1Id][fighter2Id] && archetypeMap[fighter1Id][fighter2Id][locationId]) {
        entry = archetypeMap[fighter1Id][fighter2Id][locationId];
    }
    // Fallback 1: [F1][F2][_DEFAULT_LOCATION_]
    else if (archetypeMap[fighter1Id] && archetypeMap[fighter1Id][fighter2Id] && archetypeMap[fighter1Id][fighter2Id]['_DEFAULT_LOCATION_']) {
        entry = archetypeMap[fighter1Id][fighter2Id]['_DEFAULT_LOCATION_'];
    }
    // Fallback 2: [F1][_DEFAULT_OPPONENT_][_DEFAULT_LOCATION_]
    else if (archetypeMap[fighter1Id] && archetypeMap[fighter1Id]['_DEFAULT_OPPONENT_'] && archetypeMap[fighter1Id]['_DEFAULT_OPPONENT_']['_DEFAULT_LOCATION_']) {
        entry = archetypeMap[fighter1Id]['_DEFAULT_OPPONENT_']['_DEFAULT_LOCATION_'];
        // Replace generic placeholders if entry is from a default opponent
        if (entry.introB && entry.introB.includes("this fighter") || entry.introB.includes("this challenger")) {
           entry.introB = `Facing ${fighter1Name}, ${fighter2Name} prepares for a battle of wits as much as brawn.`; // More specific default
        }
    }
    // Fallback 3: [_DEFAULT_FIGHTER_A_][_DEFAULT_OPPONENT_][_DEFAULT_LOCATION_] (Global Default)
    else if (archetypeMap['_DEFAULT_FIGHTER_A_'] && archetypeMap['_DEFAULT_FIGHTER_A_']['_DEFAULT_OPPONENT_'] && archetypeMap['_DEFAULT_FIGHTER_A_']['_DEFAULT_OPPONENT_']['_DEFAULT_LOCATION_']) {
        entry = archetypeMap['_DEFAULT_FIGHTER_A_']['_DEFAULT_OPPONENT_']['_DEFAULT_LOCATION_'];
         // Replace generic placeholders if entry is from global default
        if (entry.introA && entry.introA.includes("A formidable warrior") || entry.introA.includes("A skilled fighter")) {
            entry.introA = `${fighter1Name} steps into the arena, ready to prove their mettle.`;
        }
        if (entry.introB && entry.introB.includes("this challenger") || entry.introB.includes("An unknown challenger")) {
            entry.introB = `Facing ${fighter1Name}, ${fighter2Name} prepares for an epic confrontation.`;
        }
    }


    if (entry) {
        return {
            label: entry.label || DEFAULT_TITLE,
            introA: entry.introA || `${fighter1Name} prepares for the coming battle.`,
            introB: entry.introB || `${fighter2Name} stands ready to face the challenge.`,
            error: null
        };
    }

    // If no entry found after all fallbacks, use the most generic default
    return {
        label: DEFAULT_TITLE,
        introA: `${fighter1Name} prepares for an epic confrontation.`,
        introB: `${fighter2Name} stands ready to meet their opponent.`,
        error: "Specific matchup title not found, using default." // This could be a soft error for logging
    };
}
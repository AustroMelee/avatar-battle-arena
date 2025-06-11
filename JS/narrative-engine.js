'use strict';

import { characters } from './characters.js';
import { locations, terrainTags } from './locations.js';
import { battleBeats } from './narrative-data.js';

// --- NEW HELPER FUNCTION: The heart of our repetition fix ---
// This ensures we don't use the same move over and over.
function getUniqueTechnique(character, usedTechniques) {
    // Filter out techniques that have already been used in this fight.
    const availableTechniques = character.techniques.filter(t => !usedTechniques.has(t.verb));

    // If we still have unique techniques left, pick one.
    if (availableTechniques.length > 0) {
        const technique = getRandomElement(availableTechniques);
        usedTechniques.add(technique.verb); // Mark this verb as used
        return technique;
    }

    // If we've used all unique techniques, we'll allow a repeat but prioritize non-finishers.
    const nonFinishers = character.techniques.filter(t => !t.finisher);
    if (nonFinishers.length > 0) {
        return getRandomElement(nonFinishers);
    }
    
    // Fallback to any technique if only finishers are left
    return getRandomElement(character.techniques);
}


function toGerund(verb = '') {
    if (!verb) return "";
    verb = verb.toLowerCase();
    if (verb.endsWith('e') && !['be', 'see', 'use', 'dodge'].includes(verb)) return verb.slice(0, -1) + 'ing';
    const double = ['run', 'swim', 'cut', 'hit', 'pin', 'set', 'sit', 'propel', 'spin', 'turn', 'engulf', 'heat', 'jab', 'slip'];
    if (double.includes(verb)) return verb + verb.slice(-1) + 'ing';
    return verb + 'ing';
}

function toPastTense(verb = '') {
    if (!verb) return "";
    verb = verb.toLowerCase();
    if (verb.endsWith('e')) return verb + 'd';
    if (verb.endsWith('y') && verb.length > 2) return verb.slice(0, -1) + 'ied';
    const irregular = { 'hurl': 'hurled', 'run': 'ran', 'swim': 'swam', 'cut': 'cut', 'hit': 'hit', 'set': 'set', 'sit': 'sat', 'spin': 'spun', 'throw': 'threw', 'breathe': 'breathed', 'lead': 'led', 'find': 'found' };
    if (irregular[verb]) return irregular[verb];
    const double = ['pin', 'slip', 'jab'];
     if (double.includes(verb)) return verb + verb.slice(-1) + 'ed';
    return verb + 'ed';
}

function getRandomElement(array) {
    if (!array || array.length === 0) return '';
    return array[Math.floor(Math.random() * array.length)];
}

export function generatePlayByPlay(f1Id, f2Id, locId, battleOutcome) {
    const { winnerId, loserId } = battleOutcome;
    const f1 = characters[f1Id], f2 = characters[f2Id], loc = locations[locId];
    const winner = characters[winnerId], loser = characters[loserId];

    let story = [];
    const usedTechniques = new Set(); // The context controller for verb usage

    const populateBeat = (template, initiator, responder, context) => {
        const { winner, loser, loc, initiatorTech, responderTech } = context;
        // The finisher description is now self-contained and doesn't need a verb/object.
        const finisherDescription = getRandomElement(winner.techniques.filter(t => t.finisher))?.finalFlavor || `delivered a final, decisive blow.`;

        // --- GRAMMAR FIX: Capitalize pronouns for start-of-sentence usage ---
        const initiatorPronounSCap = initiator.pronouns.s.charAt(0).toUpperCase() + initiator.pronouns.s.slice(1);
        const responderPronounSCap = responder.pronouns.s.charAt(0).toUpperCase() + responder.pronouns.s.slice(1);

        return template
            .replace(/{initiatorName}/g, `<span class="char-${initiator.id}">${initiator.name}</span>`)
            .replace(/{responderName}/g, `<span class="char-${responder.id}">${responder.name}</span>`)
            .replace(/{winnerName}/g, `<span class="char-${winner.id}">${winner.name}</span>`)
            .replace(/{loserName}/g, `<span class="char-${loser.id}">${loser.name}</span>`)
            .replace(/{locationFeature}/g, `<b>${loc.featureA}</b>`)
            .replace(/{locationTerrain}/g, `<b>${loc.terrain}</b>`)
            .replace(/{initiatorPronounS}/g, initiator.pronouns.s)
            .replace(/{initiatorPronounSCap}/g, initiatorPronounSCap)
            .replace(/{initiatorPronounO}/g, initiator.pronouns.o)
            .replace(/{initiatorPronounP}/g, initiator.pronouns.p)
            .replace(/{initiator_verb_ing}/g, toGerund(initiatorTech.verb))
            .replace(/{initiator_verb_past}/g, toPastTense(initiatorTech.verb))
            .replace(/{initiator_verb_base}/g, initiatorTech.verb.toLowerCase())
            .replace(/{initiator_object}/g, initiatorTech.object || '')
            .replace(/{responderPronounS}/g, responder.pronouns.s)
            .replace(/{responderPronounSCap}/g, responderPronounSCap)
            .replace(/{responderPronounO}/g, responder.pronouns.o)
            .replace(/{responderPronounP}/g, responder.pronouns.p)
            .replace(/{responder_verb_ing}/g, toGerund(responderTech.verb))
            .replace(/{responder_verb_past}/g, toPastTense(responderTech.verb))
            .replace(/{responder_verb_base}/g, responderTech.verb.toLowerCase())
            .replace(/{responder_object}/g, responderTech.object || '')
            .replace(/{winnerFinisherDescription}/g, finisherDescription);
    };
    
    // --- OPENING BEAT ---
    const openingContext = {
        winner, loser, loc,
        initiatorTech: getUniqueTechnique((f1.powerTier >= f2.powerTier) ? f1 : f2, usedTechniques),
        responderTech: getUniqueTechnique((f1.powerTier < f2.powerTier) ? f1 : f2, usedTechniques)
    };
    const openingInitiator = (f1.powerTier >= f2.powerTier) ? f1 : f2;
    const openingResponder = (openingInitiator.id === f1.id) ? f2 : f1;
    story.push(populateBeat(getRandomElement(battleBeats.opening), openingInitiator, openingResponder, openingContext));

    // --- ADVANTAGE BEAT (Winner's attack) ---
    const advantageContext = {
        winner, loser, loc,
        initiatorTech: getUniqueTechnique(winner, usedTechniques),
        responderTech: getUniqueTechnique(loser, usedTechniques)
    };
    story.push(populateBeat(getRandomElement(battleBeats.advantage_attack), winner, loser, advantageContext));
    
    // --- MID BEAT (Interaction or Loser's counter-attack) ---
    const locTags = terrainTags[locId] || [];
    const winnerTerrainAdvantage = winner.strengths.some(s => locTags.includes(s));
    let midBeatTemplate;
    const midBeatContext = {
        winner, loser, loc,
        initiatorTech: getUniqueTechnique(winnerTerrainAdvantage ? winner : loser, usedTechniques),
        responderTech: getUniqueTechnique(winnerTerrainAdvantage ? loser : winner, usedTechniques)
    };

    if (winnerTerrainAdvantage && Math.random() > 0.5) {
        midBeatTemplate = getRandomElement(battleBeats.terrain_interaction);
        story.push(populateBeat(midBeatTemplate, winner, loser, midBeatContext));
    } else {
        midBeatTemplate = getRandomElement(battleBeats.disadvantage_attack);
        story.push(populateBeat(midBeatTemplate, loser, winner, midBeatContext));
    }

    // --- FINISHING MOVE ---
    const finishingContext = { winner, loser, loc, initiatorTech: {}, responderTech: {} }; // No specific techniques needed here
    story.push(populateBeat(getRandomElement(battleBeats.finishing_move), winner, loser, finishingContext));

    return story.map(beat => `<p>${beat}</p>`).join('');
}
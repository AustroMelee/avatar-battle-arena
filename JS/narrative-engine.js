'use strict';

import { characters, locations, terrainTags, battleBeats } from './data/index.js';

// --- GRAMMAR HELPERS ---

function toGerund(verb = '') { // -ing form
    if (!verb) return "";
    if (verb.endsWith('e') && !['be', 'see', 'use'].includes(verb)) return verb.slice(0, -1) + 'ing';
    const double = ['run', 'swim', 'cut', 'hit', 'pin', 'set', 'sit', 'propel', 'spin', 'turn', 'engulf', 'heat'];
    if (double.includes(verb)) return verb + verb.slice(-1) + 'ing';
    return verb + 'ing';
}

function toPastTense(verb = '') { // -ed form (simplified for this project)
    if (!verb) return "";
    if (verb.endsWith('e')) return verb + 'd';
    if (verb.endsWith('y')) return verb.slice(0, -1) + 'ied';
    const irregular = { 'hurl': 'hurled', 'run': 'ran', 'swim': 'swam', 'cut': 'cut', 'hit': 'hit', 'set': 'set', 'sit': 'sat', 'spin': 'spun' };
    if (irregular[verb]) return irregular[verb];
    return verb + 'ed';
}

function getRandomElement(array) {
    if (!array || array.length === 0) return '';
    return array[Math.floor(Math.random() * array.length)];
}

// --- MAIN NARRATIVE GENERATOR ---

export function generatePlayByPlay(f1Id, f2Id, locId, battleOutcome) {
    const { winnerId, loserId } = battleOutcome;
    const f1 = characters[f1Id], f2 = characters[f2Id], loc = locations[locId];
    const winner = characters[winnerId], loser = characters[loserId];

    let story = [];

    const populateBeat = (template, initiator, responder) => {
        const initiatorTech = getRandomElement(initiator.techniques) || { verb: 'move', object: 'forward', method: ''};
        const responderTech = getRandomElement(responder.techniques) || { verb: 'defend', object: 'themself', method: ''};
        const winnerTech = getRandomElement(winner.techniques.filter(t => t.finisher)) || getRandomElement(winner.techniques) || { verb: 'strike', object: 'out', method: ''};

        return template
            .replace(/{initiatorName}/g, `<span class="char-${initiator.id}">${initiator.name}</span>`)
            .replace(/{responderName}/g, `<span class="char-${responder.id}">${responder.name}</span>`)
            .replace(/{winnerName}/g, `<span class="char-${winner.id}">${winner.name}</span>`)
            .replace(/{loserName}/g, `<span class="char-${loser.id}">${loser.name}</span>`)
            .replace(/{locationFeature}/g, loc.featureA)
            .replace(/{locationTerrain}/g, loc.terrain)
            // Initiator Verbs
            .replace(/{initiator_verb_ing}/g, toGerund(initiatorTech.verb))
            .replace(/{initiator_verb_past}/g, toPastTense(initiatorTech.verb))
            .replace(/{initiator_verb_base}/g, initiatorTech.verb)
            // Responder Verbs
            .replace(/{responder_verb_ing}/g, toGerund(responderTech.verb))
            .replace(/{responder_verb_past}/g, toPastTense(responderTech.verb))
            .replace(/{responder_verb_base}/g, responderTech.verb)
            // Winner Verbs (for finisher)
            .replace(/{winner_verb_past}/g, toPastTense(winnerTech.verb))
            // Objects
            .replace(/{initiator_object}/g, initiatorTech.object || '')
            .replace(/{responder_object}/g, responderTech.object || '')
            .replace(/{winner_object}/g, winnerTech.object || '');
    };

    // BEAT 1: Opening
    story.push(populateBeat(getRandomElement(battleBeats.opening), (f1.powerTier >= f2.powerTier ? f1 : f2), (f1.powerTier >= f2.powerTier ? f2 : f1)));

    // BEAT 2: Winner's Advantage
    story.push(populateBeat(getRandomElement(battleBeats.advantage_attack), winner, loser));
    
    // BEAT 3: Loser's Counter-Attempt
    const locTags = terrainTags[locId] || [];
    const winnerTerrainAdvantage = winner.strengths.some(s => locTags.includes(s));
    const template = (winnerTerrainAdvantage && Math.random() > 0.5)
        ? getRandomElement(battleBeats.terrain_interaction)
        : getRandomElement(battleBeats.disadvantage_attack);
    story.push(populateBeat(template, loser, winner));

    // BEAT 4: Finishing Move
    story.push(populateBeat(getRandomElement(battleBeats.finishing_move), winner, loser));

    return story.map(beat => `<p>${beat}</p>`).join('');
}
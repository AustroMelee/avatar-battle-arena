'use strict';

import { characters } from './characters.js';
import { locations, terrainTags } from './locations.js';
import { battleBeats } from './narrative-data.js';

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

    const populateBeat = (template, initiator, responder, context) => {
        const { winner, loser, loc, winnerTech, loserTech } = context;
        const initiatorTech = (initiator.id === winner.id) ? winnerTech : loserTech;
        const responderTech = (responder.id === winner.id) ? winnerTech : loserTech;
        const finisherTech = getRandomElement(winner.techniques.filter(t => t.finisher)) || getRandomElement(winner.techniques) || { verb: 'strike', object: 'out', method: ''};

        return template
            .replace(/{initiatorName}/g, `<span class="char-${initiator.id}">${initiator.name}</span>`)
            .replace(/{responderName}/g, `<span class="char-${responder.id}">${responder.name}</span>`)
            .replace(/{winnerName}/g, `<span class="char-${winner.id}">${winner.name}</span>`)
            .replace(/{loserName}/g, `<span class="char-${loser.id}">${loser.name}</span>`)
            .replace(/{locationFeature}/g, loc.featureA)
            .replace(/{locationTerrain}/g, loc.terrain)
            .replace(/{initiatorPronounS}/g, initiator.pronouns.s)
            .replace(/{initiatorPronounO}/g, initiator.pronouns.o)
            .replace(/{initiatorPronounP}/g, initiator.pronouns.p)
            .replace(/{initiator_verb_ing}/g, toGerund(initiatorTech.verb))
            .replace(/{initiator_verb_past}/g, toPastTense(initiatorTech.verb))
            .replace(/{initiator_verb_base}/g, initiatorTech.verb.toLowerCase())
            .replace(/{initiator_object}/g, initiatorTech.object || '')
            .replace(/{responderPronounS}/g, responder.pronouns.s)
            .replace(/{responderPronounO}/g, responder.pronouns.o)
            .replace(/{responderPronounP}/g, responder.pronouns.p)
            .replace(/{responder_verb_ing}/g, toGerund(responderTech.verb))
            .replace(/{responder_verb_past}/g, toPastTense(responderTech.verb))
            .replace(/{responder_verb_base}/g, responderTech.verb.toLowerCase())
            .replace(/{responder_object}/g, responderTech.object || '')
            .replace(/{winnerFinisherDescription}/g, getRandomElement(finisherTech.finalFlavor) || `delivered a final, decisive blow.`);
    };
    
    const context = {
        winner,
        loser,
        loc,
        winnerTech: getRandomElement(winner.techniques) || { verb: 'attack', object: 'fiercely' },
        loserTech: getRandomElement(loser.techniques) || { verb: 'defend', object: 'desperately' }
    };

    const openingInitiator = (f1.powerTier >= f2.powerTier) ? f1 : f2;
    const openingResponder = (openingInitiator.id === f1.id) ? f2 : f1;
    story.push(populateBeat(getRandomElement(battleBeats.opening), openingInitiator, openingResponder, context));

    story.push(populateBeat(getRandomElement(battleBeats.advantage_attack), winner, loser, context));
    
    const locTags = terrainTags[locId] || [];
    const winnerTerrainAdvantage = winner.strengths.some(s => locTags.includes(s));
    let midBeatTemplate;
    if (winnerTerrainAdvantage && Math.random() > 0.5) {
        midBeatTemplate = getRandomElement(battleBeats.terrain_interaction);
        story.push(populateBeat(midBeatTemplate, winner, loser, context));
    } else {
        midBeatTemplate = getRandomElement(battleBeats.disadvantage_attack);
        story.push(populateBeat(midBeatTemplate, loser, winner, context));
    }

    story.push(populateBeat(getRandomElement(battleBeats.finishing_move), winner, loser, context));

    return story.map(beat => `<p>${beat}</p>`).join('');
}
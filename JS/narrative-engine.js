'use strict';

import { characters } from './characters.js';
import { locations, terrainTags } from './locations.js';
import { battleBeats } from './narrative-data.js';

function assembleObjectPhrase(technique) {
    if (!technique || !technique.object) {
        return '';
    }
    if (technique.requiresArticle) {
        const firstLetter = technique.object.charAt(0).toLowerCase();
        const article = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter) ? 'an' : 'a';
        return `${article} ${technique.object}`;
    }
    return technique.object;
}

function getUniqueTechnique(character, usedTechniques) {
    const availableTechniques = character.techniques.filter(t => !usedTechniques.has(t.verb));
    if (availableTechniques.length > 0) {
        const technique = getRandomElement(availableTechniques);
        usedTechniques.add(technique.verb);
        return technique;
    }
    const nonFinishers = character.techniques.filter(t => !t.finisher);
    if (nonFinishers.length > 0) {
        return getRandomElement(nonFinishers);
    }
    return getRandomElement(character.techniques);
}

function toGerund(verb = '') {
    if (!verb) return "";
    verb = verb.toLowerCase();
    if (verb.endsWith('e') && !['be', 'see', 'use', 'dodge', 'freeze'].includes(verb)) return verb.slice(0, -1) + 'ing';
    const double = ['run', 'swim', 'cut', 'hit', 'pin', 'set', 'sit', 'propel', 'spin', 'turn', 'engulf', 'heat', 'jab', 'slip', 'control', 'wield'];
    if (double.includes(verb)) return verb + verb.slice(-1) + 'ing';
    return verb + 'ing';
}

function toPastTense(verb = '') {
    if (!verb) return "";
    verb = verb.toLowerCase();

    // FIX: Added 'sweep' to the irregular verb list.
    const irregular = { 
        'hurl': 'hurled', 'run': 'ran', 'swim': 'swam', 'cut': 'cut', 'hit': 'hit', 
        'set': 'set', 'sit': 'sat', 'spin': 'spun', 'throw': 'threw', 'breathe': 'breathed', 
        'lead': 'led', 'find': 'found', 'ride': 'rode', 'weave': 'wove', 'freeze': 'froze', 
        'bend': 'bent', 'strike': 'struck', 'sweep': 'swept'
    };
    if (irregular[verb]) {
        return irregular[verb];
    }
    
    if (verb.endsWith('e')) return verb + 'd';
    if (verb.endsWith('y') && verb.length > 2) return verb.slice(0, -1) + 'ied';

    const double = ['pin', 'slip', 'jab'];
     if (double.includes(verb)) return verb + verb.slice(-1) + 'ed';
    return verb + 'ed';
}

function getRandomElement(array) {
    if (!array || array.length === 0) return '';
    // Guard against being passed a string instead of an array
    if (typeof array === 'string') return array; 
    return array[Math.floor(Math.random() * array.length)];
}

export function generatePlayByPlay(f1Id, f2Id, locId, battleOutcome) {
    const { winnerId, loserId } = battleOutcome;
    const f1 = characters[f1Id], f2 = characters[f2Id], loc = locations[locId];
    const winner = characters[winnerId], loser = characters[loserId];

    let story = [];
    const usedTechniques = new Set();

    const populateBeat = (template, initiator, responder, context) => {
        const { winner, loc, initiatorTech, responderTech } = context;
        
        const finisherTechnique = getRandomElement(winner.techniques.filter(t => t.finisher));
        const finisherDescription = getRandomElement(finisherTechnique?.finalFlavor) || `${winner.name} delivered a final, decisive blow.`;

        const initiatorPronounSCap = initiator.pronouns.s.charAt(0).toUpperCase() + initiator.pronouns.s.slice(1);
        const responderPronounSCap = responder.pronouns.s.charAt(0).toUpperCase() + responder.pronouns.s.slice(1);

        const initiatorObjectPhrase = assembleObjectPhrase(initiatorTech);
        const responderObjectPhrase = assembleObjectPhrase(responderTech);

        return template
            .replace(/{initiatorName}/g, `<span class="char-${initiator.id}">${initiator.name}</span>`)
            .replace(/{responderName}/g, `<span class="char-${responder.id}">${responder.name}</span>`)
            .replace(/{locationFeature}/g, `<b>${loc.featureA}</b>`)
            .replace(/{locationTerrain}/g, `<b>${loc.terrain}</b>`)
            .replace(/{initiatorPronounS}/g, initiator.pronouns.s)
            .replace(/{initiatorPronounSCap}/g, initiatorPronounSCap)
            .replace(/{initiatorPronounO}/g, initiator.pronouns.o)
            .replace(/{initiatorPronounP}/g, initiator.pronouns.p)
            .replace(/{initiator_verb_ing}/g, toGerund(initiatorTech?.verb || '').trim())
            .replace(/{initiator_verb_past}/g, toPastTense(initiatorTech?.verb || '').trim())
            .replace(/{initiator_verb_base}/g, (initiatorTech?.verb || '').toLowerCase().trim())
            .replace(/{initiator_object_phrase}/g, initiatorObjectPhrase.trim())
            .replace(/{responderPronounS}/g, responder.pronouns.s)
            .replace(/{responderPronounSCap}/g, responderPronounSCap)
            .replace(/{responderPronounO}/g, responder.pronouns.o)
            .replace(/{responderPronounP}/g, responder.pronouns.p)
            .replace(/{responder_verb_ing}/g, toGerund(responderTech?.verb || '').trim())
            .replace(/{responder_verb_past}/g, toPastTense(responderTech?.verb || '').trim())
            .replace(/{responder_verb_base}/g, (responderTech?.verb || '').toLowerCase().trim())
            .replace(/{responder_object_phrase}/g, responderObjectPhrase.trim())
            .replace(/{winnerFinisherDescription}/g, finisherDescription);
    };
    
    const openingInitiator = (f1.powerTier >= f2.powerTier) ? f1 : f2;
    const openingResponder = (openingInitiator.id === f1.id) ? f2 : f1;
    const openingContext = {
        winner, loser, loc,
        initiatorTech: getUniqueTechnique(openingInitiator, usedTechniques),
        responderTech: getUniqueTechnique(openingResponder, usedTechniques)
    };
    story.push(populateBeat(getRandomElement(battleBeats.opening), openingInitiator, openingResponder, openingContext));

    const advantageContext = {
        winner, loser, loc,
        initiatorTech: getUniqueTechnique(winner, usedTechniques),
        responderTech: getUniqueTechnique(loser, usedTechniques)
    };
    story.push(populateBeat(getRandomElement(battleBeats.advantage_attack), winner, loser, advantageContext));
    
    const locTags = terrainTags[locId] || [];
    const winnerTerrainAdvantage = winner.strengths.some(s => locTags.includes(s));
    
    if (winnerTerrainAdvantage && Math.random() > 0.5) {
        const context = {
            winner, loser, loc,
            initiatorTech: getUniqueTechnique(winner, usedTechniques),
            responderTech: getUniqueTechnique(loser, usedTechniques)
        };
        story.push(populateBeat(getRandomElement(battleBeats.terrain_interaction), winner, loser, context));
    } else {
        const context = {
            winner, loser, loc,
            initiatorTech: getUniqueTechnique(loser, usedTechniques),
            responderTech: getUniqueTechnique(winner, usedTechniques)
        };
        story.push(populateBeat(getRandomElement(battleBeats.disadvantage_attack), loser, winner, context));
    }

    const defaultTech = { verb: '', object: '', requiresArticle: false };
    const finishingContext = { winner, loser, loc, initiatorTech: defaultTech, responderTech: defaultTech };
    story.push(populateBeat(getRandomElement(battleBeats.finishing_move), winner, loser, finishingContext));

    return story.map(beat => `<p>${beat}</p>`).join('');
}
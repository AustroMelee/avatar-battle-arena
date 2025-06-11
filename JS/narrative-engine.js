'use strict';

// This file has been corrected to import ALL necessary data.
import { characters, locations, terrainTags, battleBeats } from './data/index.js';

function getRandomElement(array) {
    if (!array || array.length === 0) return '';
    return array[Math.floor(Math.random() * array.length)];
}

function getActionPhrase(character, isFinisher = false) {
    let technique;
    if (isFinisher) {
        technique = character.techniques.find(t => t.finisher);
    }
    // If no finisher is requested or found, get a random one.
    if (!technique) {
        technique = getRandomElement(character.techniques);
    }
    
    if (!technique) return "made a standard move";
    return `${technique.verb} ${technique.object} ${technique.method}`;
}

export function generatePlayByPlay(f1Id, f2Id, locId, battleOutcome) {
    const { winnerId, loserId } = battleOutcome;
    const f1 = characters[f1Id];
    const f2 = characters[f2Id];
    const loc = locations[locId];
    const winner = characters[winnerId];
    const loser = characters[loserId];

    let story = [];
    let initiator, responder;

    // BEAT 1: The Opening
    initiator = (f1.powerTier >= f2.powerTier) ? f1 : f2;
    responder = (initiator.id === f1.id) ? f2 : f1;
    let openingTemplate = getRandomElement(battleBeats.opening);
    story.push(openingTemplate
        .replace(/{initiatorName}/g, `<span class="char-${initiator.id}">${initiator.name}</span>`)
        .replace(/{responderName}/g, `<span class="char-${responder.id}">${responder.name}</span>`)
        .replace(/{actionPhrase}/g, getActionPhrase(initiator))
        .replace(/{responsePhrase}/g, getActionPhrase(responder))
    );

    // BEAT 2: Mid-game - Winner's Advantage
    initiator = winner;
    responder = loser;
    let advantageTemplate = getRandomElement(battleBeats.advantage_attack);
    story.push(advantageTemplate
        .replace(/{initiatorName}/g, `<span class="char-${initiator.id}">${initiator.name}</span>`)
        .replace(/{responderName}/g, `<span class="char-${responder.id}">${responder.name}</span>`)
        .replace(/{actionPhrase}/g, getActionPhrase(initiator))
        .replace(/{responsePhrase}/g, getActionPhrase(responder))
    );
    
    // BEAT 3: Mid-game - Loser's Counter-Attempt / Terrain
    initiator = loser;
    responder = winner;
    const locTags = terrainTags[locId] || [];
    const winnerTerrainScore = (winner.strengths.filter(s => locTags.includes(s)).length - winner.weaknesses.filter(s => locTags.includes(s)).length);
    let midGameTemplate = (winnerTerrainScore > 0 && Math.random() > 0.5)
        ? getRandomElement(battleBeats.terrain_interaction)
        : getRandomElement(battleBeats.disadvantage_attack);
    
    story.push(midGameTemplate
        .replace(/{initiatorName}/g, `<span class="char-${initiator.id}">${initiator.name}</span>`)
        .replace(/{responderName}/g, `<span class="char-${responder.id}">${responder.name}</span>`)
        .replace(/{actionPhrase}/g, getActionPhrase(initiator))
        .replace(/{responsePhrase}/g, getActionPhrase(responder))
        .replace(/{locationFeature}/g, loc.featureA)
        .replace(/{locationTerrain}/g, loc.terrain)
    );

    // BEAT 4: The Finishing Move
    let finishingTemplate = getRandomElement(battleBeats.finishing_move);
    story.push(finishingTemplate
        .replace(/{winnerName}/g, `<span class="char-${winner.id}">${winner.name}</span>`)
        .replace(/{loserName}/g, `<span class="char-${loser.id}">${loser.name}</span>`)
        .replace(/{actionPhrase}/g, getActionPhrase(winner, true)) // Request a finisher
    );

    return story.map(beat => `<p>${beat}</p>`).join('');
}
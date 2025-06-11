'use strict';

// ** THIS IS THE CORRECTED IMPORT STATEMENT **
import { characters, locations, terrainTags, battleBeats } from './data/index.js';

// Helper to get a random element from an array
function getRandomElement(array) {
    if (!array || array.length === 0) return '';
    return array[Math.floor(Math.random() * array.length)];
}

// Helper to construct a phrase from a character's technique
function getActionPhrase(character) {
    const technique = getRandomElement(character.techniques);
    if (!technique) return "made a standard move";
    return `${technique.verb} ${technique.object} ${technique.method}`;
}

/**
 * Generates a full play-by-play battle narrative.
 * @param {string} f1Id - Fighter 1's ID
 * @param {string} f2Id - Fighter 2's ID
 * @param {string} locId - Location ID
 * @param {object} battleOutcome - The result from calculateWinProbability
 * @returns {string} - The HTML string for the story.
 */
export function generatePlayByPlay(f1Id, f2Id, locId, battleOutcome) {
    const { winnerId, loserId } = battleOutcome;
    const f1 = characters[f1Id];
    const f2 = characters[f2Id];
    const loc = locations[locId];
    const winner = characters[winnerId];
    const loser = characters[loserId];

    let story = [];
    let initiator, responder;

    // --- BEAT 1: The Opening ---
    initiator = (f1.powerTier >= f2.powerTier) ? f1 : f2;
    responder = (initiator.id === f1.id) ? f2 : f1;

    let openingTemplate = getRandomElement(battleBeats.opening);
    let openingStory = openingTemplate
        .replace(/{initiatorName}/g, `<span class="char-${initiator.id}">${initiator.name}</span>`)
        .replace(/{responderName}/g, `<span class="char-${responder.id}">${responder.name}</span>`)
        .replace(/{actionPhrase}/g, getActionPhrase(initiator))
        .replace(/{responsePhrase}/g, getActionPhrase(responder));
    story.push(openingStory);

    // --- BEAT 2: Mid-game - The Winner Pressing Advantage ---
    initiator = winner;
    responder = loser;
    let advantageTemplate = getRandomElement(battleBeats.advantage_attack);
    let advantageStory = advantageTemplate
        .replace(/{initiatorName}/g, `<span class="char-${initiator.id}">${initiator.name}</span>`)
        .replace(/{responderName}/g, `<span class="char-${responder.id}">${responder.name}</span>`)
        .replace(/{actionPhrase}/g, getActionPhrase(initiator))
        .replace(/{responsePhrase}/g, getActionPhrase(responder));
    story.push(advantageStory);
    
    // --- BEAT 3: Mid-game - Loser's Counter-Attempt ---
    initiator = loser;
    responder = winner;
    
    // This logic now works because terrainTags is imported
    const locTags = terrainTags[locId] || [];
    const winnerTerrainScore = (winner.strengths.filter(s => locTags.includes(s)).length - winner.weaknesses.filter(s => locTags.includes(s)).length);
    let midGameTemplate;
    if (winnerTerrainScore > 0 && Math.random() > 0.5) {
        midGameTemplate = getRandomElement(battleBeats.terrain_interaction);
    } else {
        midGameTemplate = getRandomElement(battleBeats.disadvantage_attack);
    }
    
    let midGameStory = midGameTemplate
        .replace(/{initiatorName}/g, `<span class="char-${initiator.id}">${initiator.name}</span>`)
        .replace(/{responderName}/g, `<span class="char-${responder.id}">${responder.name}</span>`)
        .replace(/{actionPhrase}/g, getActionPhrase(initiator))
        .replace(/{responsePhrase}/g, getActionPhrase(responder))
        .replace(/{locationFeature}/g, loc.featureA)
        .replace(/{locationTerrain}/g, loc.terrain);
    story.push(midGameStory);

    // --- BEAT 4: The Finishing Move ---
    const finishingTechnique = winner.techniques.find(t => t.finisher);
    const finishingMovePhrase = finishingTechnique 
        ? `${finishingTechnique.verb} ${finishingTechnique.object} ${finishingTechnique.method}`
        : getActionPhrase(winner);

    let finishingTemplate = getRandomElement(battleBeats.finishing_move);
    let finishingStory = finishingTemplate
        .replace(/{winnerName}/g, `<span class="char-${winner.id}">${winner.name}</span>`)
        .replace(/{loserName}/g, `<span class="char-${loser.id}">${loser.name}</span>`)
        .replace(/{actionPhrase}/g, finishingMovePhrase);
    story.push(finishingStory);

    return story.map(beat => `<p>${beat}</p>`).join('');
}

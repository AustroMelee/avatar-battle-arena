'use strict';

import { generatePlayByPlay } from './narrative-engine.js'; 
import { characters } from './characters.js';
import { locations, terrainTags } from './locations.js';
import { victoryTypes, postBattleVictoryPhrases } from './narrative.js';
import { adjectiveToNounMap } from './mechanics.js';


let usedReasonIds = new Set();

// --- UTILITY & HELPER FUNCTIONS ---

function getRandomElement(array, fallbackValue = "skill") {
    if (!array || array.length === 0) return fallbackValue;
    return array[Math.floor(Math.random() * array.length)];
}

function normalizeTraitToNoun(traitString) {
    if (!traitString) return 'skill';
    const normalized = traitString.toLowerCase().replace(/ /g, '_');
    return adjectiveToNounMap[normalized] || traitString.replace(/_/g, ' ');
}

// --- NARRATIVE HELPER FUNCTIONS ---

function getVictoryQuote(character, victoryData) {
    if (!character || !character.quotes) return "Victory is mine.";
    const { type, opponentId, resolutionTone } = victoryData;
    const quotes = character.quotes;

    // Prioritize specific opponent quotes
    if (opponentId && quotes.postWin_specific && quotes.postWin_specific[opponentId]) {
        return getRandomElement(quotes.postWin_specific[opponentId]);
    }
    
    // Then, prioritize quotes matching the resolution tone
    if (resolutionTone?.type === "overwhelming_power" && quotes.postWin_overwhelming) {
        return getRandomElement(quotes.postWin_overwhelming);
    }
    if (resolutionTone?.type === "clever_victory" && quotes.postWin_clever) {
        return getRandomElement(quotes.postWin_clever);
    }
    if (resolutionTone?.type === "emotional_yield" && quotes.postWin_reflective) {
        return getRandomElement(quotes.postWin_reflective);
    }

    // Fallback to general victory types
    if (quotes[`postWin_${type}`]) {
        return getRandomElement(quotes[`postWin_${type}`]);
    }
    
    // Final fallback to a generic post-win quote
    return getRandomElement(quotes.postWin, "I am victorious.");
}

function populateTemplate(template, data) {
    return template.replace(/{(\w+)}/g, (match, key) => {
        const lowerKey = key.toLowerCase();
        for (const dataKey in data) {
            if (dataKey.toLowerCase() === lowerKey) {
                return data[dataKey];
            }
        }
        return match;
    });
}


function getToneAlignedVictoryEnding(winnerId, loserId, winProb, victoryType, resolutionTone) {
    const winnerChar = characters[winnerId];
    const loserChar = characters[loserId];

    const templateData = {
        WinnerName: `<span class="char-${winnerId}">${winnerChar.name}</span>`,
        LoserName: `<span class="char-${loserId}">${loserChar.name}</span>`,
        WinnerPronounS: winnerChar.pronouns.s,
        WinnerPronounO: winnerChar.pronouns.o,
        WinnerPronounP: winnerChar.pronouns.p,
        LoserPronounS: loserChar.pronouns.s,
        LoserPronounO: loserChar.pronouns.o,
        LoserPronounP: loserChar.pronouns.p,
        WinnerStrength: normalizeTraitToNoun(getRandomElement(winnerChar?.strengths, "skill")),
        LoserID: loserId, 
    };

    const quoteData = { 
        type: winProb >= 90 ? 'stomp' : (winProb >= 75 ? 'dominant' : 'narrow'), 
        opponentId: loserId, 
        resolutionTone 
    };
    templateData.WinnerQuote = getVictoryQuote(winnerChar, quoteData);
    
    let template;
    const specificEnding = victoryTypes[victoryType]?.narrativeEndings?.[winnerId];
    if (specificEnding) {
        template = specificEnding;
    } else {
        const archetypePhrases = postBattleVictoryPhrases[winnerChar.victoryStyle] || postBattleVictoryPhrases.default;
        template = getRandomElement(archetypePhrases);
    }

    return populateTemplate(template, templateData);
}

// --- CORE BATTLE LOGIC ---

function determineVictoryType(winnerId, loserId, winProb) {
    const winnerChar = characters[winnerId];
    const loserChar = characters[loserId];
    
    if (winnerChar.type === 'Chi Blocker' && loserChar.type === 'Bender') return 'disabling_strike';
    if (winProb >= 90) return 'overwhelm';
    if (winnerChar.role === 'tactician' || winnerChar.role === 'mentor_strategist') return 'outsmart';
    if (winnerChar.role === 'tank_disabler') return 'terrain_kill';
    if (winnerChar.tone.includes('reluctant') || winnerChar.tone.includes('pacifistic')) return 'morale_break';
    
    return 'overwhelm';
}

function determineResolutionTone(fightContext) {
    const { victoryType, relationship, winProb } = fightContext;
    if (victoryType === "morale_break" && relationship?.bond?.includes("strong")) return { type: "emotional_yield" };
    if (victoryType === "overwhelm" && winProb >= 85) return { type: "overwhelming_power" };
    if (victoryType === "outsmart") return { type: "clever_victory" };
    return { type: "technical_win" };
}


// --- MAIN EXPORTED FUNCTIONS ---

export function calculateWinProbability(f1Id, f2Id, locId) {
    usedReasonIds.clear();
    const f1 = characters[f1Id], f2 = characters[f2Id];
    const location = locations[locId];
    let f1NetModifier = 50, f2NetModifier = 50;
    const outcomeReasons = [];

    const addReason = (fighter, reason, modifier) => {
        const fighterName = `<span class="char-${fighter.id}">${fighter.name}</span>`;
        const reasonText = reason.replace('{FighterName}', fighterName);
        const reasonId = `${fighter.id}|${reasonText}|${modifier}`;

        if (!usedReasonIds.has(reasonId) && modifier !== 0) {
            outcomeReasons.push({ fighterId: fighter.id, reason: reasonText, modifier });
            usedReasonIds.add(reasonId);
        }
    };
    
    const tierGap = f1.powerTier - f2.powerTier;
    if (tierGap !== 0) {
        const tierModifier = Math.sign(tierGap) * (Math.abs(tierGap) * 5 + Math.pow(Math.abs(tierGap), 2));
        addReason(f1, 'Power Tier Advantage', tierModifier);
        addReason(f2, 'Power Tier Disadvantage', -tierModifier);
        f1NetModifier += tierModifier;
        f2NetModifier -= tierModifier;
    }

    const locTags = terrainTags[locId] || [];
    [f1, f2].forEach(fighter => {
        let fighterModifier = 0;
        const locName = `<b>${location.name}</b>`;

        fighter.strengths?.forEach(strength => {
            if (locTags.includes(strength)) {
                fighterModifier += 10;
                addReason(fighter, `Leveraged ${locName}'s ${normalizeTraitToNoun(strength)}`, 10);
            }
        });
        fighter.weaknesses?.forEach(weakness => {
            if (locTags.includes(weakness)) {
                fighterModifier -= 10;
                addReason(fighter, `Hindered by ${locName}'s ${normalizeTraitToNoun(weakness)}`, -10);
            }
        });

        if (fighter.id === f1.id) f1NetModifier += fighterModifier;
        else f2NetModifier += fighterModifier;
    });
    
    f1NetModifier += Math.random() * 10 - 5;
    f2NetModifier += Math.random() * 10 - 5;
    
    const f1FinalScore = Math.max(1, f1NetModifier);
    const f2FinalScore = Math.max(1, f2NetModifier);
    const totalScore = f1FinalScore + f2FinalScore;
    const f1Prob = Math.round((f1FinalScore / totalScore) * 100);
    const winProb = Math.max(f1Prob, 100 - f1Prob);
    const winnerId = f1Prob >= 50 ? f1Id : f2Id;
    const loserId = f1Prob < 50 ? f1Id : f2Id;
    
    const victoryType = determineVictoryType(winnerId, loserId, winProb);
    const relationship = characters[winnerId]?.relationships?.[loserId];
    const resolutionTone = determineResolutionTone({ victoryType, relationship, winProb });
    
    return { winnerId, loserId, winProb, outcomeReasons, victoryType, f1FinalScore, f2FinalScore, resolutionTone };
}

export function generateBattleStory(f1Id, f2Id, locId, battleOutcome) {
    const playByPlay = generatePlayByPlay(f1Id, f2Id, locId, battleOutcome);
    const finalEnding = getToneAlignedVictoryEnding(battleOutcome.winnerId, battleOutcome.loserId, battleOutcome.winProb, battleOutcome.victoryType, battleOutcome.resolutionTone);
    return `${playByPlay}<br><p>${finalEnding}</p>`;
}
Use code with caution.
JavaScript
--- END OF FILE battle-engine.js ---
3. Updated narrative-engine.js
(The single import from data/index.js is replaced by several direct imports.)
--- START OF FILE narrative-engine.js ---
'use strict';

import { characters } from './characters.js';
import { locations, terrainTags } from './locations.js';
import { battleBeats } from './narrative-data.js';

// --- GRAMMAR HELPERS ---

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

// --- MAIN NARRATIVE GENERATOR ---

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
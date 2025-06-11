'use strict';

import { generatePlayByPlay } from './narrative-engine.js'; 
import { 
    characters, 
    locations, 
    terrainTags, 
    victoryTypes, 
    postBattleVictoryPhrases, 
    adjectiveToNounMap 
} from './data/index.js';

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
    let finalQuote;

    if (opponentId && quotes.postWin_specific && quotes.postWin_specific[opponentId]) {
        finalQuote = getRandomElement(quotes.postWin_specific[opponentId]);
    } else if (quotes[`postWin_${type}`]) {
        finalQuote = getRandomElement(quotes[`postWin_${type}`]);
    } else {
        finalQuote = quotes.postWin;
    }

    if (resolutionTone?.type === "emotional_yield" && quotes.postWin_reflective) {
        finalQuote = getRandomElement(quotes.postWin_reflective);
    } else if (resolutionTone?.type === "overwhelming_power" && quotes.postWin_overwhelming) {
        finalQuote = getRandomElement(quotes.postWin_overwhelming);
    } else if (resolutionTone?.type === "clever_victory" && quotes.postWin_clever) {
        finalQuote = getRandomElement(quotes.postWin_clever);
    }
    
    return finalQuote || "I am victorious.";
}

// ** UPDATED to remove extra quotes **
function getToneAlignedVictoryEnding(winnerId, loserId, winProb, victoryType, resolutionTone) {
    const winnerChar = characters[winnerId];
    const loserChar = characters[loserId];

    const archetypePhrases = postBattleVictoryPhrases[winnerChar.victoryStyle] || postBattleVictoryPhrases.default;
    let template = getRandomElement(archetypePhrases);
    
    const quoteData = { type: winProb >= 90 ? 'stomp' : (winProb >= 75 ? 'dominant' : 'narrow'), opponentId: loserId, resolutionTone };
    const quote = getVictoryQuote(winnerChar, quoteData);

    // The template in narrative.js already has quotes, so we just insert the text.
    return template
        .replace(/{WinnerQuote}/g, quote)
        .replace(/{WinnerName}/g, `<span class="char-${winnerId}">${winnerChar.name}</span>`)
        .replace(/{LoserName}/g, `<span class="char-${loserId}">${loserChar.name}</span>`);
}

// --- CORE BATTLE LOGIC ---

function determineVictoryType(winnerId, loserId, winProb) {
    const winnerChar = characters[winnerId];
    const loserChar = characters[loserId];
    if (winnerChar.bendingTypes?.includes('Chi-Blocking') && loserChar.type === 'Bender') return 'disabling_strike';
    if (winProb >= 90) return 'overwhelm';
    if (winnerChar.role === 'tactician' || winnerChar.role === 'mentor_strategist') return 'outsmart';
    if (winnerChar.role === 'tank_disabler') return 'terrain_kill';
    if (winnerChar.tone.includes('reluctant') || winnerChar.tone.includes('pacifistic')) return 'morale_break';
    return 'overwhelm';
}

function determineResolutionTone(fightContext) {
    const { winBy, relationshipStrength, winProb } = fightContext;
    if (winBy === "morale_break" && relationshipStrength >= 0.6) return { type: "emotional_yield" };
    if (winBy === "overwhelm" && winProb >= 85) return { type: "overwhelming_power" };
    if (winBy === "outsmart" || winBy === "tiebreak_win") return { type: "clever_victory" };
    return { type: "technical_win" };
}

// --- MAIN EXPORTED FUNCTIONS ---

export function calculateWinProbability(f1Id, f2Id, locId) {
    usedReasonIds.clear();
    const f1 = characters[f1Id], f2 = characters[f2Id];
    let f1NetModifier = 50, f2NetModifier = 50;
    const outcomeReasons = [];

    const addReason = (fighter, reason, modifier) => {
        const reasonId = `${fighter.name}|${reason}|${modifier}`;
        if (!usedReasonIds.has(reasonId) && modifier !== 0) {
            outcomeReasons.push({ fighterId: fighter.id, reason, modifier });
            usedReasonIds.add(reasonId);
        }
    };
    
    const tierGap = f1.powerTier - f2.powerTier;
    if (tierGap !== 0) {
        const tierModifier = Math.sign(tierGap) * (Math.abs(tierGap) * 5 + Math.pow(Math.abs(tierGap), 2));
        if (tierModifier > 0) {
            addReason(f1, 'Power Tier Advantage', tierModifier);
            addReason(f2, 'Power Tier Disadvantage', -tierModifier);
        } else {
            addReason(f1, 'Power Tier Disadvantage', tierModifier);
            addReason(f2, 'Power Tier Advantage', -tierModifier);
        }
        f1NetModifier += tierModifier;
        f2NetModifier -= tierModifier;
    }

    const locTags = terrainTags[locId] || [];
    [f1, f2].forEach(fighter => {
        let fighterModifier = 0;
        fighter.strengths?.forEach(strength => {
            if (locTags.includes(strength)) {
                fighterModifier += 10;
                addReason(fighter, `Leveraged ${normalizeTraitToNoun(strength)}`, 10);
            }
        });
        fighter.weaknesses?.forEach(weakness => {
            if (locTags.includes(weakness)) {
                fighterModifier -= 10;
                addReason(fighter, `Hindered by ${normalizeTraitToNoun(weakness)}`, -10);
            }
        });
        if (fighter.id === f1.id) {
            f1NetModifier += fighterModifier;
        } else {
            f2NetModifier += fighterModifier;
        }
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
    const resolutionTone = determineResolutionTone({ winBy: victoryType, relationshipStrength: 0, winProb });
    
    return { winnerId, loserId, winProb, outcomeReasons, victoryType, f1FinalScore, f2FinalScore, resolutionTone };
}

export function generateBattleStory(f1Id, f2Id, locId, battleOutcome) {
    const playByPlay = generatePlayByPlay(f1Id, f2Id, locId, battleOutcome);
    const finalEnding = getToneAlignedVictoryEnding(battleOutcome.winnerId, battleOutcome.loserId, battleOutcome.winProb, battleOutcome.victoryType, battleOutcome.resolutionTone);
    return `${playByPlay}<br><p>${finalEnding}</p>`;
}
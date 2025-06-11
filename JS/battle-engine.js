'use strict';

import { generatePlayByPlay } from './narrative-engine.js'; 
import { characters } from './characters.js';
import { locations, terrainTags } from './locations.js';
import { victoryTypes, postBattleVictoryPhrases } from './narrative.js';
import { adjectiveToNounMap } from './mechanics.js';

let usedReasonIds = new Set();

function getRandomElement(array, fallbackValue = "skill") {
    if (!array || array.length === 0) return fallbackValue;
    if (typeof array === 'string') return array;
    return array[Math.floor(Math.random() * array.length)];
}

function normalizeTraitToNoun(traitString) {
    if (!traitString) return 'skill';
    const normalized = traitString.toLowerCase().replace(/ /g, '_');
    return adjectiveToNounMap[normalized] || traitString.replace(/_/g, ' ');
}

function getVictoryQuote(character, victoryData) {
    if (!character || !character.quotes) return "Victory is mine.";
    const { type, opponentId, resolutionTone } = victoryData;
    const quotes = character.quotes;

    let selectedQuote = "";

    if (opponentId && quotes.postWin_specific && quotes.postWin_specific[opponentId]) {
        selectedQuote = getRandomElement(quotes.postWin_specific[opponentId]);
    } else if (resolutionTone?.type === "overwhelming_power" && quotes.postWin_overwhelming) {
        selectedQuote = getRandomElement(quotes.postWin_overwhelming);
    } else if (resolutionTone?.type === "clever_victory" && quotes.postWin_clever) {
        selectedQuote = getRandomElement(quotes.postWin_clever);
    } else if (resolutionTone?.type === "emotional_yield" && quotes.postWin_reflective) {
        selectedQuote = getRandomElement(quotes.postWin_reflective);
    } else if (quotes[`postWin_${type}`]) {
        selectedQuote = getRandomElement(quotes[`postWin_${type}`]);
    } else if (quotes.postWin) {
        selectedQuote = getRandomElement(quotes.postWin);
    }
    
    return selectedQuote || "The battle is won.";
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
    const finalQuote = getVictoryQuote(winnerChar, quoteData);
    templateData.WinnerQuote = finalQuote;
    
    const specificEndingData = victoryTypes[victoryType]?.narrativeEndings?.[winnerId];
    
    // FIX: Handle both simple string templates and complex object templates.
    if (specificEndingData) {
        const ending = getRandomElement(specificEndingData);
        if (typeof ending === 'object' && ending.action && ending.dialogue) {
            // It's a structured ending like Jeong Jeong's.
            const epilogue = `The destructive path of fire had been averted — for now.`;
            return `${ending.action}<br><i>"${ending.dialogue}"</i><br>${epilogue}`;
        } else if (typeof ending === 'string') {
            // It's a simple string template.
            return populateTemplate(ending, templateData);
        }
    }
    
    // Fallback to the generic victory style phrases.
    const archetypePhrases = postBattleVictoryPhrases[winnerChar.victoryStyle] || postBattleVictoryPhrases.default;
    let populatedEnding = populateTemplate(getRandomElement(archetypePhrases), templateData);
    
    if (!populatedEnding.includes(finalQuote)) {
        populatedEnding += ` "${finalQuote}"`;
    }

    return populatedEnding;
}


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

export function calculateWinProbability(f1Id, f2Id, locId) {
    usedReasonIds.clear();
    const f1 = characters[f1Id], f2 = characters[f2Id];
    const location = locations[locId];
    let f1NetModifier = 50, f2NetModifier = 50;
    const outcomeReasons = [];

    const addReason = (fighter, reason, modifier) => {
        const reasonId = `${fighter.id}|${reason}|${modifier}`;
        if (!usedReasonIds.has(reasonId) && modifier !== 0) {
            outcomeReasons.push({ fighterId: fighter.id, reason, modifier });
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
'use strict';

import { generatePlayByPlay } from './narrative-engine.js'; 
import { characters } from './characters.js';
import { locations, terrainTags } from './locations.js';
import { victoryTypes, postBattleVictoryPhrases } from './narrative.js';
import { adjectiveToNounMap } from './mechanics.js';

let usedReasonIds = new Set();

function getRandomElement(array, fallbackValue = "skill") {
    if (!array || array.length === 0) return fallbackValue;
    return array[Math.floor(Math.random() * array.length)];
}

function normalizeTraitToNoun(traitString) {
    if (!traitString) return 'skill';
    const normalized = traitString.toLowerCase().replace(/ /g, '_');
    return adjectiveToNounMap[normalized] || traitString.replace(/_/g, ' ');
}

// --- CONSOLIDATED LOGIC ---
function getVictoryQuote(character, victoryData) {
    if (!character || !character.quotes) return "Victory is mine.";
    const { type, opponentId, resolutionTone } = victoryData;
    const quotes = character.quotes;

    // This complex selection ensures the most specific and context-aware quote is chosen.
    if (opponentId && quotes.postWin_specific && quotes.postWin_specific[opponentId]) {
        return getRandomElement(quotes.postWin_specific[opponentId]);
    }
    if (resolutionTone?.type === "overwhelming_power" && quotes.postWin_overwhelming) {
        return getRandomElement(quotes.postWin_overwhelming);
    }
    if (resolutionTone?.type === "clever_victory" && quotes.postWin_clever) {
        return getRandomElement(quotes.postWin_clever);
    }
    if (resolutionTone?.type === "emotional_yield" && quotes.postWin_reflective) {
        return getRandomElement(quotes.postWin_reflective);
    }
    // Fallback to more general types
    if (quotes[`postWin_${type}`]) {
        return getRandomElement(quotes[`postWin_${type}`]);
    }
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
    const finalQuote = getVictoryQuote(winnerChar, quoteData);
    // FIX: Cleaner quote integration. No more double quotes.
    templateData.WinnerQuote = finalQuote;
    
    let template;
    const specificEnding = victoryTypes[victoryType]?.narrativeEndings?.[winnerId];
    if (specificEnding) {
        template = getRandomElement(specificEnding);
    } else {
        const archetypePhrases = postBattleVictoryPhrases[winnerChar.victoryStyle] || postBattleVictoryPhrases.default;
        template = getRandomElement(archetypePhrases);
    }

    let populatedEnding = populateTemplate(template, templateData);
    
    // Append the quote as dialogue if the template doesn't already include it.
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
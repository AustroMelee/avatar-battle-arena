'use strict';

// Import our new narrative engine
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

// --- UTILITY & HELPER FUNCTIONS (Unchanged) ---

function getTraitDisplay(character, traitKey) {
    if (!character) return "unspecified tactic";
    const fallbackMap = {
        style: "unique approach",
        combatStrength: "superior technique",
        combatWeakness: "unexpected flaw",
        openingMove: "a signature maneuver",
        counterMove: "a strong counter-move",
        midGameTactic: "a clever mid-battle tactic",
        terrainAdaptation: "a swift terrain adaptation",
        finishingMove: "a powerful finishing blow",
        lastDitchDefense: "a desperate last-ditch defense"
    };
    return character[traitKey] || fallbackMap[traitKey] || "standard maneuver";
}

function getRandomElement(array, fallbackValue = "skill") {
    if (!array || array.length === 0) return fallbackValue;
    return array[Math.floor(Math.random() * array.length)];
}

function sanitizePhrase(phrase) {
    if (phrase && phrase.startsWith('the ')) {
        return phrase.substring(4);
    }
    return phrase;
}

function normalizeTraitToNoun(traitString) {
    if (!traitString) return 'skill';
    const normalized = traitString.toLowerCase().replace(/ /g, '_');
    return adjectiveToNounMap[normalized] || traitString.replace(/_/g, ' ');
}

// --- NARRATIVE HELPER FUNCTIONS (To support the final victory announcement) ---

function getCharacterSpecificQuote(charObj, type, opponentId) {
    if (!charObj || !charObj.quotes) return '';
    if (opponentId && charObj.quotes[type + '_specific'] && charObj.quotes[type + '_specific'][opponentId]) {
        return getRandomElement(charObj.quotes[type + '_specific'][opponentId]);
    }
    return charObj.quotes[type] || '';
};

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

function populateTemplate(template, data) {
    const map = {
        WinnerName: `<span class="char-${data.winnerId}">${characters[data.winnerId]?.name || 'Winner'}</span>`,
        LoserName: `<span class="char-${data.loserId}">${characters[data.loserId]?.name || 'Loser'}</span>`,
        LoserPronounS: characters[data.loserId]?.pronouns.s || 'they',
        WinnerPronounS: characters[data.winnerId]?.pronouns.s || 'they',
        WinnerPronounP: characters[data.winnerId]?.pronouns.p || 'their',
        WinnerStrength: normalizeTraitToNoun(getRandomElement(characters[data.winnerId]?.strengths, "skill")),
        WinnerStyle: getTraitDisplay(characters[data.winnerId], 'style'),
        WinnerQuote: getVictoryQuote(characters[data.winnerId], {
            type: data.winProb >= 90 ? 'stomp' : (data.winProb >= 75 ? 'dominant' : 'narrow'),
            opponentId: data.loserId,
            resolutionTone: data.resolutionTone
        }),
    };
    return template.replace(/{(\w+)}/g, (match, key) => map[key] || match);
}

function getToneAlignedVictoryEnding(winnerId, victoryType, baseStoryData) {
    const winnerChar = characters[winnerId];
    if (victoryTypes[victoryType]?.narrativeEndings[winnerId]) {
        return populateTemplate(victoryTypes[victoryType].narrativeEndings[winnerId], baseStoryData);
    }
    const archetypePhrases = postBattleVictoryPhrases[winnerChar.victoryStyle] || postBattleVictoryPhrases["default"];
    return populateTemplate(getRandomElement(archetypePhrases), baseStoryData);
}


// --- CORE BATTLE LOGIC (Unchanged) ---

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
    const f1 = characters[f1Id], f2 = characters[f2Id], loc = locations[locId];
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

    [
        { fighter: f1, opponentId: f2Id },
        { fighter: f2, opponentId: f1Id }
    ].forEach(({ fighter, opponentId }) => {
        const relationship = fighter.relationships?.[opponentId];
        if (relationship) {
            let relModifier = 0;
            let reason = '';
            if (relationship.dynamic === 'emotional_conflict' && fighter.id === 'zuko' && opponentId === 'iroh') {
                relModifier = -7; reason = 'Hesitation fighting his uncle';
            } else if (relationship.type === 'mentor_student' && fighter.id === 'iroh') {
                relModifier = -5; reason = 'Holding back against his student';
            } else if (relationship.dynamic === 'philosophical_clash' && fighter.id === 'sokka' && opponentId === 'pakku') {
                relModifier = 5; reason = 'Motivated by philosophical opposition';
            }
            if (relModifier !== 0) {
                const modifierTarget = (fighter.id === f1.id) ? 1 : -1;
                f1NetModifier += relModifier * modifierTarget;
                f2NetModifier -= relModifier * modifierTarget;
                addReason(fighter, reason, relModifier);
                const opponent = (fighter.id === f1.id) ? f2 : f1;
                addReason(opponent, `Faced opponent's ${reason.toLowerCase()}`, -relModifier);
            }
        }
    });

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
    const relationshipStrength = 0;
    const resolutionTone = determineResolutionTone({ winBy: victoryType, relationshipStrength, winProb });
    
    return { f1: f1Prob, f2: 100 - f1Prob, winnerId, loserId, winProb, outcomeReasons, victoryType, f1FinalScore, f2FinalScore, resolutionTone };
}

// ** NEW, REFACTORED STORY GENERATION FUNCTION **
export function generateBattleStory(f1Id, f2Id, locId, battleOutcome) {
    const { winnerId, loserId, victoryType, resolutionTone, winProb } = battleOutcome;
    
    // 1. Generate the detailed play-by-play from the new engine.
    const playByPlay = generatePlayByPlay(f1Id, f2Id, locId, battleOutcome);

    // 2. Get the winner's final victory announcement.
    const baseStoryData = {
        winnerId,
        loserId,
        winProb,
        victoryType,
        resolutionTone,
    };
    const finalEnding = getToneAlignedVictoryEnding(winnerId, victoryType, baseStoryData);

    // 3. Combine them into the final story.
    return `${playByPlay}<br><p>${finalEnding}</p>`;
}

File 2: main.js (Crucial Update)

You also need to update main.js to call generateBattleStory with the correct arguments. This is a small but critical change.

js/main.js

'use strict';

import { calculateWinProbability, generateBattleStory } from './battle-engine.js';
import { DOM, populateDropdowns, updateFighterDisplay, showLoadingState, showResultsState, resetBattleUI } from './ui.js';

function handleBattleStart() {
    const f1Id = DOM.fighter1Select.value;
    const f2Id = DOM.fighter2Select.value;
    const locId = DOM.locationSelect.value;

    if (!f1Id || !f2Id || !locId) {
        alert("Please select both fighters and a location.");
        return;
    }
    if (f1Id === f2Id) {
        alert('Please select two different fighters!');
        return;
    }

    resetBattleUI();
    showLoadingState();

    // Simulate calculation time
    setTimeout(() => {
        try {
            const battleOutcome = calculateWinProbability(f1Id, f2Id, locId);
            
            // *** THIS IS THE UPDATED FUNCTION CALL ***
            const story = generateBattleStory(
                f1Id,
                f2Id,
                locId,
                battleOutcome
            );
            
            // Attach the generated story to the outcome object
            battleOutcome.story = story;

            showResultsState(battleOutcome);

        } catch (error) {
            console.error("An error occurred during battle simulation:", error);
            alert("A critical error occurred. Please check the console and refresh.");
            // Reset UI state on error
            DOM.loadingSpinner.classList.add('hidden');
            DOM.battleBtn.disabled = false;
        }
    }, 1500);
}

function init() {
    // UI Setup
    populateDropdowns();
    updateFighterDisplay('fighter1');
    updateFighterDisplay('fighter2');

    // Event Listeners
    DOM.battleBtn.addEventListener('click', handleBattleStart);
    DOM.fighter1Select.addEventListener('change', () => updateFighterDisplay('fighter1'));
    DOM.fighter2Select.addEventListener('change', () => updateFighterDisplay('fighter2'));
}


'use strict';

import { 
    characters, 
    locations, 
    terrainTags, 
    victoryTypes, 
    postBattleVictoryPhrases, 
    storyTemplates, 
    combatStyleAdvantages, 
    adjectiveToNounMap 
} from './data/index.js';

let usedTechniqueSentences = new Set();
let usedReasonIds = new Set();

// --- UTILITY & HELPER FUNCTIONS ---

function getTraitDisplay(character, traitKey) {
    if (!character) return "unspecified tactic";
    const fallbackMap = {
        style: "unique approach",
        combatStrength: "superior technique",
        combatWeakness: "unexpected flaw",
        openingMove: "signature maneuver",
        counterMove: "a strong counter-move",
        midGameTactic: "a clever mid-battle tactic",
        terrainAdaptation: "a swift terrain adaptation",
        finishingMove: "a powerful finishing blow",
        lastDitchDefense: "a desperate last-ditch defense"
    };
    return character[traitKey] || fallbackMap[traitKey] || "standard maneuver";
}

function shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function getRandomElement(array, fallbackValue = "skill") {
    if (!array || array.length === 0) return fallbackValue;
    return array[Math.floor(Math.random() * array.length)];
}

function toGerund(verb) {
    if (!verb) return "";
    if (verb.endsWith('e') && verb.length > 1 && !['be', 'see', 'use'].includes(verb)) {
        return verb.slice(0, -1) + 'ing';
    }
    const doubleConsonant = ['run', 'swim', 'cut', 'hit', 'spin', 'set', 'sit', 'propel', 'pin', 'turn', 'engulf', 'heat'];
    if (doubleConsonant.includes(verb)) {
        return verb + verb.slice(-1) + 'ing';
    }
    return verb + 'ing';
}

function sanitizePhrase(phrase) {
    if (phrase && phrase.startsWith('the ')) {
        return phrase.substring(4);
    }
    return phrase;
}

function getStyledAction(fighter, baseAction) {
    const style = fighter.combatStyleTags?.[0];
    const flavorMap = {
        aggressive: `aggressively ${baseAction}`, precise: `methodically ${baseAction}`,
        calculated: `deliberately ${baseAction}`, improvisational: `cleverly ${baseAction}`,
        evasive: `swiftly ${baseAction}`, fierce: `fiercely ${baseAction}`,
        unrelenting: `relentlessly ${baseAction}`, determined: `with fierce determination ${baseAction}`,
        ruthless: `ruthlessly ${baseAction}`, overwhelming: `with overwhelming force ${baseAction}`,
        eccentric: `unpredictably ${baseAction}`, acrobatic: `acrobatically ${baseAction}`,
        silent: `silently ${baseAction}`, wise: `with calm wisdom ${baseAction}`,
        disciplined: `with disciplined precision ${baseAction}`, controlled: `with precise control ${baseAction}`,
        default: baseAction
    };
    return flavorMap[style] || baseAction;
}

function normalizeTraitToNoun(traitString) {
    if (!traitString) return 'skill';
    const normalized = traitString.toLowerCase().replace(/ /g, '_');
    return adjectiveToNounMap[normalized] || traitString.replace(/_/g, ' ');
}

// --- NARRATIVE & STORY GENERATION ---

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
        Fighter1Name: `<span class="char-${data.f1Id}">${characters[data.f1Id]?.name || 'Fighter 1'}</span>`,
        Fighter2Name: `<span class="char-${data.f2Id}">${characters[data.f2Id]?.name || 'Fighter 2'}</span>`,
        WinnerName: `<span class="char-${data.winnerId}">${characters[data.winnerId]?.name || 'Winner'}</span>`,
        LoserName: `<span class="char-${data.loserId}">${characters[data.loserId]?.name || 'Loser'}</span>`,
        Fighter1ID: data.f1Id, WinnerID: data.winnerId, LoserID: data.loserId,
        WinnerPronounP: characters[data.winnerId]?.pronouns.p || 'their',
        LoserPronounS: characters[data.loserId]?.pronouns.s || 'they',
        WinnerPronounS: characters[data.winnerId]?.pronouns.s || 'they',
        WinnerStrength: normalizeTraitToNoun(getRandomElement(characters[data.winnerId]?.strengths, "skill")),
        Fighter1Desc: getFormattedStyle(characters[data.f1Id]),
        Fighter2Desc: getFormattedStyle(characters[data.f2Id]),
        WinnerStyle: getTraitDisplay(characters[data.winnerId], 'style'),
        LocationName: locations[data.locId]?.name || 'the arena',
        LocationTerrain: locations[data.locId]?.terrain || 'the battlefield',
        LocationFeature: sanitizePhrase(locations[data.locId]?.feature) || 'the surroundings',
        LocationFeatureA: locations[data.locId]?.featureA || 'the dynamic surroundings',
        LocationFeatureB: locations[data.locId]?.featureB || 'the terrain',
        LocationFeatureC: locations[data.locId]?.featureC || 'a loose element',
        Fighter1IntroQuote: getCharacterSpecificQuote(characters[data.f1Id], 'preBattle', data.f2Id),
        Fighter2IntroQuote: getCharacterSpecificQuote(characters[data.f2Id], 'preBattle', data.f1Id),
        WinnerQuote: (data.victoryType === 'draw' || data.victoryType === 'tiebreak_win') ? '' : getVictoryQuote(characters[data.winnerId], {
            type: data.winProb >= 90 ? 'stomp' : (data.winProb >= 75 ? 'dominant' : 'narrow'),
            opponentId: data.loserId,
            resolutionTone: data.resolutionTone
        }),
    };
    return template.replace(/{(\w+)}/g, (match, key) => map[key] || match);
}

function getFormattedStyle(charObj) {
    if (!charObj) return 'an unknown fighter';
    const style = getTraitDisplay(charObj, 'style');
    return `a ${style.replace(/_/g, ' ')}`;
}

function getToneAlignedVictoryEnding(winnerId, victoryType, baseStoryData) {
    const winnerChar = characters[winnerId];
    if (victoryTypes[victoryType]?.narrativeEndings[winnerId]) {
        return populateTemplate(victoryTypes[victoryType].narrativeEndings[winnerId], baseStoryData);
    }
    const archetypePhrases = postBattleVictoryPhrases[winnerChar.victoryStyle] || postBattleVictoryPhrases["default"];
    return populateTemplate(getRandomElement(archetypePhrases), baseStoryData);
}

function generateCombatSequence(f1, f2, loc) {
    const f1_opening_action = getStyledAction(f1, getTraitDisplay(f1, "openingMove"));
    const f2_counter_action = getStyledAction(f2, getTraitDisplay(f2, "counterMove"));
    const f1_mid_game_action = getStyledAction(f1, getTraitDisplay(f1, "midGameTactic"));
    const f2_terrain_adapt_action = getStyledAction(f2, getTraitDisplay(f2, "terrainAdaptation"));
    const f1_finishing_action = getStyledAction(f1, getTraitDisplay(f1, "finishingMove"));
    const f2_last_ditch_action = getStyledAction(f2, getTraitDisplay(f2, "lastDitchDefense"));

    return [
        `<span class='char-${f1.id}'>${f1.name}</span> initiated the clash with ${f1_opening_action}, directly confronting <span class='char-${f2.id}'>${f2.name}</span>. The very ${loc.featureA} seemed to amplify the impact.`,
        `<span class='char-${f2.id}'>${f2.name}</span> responded with ${f2_counter_action}, deftly leveraging ${loc.featureB}. Meanwhile, <span class='char-${f1.id}'>${f1.name}</span> pivoted to ${f1_mid_game_action}, seeking to control the flow.`,
        `As the battle intensified, <span class='char-${f1.id}'>${f1.name}'s</span> ${f1_finishing_action} met <span class='char-${f2.id}'>${f2.name}'s</span> ${f2_last_ditch_action}. The environment itself seemed to react, with ${loc.featureC} shifting beneath their feet.`
    ];
}

function getMicroTurningPoint(f1, f2, loc) {
    const moments = [
      `<span class='char-${f1.id}'>${f1.name}</span> tripped on ${loc.featureC}, costing critical seconds and revealing an opening.`,
      `<span class='char-${f2.id}'>${f2.name}'s</span> overconfidence led to a fatal misread, leaving an attack open.`,
      `A sudden environmental shift involving ${loc.featureA} changed everything, catching one off guard.`,
      `A crucial misstep by <span class='char-${f1.id}'>${f1.name}</span> left ${f1.pronouns.o} vulnerable.`,
    ];
    return getRandomElement(moments);
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
    const f1 = characters[f1Id], f2 = characters[f2Id], loc = locations[locId];
    let f1NetModifier = 50, f2NetModifier = 50;
    const outcomeReasons = [];

    const addReason = (fighter, reason, modifier) => {
        const reasonId = `${fighter.name}|${reason}|${modifier}`;
        if (!usedReasonIds.has(reasonId)) {
            outcomeReasons.push({ fighterId: fighter.id, reason, modifier });
            usedReasonIds.add(reasonId);
        }
    };
    
    // Tier difference
    const tierGap = f1.powerTier - f2.powerTier;
    f1NetModifier += tierGap * 5; addReason(f1, 'Power Tier Advantage', tierGap * 5);
    f2NetModifier -= tierGap * 5; addReason(f2, 'Power Tier Disadvantage', -tierGap * 5);

    // Terrain interactions
    const locTags = terrainTags[locId] || [];
    [f1, f2].forEach(fighter => {
        const modifier = (fighter === f1) ? 1 : -1;
        fighter.strengths?.forEach(strength => {
            if(locTags.includes(strength)) {
                f1NetModifier += 10 * modifier; addReason(fighter, `Leveraged ${normalizeTraitToNoun(strength)}`, 10 * modifier);
            }
        });
        fighter.weaknesses?.forEach(weakness => {
            if(locTags.includes(weakness)) {
                f1NetModifier -= 10 * modifier; addReason(fighter, `Hindered by ${normalizeTraitToNoun(weakness)}`, -10 * modifier);
            }
        });
    });

    // Final calculations
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
    const relationshipStrength = 0; // Simplified
    const resolutionTone = determineResolutionTone({ winBy: victoryType, relationshipStrength, winProb });
    
    return { f1: f1Prob, f2: 100 - f1Prob, winnerId, loserId, winProb, outcomeReasons, victoryType, f1FinalScore, f2FinalScore, resolutionTone };
}

export function generateBattleStory(winnerId, loserId, locId, outcomeReasons, victoryType, winProb, f1FinalScore, f2FinalScore, resolutionTone) {
    usedTechniqueSentences.clear();
    const f1Id = document.getElementById('fighter1').value;
    const f2Id = document.getElementById('fighter2').value;
    
    const data = { f1Id, f2Id, winnerId, loserId, locId, winProb, victoryType, resolutionTone };
    const f1 = characters[f1Id], f2 = characters[f2Id], loc = locations[locId];

    const actionBeats = generateCombatSequence(f1, f2, loc);
    let narrative_core = actionBeats.join(" ");

    if (Math.abs(f1FinalScore - f2FinalScore) <= 10) {
        narrative_core += ` ${getMicroTurningPoint(f1, f2, loc)}`;
    }
    
    const finalEnding = getToneAlignedVictoryEnding(winnerId, victoryType, data);
    return `<p>${narrative_core}</p><br><p>${finalEnding}</p>`;
}
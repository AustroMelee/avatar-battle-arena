// FILE: engine_battle-engine-core.js
'use strict';

// Version 1.7: Simplified & Robust Summary Logic
// - Replaced the complex "decisive event" search with a simplified and more robust
//   end-of-battle summary block to prevent crashes in timeout/stalemate scenarios.

import { characters } from './data_characters.js';
import { locationConditions } from './location-battle-conditions.js';
// --- UPDATED IMPORTS ---
import { phaseTemplates, battlePhases as phaseDefinitions } from './data_narrative_phases.js'; // Corrected import path (now on one line)
import { locations, locationPhaseOverrides } from './locations.js'; // NEW: Import locations for locationPhaseOverrides
// --- END UPDATED IMPORTS ---
import { selectMove, updateAiMemory, attemptManipulation, adaptPersonality } from './engine_ai-decision.js';
import { calculateMove } from './engine_move-resolution.js';
import { updateMentalState } from './engine_mental-state.js';
import { generateTurnNarrationObjects, getFinalVictoryLine, findNarrativeQuote, generateCurbstompNarration, substituteTokens, generateEscalationNarrative, generateActionDescriptionObject } from './engine_narrative-engine.js';
import { modifyMomentum } from './engine_momentum.js'; // Keep this import here, as battle-engine-core also uses it directly
import { initializeBattlePhaseState, checkAndTransitionPhase, BATTLE_PHASES } from './engine_battle-phase.js';
// --- UPDATED IMPORTS for Mechanics ---
import { universalMechanics } from './data_mechanics_universal.js'; // From new file
import { locationCurbstompRules } from './data_mechanics_locations.js'; // From new file
import { characterCurbstompRules } from './data_mechanics_characters.js'; // FIX: Removed '='
// --- END UPDATED IMPORTS for Mechanics ---
import { calculateIncapacitationScore, determineEscalationState, ESCALATION_STATES } from './engine_escalation.js';
import { checkReactiveDefense } from './engine_reactive-defense.js';

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
export const getRandomElement = (arr) => arr && arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

let charactersMarkedForDefeat = new Set();
// NEW: Define a higher total turn limit for the battle
const MAX_TOTAL_TURNS = 25;

// Add energy management constants
const MIN_ENERGY_FOR_ACTION = 10;
const ENERGY_RECOVERY_PER_TURN = 4;
const MAX_ENERGY = 100;

// Add stun management constants
const MAX_CONSECUTIVE_STUNS = 2;
const STUN_RESISTANCE_INCREASE = 0.5;

// Add minimum turns before curbstomp check
const MIN_TURNS_BEFORE_CURBSTOMP = 5;
const CURBSTOMP_HP_THRESHOLD = 0.2; // 20% HP threshold
const CURBSTOMP_MOMENTUM_THRESHOLD = -50;

function selectCurbstompVictim({ attacker, defender, rule, locationData, battleState }) {
    if (typeof rule.weightingLogic === 'function') {
        const weightedOutcome = rule.weightingLogic({ attacker, defender, rule, location: locationData, situation: { ...battleState, environmentState: battleState.environmentState || { damageLevel: 0 } } });

        if (typeof weightedOutcome === 'string') {
            return weightedOutcome;
        } else if (weightedOutcome && typeof weightedOutcome.victimId === 'string' && typeof weightedOutcome.probability === 'number') {
            if (Math.random() < weightedOutcome.probability) {
                return weightedOutcome.victimId;
            }
            return null;
        } else if (weightedOutcome && typeof weightedOutcome.probabilities === 'object') {
            const rand = Math.random();
            let cumulativeProb = 0;
            // FIX: Change weightedProbabilities to weightedOutcome.probabilities
            for (const charId in weightedOutcome.probabilities) {
                cumulativeProb += weightedOutcome.probabilities[charId];
                if (rand < cumulativeProb) {
                    return charId;
                }
            }
            return Math.random() < 0.5 ? attacker.id : defender.id;
        }
    }

    // Default or fallback victim selection if no weightingLogic, or if it doesn't return a victim
    if (rule.outcome?.type?.includes("loss_weighted_character") || rule.outcome?.type?.includes("loss_random_character")) {
        return Math.random() < 0.5 ? attacker.id : defender.id;
    }
    // If the rule explicitly applies to a character and dictates their loss (e.g., instant_death_character)
    if (rule.appliesToCharacter && (rule.outcome?.type?.includes("loss_weighted_character") || rule.outcome?.type?.includes("instant_death_character"))) {
        return rule.appliesToCharacter;
    }
    return null; // No victim determined by this logic
}

function applyCurbstompRules(fighter1, fighter2, battleState, battleEventLog, isPreBattle = false) {
    const allRules = [
        ...(characterCurbstompRules[fighter1.id] || []),
        ...(characterCurbstompRules[fighter2.id] || []),
        ...(locationCurbstompRules[battleState.locationId] || [])
    ];

    for (const rule of allRules) {
        if (Math.random() >= (rule.triggerChance || 1.0)) continue;

        let protagonists = [];
        let antagonist = null;

        if (rule.appliesToCharacter) {
            if (fighter1.id === rule.appliesToCharacter) protagonists.push(fighter1);
            if (fighter2.id === rule.appliesToCharacter) protagonists.push(fighter2);
        } else if (rule.appliesToPair) {
            if (rule.appliesToPair.includes(fighter1.id) && rule.appliesToPair.includes(fighter2.id)) {
                protagonists.push(fighter1, fighter2);
            }
        } else if (rule.appliesToElement) {
            if (fighter1.element === rule.appliesToElement) protagonists.push(fighter1);
            if (fighter2.element === rule.appliesToElement) protagonists.push(fighter2);
        } else if (rule.appliesToFaction) {
            const isNegated = rule.appliesToFaction.startsWith('!');
            const faction = isNegated ? rule.appliesToFaction.substring(1) : rule.appliesToFaction;
            if (isNegated) {
                if (fighter1.faction !== faction) protagonists.push(fighter1);
                if (fighter2.faction !== faction) protagonists.push(fighter2);
            } else {
                if (fighter1.faction === faction) protagonists.push(fighter1);
                if (fighter2.faction === faction) protagonists.push(fighter2);
            }
        } else if (rule.appliesToAll) {
            protagonists.push(fighter1, fighter2);
        }

        for (const protagonist of protagonists) {
            const opponent = (protagonist.id === fighter1.id) ? fighter2 : fighter1;
            if (rule.conditionLogic && !rule.conditionLogic(protagonist, opponent, battleState)) {
                continue;
            }

            // --- Process Outcome ---
            const outcome = rule.outcome;
            if (Math.random() < 0.15 && (outcome.type.includes('instant_') || outcome.type.includes('environmental_kill'))) {
                battleEventLog.push({
                    type: 'narrative_event',
                    text: `By some miracle, ${protagonist.name} survives what should have been a fatal blow!`,
                    html_content: `<p class="narrative-survivor">By some miracle, ${protagonist.name} survives what should have been a fatal blow!</p>`
                });
                protagonist.aiLog.push(`[Survivor's Luck]: Miraculously survived rule '${rule.id}'.`);
                continue; // Skip the rest of the outcome processing
            }

            let winner, loser;
            switch (outcome.type) {
                case 'instant_win':
                    winner = outcome.winner ? (protagonist.id === outcome.winner ? protagonist : opponent) : protagonist;
                    loser = (winner.id === protagonist.id) ? opponent : protagonist;
                    if (!isPreBattle || battleState.locationConditions[battleState.locationId]?.allowPreBattleCurbstomp) {
                        charactersMarkedForDefeat.add(loser.id);
                    }
                    battleEventLog.push({ type: 'curbstomp_event', text: `${winner.name} secured a decisive victory over ${loser.name} due to ${rule.description}.` });
                    break;
                case 'instant_loss':
                    loser = protagonist;
                    if (!isPreBattle || battleState.locationConditions[battleState.locationId]?.allowPreBattleCurbstomp) {
                        charactersMarkedForDefeat.add(loser.id);
                    }
                    battleEventLog.push({ type: 'curbstomp_event', text: `${loser.name} was decisively defeated due to ${rule.description}.` });
                    break;
                case 'environmental_kill':
                    loser = protagonist;
                    if (!isPreBattle || battleState.locationConditions[battleState.locationId]?.allowPreBattleCurbstomp) {
                        charactersMarkedForDefeat.add(loser.id);
                    }
                    battleEventLog.push({ type: 'curbstomp_event', text: `The environment itself proved fatal for ${loser.name}.` });
                    break;
                case 'buff':
                    protagonist[outcome.property] = (protagonist[outcome.property] || 0) + outcome.value;
                    protagonist.aiLog.push(`[Buff]: Rule '${rule.id}' applied: ${outcome.property} modified by ${outcome.value}.`);
                    break;
                case 'debuff':
                    protagonist[outcome.property] = (protagonist[outcome.property] || 0) + outcome.value;
                    protagonist.aiLog.push(`[Debuff]: Rule '${rule.id}' applied: ${outcome.property} modified by ${outcome.value}.`);
                    break;
                 case 'advantage':
                    antagonist = outcome.target === protagonist.id ? protagonist : opponent;
                    antagonist.momentum += (outcome.value * 100); // Convert advantage to momentum
                    antagonist.aiLog.push(`[Advantage]: Rule '${rule.id}' granted significant momentum boost.`);
                    break;
                case 'external_intervention':
                    // This `isStalemate` variable here is not the one from the outer `simulateBattle` scope.
                    // To affect the battle outcome, it needs to be part of the `evaluateTerminalState` return or
                    // passed into `simulateBattle` appropriately. For now, it's local.
                    // This is a known limitation when trying to directly set `isStalemate` from within nested functions.
                    // The primary way to trigger stalemate currently is via `MAX_TOTAL_TURNS` or defensive turns.
                    // For now, removing `isStalemate = true;` from here to avoid confusion.
                    battleEventLog.push({ type: 'narrative_event', text: 'The fight was interrupted by outside forces, ending in a draw.' });
                    break;
            }
        }
    }
}

// Corrected initializeFighterState to be more robust
function initializeFighterState(fighterId, opponentId, emotionalMode = false) {
    // DIAGNOSTIC START
    console.log(`[DEBUG] Initializing fighter state for charId: '${fighterId}'`);
    if (!characters) {
        console.error("[DEBUG] 'characters' object is undefined/null during initializeFighterState!");
        // Return a broken fighter immediately to prevent further errors
        return { id: fighterId, name: `[MISSING CHARS OBJECT - ${fighterId}]`, hp: 0, maxHp: 100, energy: 0, momentum: 0, stunDuration: 0, stunResistance: 0, consecutiveStuns: 0, stunImmunityTurns: 0, tacticalState: null, moveHistory: [], moveFailureHistory: [], consecutiveDefensiveTurns: 0, aiLog: [`ERROR: 'characters' object is null/undefined.`], relationalState: null, mentalState: { level: 'broken', stress: 100, mentalStateChangedThisTurn: false }, contextualState: {}, collateralTolerance: 0.0, mobility: 0.0, personalityProfile: {}, aiMemory: {}, curbstompRulesAppliedThisBattle: new Set(), faction: 'Error', element: 'error', specialTraits: {}, criticalHitsTaken: 0, intelligence: 0, hasMetalArmor: false, incapacitationScore: 100, escalationState: ESCALATION_STATES.TERMINAL_COLLAPSE, summary: `(ERROR: 'characters' object is null/undefined.)` };
    }
    const characterData = characters[fighterId];
    if (!characterData) {
        console.error(`[DEBUG] Character data for ID '${fighterId}' not found in 'characters' object.`);
        // Return a broken fighter immediately to prevent further errors
        return {
            id: fighterId,
            name: `[MISSING DATA - ${fighterId}]`, // Safe fallback name
            hp: 0, maxHp: 100, // Treat as defeated for safety
            energy: 0, momentum: 0, stunDuration: 0,
            stunResistance: 0, consecutiveStuns: 0, stunImmunityTurns: 0,
            tacticalState: null, moveHistory: [], moveFailureHistory: [],
            consecutiveDefensiveTurns: 0, aiLog: [`ERROR: Character data for "${fighterId}" not loaded/found.`],
            relationalState: null,
            mentalState: { level: 'broken', stress: 100, mentalStateChangedThisTurn: false }, // Mark as broken
            contextualState: {},
            collateralTolerance: 0.0, // Treat as highly sensitive to collateral
            mobility: 0.0, // No mobility
            personalityProfile: { aggression: 0, patience: 0, riskTolerance: 0, opportunism: 0, creativity: 0, defensiveBias: 0, antiRepeater: 0, signatureMoveBias: {}, predictability: 1 },
            aiMemory: {},
            curbstompRulesAppliedThisBattle: new Set(),
            faction: 'Error',
            element: 'error',
            specialTraits: {},
            criticalHitsTaken: 0,
            intelligence: 0,
            hasMetalArmor: false,
            incapacitationScore: 100, // Mark as fully incapacitated
            escalationState: ESCALATION_STATES.TERMINAL_COLLAPSE, // Mark as terminal collapse
            summary: `(ERROR: Character data for ${fighterId} missing or corrupted.)` // Add a summary for dev logs
        };
    }
    // DIAGNOSTIC END

    // Ensure characterData.name exists before using it
    const characterName = characterData.name || fighterId; // Fallback to ID if name is missing

    // DIAGNOSTIC: Log characterData.imageUrl
    console.log(`[DEBUG] Initializing fighter state for '${fighterId}': characterData.imageUrl =`, characterData.imageUrl);

    const personalityProfile = characterData.personalityProfile || {
        aggression: 0.5, patience: 0.5, riskTolerance: 0.5, opportunism: 0.5,
        creativity: 0.5, defensiveBias: 0.5, antiRepeater: 0.5, signatureMoveBias: {}
    };

    // Deep copy, but handle potential issues with JSON.parse/stringify if characterData is very complex or contains circular references (unlikely here)
    let copiedCharacterData;
    try {
        copiedCharacterData = JSON.parse(JSON.stringify(characterData));
    } catch (e) {
        console.error(`Error deep copying character data for ${fighterId}:`, e);
        // Fallback to shallow copy or minimal properties if deep copy fails
        copiedCharacterData = { ...characterData };
    }


    return {
        id: fighterId,
        opponentId: opponentId,
        name: characterName,
        ...copiedCharacterData, // Spread the copied data
        hp: 100, maxHp: 100,
        energy: 100, momentum: 0, lastMove: null, lastMoveEffectiveness: null,
        stunDuration: 0,
        stunResistance: 0,
        consecutiveStuns: 0,
        stunImmunityTurns: 0,
        tacticalState: null, moveHistory: [], moveFailureHistory: [],
        consecutiveDefensiveTurns: 0, aiLog: [],
        // Access relationships from characterData directly
        relationalState: (emotionalMode && characterData.relationships?.[opponentId]) || null,
        mentalState: { level: 'stable', stress: 0, mentalStateChangedThisTurn: false },
        contextualState: {},
        collateralTolerance: characterData.collateralTolerance !== undefined ? characterData.collateralTolerance : 0.5,
        mobility: characterData.mobility !== undefined ? characterData.mobility : 0.5,
        personalityProfile: JSON.parse(JSON.stringify(personalityProfile)),
        aiMemory: {
            selfMoveEffectiveness: {}, opponentModel: { isAggressive: 0, isDefensive: 0, isTurtling: false },
            moveSuccessCooldown: {}, opponentSequenceLog: {},
            repositionCooldown: 0,
        },
        curbstompRulesAppliedThisBattle: new Set(),
        faction: characterData.faction || 'Neutral',
        element: characterData.element || 'physical',
        specialTraits: { ...characterData.specialTraits },
        criticalHitsTaken: 0,
        intelligence: characterData.specialTraits?.intelligence || 50,
        hasMetalArmor: characterData.specialTraits?.hasMetalArmor || false,
        incapacitationScore: 0,
        escalationState: characterData.escalationState || ESCALATION_STATES.NORMAL,
        mentalResilience: characterData.mentalResilience !== undefined ? characterData.mentalResilience : 1.2, // NEW: Default mental resilience
        // Make sure techniques are copied from characterData here, if they are meant to be character-wide.
        // If techniques can vary by location, they will be selected later by getAvailableMoves.
        // For now, assume a 'techniques' array is available on the base character object.
        techniques: [
            ...(characterData.techniques || []),
            ...(characterData.techniquesFull || []),
            ...(characterData.techniquesCanteen || []),
            ...(characterData.techniquesEasternAirTemple || []),
            ...(characterData.techniquesNorthernWaterTribe || []),
            ...(characterData.techniquesOmashu || []),
            ...(characterData.techniquesSiWongDesert || []),
            ...(characterData.techniquesBoilingRock || [])
        ],
        techniquesFull: characterData.techniquesFull || [],
        techniquesCanteen: characterData.techniquesCanteen || [],
        techniquesEasternAirTemple: characterData.techniquesEasternAirTemple || [],
        techniquesNorthernWaterTribe: characterData.techniquesNorthernWaterTribe || [],
        techniquesOmashu: characterData.techniquesOmashu || [],
        techniquesSiWongDesert: characterData.techniquesSiWongDesert || [],
        techniquesBoilingRock: characterData.techniquesBoilingRock || [],
        quotes: characterData.quotes || {}, // Ensure quotes are copied
        images: characterData.images || {},
        portrait: characterData.imageUrl || null, // Ensure portrait is set for UI
        pronouns: characterData.pronouns || { s: 'he', p: 'his', o: 'him' }, // NEW: Ensure pronouns are always set
    };
}

function evaluatePersonalityTrigger(triggerId, character, opponent, battleState) {
    const {
        opponentLandedCriticalHit, opponentTaunted, allyTargeted, ally,
        opponentUsedLethalForce, opponentLandedSignificantHits, opponentTauntedAgeOrStrategy,
        opponentTauntedBlindness, opponentLandedBlindHit, characterReceivedCriticalHit,
        opponentCheated, allyDisarmedUnfairly, allyDowned,
        characterLandedStrongOrCriticalHitLastTurn, allyBuffedSelf,
        opponentTauntedSkillOrTradition, opponentAttackedFirstAggressively
    } = battleState;

    switch (triggerId) {
        case "provoked":
            return opponentLandedCriticalHit || opponentTaunted || (allyTargeted && ally && ['ty-lee', 'zuko'].includes(ally.id));
        case "serious_fight":
            return (ally && ally.hp < ally.maxHp * 0.3) || opponentUsedLethalForce;
        case "authority_challenged":
            // FIX: Use opponentTaunted from battleState, not non-existent opponentUsedTaunt
            return (opponentLandedSignificantHits >= 2) || opponentTaunted;
        case "underestimated":
            return opponentTauntedAgeOrStrategy || (opponent.lastMoveEffectiveness === 'Weak' && opponent.lastMove.power > 50);
        case "in_control":
            return (character.hp > character.maxHp * 0.5) && !characterReceivedCriticalHit && (opponent.mentalState.level === 'stable' || opponent.mentalState.level === 'stressed');
        case "desperate_broken":
            return (character.hp < character.maxHp * 0.3) || (character.mentalState.level === 'broken');
        case "desperate_mentally_broken":
             return (character.id === 'katara' && ((character.hp < character.maxHp * 0.1) || (allyDowned) || (character.criticalHitsTaken >= 2) || (character.mentalState.level === 'broken')));
        case "doubted":
            return opponentTauntedBlindness || opponentLandedBlindHit;
        case "mortal_danger":
            return (ally && ally.hp < ally.maxHp * 0.05) || (character.hp < character.maxHp * 0.2);
        case "honor_violated":
            return opponentCheated || allyDisarmedUnfairly;
        case "meticulous_planning":
            return (opponent.lastMove?.isHighRisk && opponent.lastMoveEffectiveness === 'Weak') || (battleState.location?.tags?.includes('trap_favorable'));
        case "confident_stance":
            return characterLandedStrongOrCriticalHitLastTurn || allyBuffedSelf;
        case "skill_challenged":
            return opponentTauntedSkillOrTradition || opponentAttackedFirstAggressively;
        case "disrespected":
             return battleState.locationId === 'omashu' && opponentTauntedAgeOrStrategy;
        default:
            return false;
    }
}

function checkCurbstompConditions(attacker, defender, locId, battleState, battleEventLog, isPreBattle = false) {
    // Skip curbstomp check if it's pre-battle and not explicitly allowed
    if (isPreBattle && !locationConditions[locId]?.allowPreBattleCurbstomp) {
        return false;
    }

    // Skip curbstomp check if we haven't reached minimum turns
    if (!isPreBattle && battleState.turn < MIN_TURNS_BEFORE_CURBSTOMP) {
        return false;
    }

    // Get current phase from battleState
    const currentPhase = battleState.currentPhase || 'EARLY';

    // Check for curbstomp conditions
    const isCurbstomp = (
        // HP threshold check
        (defender.hp <= attacker.hp * CURBSTOMP_HP_THRESHOLD) &&
        // Momentum threshold check
        (defender.momentum <= CURBSTOMP_MOMENTUM_THRESHOLD)
    );

    if (isCurbstomp) {
        const curbstompEvent = {
            type: 'curbstomp_event',
            attackerId: attacker.id,
            defenderId: defender.id,
            text: `${attacker.name} has completely overwhelmed ${defender.name}!`,
            html_content: `<p class="narrative-action char-${attacker.id}">${attacker.name} has completely overwhelmed ${defender.name}!</p>`,
            isMajorEvent: true,
            actualAttackerId: attacker.id
        };
        battleEventLog.push(curbstompEvent);
        attacker.aiLog.push(`[Curbstomp]: ${attacker.name} has achieved a decisive advantage over ${defender.name}.`);
        return true;
    }

    return false;
}

function evaluateTerminalState(fighter1, fighter2, isStalemateFlag) {
    let battleOver = false;
    let winnerId = null;
    let loserId = null;
    let isStalemate = isStalemateFlag;

    const f1DefeatedByRegistry = charactersMarkedForDefeat.has(fighter1.id);
    const f2DefeatedByRegistry = charactersMarkedForDefeat.has(fighter2.id);

    // If marked for defeat, ensure HP is 0 for consistent state
    if (f1DefeatedByRegistry && fighter1.hp > 0) fighter1.hp = 0;
    if (f2DefeatedByRegistry && fighter2.hp > 0) fighter2.hp = 0;

    const f1DefeatedByHp = fighter1.hp <= 0;
    const f2DefeatedByHp = fighter2.hp <= 0;

    if (f1DefeatedByHp && f2DefeatedByHp) {
        battleOver = true;
        isStalemate = true;
    } else if (f1DefeatedByHp) {
        battleOver = true;
        winnerId = fighter2.id;
        loserId = fighter1.id;
    } else if (f2DefeatedByHp) {
        battleOver = true;
        winnerId = fighter1.id;
        loserId = fighter2.id;
    }
    if (isStalemateFlag && !battleOver) { // If stalemate was forced but no one's HP dropped to zero
        battleOver = true;
    }


    return { battleOver, winnerId, loserId, isStalemate };
}

// Add state validation function at the top of the file
function validateBattleState(state) {
    const requiredProperties = [
        'turn',
        'currentPhase',
        'environmentState',
        'location',
        'timeOfDay',
        'emotionalMode'
    ];

    const missingProperties = requiredProperties.filter(prop => !(prop in state));
    if (missingProperties.length > 0) {
        throw new Error(`Invalid battle state: Missing required properties: ${missingProperties.join(', ')}`);
    }

    if (!state.environmentState.specificImpacts || !(state.environmentState.specificImpacts instanceof Set)) {
        throw new Error('Invalid battle state: environmentState.specificImpacts must be a Set');
    }

    return true;
}

// Update initializeBattleState to include currentPhase
function initializeBattleState(f1Id, f2Id, locId, timeOfDay, emotionalMode) {
    const environmentState = {
        damageLevel: 0,
        specificImpacts: new Set(),
        lastImpact: null,
        damageHistory: []
    };

    const locationData = locationConditions[locId];
    if (!locationData) {
        throw new Error(`Invalid location ID: ${locId}`);
    }

    const currentLocConditions = { 
        id: locId, 
        timeOfDay, 
        ...locationData,
        environmentalModifiers: locationData.environmentalModifiers || {},
        damageThresholds: locationData.damageThresholds || {
            minor: 20,
            moderate: 40,
            severe: 60,
            catastrophic: 80
        }
    };

    const state = {
        turn: 0,
        currentPhase: 'EARLY', // Initialize with EARLY phase
        opponentLandedCriticalHit: false,
        opponentTaunted: false,
        opponentUsedLethalForce: false,
        opponentLandedSignificantHits: 0,
        characterReceivedCriticalHit: false,
        characterLandedStrongOrCriticalHitLastTurn: false,
        attackerIsStunned: false,
        opponentElement: null,
        fighter1Escalation: null,
        fighter2Escalation: null,
        environmentState,
        location: locId,
        timeOfDay,
        emotionalMode,
        lastPhaseTransition: null,
        phaseHistory: [],
        errorCount: 0,
        locationConditions: currentLocConditions // Add location conditions to state
    };

    validateBattleState(state);
    return state;
}

// Add helper function to get opponent
function getOpponent(fighter, fighter1, fighter2) {
    return fighter.id === fighter1.id ? fighter2 : fighter1;
}

// Update the simulateBattle function to use the new initialization
export function simulateBattle(f1Id, f2Id, locId, timeOfDay, emotionalMode = false) {
    // Initialize fighters
    const fighter1 = initializeFighterState(f1Id, f2Id, emotionalMode);
    const fighter2 = initializeFighterState(f2Id, f1Id, emotionalMode);

    // Create mutable references to track current attacker and defender
    let currentAttacker = fighter1;
    let currentDefender = fighter2;

    // Initialize battle state
    const currentBattleState = initializeBattleState(f1Id, f2Id, locId, timeOfDay, emotionalMode);

    // Set initial opponent references without creating circular dependencies
    fighter1.opponentId = fighter2.id;
    fighter2.opponentId = fighter1.id;
    currentBattleState.opponentId = fighter1.id;

    // Use the environmentState from currentBattleState
    const { environmentState } = currentBattleState;
    const battleEventLog = [];
    // The global charactersMarkedForDefeat is already used above, keep this global.
    // const charactersMarkedForDefeat = new Set(); // Remove this line if it's already global
    const battleContextFiredQuotes = new Set(); // This can remain local if desired
    
    // Initialize phase state using the imported function
    const phaseState = initializeBattlePhaseState();
    
    // Apply location-specific phase overrides with validation
    const locationOverrides = locationPhaseOverrides[locId] || {};
    if (locationOverrides.pokingDuration) {
        if (typeof locationOverrides.pokingDuration !== 'number' || locationOverrides.pokingDuration < 0) {
            throw new Error(`Invalid poking duration for location ${locId}: ${locationOverrides.pokingDuration}`);
        }
        phaseState.pokingDuration = locationOverrides.pokingDuration;
        fighter1.aiLog.push(`[Phase Override]: Poking duration set to ${phaseState.pokingDuration} due to location ${locId}.`);
        fighter2.aiLog.push(`[Phase Override]: Poking duration set to ${phaseState.pokingDuration} due to location ${locId}.`);
    }

    let battleOver = false;
    let winnerId = null;
    let loserId = null;
    let isStalemate = false;
    let turn = 0;

    fighter1.aiLog.push(`Battle started in ${phaseState.currentPhase} Phase.`);
    fighter2.aiLog.push(`Battle started in ${phaseState.currentPhase} Phase.`);

    // DIAGNOSTIC: Log initial aiLog state before loop
    console.log(`[DEBUG] Before loop - fighter1.aiLog length: ${fighter1.aiLog.length}, content:`, fighter1.aiLog);
    console.log(`[DEBUG] Before loop - fighter2.aiLog length: ${fighter2.aiLog.length}, content:`, fighter2.aiLog);

    // Helper function to get opponent without circular references
    const getOpponent = (fighter) => fighter.id === fighter1.id ? fighter2 : fighter1;

    // --- Pre-Battle Narrative (PRE_BANTER Phase) ---
    const initialBanter1 = findNarrativeQuote(fighter1, fighter2, 'battleStart', phaseState.currentPhase, { 
        currentPhaseKey: phaseState.currentPhase, 
        locationId: locId, 
        battleState: currentBattleState 
    });
    if (initialBanter1) {
        battleEventLog.push(...generateTurnNarrationObjects(
            [{quote: initialBanter1, actor: fighter1}], 
            null, 
            fighter1, 
            fighter2, 
            null, 
            environmentState, 
            currentBattleState.locationConditions, // Use locationData from battleState
            phaseState.currentPhase, 
            true, 
            null, 
            currentBattleState
        ));
    }

    const initialBanter2 = findNarrativeQuote(fighter2, fighter1, 'battleStart', phaseState.currentPhase, { 
        currentPhaseKey: phaseState.currentPhase, 
        locationId: locId, 
        battleState: currentBattleState 
    });
    if (initialBanter2) {
        battleEventLog.push(...generateTurnNarrationObjects(
            [{quote: initialBanter2, actor: fighter2}], 
            null, 
            fighter2, 
            fighter1, 
            null, 
            environmentState, 
            currentBattleState.locationConditions, // Use locationData from battleState
            phaseState.currentPhase, 
            true, 
            null, 
            currentBattleState
        ));
    }

    // NEW: Apply all pre-battle curbstomp, buff, and debuff rules
    applyCurbstompRules(fighter1, fighter2, currentBattleState, battleEventLog, true);

    // Evaluate outcome after pre-battle curbstomps
    let terminalOutcome = evaluateTerminalState(fighter1, fighter2, isStalemate);
    battleOver = terminalOutcome.battleOver;
    winnerId = terminalOutcome.winnerId;
    loserId = terminalOutcome.loserId;
    isStalemate = terminalOutcome.isStalemate;

    while (turn < MAX_TOTAL_TURNS && !battleOver) {
        // DIAGNOSTIC: Log aiLog state at beginning of each turn
        console.log(`[DEBUG] Turn ${turn + 1} START - currentAttacker.aiLog length: ${currentAttacker.aiLog.length}, content:`, currentAttacker.aiLog);
        console.log(`[DEBUG] Turn ${turn + 1} START - currentDefender.aiLog length: ${currentDefender.aiLog.length}, content:`, currentDefender.aiLog);

        currentBattleState.turn = turn;
        currentAttacker.currentTurn = turn;
        currentDefender.currentTurn = turn;
        currentBattleState.currentPhase = phaseState.currentPhase;

        currentBattleState.opponentLandedCriticalHit = false;
        currentBattleState.opponentTaunted = false;
        currentBattleState.opponentUsedLethalForce = false;
        currentBattleState.opponentLandedSignificantHits = 0;
        currentBattleState.characterReceivedCriticalHit = false;
        currentBattleState.characterLandedStrongOrCriticalHitLastTurn = false;

        // --- Universal Turn Setup ---
        const turnSpecificEventsForLog = [];

        turnSpecificEventsForLog.push({
            type: 'turn_marker',
            actorId: currentAttacker.id,
            characterName: currentAttacker.name,
            turn: turn + 1,
            portrait: currentAttacker.portrait, // Correctly use `portrait` here
        });
        // --- End Universal Turn Setup ---

        // At the start of each turn, check for phase transitions
        const phaseChanged = checkAndTransitionPhase(phaseState, currentAttacker, currentDefender, turn, locId);
        if (phaseChanged) {
            if (phaseState.phaseSummaryLog.length > 0) {
                const lastSummaryEntry = phaseState.phaseSummaryLog[phaseState.phaseSummaryLog.length - 1];
                currentAttacker.aiLog.push(`[Phase Summary]: ${lastSummaryEntry.phase} concluded after ${lastSummaryEntry.turns} turns.`);
                currentDefender.aiLog.push(`[Phase Summary]: ${lastSummaryEntry.phase} concluded after ${lastSummaryEntry.turns} turns.`);
            }
        
            // Explicitly push phase transition message to AI log
            const phaseTransitionMessage = `[Phase Transition]: Entered the ${phaseState.currentPhase} Phase.`;
            currentAttacker.aiLog.push(phaseTransitionMessage);
            currentDefender.aiLog.push(phaseTransitionMessage);

            // DIAGNOSTIC: Log aiLog state immediately after phase transition pushes
            console.log(`[DEBUG] Turn ${turn + 1} AFTER PHASE TRANSITION - currentAttacker.aiLog length: ${currentAttacker.aiLog.length}, content:`, currentAttacker.aiLog);
            console.log(`[DEBUG] Turn ${turn + 1} AFTER PHASE TRANSITION - currentDefender.aiLog length: ${currentDefender.aiLog.length}, content:`, currentDefender.aiLog);

            currentBattleState.currentPhase = phaseState.currentPhase;

            const currentPhaseInfo = phaseDefinitions.find(p => p.key === phaseState.currentPhase);
            battleEventLog.push({
                type: 'phase_header_event',
                phaseName: currentPhaseInfo.name,
                phaseEmoji: currentPhaseInfo.emoji,
                phaseKey: phaseState.currentPhase,
                text: `${currentPhaseInfo.name} ${currentPhaseInfo.emoji}`,
                html_content: phaseTemplates.header
                    .replace('{phaseDisplayName}', currentPhaseInfo.name)
                    .replace('{phaseEmoji}', currentPhaseInfo.emoji)
            });

            const phaseTransitionQuote1 = findNarrativeQuote(currentAttacker, currentDefender, 'phaseTransition', phaseState.currentPhase, { 
                currentPhaseKey: phaseState.currentPhase, 
                battleState: currentBattleState 
            });
            if (phaseTransitionQuote1) {
                battleEventLog.push(...generateTurnNarrationObjects(
                    [{quote: phaseTransitionQuote1, actor: currentAttacker}],
                    null,
                    currentAttacker,
                    currentDefender,
                    null,
                    environmentState,
                    currentBattleState.locationConditions, // Use locationData from battleState
                    phaseState.currentPhase,
                    true,
                    null,
                    currentBattleState
                ));
            }

            const phaseTransitionQuote2 = findNarrativeQuote(currentDefender, currentAttacker, 'phaseTransition', phaseState.currentPhase, { 
                currentPhaseKey: phaseState.currentPhase, 
                battleState: currentBattleState 
            });
            if (phaseTransitionQuote2) {
                battleEventLog.push(...generateTurnNarrationObjects(
                    [{quote: phaseTransitionQuote2, actor: currentDefender}],
                    null,
                    currentDefender,
                    currentAttacker,
                    null,
                    environmentState,
                    currentBattleState.locationConditions, // Use locationData from battleState
                    phaseState.currentPhase,
                    true,
                    null,
                    currentBattleState
                ));
            }
        }

        if (charactersMarkedForDefeat.has(currentAttacker.id)) {
            currentAttacker.aiLog.push(`[Action Skipped]: ${currentAttacker.name} is already marked for defeat and cannot act this segment.`);
            continue;
        }

        if (currentAttacker.stunImmunityTurns > 0) {
            currentAttacker.stunImmunityTurns--;
        }

        if (battleOver || isStalemate) {
            // These 'return' statements were replaced by 'continue' in a previous step to fix 'Jump target cannot cross function boundary'
            // and the while loop condition now handles `battleOver` and `isStalemate`.
            // Any further action after this point in this iteration of loop would be incorrect.
            // So we add a redundant continue for clarity (it will not be hit if battleOver or isStalemate are true already).
            continue;
        }


        // Energy management
        if (currentAttacker.energy < MIN_ENERGY_FOR_ACTION) {
            currentAttacker.energy = Math.min(currentAttacker.energy + ENERGY_RECOVERY_PER_TURN, MAX_ENERGY);
            currentAttacker.aiLog.push(`[Energy Recovery]: ${currentAttacker.name} recovers energy to ${currentAttacker.energy}.`);
            turnSpecificEventsForLog.push({
                type: 'energy_recovery_event',
                actorId: currentAttacker.id,
                characterName: currentAttacker.name,
                text: `${currentAttacker.name} takes a moment to recover energy. (Energy: ${currentAttacker.energy})`,
                html_content: `<p class="narrative-action char-${currentAttacker.id}">${currentAttacker.name} takes a moment to recover energy. (Energy: ${currentAttacker.energy})</p>`
            });
            continue;
        }

        // Stun management
        if (currentAttacker.stunDuration > 0) {
            currentAttacker.stunDuration--;
            
            if (currentAttacker.stunDuration === 0) {
                currentAttacker.consecutiveStuns = 0;
                currentAttacker.aiLog.push(`[Stun Expired]: ${currentAttacker.name} has recovered from being stunned.`);
            }

            currentAttacker.stunResistance = (currentAttacker.stunResistance || 0) + STUN_RESISTANCE_INCREASE;
            currentAttacker.aiLog.push(`[Action Skipped]: ${currentAttacker.name} is stunned. Turns remaining: ${currentAttacker.stunDuration}. Stun resistance increased to ${currentAttacker.stunResistance}.`);
            turnSpecificEventsForLog.push({
                type: 'stun_event',
                actorId: currentAttacker.id,
                characterName: currentAttacker.name,
                text: `${currentAttacker.name} is stunned and unable to move! (Stun remaining: ${currentAttacker.stunDuration} turn(s))`,
                html_content: `<p class="narrative-action char-${currentAttacker.id}">${currentAttacker.name} is stunned and unable to move! (Stun remaining: ${currentAttacker.stunDuration} turn(s))</p>`
            });
            currentBattleState.attackerIsStunned = true;
            continue;
        }
        currentBattleState.attackerIsStunned = false;

        // Get opponent using the helper function
        const opponent = getOpponent(currentAttacker, fighter1, fighter2);

        // Update battle state with opponent info
        currentBattleState.opponentLandedCriticalHit = opponent.lastMoveForPersonalityCheck?.effectiveness === 'Critical';
        currentBattleState.opponentUsedLethalForce = opponent.lastMoveForPersonalityCheck?.isHighRisk || false;
        currentBattleState.characterReceivedCriticalHit = false;
        currentBattleState.opponentElement = opponent.element;
        currentBattleState.fighter1Escalation = fighter1.escalationState;
        currentBattleState.fighter2Escalation = fighter2.escalationState;

        // Only check for curbstomp after minimum turns
        if (currentBattleState.turn >= MIN_TURNS_BEFORE_CURBSTOMP) {
            if (checkCurbstompConditions(currentAttacker, currentDefender, locId, currentBattleState, battleEventLog, false)) {
                currentAttacker.aiLog.push(`[Curbstomp Check]: ${currentAttacker.name} has achieved a decisive advantage over ${currentDefender.name}.`);
                terminalOutcome = evaluateTerminalState(currentAttacker, currentDefender, isStalemate);
                if (terminalOutcome.battleOver) {
                    battleOver = true;
                    winnerId = terminalOutcome.winnerId;
                    loserId = terminalOutcome.loserId;
                    isStalemate = terminalOutcome.isStalemate;
                    continue; // Exit current turn to process battle outcome
                }
            }
        }

        if (charactersMarkedForDefeat.has(currentDefender.id) || charactersMarkedForDefeat.has(currentAttacker.id)) {
            terminalOutcome = evaluateTerminalState(currentAttacker, currentDefender, isStalemate);
            if (terminalOutcome.battleOver) {
                battleOver = true; winnerId = terminalOutcome.winnerId; loserId = terminalOutcome.loserId; isStalemate = terminalOutcome.isStalemate;
                continue; // Exit current turn to process battle outcome
            }
        }

        let narrativeEventsForAction = [];
        const oldDefenderMentalState = currentDefender.mentalState.level;
        const oldAttackerMentalState = currentAttacker.mentalState.level;
        currentAttacker.mentalStateChangedThisTurn = false;

        if (currentBattleState.turn > 0) adaptPersonality(currentAttacker);

        if (currentAttacker.tacticalState) {
            currentAttacker.tacticalState.duration--;
            if (currentAttacker.tacticalState.duration <= 0) {
                currentAttacker.aiLog.push(`[Tactical State Expired]: ${currentAttacker.name} is no longer ${currentAttacker.tacticalState.name}.`);
                currentAttacker.tacticalState = null;
            }
        }

        if (currentAttacker.stunDuration > 0) {
            currentAttacker.stunDuration--;
            if (currentAttacker.stunDuration === 0) {
                currentAttacker.aiLog.push(`[Stun Expired]: ${currentAttacker.name} is no longer stunned.`);
                turnSpecificEventsForLog.push({
                    type: 'stun_event',
                    actorId: currentAttacker.id,
                    characterName: currentAttacker.name,
                    text: `${currentAttacker.name} recovers from the stun!`,
                    html_content: `<p class="narrative-action char-${currentAttacker.id}">${currentAttacker.name} recovers from the stun!</p>`
                });
            }
        }

        // --- AI Action Selection ---
        const aiDecision = selectMove(currentAttacker, currentDefender, currentBattleState.locationConditions, currentBattleState.turn, currentBattleState.currentPhase); // Use currentBattleState.locationConditions
        const move = aiDecision.move;

        // DIAGNOSTIC: Log the selected move and AI decision details
        console.log(`[DEBUG] Turn ${turn + 1} - ${currentAttacker.name} selected move:`, move);
        console.log(`[DEBUG] Turn ${turn + 1} - AI Decision:`, aiDecision);

        if (!move) {
            currentAttacker.aiLog.push("[Action Failed]: AI failed to select a valid move.");
            // Potentially add a "hesitation" narrative event here
            continue; 
        }

        // --- Move Execution & Resolution ---
        const result = calculateMove(move, currentAttacker, currentDefender, currentBattleState.locationConditions, battleEventLog, environmentState, locId, modifyMomentum); // Use currentBattleState.locationConditions
        
        // DIAGNOSTIC: Log the result of the move calculation
        console.log(`[DEBUG] Turn ${turn + 1} - ${currentAttacker.name} move result:`, result);

        // Generate narration for the entire action
        const turnNarrationObjects = generateTurnNarrationObjects(
            narrativeEventsForAction,
            move,
            currentAttacker,
            currentDefender,
            result,
            environmentState,
            currentBattleState.locationConditions, // Use locationData from battleState
            phaseState.currentPhase,
            false,
            aiDecision.aiLogEntryFromSelectMove || {},
            currentBattleState
        );
        turnSpecificEventsForLog.push(...turnNarrationObjects);


        // --- Update Fighter States Post-Action ---
        // Update mental state based on the move's outcome
        updateMentalState(currentAttacker, currentDefender, result, environmentState, locId, currentBattleState);
        updateMentalState(currentDefender, currentAttacker, { ...result, wasAttacker: false }, environmentState, locId, currentBattleState);

        // Update momentum
        modifyMomentum(currentAttacker, result.momentumChange.attacker, `Own Move (${result.effectiveness.label})`);
        modifyMomentum(currentDefender, result.momentumChange.defender, `Opponent Move (${result.effectiveness.label}) by ${currentAttacker.name}`);

        // Apply stun if the move caused it
        if (result.stunDuration > 0) {
            applyStun(currentDefender, result.stunDuration);
        }

        // Handle HP changes and defeat checking
        if (result.damage > 0) {
            currentDefender.hp = clamp(currentDefender.hp - result.damage, 0, 100);
        }
        if (result.selfDamage > 0) {
            currentAttacker.hp = clamp(currentAttacker.hp - result.selfDamage, 0, 100);
        }

        if (move.moveTags?.includes('requires_opening') && result.payoff && result.consumedStateName && !result.isReactedAction) {
             currentDefender.tacticalState = null;
             currentAttacker.aiLog.push(`[Tactical State Consumed]: ${currentAttacker.name} consumed ${currentDefender.name}'s ${result.consumedStateName} state.`);
        }


        if (currentDefender.hp <= 0 && !charactersMarkedForDefeat.has(currentDefender.id)) {
            charactersMarkedForDefeat.add(currentDefender.id);
        }
        currentAttacker.energy = clamp(currentAttacker.energy - result.energyCost, 0, 100);
        currentAttacker.moveHistory.push({ ...move, effectiveness: result.effectiveness.label });
        currentAttacker.lastMove = move;

        updateAiMemory(currentDefender, currentAttacker);
        updateAiMemory(currentAttacker, currentDefender);

        terminalOutcome = evaluateTerminalState(fighter1, fighter2, isStalemate);
        if (terminalOutcome.battleOver) {
            battleOver = true; winnerId = terminalOutcome.winnerId; loserId = terminalOutcome.loserId; isStalemate = terminalOutcome.isStalemate;
        }

        // Add all events from the completed turn to the main battle log
        battleEventLog.push(...turnSpecificEventsForLog);

        // Clear and update environment state
        environmentState.specificImpacts.clear();
        const currentLocData = currentBattleState.locationConditions; // Use currentBattleState.locationConditions
        if (currentLocData && currentLocData.damageThresholds && environmentState.damageLevel > 0) {
            let impactTier = null;
            if (environmentState.damageLevel >= currentLocData.damageThresholds.catastrophic) impactTier = 'catastrophic';
            else if (environmentState.damageLevel >= currentLocData.damageThresholds.severe) impactTier = 'severe';
            else if (environmentState.damageLevel >= currentLocData.damageThresholds.moderate) impactTier = 'moderate';
            else if (environmentState.damageLevel >= currentLocData.damageThresholds.minor) impactTier = 'minor';

            if (impactTier && currentLocData.environmentalImpacts[impactTier] && currentLocData.environmentalImpacts[impactTier].length > 0) { // Use currentLocData.environmentalImpacts
                const randomIndex = getRandomElement(currentLocData.environmentalImpacts[impactTier]);
                if (randomIndex !== null) {
                    environmentState.specificImpacts.add(currentLocData.environmentalImpacts[impactTier][randomIndex]);
                }
            }
        }

        // Update battle state with environment changes by mutating the existing object
        Object.assign(currentBattleState.environmentState, {
            damageLevel: environmentState.damageLevel,
            specificImpacts: new Set(environmentState.specificImpacts),
            lastImpact: environmentState.lastImpact,
            damageHistory: [...environmentState.damageHistory]
        });

        currentBattleState.characterLandedStrongOrCriticalHitLastTurn =
            currentAttacker.lastMoveForPersonalityCheck?.effectiveness === 'Strong' ||
            currentAttacker.lastMoveForPersonalityCheck?.effectiveness === 'Critical';

        // Environmental Impact Narration - Overhaul (Point 4)
        // Only generate environmental narration if damage level is significant and enough turns have passed.
        const MIN_DAMAGE_FOR_ENVIRONMENTAL_NARRATION = 20;
        const MIN_TURNS_BETWEEN_ENVIRONMENTAL_NARRATION = 3; // Or adjust based on desired frequency

        if (environmentState.damageLevel >= MIN_DAMAGE_FOR_ENVIRONMENTAL_NARRATION && environmentState.specificImpacts.size > 0) {
            if (currentBattleState.turn === 0 || (currentBattleState.turn - (currentBattleState.lastEnvironmentalNarrationTurn || -Infinity) >= MIN_TURNS_BETWEEN_ENVIRONMENTAL_NARRATION)) {
                let environmentalSummaryHtml = `<div class=\"environmental-summary\">`;
                environmentalSummaryHtml += phaseTemplates.environmentalImpactHeader;
                let allImpactTexts = [];
                environmentState.specificImpacts.forEach(impact => {
                    const formattedImpactText = findNarrativeQuote(currentAttacker, currentDefender, 'onCollateral', 'general', {
                        impactText: impact,
                        currentPhaseKey: phaseState.currentPhase,
                        battleState: currentBattleState
                    })?.line || impact;
                    allImpactTexts.push(formattedImpactText);
                });
                environmentalSummaryHtml += allImpactTexts.map(text => `<p class=\"environmental-impact-text\">${text}</p>`).join('');
                environmentalSummaryHtml += `</div>`;
                battleEventLog.push({
                    type: 'environmental_summary_event',
                    texts: allImpactTexts,
                    html_content: environmentalSummaryHtml,
                    isEnvironmental: true
                });
                currentBattleState.lastEnvironmentalNarrationTurn = currentBattleState.turn;
            }
        }

        if (!battleOver && currentBattleState.turn >= MIN_TURNS_BEFORE_CURBSTOMP) { // Check curbstomp after minimum turns
            if (currentAttacker.consecutiveDefensiveTurns >= 3 && currentDefender.consecutiveDefensiveTurns >= 3 &&
                Math.abs(currentAttacker.hp - currentDefender.hp) < 15 &&
                phaseState.currentPhase !== BATTLE_PHASES.EARLY) {

                // If both fighters are defensive and HP is close, it's a stalemate
                // Characters marked for defeat only if HP is non-zero, preventing double defeat flags
                if (currentAttacker.hp > 0) charactersMarkedForDefeat.add(currentAttacker.id);
                if (currentDefender.hp > 0) charactersMarkedForDefeat.add(currentDefender.id);

                terminalOutcome = evaluateTerminalState(currentAttacker, currentDefender, true);
                battleOver = true;
                winnerId = terminalOutcome.winnerId;
                loserId = terminalOutcome.loserId;
                isStalemate = terminalOutcome.isStalemate;
                currentAttacker.aiLog.push("[Stalemate Condition Met]: Prolonged defensive engagement.");
                currentDefender.aiLog.push("[Stalemate Condition Met]: Prolonged defensive engagement.");
            }
        }

        // Swap the current attacker and defender references for the next turn
        [currentAttacker, currentDefender] = [currentDefender, currentAttacker];
        turn++; // Increment turn at the end of the loop
    }
    
    // Before final evaluateTerminalState and summary, log the last phase's duration if battle ends mid-phase
    if (phaseState.phaseSummaryLog.length === 0 || phaseState.phaseSummaryLog[phaseState.phaseSummaryLog.length - 1].phase !== phaseState.currentPhase) {
        phaseState.phaseSummaryLog.push({ phase: phaseState.currentPhase, turns: phaseState.turnInCurrentPhase });
    }
    
    terminalOutcome = evaluateTerminalState(fighter1, fighter2, isStalemate);
    battleOver = terminalOutcome.battleOver;
    winnerId = terminalOutcome.winnerId;
    loserId = terminalOutcome.loserId;
    isStalemate = terminalOutcome.isStalemate;
    
    if (!battleOver && turn >= MAX_TOTAL_TURNS) {
        if (currentAttacker.hp === currentDefender.hp) {
            isStalemate = true;
        } else {
            winnerId = (currentAttacker.hp > currentDefender.hp) ? currentAttacker.id : currentDefender.id;
            loserId = (winnerId === currentAttacker.id) ? currentDefender.id : currentAttacker.id;
        }
        battleOver = true;
    }
    
    const finalWinnerFull = winnerId ? (currentAttacker.id === winnerId ? currentAttacker : currentDefender) : null;
    const finalLoserFull = loserId ? (currentAttacker.id === loserId ? currentAttacker : currentDefender) : null;
    
    if (isStalemate) {
        battleEventLog.push({
            type: 'stalemate_result_event',
            text: "The battle ends in a STALEMATE!",
            html_content: phaseTemplates.stalemateResult
        });
        fighter1.summary = "The battle reached an impasse, with neither fighter able to secure victory.";
        fighter2.summary = "The battle reached an impasse, with neither fighter able to secure victory.";
    } else if (finalWinnerFull && finalLoserFull) {
        const isKOByHp = finalLoserFull.hp <= 0;
        const isTimeoutVictory = turn >= MAX_TOTAL_TURNS && !isKOByHp;
        const lastCurbstompEvent = battleEventLog.slice().reverse().find(e => e.type === 'curbstomp_event' && !e.isEscape && e.isMajorEvent);
    
        if (lastCurbstompEvent && charactersMarkedForDefeat.has(finalLoserFull.id) && lastCurbstompEvent.actualAttackerId === finalWinnerFull.id) {
            finalWinnerFull.summary = lastCurbstompEvent.text;
            finalLoserFull.summary = `${finalLoserFull.name} was overcome by ${finalWinnerFull.name}'s decisive action.`;
        } else if (isKOByHp) {
            const finalBlowTextRaw = `${finalWinnerFull.name} lands the finishing blow, defeating ${finalLoserFull.name}!`;
            const finalBlowTextHtml = phaseTemplates.finalBlow
                .replace(/{winnerName}/g, `<span class="char-${finalWinnerFull.id}">${finalWinnerFull.name}</span>`)
                .replace(/{loserName}/g, `<span class="char-${finalLoserFull.id}">${finalLoserFull.name}</span>`);
            battleEventLog.push({
                type: 'final_blow_event',
                text: finalBlowTextRaw,
                html_content: finalBlowTextHtml,
                isKOAction: true
            });
            finalWinnerFull.summary = finalBlowTextRaw;
            finalLoserFull.summary = `${finalLoserFull.name} was defeated by a final blow from ${finalWinnerFull.name}.`;
        } else if (isTimeoutVictory) {
            const timeoutTextRaw = `The battle timer expires! With more health remaining, ${finalWinnerFull.name} is declared the victor over ${finalLoserFull.name}!`;
            const timeoutTextHtml = phaseTemplates.timeOutVictory
                .replace(/{winnerName}/g, `<span class="char-${finalWinnerFull.id}">${finalWinnerFull.name}</span>`)
                .replace(/{loserName}/g, `<span class="char-${finalLoserFull.id}">${finalLoserFull.name}</span>`);
            battleEventLog.push({
                type: 'timeout_victory_event',
                text: timeoutTextRaw,
                html_content: timeoutTextHtml
            });
            finalWinnerFull.summary = timeoutTextRaw;
            finalLoserFull.summary = `${finalLoserFull.name} lost by timeout as ${finalWinnerFull.name} had more health remaining.`;
        } else {
            finalWinnerFull.summary = `${finalWinnerFull.name}'s victory was sealed by their superior strategy and power.`;
            finalLoserFull.summary = `${finalLoserFull.name} fought bravely but was ultimately overcome.`;
        }
    } else {
        // Handle cases where we don't have valid fighter states, ensuring a summary is always set.
        const defaultSummary = "The battle ended in an unexpected state.";
        if (fighter1) fighter1.summary = defaultSummary;
        if (fighter2) fighter2.summary = defaultSummary;
    }
    
    // Add conclusion event
    if (!isStalemate && finalWinnerFull && finalLoserFull) {
        const finalWords = getFinalVictoryLine(finalWinnerFull, finalLoserFull);
        const conclusionContext = {
            WinnerName: finalWinnerFull.name,
            LoserName: finalLoserFull.name
        };
        const conclusionTextRaw = substituteTokens(
            `${finalWinnerFull.name} stands victorious. "${finalWords}"`,
            finalWinnerFull,
            finalLoserFull,
            conclusionContext
        );
        const conclusionTextHtml = phaseTemplates.conclusion.replace('{endingNarration}', conclusionTextRaw);
        battleEventLog.push({
            type: 'conclusion_event',
            text: conclusionTextRaw,
            html_content: conclusionTextHtml
        });
    } else if (isStalemate) {
        const conclusionTextRaw = "The battle concludes. Neither could claim outright victory.";
        battleEventLog.push({
            type: 'conclusion_event',
            text: conclusionTextRaw,
            html_content: phaseTemplates.conclusion.replace('{endingNarration}', conclusionTextRaw)
        });
    }
    
    // Update logs without creating circular references
    if (fighter1) fighter1.interactionLog = [...battleEventLog];
    if (fighter2) fighter2.interactionLog = [...battleEventLog];
    if (fighter1) fighter1.phaseLog = [...phaseState.phaseLog];
    if (fighter2) fighter2.phaseLog = [...phaseState.phaseLog];
    
    // DIAGNOSTIC: Log final aiLog content before returning
    console.log(`[DEBUG] Final fighter1.aiLog:`, fighter1.aiLog);
    console.log(`[DEBUG] Final fighter2.aiLog:`, fighter2.aiLog);

    // Create clean copies of final states without circular references
    const createCleanFighterState = (fighter) => {
        if (!fighter) {
            return {
                id: 'unknown',
                name: 'Unknown Fighter',
                hp: 0,
                energy: 0,
                momentum: 0,
                summary: 'The fighter\'s state could not be determined.',
                aiLog: ['Error: Fighter state was null or undefined.']
            };
        }
        const cleanState = { ...fighter };
        // Remove circular references
        delete cleanState.opponent; // Assuming 'opponent' property might exist and cause circularity
        // Keep only the opponent ID
        cleanState.opponentId = fighter.opponentId;

        // Ensure aiLog is explicitly copied as a new array to avoid any shared reference issues
        cleanState.aiLog = [...(fighter.aiLog || [])];

        return cleanState;
    };
    
    // Determine final states without circular references using the original, now-updated, fighter objects
    const finalFighter1State = createCleanFighterState(fighter1);
    const finalFighter2State = createCleanFighterState(fighter2);
    
    // Update phase state in battle state
    currentBattleState.currentPhase = phaseState.currentPhase;
    
    return {
        log: battleEventLog,
        winnerId: winnerId,
        loserId: loserId,
        isDraw: isStalemate,
        finalState: { 
            fighter1: finalFighter1State, 
            fighter2: finalFighter2State
        },
        environmentState,
        phaseSummary: phaseState.phaseSummaryLog
    };
}
    
// Modify the stun application logic
function applyStun(fighter, duration) {
    if (fighter.stunImmunityTurns > 0) {
        fighter.aiLog.push(`[Stun Resist]: ${fighter.name} is immune to stun for this turn.`);
        return; // No stun applied
    }

    // Apply stun resistance
    const effectiveDuration = Math.max(1, Math.floor(duration * (1 - (fighter.stunResistance || 0))));
    
    // Check for consecutive stuns
    if (fighter.consecutiveStuns >= MAX_CONSECUTIVE_STUNS) {
        fighter.aiLog.push(`[Stun Resistance]: ${fighter.name} has built up resistance to being stun-locked.`);
        return; // Resist the stun
    }
    
    fighter.consecutiveStuns = (fighter.consecutiveStuns || 0) + 1;
    fighter.stunDuration = effectiveDuration;
    fighter.stunImmunityTurns = 2; // Grant 2 turns of stun immunity after being stunned.
}

// Add energy cost to moves
function calculateMoveEnergyCost(move, fighter) {
    const baseCost = move.energyCost || 20;
    const effectiveness = move.effectiveness || 'Normal';
    
    // Adjust cost based on effectiveness (this is currently not passed, as calculateMove determines it)
    // For now, let's assume 'effectiveness' here refers to a potential base effectiveness property of the move,
    // not the dynamic outcome. If it's meant to be dynamic, it needs to be calculated *after* the move.
    // Given current usage, this function is used *before* calculateMove, so `move.effectiveness` might not be set.
    // Keeping it simple for now, as it's not being called.
    const effectivenessMultiplier = {
        'Critical': 1.5,
        'Strong': 1.2,
        'Normal': 1.0,
        'Weak': 0.8
    }[effectiveness] || 1.0;
    
    return Math.floor(baseCost * effectivenessMultiplier);
}

// Modify move execution to include energy costs
// This function is currently NOT used by simulateBattle directly.
// The energy cost calculation is done within calculateMove, and then clamped.
// If this function `executeMove` was intended to be called, it's missing from the main loop.
// For now, I'm just leaving it as-is, assuming its current role as a utility function.
function executeMove(move, attacker, defender) {
    const energyCost = calculateMoveEnergyCost(move, attacker);
    
    if (attacker.energy < energyCost) {
        attacker.aiLog.push(`[Energy Check]: ${attacker.name} doesn't have enough energy (${attacker.energy}/${energyCost}) to execute ${move.name}.`);
        return false;
    }
    
    attacker.energy -= energyCost;
    attacker.aiLog.push(`[Energy Cost]: ${attacker.name} used ${energyCost} energy executing ${move.name}. Remaining energy: ${attacker.energy}`);
    
    // ... rest of move execution logic ...
    // This function doesn't actually contain the rest of the move execution logic,
    // which is primarily in `calculateMove`. This function seems to be a remnant or
    // an example of how energy cost *could* be checked. It's not called anywhere else.
    
    return true;
}
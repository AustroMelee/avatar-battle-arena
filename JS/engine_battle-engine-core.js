'use strict';

import { characters } from './data_characters.js';
import { locationConditions } from './location-battle-conditions.js';
import { phaseTemplates, battlePhases as phaseDefinitions } from './narrative-v2.js';
import { selectMove, updateAiMemory, attemptManipulation, adaptPersonality } from './engine_ai-decision.js';
import { calculateMove } from './engine_move-resolution.js';
import { updateMentalState } from './engine_mental-state.js';
import { generateTurnNarrationObjects, getFinalVictoryLine, findNarrativeQuote, generateCurbstompNarration, substituteTokens } from './engine_narrative-engine.js';
import { modifyMomentum } from './engine_momentum.js';
import { initializeBattlePhaseState, checkAndTransitionPhase, BATTLE_PHASES } from './engine_battle-phase.js';
import { universalMechanics, locationCurbstompRules, characterCurbstompRules } from './mechanics.js';

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
// --- MODIFICATION: Added export ---
export const getRandomElement = (arr) => arr && arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;
// --- END MODIFICATION ---

let charactersMarkedForDefeat = new Set();

// --- MODIFICATION START: selectCurbstompVictim function ---
/**
 * Selects a victim for a curbstomp rule based on weightingLogic or fallback.
 * @param {object} attacker - The current attacker in the turn.
 * @param {object} defender - The current defender in the turn.
 * @param {object} rule - The curbstomp rule being evaluated.
 * @param {object} locationData - The data for the current location.
 * @param {object} battleState - The current state of the battle.
 * @returns {string|null} The ID of the chosen victim, or null if no victim could be determined.
 */
function selectCurbstompVictim({ attacker, defender, rule, locationData, battleState }) {
    if (typeof rule.weightingLogic === 'function') {
        const weightedOutcome = rule.weightingLogic({ attacker, defender, location: locationData, situation: battleState });

        if (typeof weightedOutcome === 'string') { // Directly returns victim ID
            return weightedOutcome;
        } else if (weightedOutcome && typeof weightedOutcome.victimId === 'string' && typeof weightedOutcome.probability === 'number') {
            // Returns a specific victim and their probability of being chosen (e.g., for single-target vulnerabilities)
            if (Math.random() < weightedOutcome.probability) {
                return weightedOutcome.victimId;
            }
            return null; // Victim avoided based on probability
        } else if (weightedOutcome && typeof weightedOutcome.probabilities === 'object') {
            // Returns probabilities for attacker vs defender
            const rand = Math.random();
            let cumulativeProb = 0;
            for (const charId in weightedOutcome.probabilities) {
                cumulativeProb += weightedOutcome.probabilities[charId];
                if (rand < cumulativeProb) {
                    return charId;
                }
            }
            // Fallback if probabilities don't sum to 1 or other issues
            return Math.random() < 0.5 ? attacker.id : defender.id;
        }
    }

    // Fallback for rules like "appliesToAll" that are now "instant_loss_weighted_character" but might not have weightingLogic yet
    // or if weightingLogic doesn't yield a clear result.
    // This maintains a semblance of the old "random" for such cases but should be replaced by specific weightingLogic.
    if (rule.appliesToAll && rule.outcome?.type?.includes("loss_weighted_character")) {
        return Math.random() < 0.5 ? attacker.id : defender.id;
    }
    
    // If rule targets a specific character (e.g. "sokka_vulnerability_death") but no weighting logic defined on how it might be avoided
    if (rule.appliesToCharacter && rule.outcome?.type?.includes("loss_weighted_character")) {
        return rule.appliesToCharacter; // The rule intrinsically targets this character
    }


    // Default fallback if no specific logic handles it (should be rare with good rule design)
    return null;
}
// --- MODIFICATION END ---


function initializeFighterState(charId, opponentId, emotionalMode) {
    const characterData = characters[charId];
    if (!characterData) throw new Error(`Character with ID ${charId} not found.`);
    
    const personalityProfile = characterData.personalityProfile || {
        aggression: 0.5, patience: 0.5, riskTolerance: 0.5, opportunism: 0.5,
        creativity: 0.5, defensiveBias: 0.5, antiRepeater: 0.5, signatureMoveBias: {}
    };

    return {
        id: charId, name: characterData.name, ...JSON.parse(JSON.stringify(characterData)),
        hp: 100, maxHp: 100, 
        energy: 100, momentum: 0, lastMove: null, lastMoveEffectiveness: null,
        isStunned: false, tacticalState: null, moveHistory: [], moveFailureHistory: [],
        consecutiveDefensiveTurns: 0, aiLog: [],
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
            return (opponentLandedSignificantHits >= 2) || opponentTaunted;
        case "underestimated": 
            return opponentTauntedAgeOrStrategy || (opponent.lastMoveEffectiveness === 'Weak' && opponent.lastMove.power > 50);
        case "in_control": 
            return (character.hp > character.maxHp * 0.5) && !characterReceivedCriticalHit && (opponent.mentalState.level === 'stable' || opponent.mentalState.level === 'stressed');
        case "desperate_broken": 
            return (character.hp < character.maxHp * 0.3) || (character.mentalState.level === 'broken') || (character.id === 'katara' && allyDowned) || (character.id === 'katara' && character.criticalHitsTaken >= 2);
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

function checkCurbstompConditions(attacker, defender, locationId, battleState, battleEventLog) {
    const rulesToCheck = [];
    let aDefeatWasMarkedByThisCheck = false;

    Object.values(universalMechanics).forEach(rule => {
        if (rule.characterId === attacker.id) rulesToCheck.push({ ...rule, source: 'universal', forAttacker: true, actualAttacker: attacker, actualTarget: defender });
        if (rule.characterId === defender.id) rulesToCheck.push({ ...rule, source: 'universal', forAttacker: false, actualAttacker: attacker, actualTarget: defender }); 
    });

    if (locationCurbstompRules[locationId]) {
        locationCurbstompRules[locationId].forEach(rule => {
            let applies = false;
            let ruleActualAttacker = attacker;
            let ruleActualTarget = defender;

            if (rule.appliesToPair && rule.appliesToPair[0] === attacker.id && rule.appliesToPair[1] === defender.id) { applies = true; }
            else if (rule.appliesToCharacter) {
                if (rule.appliesToCharacter === attacker.id) { applies = true; ruleActualAttacker = attacker; ruleActualTarget = defender;} 
                else if (rule.appliesToCharacter === defender.id) { applies = true; ruleActualAttacker = attacker; ruleActualTarget = defender;} 
            }
            else if (rule.appliesToCharacterElement) {
                if (attacker.element === rule.appliesToCharacterElement) {applies = true; ruleActualAttacker = attacker; ruleActualTarget = defender;}
                else if (defender.element === rule.appliesToCharacterElement && rule.outcome.type.includes("loss_character")) {applies = true; ruleActualAttacker = attacker; ruleActualTarget = defender;} 
            }
            else if (rule.appliesToAll) { applies = true; } 

            if (applies) rulesToCheck.push({ ...rule, source: 'location', actualAttacker: ruleActualAttacker, actualTarget: ruleActualTarget });
        });
    }

    if (characterCurbstompRules[attacker.id]) {
        characterCurbstompRules[attacker.id].forEach(rule => rulesToCheck.push({ ...rule, source: 'character', forAttacker: true, actualAttacker: attacker, actualTarget: defender }));
    }
    if (characterCurbstompRules[defender.id]) { 
        characterCurbstompRules[defender.id].forEach(rule => {
            if (rule.outcome.type.includes("loss_character") || rule.outcome.type.includes("self_sabotage") || rule.outcome.type.includes("disadvantage") || rule.outcome.type.includes("loss_weighted_character")) {
                 rulesToCheck.push({ ...rule, source: 'character', forAttacker: false, actualAttacker: attacker, actualTarget: defender });
            }
        });
    }
    
    for (const rule of rulesToCheck) {
        const characterForRuleApplication = rule.forAttacker ? rule.actualAttacker : rule.actualTarget; 
        const opponentForRuleApplication = characterForRuleApplication.id === rule.actualAttacker.id ? rule.actualTarget : rule.actualAttacker;
        
        const appliedRuleKey = `${rule.id}_${characterForRuleApplication.id}`;
        if (characterForRuleApplication.curbstompRulesAppliedThisBattle.has(appliedRuleKey) || characterForRuleApplication.curbstompRulesAppliedThisBattle.has(appliedRuleKey + "_escaped")) continue;

        let ruleTriggered = false;
        let effectiveChance = rule.triggerChance;

        if (rule.personalityTrigger) {
            if (!evaluatePersonalityTrigger(rule.personalityTrigger, characterForRuleApplication, opponentForRuleApplication, battleState)) {
                continue; 
            }
        }

        if (rule.conditionLogic) {
            if (!rule.conditionLogic(characterForRuleApplication, opponentForRuleApplication, { ...battleState, locationTags: battleState.location?.tags || [] })) continue;
        }
        
        if (rule.source === 'universal' && rule.conditions) {
            let universalMet = false;
            rule.conditions.forEach(cond => {
                if (cond.type === "target_technique_speed" && opponentForRuleApplication.lastMove?.speed === cond.value) { 
                    effectiveChance = cond.triggerChance; universalMet = true;
                }
                if (cond.type === "location_property" && battleState.location?.tags?.includes(cond.property)) {
                    effectiveChance = Math.min(rule.maxChance || 1, (effectiveChance || rule.triggerChance) + (cond.modifier || 0));
                    universalMet = true; 
                }
            });
            if (!universalMet && rule.conditions.length > 0) continue;
        }

        if (Math.random() < effectiveChance) ruleTriggered = true;

        if (ruleTriggered) {
            let isEscape = false;
            const characterPotentiallyEscaping = rule.outcome.type.includes("target") || rule.appliesToCharacter === opponentForRuleApplication.id ? opponentForRuleApplication : characterForRuleApplication;

            if (rule.escapeCondition && rule.escapeCondition.character === characterPotentiallyEscaping.id) {
                if (Math.random() < rule.escapeCondition.successChance) {
                    if ((rule.escapeCondition.type === "intelligence_roll" && characterPotentiallyEscaping.intelligence > rule.escapeCondition.threshold)) {
                        isEscape = true;
                    }
                }
            }
            
            let actualVictimForNarrationObject = null; 
            let mechanicallyDeterminedLoserId = null;

            // --- MODIFICATION START: Use selectCurbstompVictim for weighted rules ---
            if (rule.outcome?.type === "instant_loss_weighted_character") {
                mechanicallyDeterminedLoserId = selectCurbstompVictim({ 
                    attacker: rule.actualAttacker, 
                    defender: rule.actualTarget, 
                    rule, 
                    locationData: battleState.location, 
                    battleState 
                });
                if (mechanicallyDeterminedLoserId) {
                    actualVictimForNarrationObject = (mechanicallyDeterminedLoserId === rule.actualAttacker.id) ? rule.actualAttacker : rule.actualTarget;
                } else {
                    // This implies the weightingLogic decided no one loses this time (e.g., 0% chance for both)
                    // Or escape condition met (handled above).
                    // If no victim is chosen, we might skip marking anyone for defeat.
                    // For now, let's assume if mechanicallyDeterminedLoserId is null, the curbstomp fizzles unless it's an escape.
                    if (!isEscape) continue; // Skip if no victim and not an escape
                }
            }
            // --- MODIFICATION END ---

            const narrationContext = {};
            if (actualVictimForNarrationObject) { // If a victim was determined for weighted loss
                narrationContext.actualVictimName = actualVictimForNarrationObject.name;
            } else if (rule.outcome?.type?.includes("loss_random_character")) { // Fallback for old random rules if any remain
                 const randomLoserForNarration = Math.random() < 0.5 ? rule.actualAttacker : rule.actualTarget;
                 narrationContext.actualVictimName = randomLoserForNarration.name;
                 mechanicallyDeterminedLoserId = randomLoserForNarration.id; // Ensure this is set for mechanics
            }


            if (rule.activatingMoveName) { 
                 narrationContext['{moveName}'] = rule.activatingMoveName;
            }


            const narrativeEvent = generateCurbstompNarration(rule, rule.actualAttacker, rule.actualTarget, isEscape, narrationContext);
            if (narrativeEvent) battleEventLog.push(narrativeEvent);
            
            characterForRuleApplication.curbstompRulesAppliedThisBattle.add(appliedRuleKey + (isEscape ? "_escaped" : ""));

            if (!isEscape) {
                const outcome = rule.outcome;

                switch (outcome.type) {
                    case "instant_kill_target":
                    case "instant_death_target":
                    case "instant_kill_target_collapse":
                    case "instant_kill_target_ice":
                    case "instant_win_attacker_vs_armor": 
                    case "instant_win_attacker_control":  
                    case "instant_win_attacker_overwhelm":
                    case "instant_win_attacker":         
                        charactersMarkedForDefeat.add(rule.actualTarget.id); 
                        aDefeatWasMarkedByThisCheck = true;
                        break;
                    case "instant_loss_character":
                        const charLosingId = rule.appliesToCharacter;
                        if (charLosingId) {
                           charactersMarkedForDefeat.add(charLosingId);
                           aDefeatWasMarkedByThisCheck = true;
                        }
                        break;
                    // --- MODIFICATION START: Use mechanicallyDeterminedLoserId for marking ---
                    case "instant_loss_weighted_character": // New type
                    case "instant_loss_random_character": // Old type, handled by selectCurbstompVictim fallback or explicit victim above
                    case "instant_loss_character_if_fall": // This should also become weighted
                    case "instant_loss_random_character_if_knocked_off": // This should also become weighted
                        if (mechanicallyDeterminedLoserId) {
                            charactersMarkedForDefeat.add(mechanicallyDeterminedLoserId);
                            aDefeatWasMarkedByThisCheck = true;
                        } else {
                            // This implies weightingLogic determined no loser, or rule applied to character who avoided it
                            // console.warn(`Rule ${rule.id} (type ${outcome.type}) triggered but no mechanical loser determined.`);
                        }
                        break;
                    // --- MODIFICATION END ---
                    case "conditional_instant_kill_or_self_sabotage":
                        const isSelfSabotageOutcome = Math.random() >= (1 - (rule.selfSabotageChance || 0));
                        if (!isSelfSabotageOutcome) { 
                            charactersMarkedForDefeat.add(rule.actualTarget.id);
                            aDefeatWasMarkedByThisCheck = true;
                        } else { 
                            rule.actualAttacker.hp = clamp(rule.actualAttacker.hp - 15, 0, rule.actualAttacker.maxHp);
                            modifyMomentum(rule.actualAttacker, -2, `${rule.id} backfired on ${rule.actualAttacker.name}`);
                            
                            const selfSabotageOutcomeDetails = {...rule.outcome, successMessage: rule.outcome.selfSabotageMessage || `${rule.actualAttacker.name}'s move backfires!`};
                            const selfSabotageNarrationContext = { 
                                isSelfSabotageOutcome: true, 
                                actualVictimName: rule.actualAttacker.name, // Attacker is the victim of self-sabotage
                                '{moveName}': rule.activatingMoveName || "their own action"
                            };
                            const selfSabotageEvent = generateCurbstompNarration(
                                {...rule, outcome: selfSabotageOutcomeDetails }, 
                                rule.actualAttacker, 
                                rule.actualTarget, 
                                false,
                                selfSabotageNarrationContext
                            );
                            if(selfSabotageEvent) battleEventLog.push(selfSabotageEvent);

                            if (rule.actualAttacker.hp <=0) { 
                                charactersMarkedForDefeat.add(rule.actualAttacker.id);
                                aDefeatWasMarkedByThisCheck = true;
                            }
                        }
                        break;
                    case "instant_paralysis_target":
                    case "incapacitation_target_disable_limbs":
                    case "instant_incapacitation_target_bury":
                    case "instant_incapacitation_target_burn":
                        rule.actualTarget.isStunned = true; 
                        rule.actualTarget.hp = clamp(Math.min(rule.actualTarget.hp, 10), 0, rule.actualTarget.maxHp);
                        if (rule.actualTarget.hp <= 0) {
                            charactersMarkedForDefeat.add(rule.actualTarget.id);
                            aDefeatWasMarkedByThisCheck = true;
                        }
                        battleState.logSystemMessage = `${rule.actualTarget.name} is incapacitated by ${rule.actualAttacker.name}'s ${rule.id}!`;
                        break;
                }
                if (aDefeatWasMarkedByThisCheck) return true; 
            }
        }
    }
    return aDefeatWasMarkedByThisCheck; 
}

function evaluateTerminalState(fighter1, fighter2, isStalemateFlag) {
    let battleOver = false;
    let winnerId = null;
    let loserId = null;
    let isStalemate = isStalemateFlag; 

    const f1DefeatedByRegistry = charactersMarkedForDefeat.has(fighter1.id);
    const f2DefeatedByRegistry = charactersMarkedForDefeat.has(fighter2.id);
    
    if (f1DefeatedByRegistry) fighter1.hp = 0;
    if (f2DefeatedByRegistry) fighter2.hp = 0;
    
    const f1DefeatedByHp = fighter1.hp <= 0;
    const f2DefeatedByHp = fighter2.hp <= 0;

    if ((f1DefeatedByRegistry || f1DefeatedByHp) && (f2DefeatedByRegistry || f2DefeatedByHp)) {
        battleOver = true;
        isStalemate = true; 
    } else if (f1DefeatedByRegistry || f1DefeatedByHp) {
        battleOver = true;
        winnerId = fighter2.id;
        loserId = fighter1.id;
    } else if (f2DefeatedByRegistry || f2DefeatedByHp) {
        battleOver = true;
        winnerId = fighter1.id;
        loserId = fighter2.id;
    }
    
    return { battleOver, winnerId, loserId, isStalemate };
}


export function simulateBattle(f1Id, f2Id, locId, timeOfDay, emotionalMode = false) {
    charactersMarkedForDefeat.clear(); 

    let fighter1 = initializeFighterState(f1Id, f2Id, emotionalMode);
    let fighter2 = initializeFighterState(f2Id, f1Id, emotionalMode);
    
    const conditions = { ...locationConditions[locId], id: locId, isDay: timeOfDay === 'day', isNight: timeOfDay === 'night' };
    let battleEventLog = []; 
    let interactionLog = []; 
    let initiator = (fighter1.powerTier > fighter2.powerTier) ? fighter1 : ((fighter2.powerTier > fighter1.powerTier) ? fighter2 : (Math.random() < 0.5 ? fighter1 : fighter2));
    let responder = (initiator.id === fighter1.id) ? fighter2 : fighter1;
    
    let battleOver = false;
    let isStalemate = false;
    let winnerId = null; 
    let loserId = null;  
    let turn = 0; 

    let phaseState = initializeBattlePhaseState();
    fighter1.aiLog.push(...phaseState.phaseLog); 
    fighter2.aiLog.push(...phaseState.phaseLog);

    let environmentState = { damageLevel: 0, lastDamageSourceId: null, specificImpacts: new Set() };
    const locationData = locationConditions[locId];

    let currentBattleState = {
        locationId: locId,
        location: locationData, 
        locationTags: locationData?.tags || [], 
        turn: 0, 
        isFullMoon: conditions.isNight && Math.random() < 0.25, 
        opponentLandedCriticalHit: false, opponentTaunted: false, allyTargeted: false, ally: null,
        opponentUsedLethalForce: false, opponentLandedSignificantHits: 0, opponentTauntedAgeOrStrategy: false,
        opponentTauntedBlindness: false, opponentLandedBlindHit: false, characterReceivedCriticalHit: false, 
        opponentCheated: false, allyDisarmedUnfairly: false, allyDowned: false,
        characterLandedStrongOrCriticalHitLastTurn: false, allyBuffedSelf: false,
        opponentTauntedSkillOrTradition: false, opponentAttackedFirstAggressively: false,
        nearEdge: false, lastMovePushbackStrong: false, logSystemMessage: ""
    };

    const initialBanter1 = findNarrativeQuote(fighter1, fighter2, 'battleStart', 'general', { currentPhaseKey: phaseState.currentPhase });
    if (initialBanter1) battleEventLog.push(...generateTurnNarrationObjects([{quote: initialBanter1, actor: fighter1}], null, fighter1, fighter2, null, environmentState, locationData, phaseState.currentPhase, true));
    
    const initialBanter2 = findNarrativeQuote(fighter2, fighter1, 'battleStart', 'general', { currentPhaseKey: phaseState.currentPhase });
    if (initialBanter2) battleEventLog.push(...generateTurnNarrationObjects([{quote: initialBanter2, actor: fighter2}], null, fighter2, fighter1, null, environmentState, locationData, phaseState.currentPhase, true));

    if (checkCurbstompConditions(initiator, responder, locId, currentBattleState, battleEventLog)) {
        initiator.aiLog.push(`[Pre-Battle Curbstomp Check]: ${initiator.name} triggered or was affected by a curbstomp rule involving ${responder.name}.`);
    }
    if (!charactersMarkedForDefeat.has(initiator.id) && !charactersMarkedForDefeat.has(responder.id)) {
      if (checkCurbstompConditions(responder, initiator, locId, currentBattleState, battleEventLog)) {
        responder.aiLog.push(`[Pre-Battle Curbstomp Check]: ${responder.name} triggered or was affected by a curbstomp rule involving ${initiator.name}.`);
      }
    }
    
    let terminalOutcome = evaluateTerminalState(fighter1, fighter2, isStalemate); 
    battleOver = terminalOutcome.battleOver;
    winnerId = terminalOutcome.winnerId;
    loserId = terminalOutcome.loserId;
    isStalemate = terminalOutcome.isStalemate;


    for (turn = 0; turn < 6 && !battleOver; turn++) { 
        currentBattleState.turn = turn; 
        currentBattleState.opponentLandedCriticalHit = false; currentBattleState.opponentTaunted = false; 
        currentBattleState.opponentUsedLethalForce = false; currentBattleState.opponentLandedSignificantHits = 0;
        currentBattleState.characterReceivedCriticalHit = false; 
        currentBattleState.characterLandedStrongOrCriticalHitLastTurn = false; 

        const phaseChanged = checkAndTransitionPhase(phaseState, fighter1, fighter2, turn);
        if (phaseChanged) {
            fighter1.aiLog.push(phaseState.phaseLog[phaseState.phaseLog.length - 1]);
            fighter2.aiLog.push(phaseState.phaseLog[phaseState.phaseLog.length - 1]);
            const currentPhaseInfo = phaseDefinitions.find(p => p.key === phaseState.currentPhase) || phaseDefinitions[0];
            battleEventLog.push({ 
                type: 'phase_header_event',
                phaseName: currentPhaseInfo.name, phaseEmoji: currentPhaseInfo.emoji,
                phaseKey: phaseState.currentPhase, text: `${currentPhaseInfo.name} ${currentPhaseInfo.emoji}`,
                isPhaseHeader: true,
                html_content: phaseTemplates.header
                    .replace('{phaseDisplayName}', currentPhaseInfo.name)
                    .replace('{phaseEmoji}', currentPhaseInfo.emoji)
            });
        }
        
        let turnSpecificEventsForLog = []; 
        const battleContextFiredQuotes = new Set();
        
        const processTurnSegment = (attacker, defender) => {
            if (charactersMarkedForDefeat.has(attacker.id)) {
                attacker.aiLog.push(`[Action Skipped]: ${attacker.name} is already marked for defeat and cannot act this segment.`);
                return;
            }

            if (battleOver || isStalemate) return; 

            currentBattleState.opponentLandedCriticalHit = defender.lastMoveForPersonalityCheck?.effectiveness === 'Critical';
            currentBattleState.opponentUsedLethalForce = defender.lastMoveForPersonalityCheck?.isHighRisk || false;
            currentBattleState.characterReceivedCriticalHit = false; 

            if (checkCurbstompConditions(attacker, defender, locId, currentBattleState, battleEventLog)) {
                attacker.aiLog.push(`[Curbstomp Check]: ${attacker.name} triggered or was affected by a curbstomp rule involving ${defender.name} during turn segment.`);
                terminalOutcome = evaluateTerminalState(fighter1, fighter2, isStalemate);
                if (terminalOutcome.battleOver) { battleOver = true; winnerId = terminalOutcome.winnerId; loserId = terminalOutcome.loserId; isStalemate = terminalOutcome.isStalemate; return; }
            }
            if (charactersMarkedForDefeat.has(defender.id)) { 
                terminalOutcome = evaluateTerminalState(fighter1, fighter2, isStalemate);
                 if (terminalOutcome.battleOver) { battleOver = true; winnerId = terminalOutcome.winnerId; loserId = terminalOutcome.loserId; isStalemate = terminalOutcome.isStalemate; return; }
            }


            let narrativeEventsForAction = []; 
            const oldDefenderMentalState = defender.mentalState.level;
            const oldAttackerMentalState = attacker.mentalState.level;
            attacker.mentalStateChangedThisTurn = false; 

            if (currentBattleState.turn > 0) adaptPersonality(attacker); 
            
            if (attacker.tacticalState) {
                attacker.tacticalState.duration--;
                if (attacker.tacticalState.duration <= 0) {
                    attacker.aiLog.push(`[Tactical State Expired]: ${attacker.name} is no longer ${attacker.tacticalState.name}.`);
                    attacker.tacticalState = null;
                }
            }
            if (attacker.isStunned) { 
                attacker.aiLog.push(`[Action Skipped]: ${attacker.name} is stunned and cannot act this segment.`);
                turnSpecificEventsForLog.push({
                    type: 'stun_event', actorId: attacker.id, characterName: attacker.name,
                    text: `${attacker.name} is stunned and unable to move!`,
                    html_content: `<p class="narrative-action char-${attacker.id}">${attacker.name} is stunned and unable to move!</p>`
                });
                attacker.isStunned = false; 
                return; 
            }
            
            const addNarrativeEvent = (quote, actorForQuote) => {
                if (quote && !battleContextFiredQuotes.has(`${actorForQuote.id}-${quote.line}`)) { 
                    narrativeEventsForAction.push({ quote, actor: actorForQuote });
                    battleContextFiredQuotes.add(`${actorForQuote.id}-${quote.line}`);
                }
            };
            
            let manipulationResult = attemptManipulation(attacker, defender);
            if (manipulationResult.success) {
                defender.tacticalState = { name: manipulationResult.effect, duration: 1, intensity: 1.2, isPositive: false };
                addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onManipulation', 'asAttacker', { currentPhaseKey: phaseState.currentPhase }), attacker);
                if (manipulationResult.narration) {
                     turnSpecificEventsForLog.push({
                        type: 'manipulation_narration_event', actorId: attacker.id,
                        text: manipulationResult.narration.replace(/<[^>]+>/g, ''),
                        html_content: manipulationResult.narration, isDialogue: false, 
                     });
                }
                currentBattleState.opponentTaunted = true; 
            }

            const { move, aiLogEntryFromSelectMove } = selectMove(attacker, defender, conditions, currentBattleState.turn, phaseState.currentPhase); 
            addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onIntentSelection', aiLogEntryFromSelectMove?.intent || 'StandardExchange', { currentPhaseKey: phaseState.currentPhase }), attacker);
            
            const result = calculateMove(move, attacker, defender, conditions, interactionLog, environmentState, locId);
            result.isKOAction = (defender.hp - result.damage <= 0);

            attacker.lastMoveForPersonalityCheck = { isHighRisk: move.isHighRisk || false, effectiveness: result.effectiveness.label, power: move.power || 0 };
            if (result.effectiveness.label === 'Critical') {
                currentBattleState.characterReceivedCriticalHit = true; 
                defender.criticalHitsTaken +=1; 
            }
            if (result.effectiveness.label === 'Strong' || result.effectiveness.label === 'Critical') {
                currentBattleState.characterLandedStrongOrCriticalHitLastTurn = true; 
            }


            modifyMomentum(attacker, result.momentumChange.attacker, `Move (${result.effectiveness.label}) by ${attacker.name}`);
            modifyMomentum(defender, result.momentumChange.defender, `Opponent Move (${result.effectiveness.label}) by ${attacker.name}`);

            if (result.collateralDamage > 0 && environmentState.damageLevel < 100) { 
                environmentState.damageLevel = clamp(environmentState.damageLevel + result.collateralDamage, 0, 100);
                environmentState.lastDamageSourceId = attacker.id;
                const collateralContext = { currentPhaseKey: phaseState.currentPhase };
                if (attacker.collateralTolerance < 0.3) addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onCollateral', 'stressedByDamage', collateralContext), attacker);
                else if (attacker.collateralTolerance > 0.7) addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onCollateral', 'thrivingInDamage', collateralContext), attacker);
                else addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onCollateral', 'causingDamage', collateralContext), attacker);
                
                if (defender.collateralTolerance < 0.3) addNarrativeEvent(findNarrativeQuote(defender, attacker, 'onCollateral', 'stressedByDamage', collateralContext), defender);
                else if (defender.collateralTolerance > 0.7) addNarrativeEvent(findNarrativeQuote(defender, attacker, 'onCollateral', 'thrivingInDamage', collateralContext), defender);
                else addNarrativeEvent(findNarrativeQuote(defender, attacker, 'onCollateral', 'observingDamage', collateralContext), defender);
            }
            
            updateMentalState(defender, attacker, result, environmentState);
            updateMentalState(attacker, defender, null, environmentState); 

            if (defender.mentalState.level !== oldDefenderMentalState) {
                addNarrativeEvent(findNarrativeQuote(defender, attacker, 'onStateChange', defender.mentalState.level, { currentPhaseKey: phaseState.currentPhase }), defender);
            }
            if (attacker.mentalState.level !== oldAttackerMentalState && attacker.mentalStateChangedThisTurn) {
                addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onStateChange', attacker.mentalState.level, { currentPhaseKey: phaseState.currentPhase }), attacker);
            }
            
            attacker.lastMoveEffectiveness = result.effectiveness.label;
            attacker.consecutiveDefensiveTurns = (move.type === 'Utility' || move.type === 'Defense') ? attacker.consecutiveDefensiveTurns + 1 : 0;
            
            if (move.setup && result.effectiveness.label !== 'Weak' && !move.isRepositionMove) {
                defender.tacticalState = { ...move.setup, isPositive: false };
                attacker.aiLog.push(`[Tactical State Apply]: ${defender.name} is now ${defender.tacticalState.name}!`);
            }
             if (move.isRepositionMove && attacker.tacticalState) {
                const stateType = attacker.tacticalState.isPositive ? '(Self-Buff)' : '(Self-Debuff)';
                attacker.aiLog.push(`[Tactical State Apply]: ${attacker.name} is now ${attacker.tacticalState.name}! ${stateType}`);
            }

            if (move.moveTags?.includes('requires_opening') && result.payoff && result.consumedStateName) {
                 defender.tacticalState = null; 
                 attacker.aiLog.push(`[Tactical State Consumed]: ${attacker.name} consumed ${defender.name}'s ${result.consumedStateName} state.`);
            }
            if (result.effectiveness.label === 'Critical' && move.type !== 'Defense' && !move.isRepositionMove) defender.isStunned = true;
            
            turnSpecificEventsForLog.push(...generateTurnNarrationObjects(narrativeEventsForAction, move, attacker, defender, result, environmentState, locationData, phaseState.currentPhase));

            defender.hp = clamp(defender.hp - result.damage, 0, 100);
            if (defender.hp <= 0) {
                charactersMarkedForDefeat.add(defender.id);
            }
            attacker.energy = clamp(attacker.energy - result.energyCost, 0, 100);
            attacker.moveHistory.push({ ...move, effectiveness: result.effectiveness.label });
            attacker.lastMove = move;
            
            updateAiMemory(defender, attacker); 
            updateAiMemory(attacker, defender);
            
            terminalOutcome = evaluateTerminalState(fighter1, fighter2, isStalemate);
            if (terminalOutcome.battleOver) {
                battleOver = true; winnerId = terminalOutcome.winnerId; loserId = terminalOutcome.loserId; isStalemate = terminalOutcome.isStalemate;
            }
        };
        
        environmentState.specificImpacts.clear(); 
        const currentLocData = locationConditions[locId];
        if (currentLocData && currentLocData.damageThresholds && environmentState.damageLevel > 0) {
            let impactTier = null;
            if (environmentState.damageLevel >= currentLocData.damageThresholds.catastrophic) impactTier = 'catastrophic';
            else if (environmentState.damageLevel >= currentLocData.damageThresholds.severe) impactTier = 'severe';
            else if (environmentState.damageLevel >= currentLocData.damageThresholds.moderate) impactTier = 'moderate';
            else if (environmentState.damageLevel >= currentLocData.damageThresholds.minor) impactTier = 'minor';

            if (impactTier && locationData.environmentalImpacts[impactTier] && locationData.environmentalImpacts[impactTier].length > 0) {
                 const randomImpact = getRandomElement(locationData.environmentalImpacts[impactTier]); 
                 if (randomImpact) environmentState.specificImpacts.add(randomImpact);
            }
        }
        
        currentBattleState.characterLandedStrongOrCriticalHitLastTurn = initiator.lastMoveForPersonalityCheck?.effectiveness === 'Strong' || initiator.lastMoveForPersonalityCheck?.effectiveness === 'Critical';
        processTurnSegment(initiator, responder);

        if (!battleOver) { 
            currentBattleState.characterLandedStrongOrCriticalHitLastTurn = responder.lastMoveForPersonalityCheck?.effectiveness === 'Strong' || responder.lastMoveForPersonalityCheck?.effectiveness === 'Critical';
            processTurnSegment(responder, initiator);
        }


        if (environmentState.damageLevel > 0 && environmentState.specificImpacts.size > 0) {
            let environmentalSummaryHtml = `<div class="environmental-summary">`;
            environmentalSummaryHtml += phaseTemplates.environmentalImpactHeader;
            let allImpactTexts = [];
            environmentState.specificImpacts.forEach(impact => {
                 const formattedImpactText = findNarrativeQuote(initiator, responder, 'onCollateral', 'general', { impactText: impact, currentPhaseKey: phaseState.currentPhase })?.line || impact;
                 environmentalSummaryHtml += `<p class="environmental-impact-text">${formattedImpactText}</p>`;
                 allImpactTexts.push(formattedImpactText);
            });
            environmentalSummaryHtml += `</div>`;
            turnSpecificEventsForLog.push({ 
                type: 'environmental_summary_event', 
                texts: allImpactTexts, 
                html_content: environmentalSummaryHtml,
                isEnvironmental: true
            });
        }
        
        battleEventLog.push(...turnSpecificEventsForLog);

        if (!battleOver && currentBattleState.turn >= 2) { 
            if (fighter1.consecutiveDefensiveTurns >= 3 && fighter2.consecutiveDefensiveTurns >= 3 &&
                Math.abs(fighter1.hp - fighter2.hp) < 15 && 
                phaseState.currentPhase !== BATTLE_PHASES.EARLY) { 
                
                if (fighter1.hp > 0) charactersMarkedForDefeat.add(fighter1.id);
                if (fighter2.hp > 0) charactersMarkedForDefeat.add(fighter2.id);

                terminalOutcome = evaluateTerminalState(fighter1, fighter2, true); 
                battleOver = true; 
                winnerId = terminalOutcome.winnerId; 
                loserId = terminalOutcome.loserId; 
                isStalemate = terminalOutcome.isStalemate; 
                fighter1.aiLog.push("[Stalemate Condition Met]: Prolonged defensive engagement.");
                fighter2.aiLog.push("[Stalemate Condition Met]: Prolonged defensive engagement.");
            }
        }

        if (battleOver) break; 
        [initiator, responder] = [responder, initiator];
    }
    
    if (!battleOver) { 
        terminalOutcome = evaluateTerminalState(fighter1, fighter2, false);
        battleOver = terminalOutcome.battleOver; 
        winnerId = terminalOutcome.winnerId;
        loserId = terminalOutcome.loserId;
        isStalemate = terminalOutcome.isStalemate;

        if (!battleOver) { 
             if (fighter1.hp === fighter2.hp) {
                isStalemate = true;
            } else { 
                winnerId = (fighter1.hp > fighter2.hp) ? fighter1.id : fighter2.id;
                loserId = (winnerId === fighter1.id) ? fighter2.id : fighter1.id;
            }
        }
    }

    const finalWinnerFull = winnerId ? (fighter1.id === winnerId ? fighter1 : fighter2) : null;
    const finalLoserFull = loserId ? (fighter1.id === loserId ? fighter1 : fighter2) : null;


    if (isStalemate) {
        battleEventLog.push({ type: 'stalemate_result_event', text: "The battle ends in a STALEMATE!", html_content: phaseTemplates.stalemateResult });
        fighter1.summary = "The battle reached an impasse, with neither fighter able to secure victory.";
        fighter2.summary = "The battle reached an impasse, with neither fighter able to secure victory.";
    } else if (finalWinnerFull && finalLoserFull) { 
        const isKOByHp = finalLoserFull.hp <= 0;
        
        const wasCurbstompKOAlreadyNarrated = battleEventLog.some(
            e => e.type === 'curbstomp_event' && 
                 !e.isEscape && 
                 e.text?.toLowerCase().includes(finalLoserFull.name.toLowerCase()) && 
                 (e.text?.toLowerCase().includes("fatal") || e.text?.toLowerCase().includes("defeats") || e.text?.toLowerCase().includes("overwhelms")) 
        );

        const isTimeoutVictoryLoopFinished = turn >= 6; 

        if (isKOByHp && !wasCurbstompKOAlreadyNarrated && !battleEventLog.some(e => e.isKOAction && e.text?.includes(finalLoserFull.name))) {
            const finalBlowTextRaw = `${finalWinnerFull.name} lands the finishing blow, defeating ${finalLoserFull.name}!`;
            const finalBlowTextHtml = phaseTemplates.finalBlow
                .replace(/{winnerName}/g, `<span class="char-${finalWinnerFull.id}">${finalWinnerFull.name}</span>`)
                .replace(/{loserName}/g, `<span class="char-${finalLoserFull.id}">${finalLoserFull.name}</span>`);
            battleEventLog.push({ type: 'final_blow_event', text: finalBlowTextRaw, html_content: finalBlowTextHtml, isKOAction: true });
        } else if (isTimeoutVictoryLoopFinished && finalWinnerFull.hp > finalLoserFull.hp && !isKOByHp && !wasCurbstompKOAlreadyNarrated) {
             const timeoutTextRaw = `The battle timer expires! With more health remaining, ${finalWinnerFull.name} is declared the victor over ${finalLoserFull.name}!`;
            const timeoutTextHtml = phaseTemplates.timeOutVictory
                .replace(/{winnerName}/g, `<span class="char-${finalWinnerFull.id}">${finalWinnerFull.name}</span>`)
                .replace(/{loserName}/g, `<span class="char-${finalLoserFull.id}">${finalLoserFull.name}</span>`);
            battleEventLog.push({ type: 'timeout_victory_event', text: timeoutTextRaw, html_content: timeoutTextHtml });
        }
        
        const winnerSummaryContext = { WinnerName: finalWinnerFull.name, LoserName: finalLoserFull.name };
        const loserSummaryContext = { WinnerName: finalWinnerFull.name, LoserName: finalLoserFull.name }; 

        fighter1.summary = finalWinnerFull.id === fighter1.id 
            ? substituteTokens(fighter1.summary || "{WinnerName}'s victory was sealed by their superior strategy and power.", finalWinnerFull, finalLoserFull, winnerSummaryContext)
            : substituteTokens(fighter1.summary || "{LoserName} fought bravely but was ultimately overcome.", finalLoserFull, finalWinnerFull, loserSummaryContext);
        
        fighter2.summary = finalWinnerFull.id === fighter2.id 
            ? substituteTokens(fighter2.summary || "{WinnerName}'s victory was sealed by their superior strategy and power.", finalWinnerFull, finalLoserFull, winnerSummaryContext)
            : substituteTokens(fighter2.summary || "{LoserName} fought bravely but was ultimately overcome.", finalLoserFull, finalWinnerFull, loserSummaryContext);

    } else if (fighter1.hp === fighter2.hp && turn >= 6) { 
        isStalemate = true; 
        winnerId = null; 
        loserId = null;  
        battleEventLog.push({ type: 'draw_result_event', text: "The battle is a DRAW!", html_content: phaseTemplates.drawResult });
        fighter1.summary = "The battle ended in a perfect draw, neither giving an inch.";
        fighter2.summary = "The battle ended in a perfect draw, neither giving an inch.";
    }


    if (!isStalemate && finalWinnerFull) {
        const finalWords = getFinalVictoryLine(finalWinnerFull, finalLoserFull); 
        const conclusionContext = { WinnerName: finalWinnerFull.name, LoserName: finalLoserFull?.name || "their opponent" };
        const conclusionTextRaw = substituteTokens(`${finalWinnerFull.name} stands victorious. "${finalWords}"`, finalWinnerFull, finalLoserFull, conclusionContext);
        const conclusionTextHtml = phaseTemplates.conclusion.replace('{endingNarration}', conclusionTextRaw);
        battleEventLog.push({ type: 'conclusion_event', text: conclusionTextRaw, html_content: conclusionTextHtml });
    } else if(isStalemate) { 
        const conclusionTextRaw = "The battle concludes. Neither could claim outright victory.";
        battleEventLog.push({ type: 'conclusion_event', text: conclusionTextRaw, html_content: phaseTemplates.conclusion.replace('{endingNarration}', conclusionTextRaw) });
    }

    fighter1.interactionLog = [...interactionLog]; 
    fighter2.interactionLog = [...interactionLog];

    fighter1.phaseLog = [...phaseState.phaseLog];
    fighter2.phaseLog = [...phaseState.phaseLog];
    
    const finalFighter1State = fighter1.id === f1Id ? fighter1 : fighter2;
    const finalFighter2State = fighter2.id === f2Id ? fighter2 : fighter1;
    
    return { 
        log: battleEventLog, 
        winnerId: winnerId, 
        loserId: loserId, 
        isDraw: isStalemate, 
        finalState: { fighter1: finalFighter1State, fighter2: finalFighter2State }, 
        environmentState 
    };
}
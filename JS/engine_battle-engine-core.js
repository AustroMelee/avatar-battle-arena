// FILE: engine_battle-engine-core.js
'use strict';

// Version 1.4: decisiveSummaryPatch v1.1 - Corrected summary binding for curbstomp/reactive endings

import { characters } from './data_characters.js';
import { locationConditions } from './location-battle-conditions.js';
// --- UPDATED IMPORTS ---
import { phaseTemplates, battlePhases as phaseDefinitions } from './data_narrative_phases. // Corrected import path
// --- END UPDATED IMPORTS ---
import { selectMove, updateAiMemory, attemptManipulation, adaptPersonality } from './engine_ai-decision.js';
import { calculateMove } from './engine_move-resolution.js';
import { updateMentalState } from './engine_mental-state.js';
import { generateTurnNarrationObjects, getFinalVictoryLine, findNarrativeQuote, generateCurbstompNarration, substituteTokens, generateEscalationNarrative, generateActionDescriptionObject } from './engine_narrative-engine.js';
import { modifyMomentum } from './engine_momentum.js';
import { initializeBattlePhaseState, checkAndTransitionPhase, BATTLE_PHASES } from './engine_battle-phase.js';
// --- UPDATED IMPORTS for Mechanics ---
import { universalMechanics } from './data_mechanics_universal.js'; // From new file
import { locationCurbstompRules } from './data_mechanics_locations.js'; // From new file
import { characterCurbstompRules } from './data_mechanics_characters.js'; // From new file
// --- END UPDATED IMPORTS for Mechanics ---
import { calculateIncapacitationScore, determineEscalationState, ESCALATION_STATES } from './engine_escalation.js';
import { checkReactiveDefense } from './engine_reactive-defense.js';

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
export const getRandomElement = (arr) => arr && arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

let charactersMarkedForDefeat = new Set();

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
        stunDuration: 0,
        tacticalState: null, moveHistory: [], moveFailureHistory: [],
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
        incapacitationScore: 0,
        escalationState: characterData.escalationState || ESCALATION_STATES.NORMAL,
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

function checkCurbstompConditions(attacker, defender, locationId, battleState, battleEventLog, isPreBattleCheck = false) {
    const rulesToCheck = [];
    let aDefeatWasMarkedByThisCheck = false;
    let curbstompNarrativeGeneratedThisRule = false;

    Object.values(universalMechanics).forEach(rule => {
        if (isPreBattleCheck && !rule.canTriggerPreBattle) return;
        if (rule.characterId === attacker.id) rulesToCheck.push({ ...rule, source: 'universal', forAttacker: true, actualAttacker: attacker, actualTarget: defender });
        if (rule.characterId === defender.id) rulesToCheck.push({ ...rule, source: 'universal', forAttacker: false, actualAttacker: attacker, actualTarget: defender });
    });

    if (locationCurbstompRules[locationId]) {
        locationCurbstompRules[locationId].forEach(rule => {
            if (isPreBattleCheck && !rule.canTriggerPreBattle) return;
            let applies = false;
            let ruleActualAttacker = attacker;
            let ruleActualTarget = defender;

            if (rule.appliesToPair && rule.appliesToPair.length === 2 && rule.appliesToPair[0] === attacker.id && rule.appliesToPair[1] === defender.id) { applies = true; }
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
        characterCurbstompRules[attacker.id].forEach(rule => {
            if (isPreBattleCheck && !rule.canTriggerPreBattle) return;
            rulesToCheck.push({ ...rule, source: 'character', forAttacker: true, actualAttacker: attacker, actualTarget: defender });
        });
    }
    if (characterCurbstompRules[defender.id]) {
        characterCurbstompRules[defender.id].forEach(rule => {
            if (isPreBattleCheck && !rule.canTriggerPreBattle) return;
            if (rule.outcome.type.includes("loss_character") || rule.outcome.type.includes("self_sabotage") || rule.outcome.type.includes("disadvantage") || rule.outcome.type.includes("loss_weighted_character") || rule.outcome.type.includes("instant_death_character")) {
                 rulesToCheck.push({ ...rule, source: 'character', forAttacker: false, actualAttacker: attacker, actualTarget: defender });
            }
        });
    }

    for (const rule of rulesToCheck) {
        curbstompNarrativeGeneratedThisRule = false;
        const characterForRuleApplication = rule.forAttacker ? rule.actualAttacker : rule.actualTarget;
        const opponentForRuleApplication = characterForRuleApplication.id === rule.actualAttacker.id ? rule.actualTarget : rule.actualAttacker;

        const appliedRuleKey = `${rule.id}_${characterForRuleApplication.id}`;
        if (characterForRuleApplication.curbstompRulesAppliedThisBattle.has(appliedRuleKey) ||
            characterForRuleApplication.curbstompRulesAppliedThisBattle.has(appliedRuleKey + "_escaped") ||
            characterForRuleApplication.curbstompRulesAppliedThisBattle.has(appliedRuleKey + "_reacted_override")) {
            continue;
        }

        let ruleTriggered = false;
        let effectiveChance = rule.triggerChance;

        if (rule.personalityTrigger) {
            if (!evaluatePersonalityTrigger(rule.personalityTrigger, characterForRuleApplication, opponentForRuleApplication, battleState)) {
                continue;
            }
        }

        if (rule.conditionLogic) {
            const locationTags = battleState.location && battleState.location.tags ? battleState.location.tags : [];
            if (!rule.conditionLogic(characterForRuleApplication, opponentForRuleApplication, { ...battleState, locationTags })) continue;
        }


        if (rule.source === 'universal' && rule.conditions) {
            let universalMet = false;
            rule.conditions.forEach(cond => {
                if (cond.type === "target_technique_speed" && opponentForRuleApplication.lastMove?.speed === cond.value) {
                    effectiveChance = cond.triggerChance; universalMet = true;
                }
                if (cond.type === "location_property" && (battleState.location?.tags || []).includes(cond.property)) {
                    effectiveChance = Math.min(rule.maxChance || 1, (effectiveChance || rule.triggerChance) + (cond.modifier || 0));
                    universalMet = true;
                }
            });
            if (!universalMet && rule.conditions.length > 0) continue;
        }

        if (Math.random() < effectiveChance) ruleTriggered = true;

        if (ruleTriggered) {
            // This `move` object is a conceptual representation of the curbstomp attack for the reactive defense check.
            let curbstompMoveConcept = {
                name: rule.activatingMoveName || `Curbstomp (${rule.id})`,
                moveTags: rule.activatingMoveTags || [],
                element: rule.activatingMoveElement || 'special', // Default to special if not specified
                power: rule.activatingMovePower || 100 // Assume high power
            };

            // The 'target' of the curbstomp rule is rule.actualTarget
            // The 'attacker' of the curbstomp rule is rule.actualAttacker
            const isPotentiallyFatalToTargetOfTheRule =
                rule.outcome.type.includes("kill_target") ||
                rule.outcome.type.includes("death_target") ||
                rule.outcome.type.includes("win_attacker") || // Attacker wins means target loses
                (rule.outcome.type.includes("loss_character") && rule.appliesToCharacter === rule.actualTarget.id) ||
                (rule.outcome.type.includes("loss_weighted_character")); // Weighted could fall on target


            if (isPotentiallyFatalToTargetOfTheRule) {
                console.log(`[CURBSTOMP REACTION CHECK]: Rule ${rule.id} (Attacker: ${rule.actualAttacker.name}, Target: ${rule.actualTarget.name}). Checking reactive defense for ${rule.actualTarget.name}.`);
                // battleState.currentTurn is already set in the main loop
                // battleState.currentPhase is also set
                const reactiveCurbstompResult = checkReactiveDefense(rule.actualAttacker, rule.actualTarget, curbstompMoveConcept, battleState, battleEventLog);

                if (reactiveCurbstompResult.reacted) {
                    console.log(`[CURBSTOMP REACTION RESULT]: Defender ${rule.actualTarget.name} reacted. Type: ${reactiveCurbstompResult.type}, Success: ${reactiveCurbstompResult.success}`);
                    rule.actualAttacker.aiLog.push(`[Curbstomp Reaction by ${rule.actualTarget.name}]: Type ${reactiveCurbstompResult.type}, Success: ${reactiveCurbstompResult.success}`);
                    rule.actualTarget.aiLog.push(`[Curbstomp Reaction Self]: My ${reactiveCurbstompResult.type} was ${reactiveCurbstompResult.success ? 'SUCCESSFUL' : 'UNSUCCESSFUL'}.`);

                    if (reactiveCurbstompResult.narrativeEvents && reactiveCurbstompResult.narrativeEvents.length > 0) {
                        reactiveCurbstompResult.narrativeEvents.forEach(rawEventData => {
                            if (rawEventData.quote && rawEventData.actor) {
                                const opponentForNarration = rawEventData.actor.id === rule.actualAttacker.id ? rule.actualTarget : rule.actualAttacker;
                                const formattedEventArray = generateTurnNarrationObjects([rawEventData], null, rawEventData.actor, opponentForNarration, null, battleState.environmentState, battleState.location, battleState.currentPhase, true);
                                battleEventLog.push(...formattedEventArray);
                            }
                        });
                        curbstompNarrativeGeneratedThisRule = true;
                    }

                    if (reactiveCurbstompResult.success) {
                        if (reactiveCurbstompResult.stunAppliedToAttacker) {
                            rule.actualAttacker.stunDuration = (rule.actualAttacker.stunDuration || 0) + reactiveCurbstompResult.stunAppliedToAttacker;
                             battleEventLog.push({
                                type: 'stun_event', actorId: rule.actualAttacker.id, characterName: rule.actualAttacker.name,
                                text: `${rule.actualAttacker.name} is stunned by the redirected force! (Stun: ${reactiveCurbstompResult.stunAppliedToAttacker} turn(s))`,
                                html_content: `<p class="narrative-action char-${rule.actualAttacker.id}">${rule.actualAttacker.name} is stunned by the redirected force! (Stun: ${reactiveCurbstompResult.stunAppliedToAttacker} turn(s))</p>`
                            });
                        }
                        if (reactiveCurbstompResult.momentumChangeAttacker) modifyMomentum(rule.actualAttacker, reactiveCurbstompResult.momentumChangeAttacker, `Reactive defense by ${rule.actualTarget.name}`);
                        if (reactiveCurbstompResult.momentumChangeDefender) modifyMomentum(rule.actualTarget, reactiveCurbstompResult.momentumChangeDefender, `Successful reactive defense`);

                        characterForRuleApplication.curbstompRulesAppliedThisBattle.add(appliedRuleKey + "_reacted_override");
                        // If the curbstomp was on the 'attacker' of the rule, and their reaction KOd the 'target' of the rule
                        if (rule.actualAttacker.hp <= 0 && !charactersMarkedForDefeat.has(rule.actualAttacker.id) && rule.appliesToCharacter === rule.actualAttacker.id) {
                           charactersMarkedForDefeat.add(rule.actualAttacker.id);
                           aDefeatWasMarkedByThisCheck = true;
                           return true; // Reaction caused KO, end check
                        }
                        continue; // Skip original curbstomp outcome because reaction was successful
                    } else { // Reaction failed
                        if (reactiveCurbstompResult.damageMitigation < 1.0) { // Defender takes partial damage
                             const lightningDamageToDefender = Math.round(curbstompMoveConcept.power * (1.0 - reactiveCurbstompResult.damageMitigation));
                             rule.actualTarget.hp = clamp(rule.actualTarget.hp - lightningDamageToDefender, 0, rule.actualTarget.maxHp);
                             battleEventLog.push({
                                type: 'damage_event', actorId: rule.actualAttacker.id, targetId: rule.actualTarget.id,
                                text: `${rule.actualTarget.name} takes ${lightningDamageToDefender} damage from the partially absorbed lightning!`,
                                html_content: `<p class="narrative-damage char-${rule.actualTarget.id}">${rule.actualTarget.name} takes ${lightningDamageToDefender} damage from the partially absorbed lightning!</p>`
                             });
                             if (rule.actualTarget.hp <= 0) {
                                if (!charactersMarkedForDefeat.has(rule.actualTarget.id)) {
                                    charactersMarkedForDefeat.add(rule.actualTarget.id);
                                    aDefeatWasMarkedByThisCheck = true;
                                    // If this KO's them, the original curbstomp still "triggered" leading to this point.
                                }
                             }
                        }
                        // If the reaction failed and the target is KO'd, the original curbstomp might still apply or be redundant.
                        if (aDefeatWasMarkedByThisCheck) return true; // Exit if KO'd by failed reaction
                    }
                }
            }


            let isEscape = false;
            const characterPotentiallyEscaping = rule.outcome.type.includes("target") || (rule.appliesToCharacter === opponentForRuleApplication.id && !rule.outcome.type.includes("loss_character") && !rule.outcome.type.includes("death_character")) ? opponentForRuleApplication : characterForRuleApplication;


            if (rule.escapeCondition && rule.escapeCondition.character === characterPotentiallyEscaping.id) {
                let escapeAttemptSuccess = false;
                if (rule.escapeCondition.type === "intelligence_roll") {
                    if (characterPotentiallyEscaping.intelligence > rule.escapeCondition.threshold) {
                        if (Math.random() < rule.escapeCondition.successChance) {
                            escapeAttemptSuccess = true;
                        }
                    }
                } else {
                     if (Math.random() < rule.escapeCondition.successChance) {
                        escapeAttemptSuccess = true;
                    }
                }
                if (escapeAttemptSuccess) isEscape = true;
            }

            let actualVictimForNarrationObject = null;
            let mechanicallyDeterminedLoserId = null;

            if (rule.outcome?.type?.includes("loss_weighted_character") || rule.outcome?.type?.includes("loss_random_character") || rule.outcome?.type?.includes("loss_character_if_fall") || rule.outcome?.type?.includes("loss_random_character_if_knocked_off")) {
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
                    if (!isEscape) continue;
                }
            } else if (rule.outcome?.type === "instant_death_character" && rule.appliesToCharacter) {
                mechanicallyDeterminedLoserId = rule.appliesToCharacter;
                actualVictimForNarrationObject = (mechanicallyDeterminedLoserId === rule.actualAttacker.id) ? rule.actualAttacker : rule.actualTarget;
            } else if (rule.outcome?.type?.includes("target")) { // For rules like "instant_kill_target"
                actualVictimForNarrationObject = rule.actualTarget;
            }


            const narrationContext = {};
            if (actualVictimForNarrationObject) {
                narrationContext.actualVictimName = actualVictimForNarrationObject.name;
            } else if (rule.outcome?.type?.includes("target")) {
                narrationContext.actualVictimName = rule.actualTarget.name;
            }


            if (rule.activatingMoveName) {
                 narrationContext['{moveName}'] = rule.activatingMoveName;
            }

            if (!curbstompNarrativeGeneratedThisRule) { // Only generate if no reactive narrative took precedence
                const narrativeEvent = generateCurbstompNarration(rule, rule.actualAttacker, rule.actualTarget, isEscape, narrationContext);
                if (narrativeEvent) {
                    battleEventLog.push(narrativeEvent);
                }
            }

            characterForRuleApplication.curbstompRulesAppliedThisBattle.add(appliedRuleKey + (isEscape ? "_escaped" : ""));

            if (!isEscape) {
                const outcome = rule.outcome;

                switch (outcome.type) {
                    case "instant_kill_target":
                    case "instant_death_target":
                    case "instant_kill_target_collapse":
                    case "instant_win_attacker_vs_armor":
                    case "instant_win_attacker_control":
                    case "instant_win_attacker_overwhelm":
                    case "instant_win_attacker":
                        if (!charactersMarkedForDefeat.has(rule.actualTarget.id)) {
                            charactersMarkedForDefeat.add(rule.actualTarget.id);
                            aDefeatWasMarkedByThisCheck = true;
                        }
                        break;
                    case "instant_death_character":
                    case "instant_loss_character":
                        const charLosingId = rule.appliesToCharacter;
                        if (charLosingId && !charactersMarkedForDefeat.has(charLosingId)) {
                           charactersMarkedForDefeat.add(charLosingId);
                           aDefeatWasMarkedByThisCheck = true;
                        }
                        break;
                    case "instant_loss_weighted_character":
                    case "instant_loss_random_character":
                    case "instant_loss_character_if_fall":
                    case "instant_loss_random_character_if_knocked_off":
                        if (mechanicallyDeterminedLoserId && !charactersMarkedForDefeat.has(mechanicallyDeterminedLoserId)) {
                            charactersMarkedForDefeat.add(mechanicallyDeterminedLoserId);
                            aDefeatWasMarkedByThisCheck = true;
                        }
                        break;
                    case "conditional_instant_kill_or_self_sabotage":
                        const isSelfSabotageOutcome = Math.random() < (rule.selfSabotageChance || 0);
                        if (!isSelfSabotageOutcome) {
                            if (!charactersMarkedForDefeat.has(rule.actualTarget.id)) {
                                charactersMarkedForDefeat.add(rule.actualTarget.id);
                                aDefeatWasMarkedByThisCheck = true;
                            }
                        } else {
                            rule.actualAttacker.hp = clamp(rule.actualAttacker.hp - 15, 0, rule.actualAttacker.maxHp);
                            modifyMomentum(rule.actualAttacker, -2, `${rule.id} backfired on ${rule.actualAttacker.name}`);

                            const selfSabotageOutcomeDetails = {...rule.outcome, successMessage: rule.outcome.selfSabotageMessage || `${rule.actualAttacker.name}'s move backfires!`};
                            const selfSabotageNarrationContext = {
                                isSelfSabotageOutcome: true,
                                actualVictimName: rule.actualAttacker.name,
                                '{moveName}': rule.activatingMoveName || "their own action"
                            };
                            if (!curbstompNarrativeGeneratedThisRule) {
                                const selfSabotageEvent = generateCurbstompNarration(
                                    {...rule, outcome: selfSabotageOutcomeDetails },
                                    rule.actualAttacker,
                                    rule.actualTarget,
                                    false,
                                    selfSabotageNarrationContext
                                );
                                if(selfSabotageEvent) battleEventLog.push(selfSabotageEvent);
                            }

                            if (rule.actualAttacker.hp <=0 && !charactersMarkedForDefeat.has(rule.actualAttacker.id)) {
                                charactersMarkedForDefeat.add(rule.actualAttacker.id);
                                aDefeatWasMarkedByThisCheck = true;
                            }
                        }
                        break;
                    case "instant_paralysis_target":
                    case "incapacitation_target_disable_limbs":
                    case "instant_incapacitation_target_bury":
                    case "instant_incapacitation_target_burn":
                        const stunDurationApplied = outcome.duration || 1;
                        rule.actualTarget.stunDuration = (rule.actualTarget.stunDuration || 0) + stunDurationApplied;
                        rule.actualTarget.hp = clamp(Math.min(rule.actualTarget.hp, 10), 1, rule.actualTarget.maxHp);
                        if (rule.actualTarget.hp <= 0 && !charactersMarkedForDefeat.has(rule.actualTarget.id)) {
                            charactersMarkedForDefeat.add(rule.actualTarget.id);
                            aDefeatWasMarkedByThisCheck = true;
                        }
                        battleState.logSystemMessage = `${rule.actualTarget.name} is incapacitated by ${rule.actualAttacker.name}'s ${rule.id}! Stun Duration: ${rule.actualTarget.stunDuration}`;
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
    if (isStalemateFlag && !battleOver) {
        battleOver = true;
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
        currentPhase: phaseState.currentPhase,
        isDay: timeOfDay === 'day',
        isNight: timeOfDay === 'night',
        isFullMoon: conditions.isNight && Math.random() < 0.25,
        opponentLandedCriticalHit: false, opponentTaunted: false, allyTargeted: false, ally: null,
        opponentUsedLethalForce: false, opponentLandedSignificantHits: 0, opponentTauntedAgeOrStrategy: false,
        opponentTauntedBlindness: false, opponentLandedBlindHit: false, characterReceivedCriticalHit: false,
        opponentCheated: false, allyDisarmedUnfairly: false, allyDowned: false,
        characterLandedStrongOrCriticalHitLastTurn: false, allyBuffedSelf: false,
        opponentTauntedSkillOrTradition: false, opponentAttackedFirstAggressively: false,
        nearEdge: false, lastMovePushbackStrong: false, logSystemMessage: "",
        environmentState: environmentState,
        fighter1Escalation: fighter1.escalationState,
        fighter2Escalation: fighter2.escalationState
    };

    const initialBanter1 = findNarrativeQuote(fighter1, fighter2, 'battleStart', 'general', { currentPhaseKey: phaseState.currentPhase });
    if (initialBanter1) battleEventLog.push(...generateTurnNarrationObjects([{quote: initialBanter1, actor: fighter1}], null, fighter1, fighter2, null, environmentState, locationData, phaseState.currentPhase, true));

    const initialBanter2 = findNarrativeQuote(fighter2, fighter1, 'battleStart', 'general', { currentPhaseKey: phaseState.currentPhase });
    if (initialBanter2) battleEventLog.push(...generateTurnNarrationObjects([{quote: initialBanter2, actor: fighter2}], null, fighter2, fighter1, null, environmentState, locationData, phaseState.currentPhase, true));

    if (checkCurbstompConditions(initiator, responder, locId, currentBattleState, battleEventLog, true)) {
        initiator.aiLog.push(`[Pre-Battle Curbstomp Check]: ${initiator.name} OR ${responder.name} triggered or was affected by a curbstomp rule.`);
    }
    if (!charactersMarkedForDefeat.has(initiator.id) && !charactersMarkedForDefeat.has(responder.id)) {
      if (checkCurbstompConditions(responder, initiator, locId, currentBattleState, battleEventLog, true)) {
        responder.aiLog.push(`[Pre-Battle Curbstomp Check]: ${responder.name} OR ${initiator.name} triggered or was affected by a curbstomp rule.`);
      }
    }

    let terminalOutcome = evaluateTerminalState(fighter1, fighter2, isStalemate);
    battleOver = terminalOutcome.battleOver;
    winnerId = terminalOutcome.winnerId;
    loserId = terminalOutcome.loserId;
    isStalemate = terminalOutcome.isStalemate;


    for (turn = 0; turn < 6 && !battleOver; turn++) {
        currentBattleState.turn = turn;
        initiator.currentTurn = turn;
        responder.currentTurn = turn;
        currentBattleState.currentPhase = phaseState.currentPhase;

        currentBattleState.opponentLandedCriticalHit = false;
        currentBattleState.opponentTaunted = false;
        currentBattleState.opponentUsedLethalForce = false;
        currentBattleState.opponentLandedSignificantHits = 0;
        currentBattleState.characterReceivedCriticalHit = false;
        currentBattleState.characterLandedStrongOrCriticalHitLastTurn = false;


        const phaseChanged = checkAndTransitionPhase(phaseState, fighter1, fighter2, turn);
        if (phaseChanged) {
            fighter1.aiLog.push(phaseState.phaseLog[phaseState.phaseLog.length - 1]);
            fighter2.aiLog.push(phaseState.phaseLog[phaseState.phaseLog.length - 1]);
            currentBattleState.currentPhase = phaseState.currentPhase;
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

        const processTurnSegment = (currentAttacker, currentDefender) => {
            if (charactersMarkedForDefeat.has(currentAttacker.id)) {
                currentAttacker.aiLog.push(`[Action Skipped]: ${currentAttacker.name} is already marked for defeat and cannot act this segment.`);
                return;
            }

            if (battleOver || isStalemate) return;

            if (currentAttacker.stunDuration > 0) {
                currentAttacker.stunDuration--;
                currentAttacker.aiLog.push(`[Action Skipped]: ${currentAttacker.name} is stunned. Turns remaining: ${currentAttacker.stunDuration}.`);
                turnSpecificEventsForLog.push({
                    type: 'stun_event', actorId: currentAttacker.id, characterName: currentAttacker.name,
                    text: `${currentAttacker.name} is stunned and unable to move! (Stun remaining: ${currentAttacker.stunDuration} turn(s))`,
                    html_content: `<p class="narrative-action char-${currentAttacker.id}">${currentAttacker.name} is stunned and unable to move! (Stun remaining: ${currentAttacker.stunDuration} turn(s))</p>`
                });
                currentBattleState.attackerIsStunned = true;
                return;
            }
            currentBattleState.attackerIsStunned = false;


            currentBattleState.opponentLandedCriticalHit = currentDefender.lastMoveForPersonalityCheck?.effectiveness === 'Critical';
            currentBattleState.opponentUsedLethalForce = currentDefender.lastMoveForPersonalityCheck?.isHighRisk || false;
            currentBattleState.characterReceivedCriticalHit = false;
            currentBattleState.opponentElement = currentDefender.element;
            currentBattleState.fighter1Escalation = fighter1.escalationState;
            currentBattleState.fighter2Escalation = fighter2.escalationState;


            if (checkCurbstompConditions(currentAttacker, currentDefender, locId, currentBattleState, battleEventLog, false)) {
                currentAttacker.aiLog.push(`[Curbstomp Check]: ${currentAttacker.name} OR ${currentDefender.name} triggered or was affected by a curbstomp rule during turn segment.`);
                terminalOutcome = evaluateTerminalState(fighter1, fighter2, isStalemate);
                if (terminalOutcome.battleOver) { battleOver = true; winnerId = terminalOutcome.winnerId; loserId = terminalOutcome.loserId; isStalemate = terminalOutcome.isStalemate; return; }
            }
             if (charactersMarkedForDefeat.has(currentDefender.id) || charactersMarkedForDefeat.has(currentAttacker.id)) {
                terminalOutcome = evaluateTerminalState(fighter1, fighter2, isStalemate);
                 if (terminalOutcome.battleOver) { battleOver = true; winnerId = terminalOutcome.winnerId; loserId = terminalOutcome.loserId; isStalemate = terminalOutcome.isStalemate; return; }
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

            const addNarrativeEvent = (quote, actorForQuote) => {
                if (quote && !battleContextFiredQuotes.has(`${actorForQuote.id}-${quote.line}`)) {
                    narrativeEventsForAction.push({ quote, actor: actorForQuote });
                    battleContextFiredQuotes.add(`${actorForQuote.id}-${quote.line}`);
                }
            };

            let manipulationResult = attemptManipulation(currentAttacker, currentDefender);
            if (manipulationResult.success) {
                currentDefender.tacticalState = { name: manipulationResult.effect, duration: 1, intensity: 1.2, isPositive: false };
                addNarrativeEvent(findNarrativeQuote(currentAttacker, currentDefender, 'onManipulation', 'asAttacker', { currentPhaseKey: phaseState.currentPhase }), currentAttacker);
                if (manipulationResult.narration) {
                     turnSpecificEventsForLog.push({
                        type: 'manipulation_narration_event', actorId: currentAttacker.id,
                        text: manipulationResult.narration.replace(/<[^>]+>/g, ''),
                        html_content: manipulationResult.narration, isDialogue: false,
                     });
                }
                currentBattleState.opponentTaunted = true;
            }

            const { move, aiLogEntryFromSelectMove } = selectMove(currentAttacker, currentDefender, conditions, currentBattleState.turn, phaseState.currentPhase);
            addNarrativeEvent(findNarrativeQuote(currentAttacker, currentDefender, 'onIntentSelection', aiLogEntryFromSelectMove?.intent || 'StandardExchange', { currentPhaseKey: phaseState.currentPhase, aiLogEntry: aiLogEntryFromSelectMove, move: move }), currentAttacker);

            const result = calculateMove(move, currentAttacker, currentDefender, conditions, interactionLog, environmentState, locId);
            
            if (result.isReactedAction && result.narrativeEventsToPrepend) {
                result.narrativeEventsToPrepend.forEach(rawEventData => {
                     if (rawEventData.quote && rawEventData.actor) {
                        const opponentForReactionNarrative = rawEventData.actor.id === currentDefender.id ? currentAttacker : currentDefender;
                        const formattedEventArray = generateTurnNarrationObjects([rawEventData], null, rawEventData.actor, opponentForReactionNarrative, null, environmentState, locationData, phaseState.currentPhase, true);
                        turnSpecificEventsForLog.push(...formattedEventArray);
                    }
                });
            }

            if (result.isReactedAction) {
                 const reactionMoveLine = generateActionDescriptionObject( // THIS IS THE LINE THAT WAS CAUSING THE ERROR
                    { name: result.reactionType || "Reactive Defense", verb: "reacts", object: "to the attack", element: move.element }, // Pass element for emoji
                    currentDefender, 
                    currentAttacker, 
                    result, 
                    phaseState.currentPhase,
                    {} 
                );
                 turnSpecificEventsForLog.push(reactionMoveLine);
            } else {
                result.isKOAction = (currentDefender.hp - result.damage <= 0);
                turnSpecificEventsForLog.push(...generateTurnNarrationObjects(narrativeEventsForAction, move, currentAttacker, currentDefender, result, environmentState, locationData, phaseState.currentPhase, false, aiLogEntryFromSelectMove));
            }
            
            currentDefender.hp = clamp(currentDefender.hp - result.damage, 0, 100);


            currentAttacker.lastMoveForPersonalityCheck = { isHighRisk: move.isHighRisk || false, effectiveness: result.effectiveness.label, power: move.power || 0 };
            if (result.effectiveness.label === 'Critical') {
                currentBattleState.characterReceivedCriticalHit = true;
                currentDefender.criticalHitsTaken +=1;
            }
            if (result.effectiveness.label === 'Strong' || result.effectiveness.label === 'Critical') {
                currentBattleState.characterLandedStrongOrCriticalHitLastTurn = true;
            }

            if (!result.isReactedAction) {
                modifyMomentum(currentAttacker, result.momentumChange.attacker, `Move (${result.effectiveness.label}) by ${currentAttacker.name}`);
                modifyMomentum(currentDefender, result.momentumChange.defender, `Opponent Move (${result.effectiveness.label}) by ${currentAttacker.name}`);
            }


            if (result.collateralDamage > 0 && environmentState.damageLevel < 100 && !result.isReactedAction) {
                environmentState.damageLevel = clamp(environmentState.damageLevel + result.collateralDamage, 0, 100);
                environmentState.lastDamageSourceId = currentAttacker.id;
                const collateralContext = { currentPhaseKey: phaseState.currentPhase };
                if (currentAttacker.collateralTolerance < 0.3) addNarrativeEvent(findNarrativeQuote(currentAttacker, currentDefender, 'onCollateral', 'stressedByDamage', collateralContext), currentAttacker);
                else if (currentAttacker.collateralTolerance > 0.7) addNarrativeEvent(findNarrativeQuote(currentAttacker, currentDefender, 'onCollateral', 'thrivingInDamage', collateralContext), currentAttacker);
                else addNarrativeEvent(findNarrativeQuote(currentAttacker, currentDefender, 'onCollateral', 'causingDamage', collateralContext), currentAttacker);

                if (currentDefender.collateralTolerance < 0.3) addNarrativeEvent(findNarrativeQuote(currentDefender, currentAttacker, 'onCollateral', 'stressedByDamage', collateralContext), currentDefender);
                else if (currentDefender.collateralTolerance > 0.7) addNarrativeEvent(findNarrativeQuote(currentDefender, currentAttacker, 'onCollateral', 'thrivingInDamage', collateralContext), currentDefender);
                else addNarrativeEvent(findNarrativeQuote(currentDefender, currentAttacker, 'onCollateral', 'observingDamage', collateralContext), currentDefender);
            }

            updateMentalState(currentDefender, currentAttacker, result, environmentState);
            updateMentalState(currentAttacker, currentDefender, null, environmentState);

            if (currentDefender.mentalState.level !== oldDefenderMentalState) {
                addNarrativeEvent(findNarrativeQuote(currentDefender, currentAttacker, 'onStateChange', currentDefender.mentalState.level, { currentPhaseKey: phaseState.currentPhase }), currentDefender);
            }
            if (currentAttacker.mentalState.level !== oldAttackerMentalState && currentAttacker.mentalStateChangedThisTurn) {
                addNarrativeEvent(findNarrativeQuote(currentAttacker, currentDefender, 'onStateChange', currentAttacker.mentalState.level, { currentPhaseKey: phaseState.currentPhase }), currentAttacker);
            }

            currentAttacker.lastMoveEffectiveness = result.effectiveness.label;
            currentAttacker.consecutiveDefensiveTurns = (move.type === 'Utility' || move.type === 'Defense') ? currentAttacker.consecutiveDefensiveTurns + 1 : 0;

            if (move.setup && result.effectiveness.label !== 'Weak' && !move.isRepositionMove && !result.isReactedAction) {
                currentDefender.tacticalState = { ...move.setup, isPositive: false };
                currentAttacker.aiLog.push(`[Tactical State Apply]: ${currentDefender.name} is now ${currentDefender.tacticalState.name}!`);
                if (move.setup.name === 'Pinned' && currentDefender.stunDuration > 0) {
                    currentDefender.stunDuration++;
                    currentAttacker.aiLog.push(`[Stun Extended]: ${currentDefender.name}'s stun extended by Pinned. Duration: ${currentDefender.stunDuration}`);
                }
            }
             if (move.isRepositionMove && currentAttacker.tacticalState && !result.isReactedAction) {
                const stateType = currentAttacker.tacticalState.isPositive ? '(Self-Buff)' : '(Self-Debuff)';
                currentAttacker.aiLog.push(`[Tactical State Apply]: ${currentAttacker.name} is now ${currentAttacker.tacticalState.name}! ${stateType}`);
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
        currentBattleState.environmentState = environmentState;

        currentBattleState.characterLandedStrongOrCriticalHitLastTurn = initiator.lastMoveForPersonalityCheck?.effectiveness === 'Strong' || initiator.lastMoveForPersonalityCheck?.effectiveness === 'Critical';
        processTurnSegment(initiator, responder);

        if (battleOver) {
             battleEventLog.push(...turnSpecificEventsForLog);
             break;
        }

        currentBattleState.characterLandedStrongOrCriticalHitLastTurn = responder.lastMoveForPersonalityCheck?.effectiveness === 'Strong' || responder.lastMoveForPersonalityCheck?.effectiveness === 'Critical';
        processTurnSegment(responder, initiator);


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

        if (!battleOver) {
            const score1 = calculateIncapacitationScore(fighter1, fighter2);
            const score2 = calculateIncapacitationScore(fighter2, fighter1);
            fighter1.incapacitationScore = score1;
            fighter2.incapacitationScore = score2;

            const oldEscalationState1 = fighter1.escalationState;
            const oldEscalationState2 = fighter2.escalationState;
            const newEscalationState1 = determineEscalationState(score1);
            const newEscalationState2 = determineEscalationState(score2);

            if ((newEscalationState1 === ESCALATION_STATES.SEVERELY_INCAPACITATED || newEscalationState1 === ESCALATION_STATES.TERMINAL_COLLAPSE) &&
                (newEscalationState2 === ESCALATION_STATES.SEVERELY_INCAPACITATED || newEscalationState2 === ESCALATION_STATES.TERMINAL_COLLAPSE)) {
                fighter1.escalationState = ESCALATION_STATES.NORMAL;
                fighter2.escalationState = ESCALATION_STATES.NORMAL;
                const revertLogMsg = `[Escalation Reverted]: Both fighters critically incapacitated. Battle intensity reset to Normal. F1 Score: ${score1.toFixed(1)}, F2 Score: ${score2.toFixed(1)}`;
                fighter1.aiLog.push(revertLogMsg);
                fighter2.aiLog.push(revertLogMsg);
                const specificRevertEvent = generateEscalationNarrative(fighter1, oldEscalationState1, ESCALATION_STATES.NORMAL);
                if (specificRevertEvent) {
                     turnSpecificEventsForLog.push(specificRevertEvent);
                } else {
                     turnSpecificEventsForLog.push({ type: 'escalation_change_event', text: "The overwhelming pressure on both fighters momentarily resets, the air still thick with tension, but the immediate crisis point defers!", html_content: `<p class="narrative-escalation highlight-neutral">The overwhelming pressure on both fighters momentarily resets, the air still thick with tension, but the immediate crisis point defers!</p>`, isEscalationEvent: true });
                }

            } else {
                if (oldEscalationState1 !== newEscalationState1) {
                    fighter1.escalationState = newEscalationState1;
                    fighter1.aiLog.push(`[Escalation State Change]: ${fighter1.name} is now ${newEscalationState1}. Score: ${score1.toFixed(1)}`);
                    const narrativeEvent1 = generateEscalationNarrative(fighter1, oldEscalationState1, newEscalationState1);
                    if (narrativeEvent1) turnSpecificEventsForLog.push(narrativeEvent1);
                }
                if (oldEscalationState2 !== newEscalationState2) {
                    fighter2.escalationState = newEscalationState2;
                    fighter2.aiLog.push(`[Escalation State Change]: ${fighter2.name} is now ${newEscalationState2}. Score: ${score2.toFixed(1)}`);
                    const narrativeEvent2 = generateEscalationNarrative(fighter2, oldEscalationState2, newEscalationState2);
                    if (narrativeEvent2) turnSpecificEventsForLog.push(narrativeEvent2);
                }
            }
            currentBattleState.fighter1Escalation = fighter1.escalationState;
            currentBattleState.fighter2Escalation = fighter2.escalationState;
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

    terminalOutcome = evaluateTerminalState(fighter1, fighter2, isStalemate);
    battleOver = terminalOutcome.battleOver;
    winnerId = terminalOutcome.winnerId;
    loserId = terminalOutcome.loserId;
    isStalemate = terminalOutcome.isStalemate;

    if (!battleOver && turn >= 6) {
        isStalemate = (fighter1.hp === fighter2.hp);
        if (!isStalemate) {
            winnerId = (fighter1.hp > fighter2.hp) ? fighter1.id : fighter2.id;
            loserId = (winnerId === fighter1.id) ? fighter2.id : fighter1.id;
        }
        battleOver = true;
    }


    const finalWinnerFull = winnerId ? (fighter1.id === winnerId ? fighter1 : fighter2) : null;
    const finalLoserFull = loserId ? (fighter1.id === loserId ? fighter1 : fighter2) : null;

    // Determine the dominant narrative for the summary
    let decisiveEventNarrative = null;
    let decisiveEventActorId = null; // Store the ID of the actor who performed the decisive event

    // Check for curbstomps first
    const lastCurbstompEvent = battleEventLog.slice().reverse().find(e => e.type === 'curbstomp_event' && !e.isEscape && e.isMajorEvent);
    if (lastCurbstompEvent && finalLoserFull && charactersMarkedForDefeat.has(finalLoserFull.id)) {
        // Identify who performed the curbstomp (attacker of the rule)
        // This requires knowing which curbstomp rule it was and who its 'actualAttacker' was.
        // For simplicity here, we assume the narrative text contains the winner's name.
        // Let's find the rule based on curbstompRuleId in the event
        let curbstompRuleActor = null;
        if (lastCurbstompEvent.curbstompRuleId) {
            // Search universalMechanics
            let ruleDef = Object.values(universalMechanics).find(r => r.id === lastCurbstompEvent.curbstompRuleId);
            if (ruleDef) { // Universal rule implies the characterId field is the actor
                curbstompRuleActor = ruleDef.characterId;
            } else { // Search location rules
                const locRules = locationCurbstompRules[locId] || [];
                ruleDef = locRules.find(r => r.id === lastCurbstompEvent.curbstompRuleId);
                if (ruleDef) { // Location rule might apply to a pair or character
                     curbstompRuleActor = ruleDef.actualAttacker?.id || (ruleDef.appliesToPair ? ruleDef.appliesToPair[0] : ruleDef.appliesToCharacter);
                } else { // Search character rules
                    for (const charID in characterCurbstompRules) {
                        ruleDef = characterCurbstompRules[charID].find(r => r.id === lastCurbstompEvent.curbstompRuleId);
                        if (ruleDef) {
                            curbstompRuleActor = charID; // The key of characterCurbstompRules is the actor
                            break;
                        }
                    }
                }
            }
        }
        if (curbstompRuleActor && curbstompRuleActor === winnerId) {
            decisiveEventNarrative = lastCurbstompEvent.text;
            decisiveEventActorId = curbstompRuleActor;
        }
    }

    // Check for reactive KOs if no curbstomp KO was the decisive narrative
    if (!decisiveEventNarrative) {
        const lastReactiveKOEvent = battleEventLog.slice().reverse().find(e =>
            e.type === 'move_action_event' &&
            e.isReactedAction &&
            e.reactionSuccess &&
            finalWinnerFull && e.actorId === finalWinnerFull.id && // The winner performed the reaction
            finalLoserFull && finalLoserFull.hp <= 0 // The loser was KO'd
        );
        if (lastReactiveKOEvent && finalWinnerFull.id === lastReactiveKOEvent.actorId) {
            const reactionNarratives = battleEventLog.filter(
                e => e.type === 'dialogue_event' &&
                     e.actorId === finalWinnerFull.id && // Winner (Zuko) is the actor of the dialogue
                     e.html_content.includes(finalLoserFull.name) && // Dialogue mentions loser (Azula/Ozai)
                     (e.html_content.toLowerCase().includes("redirect") || e.html_content.toLowerCase().includes("unleashes the redirected energy"))
            );
            if (reactionNarratives.length > 0) {
                decisiveEventNarrative = reactionNarratives.map(rn => rn.text).join(" ");
            } else { // Fallback if specific narrative lines aren't found (shouldn't happen ideally)
                decisiveEventNarrative = `${finalWinnerFull.name} turned ${finalLoserFull.name}'s own power against them for the win!`;
            }
            decisiveEventActorId = finalWinnerFull.id;
        }
    }


    if (isStalemate) {
        battleEventLog.push({ type: 'stalemate_result_event', text: "The battle ends in a STALEMATE!", html_content: phaseTemplates.stalemateResult });
        fighter1.summary = "The battle reached an impasse, with neither fighter able to secure victory.";
        fighter2.summary = "The battle reached an impasse, with neither fighter able to secure victory.";
    } else if (finalWinnerFull && finalLoserFull) {
        // Use decisiveEventNarrative if the winner is the one who performed that event
        if (decisiveEventNarrative && decisiveEventActorId === finalWinnerFull.id) {
            finalWinnerFull.summary = decisiveEventNarrative;
            finalLoserFull.summary = `${finalLoserFull.name} was overcome by ${finalWinnerFull.name}'s decisive action.`;
             // If the decisive narrative *already is* the curbstomp text, don't add the generic curbstomp "win" line again.
            // The generateCurbstompNarration already provides good success messages.
        } else {
            const isKOByHp = finalLoserFull.hp <= 0;
            const isTimeoutVictoryLoopFinished = turn >= 6;

            // Check if the battle ended due to a standard KO, and if it wasn't already covered by a curbstomp narrative for the winner
            const standardKOFlow = isKOByHp && (!lastCurbstompEvent || lastCurbstompEvent.actorId !== finalWinnerFull.id);

            if (standardKOFlow && !battleEventLog.some(e => e.isKOAction && e.html_content?.includes(finalLoserFull.name) && e.actorId === finalWinnerFull.id)) {
                const finalBlowTextRaw = `${finalWinnerFull.name} lands the finishing blow, defeating ${finalLoserFull.name}!`;
                const finalBlowTextHtml = phaseTemplates.finalBlow
                    .replace(/{winnerName}/g, `<span class="char-${finalWinnerFull.id}">${finalWinnerFull.name}</span>`)
                    .replace(/{loserName}/g, `<span class="char-${finalLoserFull.id}">${finalLoserFull.name}</span>`);
                battleEventLog.push({ type: 'final_blow_event', text: finalBlowTextRaw, html_content: finalBlowTextHtml, isKOAction: true });
                finalWinnerFull.summary = finalBlowTextRaw;
                finalLoserFull.summary = `${finalLoserFull.name} was defeated by a final blow from ${finalWinnerFull.name}.`;

            } else if (isTimeoutVictoryLoopFinished && finalWinnerFull.hp > finalLoserFull.hp && !isKOByHp && (!lastCurbstompEvent || lastCurbstompEvent.actorId !== finalWinnerFull.id)) {
                const timeoutTextRaw = `The battle timer expires! With more health remaining, ${finalWinnerFull.name} is declared the victor over ${finalLoserFull.name}!`;
                const timeoutTextHtml = phaseTemplates.timeOutVictory
                    .replace(/{winnerName}/g, `<span class="char-${finalWinnerFull.id}">${finalWinnerFull.name}</span>`)
                    .replace(/{loserName}/g, `<span class="char-${finalLoserFull.id}">${finalLoserFull.name}</span>`);
                battleEventLog.push({ type: 'timeout_victory_event', text: timeoutTextRaw, html_content: timeoutTextHtml });
                finalWinnerFull.summary = timeoutTextRaw;
                finalLoserFull.summary = `${finalLoserFull.name} lost by timeout as ${finalWinnerFull.name} had more health remaining.`;
            } else if (!decisiveEventNarrative) { // Generic fallback if no specific event was logged as decisive
                 finalWinnerFull.summary = substituteTokens("{WinnerName}'s victory was sealed by their superior strategy and power.", finalWinnerFull, finalLoserFull, { WinnerName: finalWinnerFull.name, LoserName: finalLoserFull.name });
                 finalLoserFull.summary = substituteTokens("{LoserName} fought bravely but was ultimately overcome.", finalLoserFull, finalWinnerFull, { WinnerName: finalWinnerFull.name, LoserName: finalLoserFull.name });
            }
        }

    } else if (fighter1.hp === fighter2.hp && turn >= 6 && !winnerId && !loserId) {
        isStalemate = true;
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
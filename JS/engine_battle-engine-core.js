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


// Corrected initializeFighterState to be more robust
function initializeFighterState(charId, opponentId, emotionalMode) {
    // DIAGNOSTIC START
    console.log(`[DEBUG] Initializing fighter state for charId: '${charId}'`);
    if (!characters) {
        console.error("[DEBUG] 'characters' object is undefined/null during initializeFighterState!");
        // Return a broken fighter immediately to prevent further errors
        return { id: charId, name: `[MISSING CHARS OBJECT - ${charId}]`, hp: 0, maxHp: 100, energy: 0, momentum: 0, stunDuration: 0, tacticalState: null, moveHistory: [], moveFailureHistory: [], consecutiveDefensiveTurns: 0, aiLog: [`ERROR: 'characters' object is null/undefined.`], relationalState: null, mentalState: { level: 'broken', stress: 100, mentalStateChangedThisTurn: false }, contextualState: {}, collateralTolerance: 0.0, mobility: 0.0, personalityProfile: {}, aiMemory: {}, curbstompRulesAppliedThisBattle: new Set(), faction: 'Error', element: 'error', specialTraits: {}, criticalHitsTaken: 0, intelligence: 0, hasMetalArmor: false, incapacitationScore: 100, escalationState: ESCALATION_STATES.TERMINAL_COLLAPSE, summary: `(ERROR: 'characters' object is null/undefined.)` };
    }
    const characterData = characters[charId];
    if (!characterData) {
        console.error(`[DEBUG] Character data for ID '${charId}' not found in 'characters' object.`);
        // Return a broken fighter immediately to prevent further errors
        return {
            id: charId,
            name: `[MISSING DATA - ${charId}]`, // Safe fallback name
            hp: 0, maxHp: 100, // Treat as defeated for safety
            energy: 0, momentum: 0, stunDuration: 0,
            tacticalState: null, moveHistory: [], moveFailureHistory: [],
            consecutiveDefensiveTurns: 0, aiLog: [`ERROR: Character data for "${charId}" not loaded/found.`],
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
            summary: `(ERROR: Character data for ${charId} missing or corrupted.)` // Add a summary for dev logs
        };
    }
    // DIAGNOSTIC END

    // Ensure characterData.name exists before using it
    const characterName = characterData.name || charId; // Fallback to ID if name is missing

    const personalityProfile = characterData.personalityProfile || {
        aggression: 0.5, patience: 0.5, riskTolerance: 0.5, opportunism: 0.5,
        creativity: 0.5, defensiveBias: 0.5, antiRepeater: 0.5, signatureMoveBias: {}
    };

    // Deep copy, but handle potential issues with JSON.parse/stringify if characterData is very complex or contains circular references (unlikely here)
    let copiedCharacterData;
    try {
        copiedCharacterData = JSON.parse(JSON.stringify(characterData));
    } catch (e) {
        console.error(`Error deep copying character data for ${charId}:`, e);
        // Fallback to shallow copy or minimal properties if deep copy fails
        copiedCharacterData = { ...characterData };
    }


    return {
        id: charId,
        name: characterName,
        ...copiedCharacterData, // Spread the copied data
        hp: 100, maxHp: 100,
        energy: 100, momentum: 0, lastMove: null, lastMoveEffectiveness: null,
        stunDuration: 0,
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
        // Make sure techniques are copied from characterData here, if they are meant to be character-wide.
        // If techniques can vary by location, they will be selected later by getAvailableMoves.
        // For now, assume a 'techniques' array is available on the base character object.
        techniques: characterData.techniques || [],
        techniquesFull: characterData.techniquesFull || [],
        techniquesCanteen: characterData.techniquesCanteen || [],
        techniquesEasternAirTemple: characterData.techniquesEasternAirTemple || [],
        techniquesNorthernWaterTribe: characterData.techniquesNorthernWaterTribe || [],
        techniquesOmashu: characterData.techniquesOmashu || [],
        techniquesSiWongDesert: characterData.techniquesSiWongDesert || [],
        techniquesBoilingRock: characterData.techniquesBoilingRock || [],
        quotes: characterData.quotes || {}, // Ensure quotes are copied
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

function checkCurbstompConditions(attacker, defender, locationId, battleState, battleEventLog, isPreBattleCheck = false) {
    const rulesToCheck = [];
    let aDefeatWasMarkedByThisCheck = false;
    let curbstompNarrativeGeneratedThisRule = false;
    const ruleCurrentPhase = battleState.currentPhase; // NEW: Get current phase for rule gating

    Object.values(universalMechanics).forEach(rule => {
        // NEW: Phase Check for universal rules
        if (rule.canTriggerInPhase && !rule.canTriggerInPhase.includes(ruleCurrentPhase)) return;
        if (isPreBattleCheck && !rule.canTriggerPreBattle) return;
        if (rule.characterId === attacker.id) rulesToCheck.push({ ...rule, source: 'universal', forAttacker: true, actualAttacker: attacker, actualTarget: defender });
        if (rule.characterId === defender.id) rulesToCheck.push({ ...rule, source: 'universal', forAttacker: false, actualAttacker: attacker, actualTarget: defender });
    });

    if (locationCurbstompRules[locationId]) {
        locationCurbstompRules[locationId].forEach(rule => {
            // NEW: Phase Check for location rules
            if (rule.canTriggerInPhase && !rule.canTriggerInPhase.includes(ruleCurrentPhase)) return;
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
            // NEW: Phase Check for character rules
            if (rule.canTriggerInPhase && !rule.canTriggerInPhase.includes(ruleCurrentPhase)) return;
            if (isPreBattleCheck && !rule.canTriggerPreBattle) return;
            rulesToCheck.push({ ...rule, source: 'character', forAttacker: true, actualAttacker: attacker, actualTarget: defender });
        });
    }
    if (characterCurbstompRules[defender.id]) {
        characterCurbstompRules[defender.id].forEach(rule => {
            // NEW: Phase Check for character rules
            if (rule.canTriggerInPhase && !rule.canTriggerInPhase.includes(ruleCurrentPhase)) return;
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

        // NEW: Severity Gating: Control which severity levels can trigger in which phase
        const ruleSeverity = rule.severity || 'lethal'; // Default to lethal if not specified
        if (ruleCurrentPhase === BATTLE_PHASES.PRE_BANTER) { // No lethal or crippling curbstomps in PreBanter
            if (ruleSeverity === 'lethal' || ruleSeverity === 'crippling') {
                // console.log(`[Curbstomp Gating]: Rule ${rule.id} (severity: ${ruleSeverity}) skipped in PreBanter phase.`);
                continue;
            }
        }
        if (ruleCurrentPhase === BATTLE_PHASES.POKING) {
            if (ruleSeverity === 'lethal' || ruleSeverity === 'crippling') {
                // console.log(`[Curbstomp Gating]: Rule ${rule.id} (severity: ${ruleSeverity}) skipped in Poking phase.`);
                continue; // Lethal/Crippling curbstomps generally disabled in Poking phase
            }
        }
        // Early, Mid, Late phases: By default, allow all severities unless explicitly disabled (which isn't currently done here).

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
                    effectiveChance = cond.value; universalMet = true; // FIX: cond.value should be used for triggerChance not just 'value'
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
                // Pass modifyMomentum to checkReactiveDefense so it can pass it to attemptLightningRedirection
                const reactiveCurbstompResult = checkReactiveDefense(rule.actualAttacker, rule.actualTarget, curbstompMoveConcept, battleState, battleEventLog, modifyMomentum);

                if (reactiveCurbstompResult.reacted) {
                    console.log(`[CURBSTOMP REACTION RESULT]: Defender ${rule.actualTarget.name} reacted. Type: ${reactiveCurbstompResult.type}, Success: ${reactiveCurbstompResult.success}`);
                    rule.actualAttacker.aiLog.push(`[Curbstomp Reaction by ${rule.actualTarget.name}]: Type ${reactiveCurbstompResult.type}, Success: ${reactiveCurbstompResult.success}`);
                    rule.actualTarget.aiLog.push(`[Curbstomp Reaction Self]: My ${reactiveCurbstompResult.type} was ${reactiveCurbstompResult.success ? 'SUCCESSFUL' : 'UNSUCCESSFUL'}.`);

                    if (reactiveCurbstompResult.narrativeEvents && reactiveCurbstompResult.narrativeEvents.length > 0) {
                        reactiveCurbstompResult.narrativeEvents.forEach(rawEventData => {
                            if (rawEventData.quote && rawEventData.actor) {
                                const opponentForNarration = rawEventData.actor.id === rule.actualAttacker.id ? rule.actualTarget : rule.actualAttacker;
                                // FIX: Pass full battleState to generateTurnNarrationObjects
                                const formattedEventArray = generateTurnNarrationObjects([rawEventData], null, rawEventData.actor, opponentForNarration, null, battleState.environmentState, battleState.location, phaseState.currentPhase, true, null, battleState);
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
                        // Momentum changes are already applied inside the reactive function (attemptLightningRedirection)
                        // so we don't need to call modifyMomentum here for the reactive result.
                        // However, the reactiveResult object needs to store these changes for consistency if needed elsewhere.

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
                                    // Set their HP to 0 so they are considered defeated.
                                    if (rule.actualTarget.hp > 0) rule.actualTarget.hp = 0;
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
                            // Set their HP to 0 so they are considered defeated.
                            if (rule.actualTarget.hp > 0) rule.actualTarget.hp = 0;
                            aDefeatWasMarkedByThisCheck = true;
                        }
                        break;
                    case "instant_death_character":
                    case "instant_loss_character":
                        const charLosingId = rule.appliesToCharacter;
                        if (charLosingId && !charactersMarkedForDefeat.has(charLosingId)) {
                           charactersMarkedForDefeat.add(charLosingId);
                           // Set their HP to 0 so they are considered defeated.
                           const losingChar = charLosingId === attacker.id ? attacker : defender;
                           if (losingChar.hp > 0) losingChar.hp = 0;
                           aDefeatWasMarkedByThisCheck = true;
                        }
                        break;
                    case "instant_loss_weighted_character":
                    case "instant_loss_random_character":
                    case "instant_loss_character_if_fall":
                    case "instant_loss_random_character_if_knocked_off":
                        if (mechanicallyDeterminedLoserId && !charactersMarkedForDefeat.has(mechanicallyDeterminedLoserId)) {
                            charactersMarkedForDefeat.add(mechanicallyDeterminedLoserId);
                            const losingChar = mechanicallyDeterminedLoserId === attacker.id ? attacker : defender;
                            if (losingChar.hp > 0) losingChar.hp = 0;
                            aDefeatWasMarkedByThisCheck = true;
                        }
                        break;
                    case "conditional_instant_kill_or_self_sabotage":
                        const isSelfSabotageOutcome = Math.random() < (rule.selfSabotageChance || 0);
                        if (!isSelfSabotageOutcome) {
                            if (!charactersMarkedForDefeat.has(rule.actualTarget.id)) {
                                charactersMarkedForDefeat.add(rule.actualTarget.id);
                                if (rule.actualTarget.hp > 0) rule.actualTarget.hp = 0;
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
                                if (rule.actualAttacker.hp > 0) rule.actualAttacker.hp = 0;
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
                        // Ensure HP is capped at a non-lethal value if it's an incapacitation, not a kill
                        rule.actualTarget.hp = clamp(rule.actualTarget.hp, 1, rule.actualTarget.maxHp); // Ensure HP doesn't drop to 0 from this effect alone
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

// Add state initialization function
function initializeBattleState(f1Id, f2Id, locId, timeOfDay, emotionalMode) {
    const environmentState = {
        damageLevel: 0,
        specificImpacts: new Set(),
        lastImpact: null,
        damageHistory: []
    };

    const state = {
        turn: 0,
        currentPhase: null,
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
        errorCount: 0
    };

    validateBattleState(state);
    return state;
}

// Update the simulateBattle function to use the new initialization
export function simulateBattle(f1Id, f2Id, locId, timeOfDay, emotionalMode = false) {
    // Initialize fighters
    const fighter1 = initializeFighterState(f1Id, f2Id, emotionalMode);
    const fighter2 = initializeFighterState(f2Id, f1Id, emotionalMode);

    // Initialize battle state using the new function
    const currentBattleState = initializeBattleState(f1Id, f2Id, locId, timeOfDay, emotionalMode);

    // Set initial opponent references
    fighter1.opponent = fighter2;
    fighter2.opponent = fighter1;
    currentBattleState.opponent = fighter1;

    const locationData = locationConditions[locId];
    if (!locationData) {
        throw new Error(`Invalid location ID: ${locId}`);
    }

    const conditions = { 
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

    // Use the environmentState from currentBattleState
    const { environmentState } = currentBattleState;
    const battleEventLog = [];
    const charactersMarkedForDefeat = new Set();
    const battleContextFiredQuotes = new Set();
    
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


    // --- Pre-Battle Narrative (PRE_BANTER Phase) ---
    // Fetch and log initial dialogue/introductions for PreBanter
    const initialBanter1 = findNarrativeQuote(fighter1, fighter2, 'battleStart', phaseState.currentPhase, { currentPhaseKey: phaseState.currentPhase, locationId: locId, battleState: currentBattleState });
    if (initialBanter1) battleEventLog.push(...generateTurnNarrationObjects([{quote: initialBanter1, actor: fighter1}], null, fighter1, fighter2, null, environmentState, locationData, phaseState.currentPhase, true, null, currentBattleState));

    const initialBanter2 = findNarrativeQuote(fighter2, fighter1, 'battleStart', phaseState.currentPhase, { currentPhaseKey: phaseState.currentPhase, locationId: locId, battleState: currentBattleState });
    if (initialBanter2) battleEventLog.push(...generateTurnNarrationObjects([{quote: initialBanter2, actor: fighter2}], null, fighter2, fighter1, null, environmentState, locationData, phaseState.currentPhase, true, null, currentBattleState));

    // Initial curbstomp check for rules allowed pre-battle
    if (checkCurbstompConditions(fighter1, fighter2, locId, currentBattleState, battleEventLog, true)) {
        fighter1.aiLog.push(`[Pre-Battle Curbstomp Check]: ${fighter1.name} OR ${fighter2.name} triggered or was affected by a curbstomp rule.`);
    }
    if (!charactersMarkedForDefeat.has(fighter1.id) && !charactersMarkedForDefeat.has(fighter2.id)) { // Only check defender if initiator wasn't KO'd
      if (checkCurbstompConditions(fighter2, fighter1, locId, currentBattleState, battleEventLog, true)) {
        fighter2.aiLog.push(`[Pre-Battle Curbstomp Check]: ${fighter2.name} OR ${fighter1.name} triggered or was affected by a curbstomp rule.`);
      }
    }
    // Evaluate outcome after pre-battle curbstomps
    let terminalOutcome = evaluateTerminalState(fighter1, fighter2, isStalemate);
    battleOver = terminalOutcome.battleOver;
    winnerId = terminalOutcome.winnerId;
    loserId = terminalOutcome.loserId;
    isStalemate = terminalOutcome.isStalemate;


    for (turn = 0; turn < MAX_TOTAL_TURNS && !battleOver; turn++) {
        currentBattleState.turn = turn;
        fighter1.currentTurn = turn;
        fighter2.currentTurn = turn;
        currentBattleState.currentPhase = phaseState.currentPhase;

        currentBattleState.opponentLandedCriticalHit = false;
        currentBattleState.opponentTaunted = false;
        currentBattleState.opponentUsedLethalForce = false;
        currentBattleState.opponentLandedSignificantHits = 0;
        currentBattleState.characterReceivedCriticalHit = false;
        currentBattleState.characterLandedStrongOrCriticalHitLastTurn = false;

        // At the start of each turn, check for phase transitions
        const phaseChanged = checkAndTransitionPhase(phaseState, fighter1, fighter2, turn, locId); // Pass locId
        if (phaseChanged) {
            // Log the end of the previous phase in the summary
            if (phaseState.phaseSummaryLog.length > 0) { // Should always have something if a new phase starts
                const lastSummaryEntry = phaseState.phaseSummaryLog[phaseState.phaseSummaryLog.length - 1];
                fighter1.aiLog.push(`[Phase Summary]: ${lastSummaryEntry.phase} concluded after ${lastSummaryEntry.turns} turns.`);
                fighter2.aiLog.push(`[Phase Summary]: ${lastSummaryEntry.phase} concluded after ${lastSummaryEntry.turns} turns.`);
            }
        
            fighter1.aiLog.push(phaseState.phaseLog[phaseState.phaseLog.length - 1]);
            fighter2.aiLog.push(phaseState.phaseLog[phaseState.phaseLog.length - 1]);
            currentBattleState.currentPhase = phaseState.currentPhase;
            // Add phase header event to battleEventLog
            const currentPhaseInfo = phaseDefinitions.find(p => p.key === phaseState.currentPhase);
            battleEventLog.push({
                type: 'phase_header_event',
                phaseName: currentPhaseInfo.name, phaseEmoji: currentPhaseInfo.emoji,
                phaseKey: phaseState.currentPhase, text: `${currentPhaseInfo.name} ${currentPhaseInfo.emoji}`,
                html_content: phaseTemplates.header.replace('{phaseDisplayName}', currentPhaseInfo.name).replace('{phaseEmoji}', currentPhaseInfo.emoji)
            });
            // NEW: Inject narrative for phase transition (e.g., "The air thickens...")
            const phaseTransitionQuote1 = findNarrativeQuote(fighter1, fighter2, 'phaseTransition', phaseState.currentPhase, { currentPhaseKey: phaseState.currentPhase, battleState: currentBattleState });
            if (phaseTransitionQuote1) battleEventLog.push(...generateTurnNarrationObjects([{quote: phaseTransitionQuote1, actor: fighter1}], null, fighter1, fighter2, null, environmentState, locationData, phaseState.currentPhase, true, null, currentBattleState));
            const phaseTransitionQuote2 = findNarrativeQuote(fighter2, fighter1, 'phaseTransition', phaseState.currentPhase, { currentPhaseKey: phaseState.currentPhase, battleState: currentBattleState });
            if (phaseTransitionQuote2) battleEventLog.push(...generateTurnNarrationObjects([{quote: phaseTransitionQuote2, actor: fighter2}], null, fighter2, fighter1, null, environmentState, locationData, phaseState.currentPhase, true, null, currentBattleState));
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

            // NEW: In-turn curbstomp check, passes current phase
            // This now relies on `checkCurbstompConditions` filtering by `canTriggerInPhase`
            if (checkCurbstompConditions(currentAttacker, currentDefender, locId, currentBattleState, battleEventLog, false)) { // false for not pre-battle
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

            // NEW: Decrement stun duration at the start of each turn
            if (currentAttacker.stunDuration > 0) {
                currentAttacker.stunDuration--;
                if (currentAttacker.stunDuration === 0) {
                    currentAttacker.aiLog.push(`[Stun Expired]: ${currentAttacker.name} is no longer stunned.`);
                    turnSpecificEventsForLog.push({
                        type: 'stun_event', actorId: currentAttacker.id, characterName: currentAttacker.name,
                        text: `${currentAttacker.name} recovers from the stun!`,
                        html_content: `<p class="narrative-action char-${currentAttacker.id}">${currentAttacker.name} recovers from the stun!</p>`
                    });
                }
            }

            if (currentAttacker.isStunned) { 
                currentAttacker.aiLog.push(`[Action Skipped]: ${currentAttacker.name} is stunned and cannot act this segment.`);
                turnSpecificEventsForLog.push({
                    type: 'stun_event', actorId: currentAttacker.id, characterName: currentAttacker.name,
                    text: `${currentAttacker.name} is stunned and unable to move!`,
                    html_content: `<p class="narrative-action char-${currentAttacker.id}">${currentAttacker.name} is stunned and unable to move!</p>`
                });
                currentAttacker.isStunned = false; 
                return; 
            }

            const addNarrativeEvent = (quote, actorForQuote) => {
                if (quote && !battleContextFiredQuotes.has(`${actorForQuote.id}-${quote.line}`)) {
                    const opponentForQuote = actorForQuote.id === currentAttacker.id ? currentDefender : currentAttacker;
                    // OLD: addNarrativeEvent(findNarrativeQuote(currentAttacker, currentDefender, 'onManipulation', 'asAttacker', { currentPhaseKey: phaseState.currentPhase }), currentAttacker);
                    narrativeEventsForAction.push({ quote, actor: actorForQuote, opponent: opponentForQuote, context: currentBattleState });
                    battleContextFiredQuotes.add(`${actorForQuote.id}-${quote.line}`);
                }
            };

            let manipulationResult = attemptManipulation(currentAttacker, currentDefender);
            if (manipulationResult.success) {
                currentDefender.tacticalState = { name: manipulationResult.effect, duration: 1, intensity: 1.2, isPositive: false };
                // OLD: addNarrativeEvent(findNarrativeQuote(currentAttacker, currentDefender, 'onManipulation', 'asAttacker', { currentPhaseKey: phaseState.currentPhase }), currentAttacker);
                addNarrativeEvent(findNarrativeQuote(currentAttacker, currentDefender, 'onManipulation', 'asAttacker', { currentPhaseKey: phaseState.currentPhase, battleState: currentBattleState }), currentAttacker); // Pass battleState
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
            // OLD: addNarrativeEvent(findNarrativeQuote(currentAttacker, currentDefender, 'onIntentSelection', aiLogEntryFromSelectMove?.intent || 'StandardExchange', { currentPhaseKey: phaseState.currentPhase, aiLogEntry: aiLogEntryFromSelectMove, move: move }), currentAttacker);
            addNarrativeEvent(findNarrativeQuote(currentAttacker, currentDefender, 'onIntentSelection', aiLogEntryFromSelectMove?.intent || 'StandardExchange', { currentPhaseKey: phaseState.currentPhase, aiLogEntry: aiLogEntryFromSelectMove, move: move, battleState: currentBattleState }), currentAttacker); // Pass battleState

            // Pass modifyMomentum to calculateMove
            const result = calculateMove(move, currentAttacker, currentDefender, conditions, turnSpecificEventsForLog, environmentState, locId, modifyMomentum);

            if (result.isReactedAction && result.narrativeEventsToPrepend) {
                result.narrativeEventsToPrepend.forEach(rawEventData => {
                     if (rawEventData.quote && rawEventData.actor) {
                        const opponentForReactionNarrative = rawEventData.actor.id === currentDefender.id ? currentAttacker : currentDefender;
                        // OLD: const formattedEventArray = generateTurnNarrationObjects([rawEventData], null, rawEventData.actor, opponentForReactionNarrative, null, battleState.environmentState, battleState.location, phaseState.currentPhase, true, null);
                        const formattedEventArray = generateTurnNarrationObjects([rawEventData], null, rawEventData.actor, opponentForReactionNarrative, null, battleState.environmentState, battleState.location, phaseState.currentPhase, true, null, currentBattleState); // FIX: Pass currentBattleState to generateTurnNarrationObjects
                        turnSpecificEventsForLog.push(...formattedEventArray);
                    }
                });
            }

            if (result.isReactedAction) {
                 // OLD: const reactionMoveLine = generateActionDescriptionObject( // THIS IS THE LINE THAT WAS CAUSING THE ERROR
                 // OLD:    { name: result.reactionType || "Reactive Defense", verb: "reacts", object: "to the attack", element: move.element }, // Pass element for emoji
                 // OLD:    currentDefender,
                 // OLD:    currentAttacker,
                 // OLD:    result,
                 // OLD:    phaseState.currentPhase,
                 // OLD:    aiLogEntryFromSelectMove
                 // OLD: );
                 const reactionMoveLine = generateActionDescriptionObject( // THIS IS THE LINE THAT CAUSING THE ERROR
                    { name: result.reactionType || "Reactive Defense", verb: "reacts", object: "to the attack", element: move.element }, // Pass element for emoji
                    currentDefender,
                    currentAttacker,
                    result,
                    phaseState.currentPhase,
                    aiLogEntryFromSelectMove,
                    currentBattleState // FIX: Pass battleState here
                );
                 turnSpecificEventsForLog.push(reactionMoveLine);
            } else {
                // OLD: turnSpecificEventsForLog.push(...generateTurnNarrationObjects(narrativeEventsForAction, move, currentAttacker, currentDefender, result, environmentState, locationData, phaseState.currentPhase, false, aiLogEntryFromSelectMove));
                turnSpecificEventsForLog.push(...generateTurnNarrationObjects(narrativeEventsForAction, move, currentAttacker, currentDefender, result, environmentState, locationData, phaseState.currentPhase, false, aiLogEntryFromSelectMove, currentBattleState)); // FIX: Pass currentBattleState to generateTurnNarrationObjects
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
                const collateralContext = { currentPhaseKey: phaseState.currentPhase, battleState: currentBattleState }; // Pass battleState
                // OLD: if (currentAttacker.collateralTolerance < 0.3) addNarrativeEvent(findNarrativeQuote(currentAttacker, currentDefender, 'onCollateral', 'stressedByDamage', collateralContext), currentAttacker);
                if (currentAttacker.collateralTolerance < 0.3) addNarrativeEvent(findNarrativeQuote(currentAttacker, currentDefender, 'onCollateral', 'stressedByDamage', collateralContext), currentAttacker); // Pass battleState
                // OLD: else if (currentAttacker.collateralTolerance > 0.7) addNarrativeEvent(findNarrativeQuote(currentAttacker, currentDefender, 'onCollateral', 'thrivingInDamage', collateralContext), currentAttacker);
                else if (currentAttacker.collateralTolerance > 0.7) addNarrativeEvent(findNarrativeQuote(currentAttacker, currentDefender, 'onCollateral', 'thrivingInDamage', collateralContext), currentAttacker); // Pass battleState
                // OLD: else addNarrativeEvent(findNarrativeQuote(currentAttacker, currentDefender, 'onCollateral', 'causingDamage', collateralContext), currentAttacker);
                else addNarrativeEvent(findNarrativeQuote(currentAttacker, currentDefender, 'onCollateral', 'causingDamage', collateralContext), currentAttacker); // Pass battleState

                // OLD: if (currentDefender.collateralTolerance < 0.3) addNarrativeEvent(findNarrativeQuote(currentDefender, currentAttacker, 'onCollateral', 'stressedByDamage', collateralContext), currentDefender);
                if (currentDefender.collateralTolerance < 0.3) addNarrativeEvent(findNarrativeQuote(currentDefender, currentAttacker, 'onCollateral', 'stressedByDamage', collateralContext), currentDefender); // Pass battleState
                // OLD: else if (currentDefender.collateralTolerance > 0.7) addNarrativeEvent(findNarrativeQuote(currentDefender, currentAttacker, 'onCollateral', 'thrivingInDamage', collateralContext), currentDefender);
                else if (currentDefender.collateralTolerance > 0.7) addNarrativeEvent(findNarrativeQuote(currentDefender, currentAttacker, 'onCollateral', 'thrivingInDamage', collateralContext), currentDefender); // Pass battleState
                // OLD: else addNarrativeEvent(findNarrativeQuote(currentDefender, currentAttacker, 'onCollateral', 'observingDamage', collateralContext), currentDefender);
                else addNarrativeEvent(findNarrativeQuote(currentDefender, currentAttacker, 'onCollateral', 'observingDamage', collateralContext), currentDefender); // Pass battleState
            }

            updateMentalState(currentDefender, currentAttacker, result, environmentState, locId); // <-- Pass locId here
            updateMentalState(currentAttacker, currentDefender, null, environmentState, locId); // <-- Pass locId here

            if (currentDefender.mentalState.level !== oldDefenderMentalState) {
                // OLD: addNarrativeEvent(findNarrativeQuote(currentDefender, currentAttacker, 'onStateChange', currentDefender.mentalState.level, { currentPhaseKey: phaseState.currentPhase }), currentDefender);
                addNarrativeEvent(findNarrativeQuote(currentDefender, currentAttacker, 'onStateChange', currentDefender.mentalState.level, { currentPhaseKey: phaseState.currentPhase, battleState: currentBattleState }), currentDefender); // Pass battleState
            }
            if (currentAttacker.mentalState.level !== oldAttackerMentalState && currentAttacker.mentalStateChangedThisTurn) {
                // OLD: addNarrativeEvent(findNarrativeQuote(currentAttacker, currentDefender, 'onStateChange', currentAttacker.mentalState.level, { currentPhaseKey: phaseState.currentPhase }), currentAttacker);
                addNarrativeEvent(findNarrativeQuote(currentAttacker, currentDefender, 'onStateChange', currentAttacker.mentalState.level, { currentPhaseKey: phaseState.currentPhase, battleState: currentBattleState }), currentAttacker); // Pass battleState
            }

            currentAttacker.lastMoveEffectiveness = result.effectiveness.label;
            currentAttacker.consecutiveDefensiveTurns = (move.type === 'Utility' || move.type === 'Defense') ? currentAttacker.consecutiveDefensiveTurns + 1 : 0;

            if (move.setup && result.effectiveness.label !== 'Weak' && !move.isRepositionMove) {
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

        const isNarrativeOnlyTurn = (currentBattleState.currentPhase === BATTLE_PHASES.PRE_BANTER); // PRE_BANTER is purely narrative

        if (!isNarrativeOnlyTurn) {
            processTurnSegment(fighter1, fighter2);
            if (battleOver) { battleEventLog.push(...turnSpecificEventsForLog); break; }
            processTurnSegment(fighter2, fighter1);
            if (battleOver) { battleEventLog.push(...turnSpecificEventsForLog); break; }
        } else {
            // Log a message for narrative-only turns, but only once per narrative turn
            if (fighter1.id === f1Id) { // Only log once per full turn (when initiator is F1)
                battleEventLog.push({ type: 'narrative_turn_marker', text: `(Narrative turn ${turn + 1} for ${currentBattleState.currentPhase})`, html_content: `<p class="narrative-info">(Narrative turn ${turn + 1} for ${currentBattleState.currentPhase})</p>` });
            }
        }
        // ... rest of turn loop: environment state, escalation updates, etc. ...

        // Clear and update environment state
        environmentState.specificImpacts.clear();
        const currentLocData = locationConditions[locId];
        if (currentLocData && currentLocData.damageThresholds && environmentState.damageLevel > 0) {
            let impactTier = null;
            if (environmentState.damageLevel >= currentLocData.damageThresholds.catastrophic) impactTier = 'catastrophic';
            else if (environmentState.damageLevel >= currentLocData.damageThresholds.severe) impactTier = 'severe';
            else if (environmentState.damageLevel >= currentLocData.damageThresholds.moderate) impactTier = 'moderate';
            else if (environmentState.damageLevel >= currentLocData.damageThresholds.minor) impactTier = 'minor';

            if (impactTier && locationData.environmentalImpacts[impactTier] && locationData.environmentalImpacts[impactTier].length > 0) {
                 const randomIndex = getRandomElement(locationData.environmentalImpacts[impactTier]);
                 if (randomIndex !== null) environmentState.specificImpacts.add(locationData.environmentalImpacts[impactTier][randomIndex]);
            }
        }

        // Update battle state with environment changes
        Object.assign(currentBattleState.environmentState, environmentState);

        if (!isNarrativeOnlyTurn) { // Only update for combat turns
            currentBattleState.characterLandedStrongOrCriticalHitLastTurn = fighter1.lastMoveForPersonalityCheck?.effectiveness === 'Strong' || fighter1.lastMoveForPersonalityCheck?.effectiveness === 'Critical';
        }


        if (environmentState.damageLevel > 0 && environmentState.specificImpacts.size > 0) {
            let environmentalSummaryHtml = `<div class="environmental-summary">`;
            environmentalSummaryHtml += phaseTemplates.environmentalImpactHeader;
            let allImpactTexts = [];
            environmentState.specificImpacts.forEach(impact => {
                 // OLD: const formattedImpactText = findNarrativeQuote(initiator, responder, 'onCollateral', 'general', { impactText: impact, currentPhaseKey: phaseState.currentPhase })?.line || impact;
                 const formattedImpactText = findNarrativeQuote(initiator, responder, 'onCollateral', 'general', { impactText: impact, currentPhaseKey: phaseState.currentPhase, battleState: currentBattleState })?.line || impact; // Pass battleState
                 allImpactTexts.push(formattedImpactText);
            });
             environmentalSummaryHtml += allImpactTexts.map(text => `<p class="environmental-impact-text">${text}</p>`).join(''); // Fix: use map to join HTML tags
            environmentalSummaryHtml += `</div>`;
            turnSpecificEventsForLog.push({
                type: 'environmental_summary_event',
                texts: allImpactTexts,
                html_content: environmentalSummaryHtml,
                isEnvironmental: true
            });
        }

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
        [fighter1, fighter2] = [fighter2, fighter1];
    }

    // NEW: Before final evaluateTerminalState and summary, log the last phase's duration if battle ends mid-phase.
    if (phaseState.phaseSummaryLog.length === 0 || phaseState.phaseSummaryLog[phaseState.phaseSummaryLog.length - 1].phase !== phaseState.currentPhase) {
        // Only add if the current phase hasn't already been summarized (e.g., if battle ends mid-phase)
        phaseState.phaseSummaryLog.push({ phase: phaseState.currentPhase, turns: phaseState.turnInCurrentPhase });
    }

    terminalOutcome = evaluateTerminalState(fighter1, fighter2, isStalemate);
    battleOver = terminalOutcome.battleOver;
    winnerId = terminalOutcome.winnerId;
    loserId = terminalOutcome.loserId;
    isStalemate = terminalOutcome.isStalemate;

    if (!battleOver && turn >= MAX_TOTAL_TURNS) { // Changed to MAX_TOTAL_TURNS
        if (fighter1.hp === fighter2.hp) {
            isStalemate = true;
        } else {
            winnerId = (fighter1.hp > fighter2.hp) ? fighter1.id : fighter2.id;
            loserId = (winnerId === fighter1.id) ? fighter2.id : fighter1.id;
        }
        battleOver = true;
    }


    const finalWinnerFull = winnerId ? (fighter1.id === winnerId ? fighter1 : fighter2) : null;
    const finalLoserFull = loserId ? (fighter1.id === loserId ? fighter1 : fighter2) : null;

    if (isStalemate) {
        battleEventLog.push({ type: 'stalemate_result_event', text: "The battle ends in a STALEMATE!", html_content: phaseTemplates.stalemateResult });
        fighter1.summary = "The battle reached an impasse, with neither fighter able to secure victory.";
        fighter2.summary = "The battle reached an impasse, with neither fighter able to secure victory.";
    } else if (finalWinnerFull && finalLoserFull) {
        // --- START OF SIMPLIFIED SUMMARY LOGIC ---
        const isKOByHp = finalLoserFull.hp <= 0;
        const isTimeoutVictory = turn >= MAX_TOTAL_TURNS && !isKOByHp;
        const lastCurbstompEvent = battleEventLog.slice().reverse().find(e => e.type === 'curbstomp_event' && !e.isEscape && e.isMajorEvent);

        // Prioritize curbstomp narrative if it led to the KO
        if (lastCurbstompEvent && charactersMarkedForDefeat.has(finalLoserFull.id) && lastCurbstompEvent.actualAttackerId === finalWinnerFull.id) {
            finalWinnerFull.summary = lastCurbstompEvent.text;
            finalLoserFull.summary = `${finalLoserFull.name} was overcome by ${finalWinnerFull.name}'s decisive action.`;
        } else if (isKOByHp) {
            const finalBlowTextRaw = `${finalWinnerFull.name} lands the finishing blow, defeating ${finalLoserFull.name}!`;
            const finalBlowTextHtml = phaseTemplates.finalBlow
                .replace(/{winnerName}/g, `<span class="char-${finalWinnerFull.id}">${finalWinnerFull.name}</span>`)
                .replace(/{loserName}/g, `<span class="char-${finalLoserFull.id}">${finalLoserFull.name}</span>`);
            battleEventLog.push({ type: 'final_blow_event', text: finalBlowTextRaw, html_content: finalBlowTextHtml, isKOAction: true });
            finalWinnerFull.summary = finalBlowTextRaw;
            finalLoserFull.summary = `${finalLoserFull.name} was defeated by a final blow from ${finalWinnerFull.name}.`;
        } else if (isTimeoutVictory) {
            const timeoutTextRaw = `The battle timer expires! With more health remaining, ${finalWinnerFull.name} is declared the victor over ${finalLoserFull.name}!`;
            const timeoutTextHtml = phaseTemplates.timeOutVictory
                .replace(/{winnerName}/g, `<span class="char-${finalWinnerFull.id}">${finalWinnerFull.name}</span>`)
                .replace(/{loserName}/g, `<span class="char-${finalLoserFull.id}">${finalLoserFull.name}</span>`);
            battleEventLog.push({ type: 'timeout_victory_event', text: timeoutTextRaw, html_content: timeoutTextHtml });
            finalWinnerFull.summary = timeoutTextRaw;
            finalLoserFull.summary = `${finalLoserFull.name} lost by timeout as ${finalWinnerFull.name} had more health remaining.`;
        } else { // Generic fallback for other win conditions
            const winnerContext = { WinnerName: finalWinnerFull.name, LoserName: finalLoserFull.name };
            const loserContext = { WinnerName: finalWinnerFull.name, LoserName: finalLoserFull.name };
            
            finalWinnerFull.summary = substituteTokens("{WinnerName}'s victory was sealed by their superior strategy and power.", finalWinnerFull, finalLoserFull, winnerContext);
            finalLoserFull.summary = substituteTokens("{LoserName} fought bravely but was ultimately overcome.", finalLoserFull, finalWinnerFull, loserContext);
        }
        // --- END OF SIMPLIFIED SUMMARY LOGIC ---
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

    fighter1.interactionLog = [...battleEventLog];
    fighter2.interactionLog = [...battleEventLog];

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
        environmentState,
        phaseSummary: phaseState.phaseSummaryLog // NEW
    };
}
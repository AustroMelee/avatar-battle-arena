// FILE: engine_battle-engine-core.js
'use strict';

import { characters } from './data_characters.js';
import { locationConditions } from './location-battle-conditions.js';
import { phaseTemplates, battlePhases as phaseDefinitions } from './narrative-v2.js';
import { selectMove, updateAiMemory, attemptManipulation, adaptPersonality } from './engine_ai-decision.js';
import { calculateMove } from './engine_move-resolution.js';
import { updateMentalState } from './engine_mental-state.js';
import { generateTurnNarrationObjects, getFinalVictoryLine, findNarrativeQuote } from './engine_narrative-engine.js';
import { modifyMomentum } from './engine_momentum.js';
import { initializeBattlePhaseState, checkAndTransitionPhase, BATTLE_PHASES } from './engine_battle-phase.js';
// --- NEW IMPORT for Curbstomp rules ---
import { universalMechanics, locationCurbstompRules, characterCurbstompRules, personalityTriggerMappings } from './mechanics.js';

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
const getRandomElement = (arr) => arr && arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

function initializeFighterState(charId, opponentId, emotionalMode) {
    const characterData = characters[charId];
    if (!characterData) throw new Error(`Character with ID ${charId} not found.`);
    
    const personalityProfile = characterData.personalityProfile || {
        aggression: 0.5, patience: 0.5, riskTolerance: 0.5, opportunism: 0.5,
        creativity: 0.5, defensiveBias: 0.5, antiRepeater: 0.5, signatureMoveBias: {}
    };

    return {
        id: charId, name: characterData.name, ...JSON.parse(JSON.stringify(characterData)),
        hp: 100, maxHp: 100, // Added maxHp for percentage checks
        energy: 100, momentum: 0, lastMove: null, lastMoveEffectiveness: null,
        isStunned: false, tacticalState: null, moveHistory: [], moveFailureHistory: [],
        consecutiveDefensiveTurns: 0, aiLog: [],
        relationalState: (emotionalMode && characterData.relationships?.[opponentId]) || null,
        mentalState: { level: 'stable', stress: 0, mentalStateChangedThisTurn: false },
        contextualState: {}, // Will store states like 'nearEdge', 'opponentTaunted'
        collateralTolerance: characterData.collateralTolerance !== undefined ? characterData.collateralTolerance : 0.5,
        mobility: characterData.mobility !== undefined ? characterData.mobility : 0.5,
        personalityProfile: JSON.parse(JSON.stringify(personalityProfile)),
        aiMemory: {
            selfMoveEffectiveness: {}, opponentModel: { isAggressive: 0, isDefensive: 0, isTurtling: false },
            moveSuccessCooldown: {}, opponentSequenceLog: {},
            repositionCooldown: 0,
        },
        // --- NEW for Curbstomp ---
        curbstompRulesAppliedThisBattle: new Set(), // Track applied rules to prevent re-triggering certain types
        faction: characterData.faction || 'Neutral', // For faction-based rules
        element: characterData.element || 'physical', // Primary element for rules
        specialTraits: { ...characterData.specialTraits }, // Ensure it's an object
        criticalHitsTaken: 0, // For personality triggers
        // Add other relevant base stats if needed for personality triggers (e.g. intelligence for Sokka)
        intelligence: characterData.specialTraits?.intelligence || 50, // default intelligence
        hasMetalArmor: characterData.specialTraits?.hasMetalArmor || false, // Example for Toph's rule
    };
}

// --- NEW CURBSTOMP CHECKING LOGIC ---
/**
 * Evaluates if a personality trigger condition is met for a character.
 * @param {string} triggerId - The ID of the personality trigger (e.g., "provoked").
 * @param {object} character - The character whose trigger is being checked.
 * @param {object} opponent - The opponent character.
 * @param {object} battleState - Current overall battle state (locationId, turn, etc.).
 * @returns {boolean} True if the trigger condition is met.
 */
function evaluatePersonalityTrigger(triggerId, character, opponent, battleState) {
    // This is a simplified evaluator. Real implementation would parse `personalityTriggers` logic string from character data.
    // For now, map directly to conceptual states based on the triggerId from mechanics.js
    // The character.personalityTriggers should contain evaluable JS conditions or flags.
    // Example: character.personalityTriggers.provoked might be `(battleState.opponentLandedCriticalHit) || (battleState.opponentTaunted)`

    // Conceptual mapping based on your `personalityTriggerMappings`
    switch (triggerId) {
        case "provoked": // Mai
            return battleState.opponentLandedCriticalHit || battleState.opponentTaunted || (battleState.allyTargeted && ['ty-lee', 'zuko'].includes(battleState.ally?.id));
        case "serious_fight": // Ty Lee
            return (battleState.ally?.hp < battleState.ally?.maxHp * 0.3) || battleState.opponentUsedLethalForce;
        case "authority_challenged": // Ozai
            return (battleState.opponentLandedSignificantHits >= 2) || battleState.opponentUsedTaunt;
        case "underestimated": // Bumi
            return battleState.opponentTauntedAgeOrStrategy || (opponent.lastMoveEffectiveness === 'Weak' && opponent.lastMove?.power > 50);
        case "in_control": // Azula (Sane)
            return (character.hp > character.maxHp * 0.5) && !(battleState.characterReceivedCriticalHit) && (opponent.mentalState.level === 'stable' || opponent.mentalState.level === 'stressed');
        case "desperate_broken": // Azula (Insane), Katara
            return (character.hp < character.maxHp * 0.3) || (character.mentalState.level === 'broken') || (character.id === 'katara' && battleState.ally?.isDowned) || (character.id === 'katara' && character.criticalHitsTaken >= 2);
        case "doubted": // Toph
            return battleState.opponentTauntedBlindness || battleState.opponentLandedBlindHit;
        case "mortal_danger": // Aang
            return (battleState.ally?.hp < battleState.ally?.maxHp * 0.05) || (character.hp < character.maxHp * 0.2);
        case "honor_violated": // Zuko
            return battleState.opponentCheated || battleState.allyDisarmedUnfairly;
        case "meticulous_planning": // Sokka
            return (opponent.lastMove?.isHighRisk && opponent.lastMoveEffectiveness === 'Weak') || battleState.locationTags.includes('trap_favorable'); // trap_favorable would be a tag in locationConditions
        case "confident_stance": // Jeong Jeong
            return battleState.characterLandedStrongOrCriticalHitLastTurn || battleState.allyBuffedSelf;
        case "skill_challenged": // Pakku
            return battleState.opponentTauntedSkillOrTradition || battleState.opponentAttackedFirstAggressively;
        case "disrespected": // Bumi in Omashu (example of more specific location trigger)
             return battleState.locationId === 'omashu' && battleState.opponentTauntedAgeOrStrategy; // Example
        default:
            // console.warn(`Unknown personality trigger ID: ${triggerId}`);
            return false;
    }
    // Note: `battleState` needs to be populated with these flags (e.g., `opponentLandedCriticalHit`)
    // by the main engine loop before calling this.
}


/**
 * Checks all curbstomp conditions for the current turn.
 * @param {object} attacker - The current attacker.
 * @param {object} defender - The current defender.
 * @param {string} locationId - The ID of the current location.
 * @param {object} battleState - Current overall battle state.
 * @param {Array} battleEventLog - The main battle log to add events to.
 * @returns {object|null} Curbstomp outcome if triggered ({winnerId, loserId, message, isDraw:false}), else null.
 */
function checkCurbstompConditions(attacker, defender, locationId, battleState, battleEventLog) {
    const rulesToCheck = [];

    // 1. Universal Mechanics
    Object.values(universalMechanics).forEach(rule => {
        if (rule.characterId === attacker.id) { // Check if the rule applies to the current attacker
            rulesToCheck.push({ ...rule, source: 'universal', forAttacker: true });
        }
        if (rule.characterId === defender.id) { // Or if it applies to the defender (e.g. a vulnerability)
             rulesToCheck.push({ ...rule, source: 'universal', forAttacker: false });
        }
    });

    // 2. Location-Specific Rules
    if (locationCurbstompRules[locationId]) {
        locationCurbstompRules[locationId].forEach(rule => {
            let applies = false;
            if (rule.appliesToPair && rule.appliesToPair[0] === attacker.id && rule.appliesToPair[1] === defender.id) {
                applies = true;
            } else if (rule.appliesToCharacter && (rule.appliesToCharacter === attacker.id || rule.appliesToCharacter === defender.id)) {
                applies = true;
            } else if (rule.appliesToCharacterElement && (attacker.element === rule.appliesToCharacterElement || defender.element === rule.appliesToCharacterElement)) {
                applies = true;
            } else if (rule.appliesToMoveType) { // These are more like modifiers, handle separately or integrate carefully
                applies = false; // For now, skip direct curbstomp from move type rules here
            } else if (rule.appliesToAll) {
                applies = true;
            }
            if (applies) {
                rulesToCheck.push({ ...rule, source: 'location' });
            }
        });
    }

    // 3. Character-Specific Rules
    if (characterCurbstompRules[attacker.id]) {
        characterCurbstompRules[attacker.id].forEach(rule => rulesToCheck.push({ ...rule, source: 'character', forAttacker: true }));
    }
    if (characterCurbstompRules[defender.id]) { // Check rules that make the defender vulnerable
        characterCurbstompRules[defender.id].forEach(rule => rulesToCheck.push({ ...rule, source: 'character', forAttacker: false }));
    }
    
    // Evaluate rules
    for (const rule of rulesToCheck) {
        let ruleTriggered = false;
        let effectiveChance = rule.triggerChance;

        // Check personality trigger first
        if (rule.personalityTrigger) {
            const characterForPersonalityCheck = (rule.forAttacker === undefined || rule.forAttacker) ? attacker : defender;
            const opponentForPersonalityCheck = characterForPersonalityCheck.id === attacker.id ? defender : attacker;
            if (!evaluatePersonalityTrigger(rule.personalityTrigger, characterForPersonalityCheck, opponentForPersonalityCheck, battleState)) {
                continue; // Personality trigger not met, skip this rule
            }
        }

        // Check specific conditionLogic if it exists
        if (rule.conditionLogic) {
            const actorForLogic = (rule.forAttacker === undefined || rule.forAttacker) ? attacker : defender;
            const opponentForLogic = actorForLogic.id === attacker.id ? defender : attacker;
            if (!rule.conditionLogic(actorForLogic, opponentForLogic, battleState)) {
                continue; // Specific condition not met
            }
        }
        
        // Universal mechanics conditions (more complex)
        if (rule.source === 'universal' && rule.conditions) {
            let universalConditionMet = false;
            rule.conditions.forEach(cond => {
                if (cond.type === "target_technique_speed" && defender.lastMove?.speed === cond.value) { // Assuming moves have a 'speed' tag
                    effectiveChance = cond.triggerChance; // Use specific chance for this condition
                    universalConditionMet = true;
                }
                if (cond.type === "location_property" && battleState.locationTags.includes(cond.property)) {
                    effectiveChance = Math.min(rule.maxChance, (effectiveChance || rule.triggerChance) + (cond.modifier || 0));
                    universalConditionMet = true; // Or some conditions need to be ANDed
                }
                // Add more universal condition checks here
            });
            if (!universalConditionMet && rule.conditions.length > 0) continue; // If conditions were specified but none met
        }


        if (Math.random() < effectiveChance) {
            ruleTriggered = true;
        }

        if (ruleTriggered) {
            // Check escape condition if it exists
            if (rule.escapeCondition) {
                const escapeChar = rule.escapeCondition.character === 'sokka' ? (attacker.id === 'sokka' ? attacker : defender) : attacker; // Simplified
                if (escapeChar.id === rule.escapeCondition.character && Math.random() < rule.escapeCondition.successChance) {
                    if ((rule.escapeCondition.type === "intelligence_roll" && escapeChar.intelligence > rule.escapeCondition.threshold)) {
                        const escapeMsg = rule.outcome.escapeMessage || `${escapeChar.name} narrowly escapes the curbstomp!`;
                        battleEventLog.push({ type: 'curbstomp_event', text: escapeMsg, html_content: `<p class="narrative-curbstomp highlight-escape">${escapeMsg}</p>`, curbstompRuleId: rule.id, isEscape: true });
                        attacker.curbstompRulesAppliedThisBattle.add(rule.id + "_escaped");
                        continue; // Escaped, move to next rule
                    }
                }
            }

            // If not escaped, apply outcome
            const outcome = rule.outcome;
            const successMsg = outcome.successMessage
                .replace(/{attackerName}/g, attacker.name)
                .replace(/{targetName}/g, defender.name)
                .replace(/{characterName}/g, rule.appliesToAll ? (Math.random() < 0.5 ? attacker.name : defender.name) : (rule.appliesToCharacter || attacker.name)); // Simplified

            battleEventLog.push({ type: 'curbstomp_event', text: successMsg, html_content: `<p class="narrative-curbstomp highlight-major">${successMsg}</p>`, curbstompRuleId: rule.id, isEscape: false });
            attacker.curbstompRulesAppliedThisBattle.add(rule.id);


            switch (outcome.type) {
                case "instant_kill":
                case "instant_death_target":
                case "instant_kill_target":
                case "instant_kill_target_collapse":
                case "instant_kill_target_ice":
                    return { winnerId: attacker.id, loserId: defender.id, message: successMsg, isDraw: false };
                case "instant_win_attacker":
                case "instant_win_attacker_vs_armor":
                case "instant_win_attacker_control":
                case "instant_win_attacker_overwhelm":
                    return { winnerId: attacker.id, loserId: defender.id, message: successMsg, isDraw: false };
                case "instant_loss_character": // e.g. Sokka heatstroke
                    const charLosing = rule.appliesToCharacter === attacker.id ? attacker : defender;
                    const charWinning = charLosing.id === attacker.id ? defender : attacker;
                    return { winnerId: charWinning.id, loserId: charLosing.id, message: successMsg, isDraw: false };
                case "instant_loss_random_character":
                case "instant_loss_character_if_fall":
                case "instant_loss_random_character_if_knocked_off":
                    const loser = Math.random() < 0.5 ? attacker : defender;
                    const winner = loser.id === attacker.id ? defender : attacker;
                    return { winnerId: winner.id, loserId: loser.id, message: successMsg.replace("{characterName}", loser.name), isDraw: false };
                case "instant_paralysis":
                case "instant_paralysis_target":
                case "incapacitation_target_disable_limbs":
                case "instant_incapacitation_target_bury":
                case "instant_incapacitation_target_burn":
                    defender.isStunned = true; // Or a more severe "paralyzed" state if you add one
                    defender.hp = Math.min(defender.hp, 10); // Heavily damage but not outright kill unless specified by rule later
                    battleState.logSystemMessage = `${defender.name} is incapacitated by ${attacker.name}'s ${rule.id}!`;
                    // This might not end the battle immediately but gives a massive advantage
                    break;
                case "conditional_instant_kill_or_self_sabotage": // Azula insane
                    if (Math.random() < (1 - (rule.selfSabotageChance || 0))) {
                        return { winnerId: attacker.id, loserId: defender.id, message: successMsg, isDraw: false };
                    } else {
                        attacker.hp -= 15; // Self-sabotage damage
                        attacker.momentum -= 2;
                        battleEventLog.push({ type: 'curbstomp_event_sabotage', text: outcome.selfSabotageMessage.replace(/{attackerName}/g, attacker.name), html_content: `<p class="narrative-curbstomp highlight-neutral">${outcome.selfSabotageMessage.replace(/{attackerName}/g, attacker.name)}</p>` });
                        battleState.logSystemMessage = `${attacker.name}'s ${rule.id} backfired!`;
                    }
                    break;
                // Advantage/Disadvantage/Persistent effects usually modify stats or upcoming rolls, not end battle.
                // These would be applied to character objects directly here.
                case "advantage_attacker":
                case "advantage_character":
                case "power_increase_character_50_percent": // Example direct effect
                case "accuracy_increase_character_25_percent":
                case "power_increase_character_40_percent":
                case "effectiveness_increase_30_percent":
                case "power_increase_character_35_percent":
                case "attack_power_increase_character_15_percent":
                case "chi_blocking_effectiveness_increase_40_percent":
                case "accuracy_increase_character_85_percent":
                case "evasion_chance_increase_60_percent":
                    // Apply buff to attacker or specific character. E.g.:
                    // attacker.contextualBuffs.push({id: rule.id, effect: outcome.effect, duration: 1});
                    battleState.logSystemMessage = `${attacker.name} gains advantage from ${rule.id}: ${outcome.effect || successMsg}`;
                    break;
                case "disadvantage_character":
                case "performance_decrease_character_20_percent":
                case "reduced_accuracy_defense":
                case "reduced_accuracy_defense_20_percent":
                    // Apply debuff to target character. E.g.:
                    // defender.contextualDebuffs.push({id: rule.id, effect: outcome.effect, duration: 1});
                    battleState.logSystemMessage = `${defender.name} is disadvantaged by ${rule.id}: ${outcome.effect || successMsg}`;
                    break;
                case "persistent_effect":
                    // Apply persistent effect, possibly to battleState or character for tracking
                    battleState.activePersistentEffects = battleState.activePersistentEffects || [];
                    battleState.activePersistentEffects.push({ruleId: rule.id, characterId: rule.appliesToCharacterElement ? 'element_' + rule.appliesToCharacterElement : (rule.forAttacker ? attacker.id : defender.id) , effect: outcome.effect, message: outcome.message});
                    battleState.logSystemMessage = `Persistent effect ${rule.id} now active.`;
                    break;
                // ... other outcome types
            }
            // If a rule triggered and wasn't an instant win/loss but changed state,
            // it might still be significant enough to stop further checks for this actor's turn.
            // For now, we'll let it check all applicable rules.
            // A single curbstomp instant win/loss is enough to end the check.
        }
    }
    return null; // No decisive curbstomp outcome this check
}
// --- END NEW CURBSTOMP LOGIC ---

export function simulateBattle(f1Id, f2Id, locId, timeOfDay, emotionalMode = false) {
    let fighter1 = initializeFighterState(f1Id, f2Id, emotionalMode);
    let fighter2 = initializeFighterState(f2Id, f1Id, emotionalMode);
    
    const conditions = { ...locationConditions[locId], id: locId, isDay: timeOfDay === 'day', isNight: timeOfDay === 'night' };
    let battleEventLog = []; 
    let interactionLog = []; 
    let initiator = (fighter1.powerTier > fighter2.powerTier) ? fighter1 : ((fighter2.powerTier > fighter1.powerTier) ? fighter2 : (Math.random() < 0.5 ? fighter1 : fighter2));
    let responder = (initiator.id === fighter1.id) ? fighter2 : fighter1;
    let battleOver = false;
    let isStalemate = false;
    let winnerId = null; // For curbstomp
    let loserId = null; // For curbstomp

    let phaseState = initializeBattlePhaseState();
    fighter1.aiLog.push(...phaseState.phaseLog); 
    fighter2.aiLog.push(...phaseState.phaseLog);

    let environmentState = { damageLevel: 0, lastDamageSourceId: null, specificImpacts: new Set() };
    const locationData = locationConditions[locId];

    // --- Populate battleState for curbstomp checks ---
    let currentBattleState = {
        locationId: locId,
        locationTags: locationData.tags || [], // Assuming locations.js would add a 'tags' array
        turn: 0,
        isFullMoon: conditions.isNight && Math.random() < 0.25, // Example: 25% chance of full moon at night
        // These will be updated each turn/segment:
        opponentLandedCriticalHit: false,
        opponentTaunted: false,
        allyTargeted: false, // Needs ally system
        ally: null, // Needs ally system
        opponentUsedLethalForce: false,
        opponentLandedSignificantHits: 0,
        opponentTauntedAgeOrStrategy: false,
        opponentTauntedBlindness: false,
        opponentLandedBlindHit: false,
        characterReceivedCriticalHit: false, // Specific to current actor
        opponentCheated: false,
        allyDisarmedUnfairly: false,
        allyDowned: false,
        characterLandedStrongOrCriticalHitLastTurn: false,
        allyBuffedSelf: false,
        opponentTauntedSkillOrTradition: false,
        opponentAttackedFirstAggressively: false,
        nearEdge: false, // Could be set by certain moves or locations
        lastMovePushbackStrong: false,
        logSystemMessage: "" // For logging curbstomp effects internally
    };
    // --- End battleState population ---

    const initialBanter1 = findNarrativeQuote(fighter1, fighter2, 'battleStart', 'general', { currentPhaseKey: phaseState.currentPhase });
    if (initialBanter1) battleEventLog.push(...generateTurnNarrationObjects([{quote: initialBanter1, actor: fighter1}], null, fighter1, fighter2, null, environmentState, locationData, phaseState.currentPhase, true));
    
    const initialBanter2 = findNarrativeQuote(fighter2, fighter1, 'battleStart', 'general', { currentPhaseKey: phaseState.currentPhase });
    if (initialBanter2) battleEventLog.push(...generateTurnNarrationObjects([{quote: initialBanter2, actor: fighter2}], null, fighter2, fighter1, null, environmentState, locationData, phaseState.currentPhase, true));

    // --- CURBSTOMP CHECK BEFORE FIRST TURN ---
    // Check for attacker (initiator) curbstomps
    let curbstompOutcome = checkCurbstompConditions(initiator, responder, locId, currentBattleState, battleEventLog);
    if (curbstompOutcome) {
        battleOver = true;
        winnerId = curbstompOutcome.winnerId;
        loserId = curbstompOutcome.loserId;
        isStalemate = curbstompOutcome.isDraw; // Though curbstomps usually aren't draws
    }
    // Check for defender (responder) curbstomps (e.g. Sokka's vulnerability)
    if (!battleOver) {
        curbstompOutcome = checkCurbstompConditions(responder, initiator, locId, currentBattleState, battleEventLog);
        if (curbstompOutcome) {
            battleOver = true;
            winnerId = curbstompOutcome.winnerId;
            loserId = curbstompOutcome.loserId;
            isStalemate = curbstompOutcome.isDraw;
        }
    }
    // --- END CURBSTOMP PRE-CHECK ---

    // Max turns can now be higher, as curbstomps can end it early.
    // Original loop was `turn < 6`. Let's keep it for now.
    for (let turn = 0; turn < 6 && !battleOver; turn++) {
        currentBattleState.turn = turn; // Update turn in battleState
        // Reset turn-specific battleState flags
        currentBattleState.opponentLandedCriticalHit = false;
        currentBattleState.opponentTaunted = false;
        currentBattleState.opponentUsedLethalForce = false;
        // ... reset other relevant flags

        const phaseChanged = checkAndTransitionPhase(phaseState, fighter1, fighter2, turn);
        if (phaseChanged) {
            fighter1.aiLog.push(phaseState.phaseLog[phaseState.phaseLog.length - 1]);
            fighter2.aiLog.push(phaseState.phaseLog[phaseState.phaseLog.length - 1]);
            const currentPhaseInfo = phaseDefinitions.find(p => p.key === phaseState.currentPhase) || phaseDefinitions[0];
            battleEventLog.push({ 
                type: 'phase_header_event',
                phaseName: currentPhaseInfo.name, // Pass name and emoji for transformer
                phaseEmoji: currentPhaseInfo.emoji,
                phaseKey: phaseState.currentPhase, // Pass key for wrapper
                text: `${currentPhaseInfo.name} ${currentPhaseInfo.emoji}`, // Keep for animation queue
                isPhaseHeader: true,
                html_content: phaseTemplates.header
                    .replace('{phaseDisplayName}', currentPhaseInfo.name)
                    .replace('{phaseEmoji}', currentPhaseInfo.emoji)
            });
        }
        
        let turnSpecificEventsForLog = []; 
        const battleContextFiredQuotes = new Set();
        
        const processTurnSegment = (attacker, defender) => {
            if (battleOver || isStalemate) return;

            // --- CURBSTOMP CHECK AT SEGMENT START ---
            currentBattleState.characterReceivedCriticalHit = false; // Reset for current attacker
            let segmentCurbstomp = checkCurbstompConditions(attacker, defender, locId, currentBattleState, battleEventLog);
            if (segmentCurbstomp) {
                battleOver = true;
                winnerId = segmentCurbstomp.winnerId;
                loserId = segmentCurbstomp.loserId;
                isStalemate = segmentCurbstomp.isDraw;
                return;
            }
            segmentCurbstomp = checkCurbstompConditions(defender, attacker, locId, currentBattleState, battleEventLog);
            if (segmentCurbstomp) {
                battleOver = true;
                winnerId = segmentCurbstomp.winnerId;
                loserId = segmentCurbstomp.loserId;
                isStalemate = segmentCurbstomp.isDraw;
                return;
            }
            // --- END SEGMENT CURBSTOMP CHECK ---

            let narrativeEventsForAction = []; 
            const oldDefenderMentalState = defender.mentalState.level;
            const oldAttackerMentalState = attacker.mentalState.level;
            attacker.mentalStateChangedThisTurn = false; 

            if (turn > 0) adaptPersonality(attacker);
            
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
                    type: 'stun_event',
                    actorId: attacker.id,
                    characterName: attacker.name,
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
                        type: 'manipulation_narration_event',
                        actorId: attacker.id,
                        text: manipulationResult.narration.replace(/<[^>]+>/g, ''),
                        html_content: manipulationResult.narration,
                        isDialogue: false, 
                     });
                }
                currentBattleState.opponentTaunted = true; // Update battleState
            }

            const { move, aiLogEntryFromSelectMove } = selectMove(attacker, defender, conditions, turn, phaseState.currentPhase); 
            
            addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onIntentSelection', aiLogEntryFromSelectMove?.intent || 'StandardExchange', { currentPhaseKey: phaseState.currentPhase }), attacker);
            
            const result = calculateMove(move, attacker, defender, conditions, interactionLog, environmentState, locId);

            // Update battleState based on move result for next curbstomp check or personality trigger
            if (result.effectiveness.label === 'Critical') {
                if (attacker.id === initiator.id) currentBattleState.opponentLandedCriticalHit = true; // If initiator is attacker, defender got hit
                else currentBattleState.characterReceivedCriticalHit = true; // If responder is attacker, initiator (now defender) got hit.
                defender.criticalHitsTaken +=1;
            }
            if (move.isHighRisk) { // Assuming moves can have an `isHighRisk` tag
                if (attacker.id === initiator.id) currentBattleState.opponentUsedLethalForce = true;
                 // else currentBattleState.characterUsedLethalForce = true; // (attacker is responder)
            }
            // Update attacker's last move for personality triggers in opponent's turn
            attacker.lastMoveForPersonalityCheck = { isHighRisk: move.isHighRisk, effectiveness: result.effectiveness.label, power: move.power };


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
            attacker.energy = clamp(attacker.energy - result.energyCost, 0, 100);
            attacker.moveHistory.push({ ...move, effectiveness: result.effectiveness.label });
            attacker.lastMove = move;
            
            updateAiMemory(defender, attacker); 
            updateAiMemory(attacker, defender);

            if (defender.hp <= 0) {
                battleOver = true;
                winnerId = attacker.id; // Winner is the current attacker
                loserId = defender.id;  // Loser is the current defender
            }

            // Stalemate check: Moved outside segment but this is one place it could be evaluated.
            // The prompt was less specific on where this check goes. Let's assume it's an end-of-turn check.
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

        // Update battleState for initiator's turn
        currentBattleState.opponentLandedSignificantHits = initiator.moveHistory.filter(m => m.effectiveness === 'Strong' || m.effectiveness === 'Critical').length;
        // Add other flags based on initiator's actions if needed for responder's personality triggers

        processTurnSegment(initiator, responder);

        if (!battleOver && !isStalemate) {
            // Update battleState for responder's turn
            currentBattleState.opponentLandedSignificantHits = responder.moveHistory.filter(m => m.effectiveness === 'Strong' || m.effectiveness === 'Critical').length;
            // Add other flags based on responder's actions if needed for initiator's personality triggers
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
                texts: allImpactTexts, // Pass as array of strings for transformer
                html_content: environmentalSummaryHtml,
                isEnvironmental: true
            });
        }
        
        battleEventLog.push(...turnSpecificEventsForLog);

        // End-of-turn stalemate check
        if (!battleOver && turn >= 2) { // Adjusted to 2 (3rd turn onwards) from 3
            if (fighter1.consecutiveDefensiveTurns >= 3 && fighter2.consecutiveDefensiveTurns >= 3 &&
                Math.abs(fighter1.hp - fighter2.hp) < 15 && 
                phaseState.currentPhase !== BATTLE_PHASES.EARLY) { 
                isStalemate = true;
                battleOver = true; 
                fighter1.aiLog.push("[Stalemate Condition Met]: Prolonged defensive engagement.");
                fighter2.aiLog.push("[Stalemate Condition Met]: Prolonged defensive engagement.");
            }
        }

        if (isStalemate || battleOver) break; // Break from main loop if stalemate or KO
        [initiator, responder] = [responder, initiator];
    }
    
    // Determine final winner/loser outside the loop if not already set by curbstomp or KO
    let finalWinner = null;
    let finalLoser = null;

    if (winnerId) { // Curbstomp or KO already determined winner
        finalWinner = characters[winnerId];
        finalLoser = characters[loserId];
    } else if (isStalemate) {
        battleEventLog.push({ type: 'stalemate_result_event', text: "The battle ends in a STALEMATE!", html_content: phaseTemplates.stalemateResult });
        fighter1.summary = "The battle reached an impasse, with neither fighter able to secure victory.";
        fighter2.summary = "The battle reached an impasse, with neither fighter able to secure victory.";
    } else if (fighter1.hp <= 0) {
        finalWinner = fighter2; finalLoser = fighter1;
    } else if (fighter2.hp <= 0) {
        finalWinner = fighter1; finalLoser = fighter2;
    } else { 
        if (fighter1.hp === fighter2.hp) { 
            isStalemate = true; 
            battleEventLog.push({ type: 'draw_result_event', text: "The battle is a DRAW!", html_content: phaseTemplates.drawResult });
            fighter1.summary = "The battle ended in a perfect draw, neither giving an inch.";
            fighter2.summary = "The battle ended in a perfect draw, neither giving an inch.";
        } else {
            finalWinner = (fighter1.hp > fighter2.hp) ? fighter1 : fighter2;
            finalLoser = (finalWinner.id === fighter1.id) ? fighter2 : fighter1;
            const timeoutTextRaw = `The battle timer expires! With more health remaining, ${finalWinner.name} is declared the victor over ${finalLoser.name}!`;
            const timeoutTextHtml = phaseTemplates.timeOutVictory
                .replace(/{winnerName}/g, `<span class="char-${finalWinner.id}">${finalWinner.name}</span>`)
                .replace(/{loserName}/g, `<span class="char-${finalLoser.id}">${finalLoser.name}</span>`);
            battleEventLog.push({ type: 'timeout_victory_event', text: timeoutTextRaw, html_content: timeoutTextHtml });
        }
    }

    if (!isStalemate && finalWinner && finalLoser && finalLoser.hp <= 0 && !battleEventLog.some(e => e.type === 'curbstomp_event' && e.curbstompRuleId)) { 
        const finalBlowTextRaw = `${finalWinner.name} lands the finishing blow, defeating ${finalLoser.name}!`;
        const finalBlowTextHtml = phaseTemplates.finalBlow
            .replace(/{winnerName}/g, `<span class="char-${finalWinner.id}">${finalWinner.name}</span>`)
            .replace(/{loserName}/g, `<span class="char-${finalLoser.id}">${finalLoser.name}</span>`);
        battleEventLog.push({ type: 'final_blow_event', text: finalBlowTextRaw, html_content: finalBlowTextHtml, isKOAction: true }); // Add isKOAction
    }
    
    if (!isStalemate && finalWinner) {
         finalWinner.summary = finalWinner.summary || `${finalWinner.name}'s victory was sealed by their superior strategy and power.`;
        const finalWords = getFinalVictoryLine(finalWinner, finalLoser); 
        const conclusionTextRaw = `${finalWinner.name} stands victorious. "${finalWords}"`;
        const conclusionTextHtml = phaseTemplates.conclusion.replace('{endingNarration}', conclusionTextRaw);
        battleEventLog.push({ type: 'conclusion_event', text: conclusionTextRaw, html_content: conclusionTextHtml });
    } else if(isStalemate || (!finalWinner && !finalLoser && fighter1.hp === fighter2.hp)) { 
        const conclusionTextRaw = "The battle concludes. Neither could claim outright victory.";
        battleEventLog.push({ type: 'conclusion_event', text: conclusionTextRaw, html_content: phaseTemplates.conclusion.replace('{endingNarration}', conclusionTextRaw) });
    }

    if(finalWinner) finalWinner.interactionLog = [...interactionLog];
    if(finalLoser) finalLoser.interactionLog = [...interactionLog];

    fighter1.phaseLog = [...phaseState.phaseLog];
    fighter2.phaseLog = [...phaseState.phaseLog];
    
    return { 
        log: battleEventLog, 
        winnerId: isStalemate ? null : (finalWinner ? finalWinner.id : null), 
        loserId: isStalemate ? null : (finalLoser ? finalLoser.id : null), 
        isDraw: isStalemate,
        finalState: { fighter1, fighter2 }, 
        environmentState 
    };
}
'use strict';

import { EFFECT_TYPES, MECHANIC_DEFINITIONS } from './data_mechanics_definitions.js';
import { characters } from './data_characters.js';
import { applyCurbstompRules, charactersMarkedForDefeat } from './engine_curbstomp_manager.js';
import { modifyMomentum } from './engine_momentum.js';
import { ESCALATION_STATES } from './engine_escalation.js';
import { getRandomElement } from './engine_battle-engine-core.js';
import { USE_DETERMINISTIC_RANDOM } from './config_game.js';
import { seededRandom } from './utils_seeded_random.js';
import { generateLogEvent } from './utils_log_event.js';

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

/**
 * Applies a single game effect to a character or the battle state.
 * This is a centralized function for all effect application, driven by data.
 * @param {object} effect - The effect object, containing type and parameters (e.g., { type: 'damage', value: 20 }).
 * @param {object} actor - The character initiating the effect (can be null for environmental effects).
 * @param {object} target - The character receiving the effect (can be null for global effects).
 * @param {object} battleState - The current battle state object.
 * @param {Array} battleEventLog - The log to push narrative events to.
 * @returns {object} An object indicating if the effect was successfully applied and any relevant messages.
 */
export function applyEffect(effect, actor, target, battleState, battleEventLog) {
    if (!effect || !effect.type) {
        console.warn("Attempted to apply an invalid effect:", effect);
        return { success: false, message: "Invalid effect." };
    }

    const definition = MECHANIC_DEFINITIONS[effect.type];
    if (!definition) {
        console.warn(`No definition found for effect type: ${effect.type}`);
        return { success: false, message: `Unknown effect type: ${effect.type}` };
    }

    let success = true;
    let message = "Effect applied.";
    let primaryTarget = null; // Reference to the actual object being modified (actor, target, or battleState.environmentState)

    switch (definition.targets[0]) { // Assuming primary target is always the first in the list
        case 'target': primaryTarget = target; break;
        case 'self': primaryTarget = actor; break;
        case 'environment': primaryTarget = battleState.environmentState; break;
        case 'global': primaryTarget = battleState; break;
    }

    if (!primaryTarget && definition.targets[0] !== 'global') {
        console.warn(`Effect type ${effect.type} requires a target but none was provided.`);
        return { success: false, message: `Missing target for ${effect.type}.` };
    }

    // Validate required parameters (basic example)
    for (const paramName in definition.params) {
        if (definition.params[paramName].required && effect[paramName] === undefined) {
            console.error(`Missing required parameter '${paramName}' for effect type ${effect.type}.`);
            return { success: false, message: `Missing parameter ${paramName}.` };
        }
    }

    switch (effect.type) {
        case EFFECT_TYPES.DAMAGE:
            if (primaryTarget && typeof primaryTarget.hp === 'number') {
                primaryTarget.hp = clamp(primaryTarget.hp - effect.value, 0, 100);
                message = `${primaryTarget.name} takes ${effect.value} damage.`;
            }
            break;
        case EFFECT_TYPES.HEAL:
            if (primaryTarget && typeof primaryTarget.hp === 'number') {
                primaryTarget.hp = clamp(primaryTarget.hp + effect.value, 0, 100);
                message = `${primaryTarget.name} heals ${effect.value} HP.`;
            }
            break;
        case EFFECT_TYPES.ENERGY_CHANGE:
            if (primaryTarget && typeof primaryTarget.energy === 'number') {
                primaryTarget.energy = clamp(primaryTarget.energy + effect.value, 0, 100);
                message = `${primaryTarget.name} energy changes by ${effect.value}.`;
            }
            break;
        case EFFECT_TYPES.STUN:
            if (primaryTarget) {
                primaryTarget.stunDuration = (primaryTarget.stunDuration || 0) + effect.duration;
                primaryTarget.consecutiveStuns = (primaryTarget.consecutiveStuns || 0) + 1; // Increment for resistance
                primaryTarget.stunImmunityTurns = 2; // Hardcoded for now, can be config
                message = `${primaryTarget.name} is stunned for ${effect.duration} turns.`;
            }
            break;
        case EFFECT_TYPES.MOMENTUM_CHANGE:
            if (effect.targetId) {
                // Resolve the target character from the battle participants (actor/target)
                let targetCharacter = null;
                if (actor && actor.id === effect.targetId) {
                    targetCharacter = actor;
                } else if (target && target.id === effect.targetId) {
                    targetCharacter = target;
                }
                
                if (targetCharacter) {
                    modifyMomentum(targetCharacter, effect.value, `Battle effect`);
                    message = `Momentum for ${targetCharacter.name} changes by ${effect.value}.`;
                } else {
                    console.warn(`Character with ID ${effect.targetId} not found among battle participants for momentum change.`);
                    success = false;
                }
            } else {
                console.warn("Momentum change effect requires a targetId.");
                success = false;
            }
            break;
        case EFFECT_TYPES.COLLATERAL_DAMAGE:
            if (primaryTarget && typeof primaryTarget.damageLevel === 'number') {
                primaryTarget.damageLevel = clamp(primaryTarget.damageLevel + effect.value, 0, 100);
                message = `Environmental damage increases by ${effect.value}.`;
            }
            break;
        case EFFECT_TYPES.EVASION_MODIFIER:
        case EFFECT_TYPES.DAMAGE_MODIFIER:
        case EFFECT_TYPES.DEFENSE_MODIFIER:
        case EFFECT_TYPES.ACCURACY_MODIFIER:
        case EFFECT_TYPES.STUN_RESISTANCE_MODIFIER:
        case EFFECT_TYPES.MANIPULATION_RESISTANCE_MODIFIER:
        case EFFECT_TYPES.SPEED_MODIFIER:
            // For modifiers, we'd typically add them to a 'activeModifiers' array on the character
            // and have a separate system (e.g., in battle engine's turn start) apply/decay them.
            // For now, just log a message.
            console.log(`Applying modifier ${effect.type} with value ${effect.value} to ${primaryTarget?.name || 'global'}.`);
            message = `${primaryTarget?.name || 'Target'} gains ${effect.type.replace('_', ' ').toLowerCase()} modifier.`;
            // Placeholder for actual application to character's active effects/modifiers
            if (primaryTarget && !primaryTarget.activeModifiers) primaryTarget.activeModifiers = [];
            if (primaryTarget) primaryTarget.activeModifiers.push({ type: effect.type, value: effect.value, duration: effect.duration, source: actor?.id });
            break;
        case EFFECT_TYPES.INSTANT_KO:
            if (primaryTarget) {
                charactersMarkedForDefeat.add(primaryTarget.id);
                message = effect.message || `${primaryTarget.name} is instantly defeated!`;
            }
            break;
        case EFFECT_TYPES.CONDITIONAL_KO_OR_MERCY:
            if (primaryTarget) {
                if (Math.random() < effect.mercyChance) {
                    // Mercy: incapacitate but not kill
                    primaryTarget.hp = clamp(primaryTarget.hp - 80, 0, 100); // Reduce HP significantly
                    primaryTarget.stunDuration = (primaryTarget.stunDuration || 0) + 3; // Long stun
                    message = effect.mercyMessage || `${primaryTarget.name} is incapacitated, spared by a moment of mercy.`;
                } else {
                    charactersMarkedForDefeat.add(primaryTarget.id);
                    message = effect.successMessage || `${primaryTarget.name} is utterly defeated!`;
                }
            }
            break;
        case EFFECT_TYPES.CONDITIONAL_KO_OR_SELF_SABOTAGE:
            if (primaryTarget && actor) {
                const mercyRoll = (USE_DETERMINISTIC_RANDOM ? seededRandom() : Math.random());
                const hasMercy = effect.mercyChance && mercyRoll < effect.mercyChance;

                battleEventLog.push(generateLogEvent(battleState, {
                    type: "dice_roll",
                    rollType: "mercyChance",
                    actorId: primaryTarget.id,
                    result: mercyRoll,
                    threshold: effect.mercyChance,
                    outcome: hasMercy ? "mercy granted" : "no mercy"
                }));

                if (hasMercy) {
                    battleEventLog.push(generateLogEvent(battleState, {
                        type: 'narrative_event',
                        text: `${primaryTarget.name} miraculously withstands what should have been a fatal blow!`,
                        html_content: `<p class="narrative-survivor">${primaryTarget.name} miraculously withstands what should have been a fatal blow!</p>`,
                    }));
                } else {
                    const selfSabotageRoll = (USE_DETERMINISTIC_RANDOM ? seededRandom() : Math.random());
                    const isSelfSabotage = effect.selfSabotageChance && selfSabotageRoll < effect.selfSabotageChance;

                    battleEventLog.push(generateLogEvent(battleState, {
                        type: "dice_roll",
                        rollType: "selfSabotageChance",
                        actorId: actor.id,
                        result: selfSabotageRoll,
                        threshold: effect.selfSabotageChance,
                        outcome: isSelfSabotage ? "self sabotage" : "no self sabotage"
                    }));

                    if (isSelfSabotage) {
                        const selfDamage = Math.floor(primaryTarget.maxHp * 0.3);
                        primaryTarget.hp = clamp(primaryTarget.hp - selfDamage, 0, primaryTarget.maxHp);
                        battleEventLog.push(generateLogEvent(battleState, {
                            type: 'narrative_event',
                            text: effect.selfSabotageMessage || `${actor.name}'s attack backfires, causing self-harm!`,
                            html_content: `<p class="narrative-self-sabotage">${actor.name}'s attack backfires!</p>`,
                        }));
                    } else {
                        primaryTarget.hp = 0;
                        battleEventLog.push(generateLogEvent(battleState, {
                            type: 'final_blow_event',
                            text: effect.successMessage || `${primaryTarget.name} is incapacitated!`, // Or more specific message
                            html_content: `<p class="final-blow">${primaryTarget.name} is incapacitated!</p>`,
                            targetId: primaryTarget.id
                        }));
                        charactersMarkedForDefeat.add(primaryTarget.id);
                    }
                }
            }
            break;
        case EFFECT_TYPES.TRAIT_TOGGLE:
            if (primaryTarget && effect.traitName in primaryTarget) {
                primaryTarget[effect.traitName] = effect.value;
                message = `${primaryTarget.name}'s trait '${effect.traitName}' is set to ${effect.value}.`;
            } else {
                console.warn(`Trait '${effect.traitName}' not found on target for TRAIT_TOGGLE effect.`);
                success = false;
            }
            break;
        case EFFECT_TYPES.APPLY_CURBSTOMP_RULE:
            if (effect.ruleId) {
                // The applyCurbstompRules function will need to be adapted to accept a specific ruleId
                // For now, we'll assume it can apply a rule directly if given its ID.
                // This part needs careful integration with existing curbstomp manager.
                // applyCurbstompRules(actor, target, battleState, battleEventLog, true, effect.ruleId);
                message = `Applying specific curbstomp rule: ${effect.ruleId}. (Integration pending)`;
            } else {
                console.warn("APPLY_CURBSTOMP_RULE requires a ruleId.");
                success = false;
            }
            break;
        case EFFECT_TYPES.TRIGGER_NARRATIVE_EVENT:
            // This would likely push a specific narrative event to the log for the narrative engine to pick up
            battleEventLog.push({ type: 'narrative_event', eventId: effect.eventId, text: effect.message || "" });
            message = effect.message || "Narrative event triggered.";
            break;
        case EFFECT_TYPES.ADJUST_AI_PROFILE:
            if (primaryTarget && primaryTarget.personalityProfile && effect.adjustments) {
                Object.keys(effect.adjustments).forEach(trait => {
                    if (trait in primaryTarget.personalityProfile) {
                        primaryTarget.personalityProfile[trait] = clamp(primaryTarget.personalityProfile[trait] + effect.adjustments[trait], 0, 1);
                    }
                });
                message = `${primaryTarget.name}'s AI profile adjusted.`;
            } else {
                console.warn("ADJUST_AI_PROFILE requires a target with personalityProfile and adjustments.");
                success = false;
            }
            break;
        case EFFECT_TYPES.NARRATIVE_ONLY:
            // This effect type is solely for narrative purposes and doesn't alter game state.
            battleEventLog.push(generateLogEvent(battleState, { type: 'narrative_event', eventId: effect.eventId, text: effect.message || "" }));
            break;
        default:
            console.warn(`Unhandled effect type: ${effect.type}`);
            success = false;
            message = `Unhandled effect type: ${effect.type}`; // More specific error
            break;
    }

    return { success, message, primaryTarget };
} 
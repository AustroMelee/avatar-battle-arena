/**
 * @fileoverview Outcome Effect Handlers
 * @description Handlers for all outcome-based effects (KO, conditional KO, self-sabotage, trait toggle, etc.).
 * @version 1.0
 */

"use strict";

import { charactersMarkedForDefeat } from "../engine_curbstomp_manager.js";
import { seededRandom } from "../utils_seeded_random.js";
import { USE_DETERMINISTIC_RANDOM } from "../config_game.js";
import { clamp } from "../utils_math.js";

/**
 * Handles INSTANT_KO effect using unified context.
 * @param {object} ctx - The unified effect context
 * @returns {object} Handler result
 */
export function handleInstantKo(ctx) {
    const { effect, primaryTarget } = ctx;
    
    if (!primaryTarget) {
        return { success: false, message: "Invalid target for instant KO effect." };
    }
    
    charactersMarkedForDefeat.add(primaryTarget.id);
    const message = effect.message || `${primaryTarget.name} is instantly defeated!`;
    
    return { success: true, message };
}

/**
 * Handles CONDITIONAL_KO_OR_MERCY effect using unified context.
 * @param {object} ctx - The unified effect context
 * @returns {object} Handler result
 */
export function handleConditionalKoOrMercy(ctx) {
    const { effect, primaryTarget } = ctx;
    
    if (!primaryTarget) {
        return { success: false, message: "Invalid target for conditional KO or mercy effect." };
    }
    
    if (Math.random() < effect.mercyChance) {
        // Mercy: incapacitate but not kill
        primaryTarget.hp = clamp(primaryTarget.hp - 80, 0, 100);
        primaryTarget.stunDuration = (primaryTarget.stunDuration || 0) + 3;
        const message = effect.mercyMessage || `${primaryTarget.name} is incapacitated, spared by a moment of mercy.`;
        return { success: true, message };
    } else {
        charactersMarkedForDefeat.add(primaryTarget.id);
        const message = effect.successMessage || `${primaryTarget.name} is utterly defeated!`;
        return { success: true, message };
    }
}

/**
 * Handles CONDITIONAL_KO_OR_SELF_SABOTAGE effect using unified context.
 * @param {object} ctx - The unified effect context
 * @returns {object} Handler result
 */
export function handleConditionalKoOrSelfSabotage(ctx) {
    const { effect, actor, primaryTarget } = ctx;
    
    if (!primaryTarget || !actor) {
        return { success: false, message: "Invalid parameters for conditional KO or self-sabotage effect." };
    }
    
    const mercyRoll = (USE_DETERMINISTIC_RANDOM ? seededRandom() : Math.random());
    const hasMercy = effect.mercyChance && mercyRoll < effect.mercyChance;
    
    ctx.addEvent({
        type: "dice_roll",
        rollType: "mercyChance",
        actorId: primaryTarget.id,
        result: mercyRoll,
        threshold: effect.mercyChance,
        outcome: hasMercy ? "mercy granted" : "no mercy"
    });
    
    if (hasMercy) {
        ctx.addEvent({
            type: "narrative_event",
            text: `${primaryTarget.name} miraculously withstands what should have been a fatal blow!`,
            html_content: `<p class="narrative-survivor">${primaryTarget.name} miraculously withstands what should have been a fatal blow!</p>`,
        });
        return { success: true, message: `${primaryTarget.name} survives by mercy!` };
    } else {
        const selfSabotageRoll = (USE_DETERMINISTIC_RANDOM ? seededRandom() : Math.random());
        const isSelfSabotage = effect.selfSabotageChance && selfSabotageRoll < effect.selfSabotageChance;
        
        ctx.addEvent({
            type: "dice_roll",
            rollType: "selfSabotageChance",
            actorId: actor.id,
            result: selfSabotageRoll,
            threshold: effect.selfSabotageChance,
            outcome: isSelfSabotage ? "self sabotage" : "no self sabotage"
        });
        
        if (isSelfSabotage) {
            const selfDamage = Math.floor(primaryTarget.maxHp * 0.3);
            primaryTarget.hp = clamp(primaryTarget.hp - selfDamage, 0, primaryTarget.maxHp);
            ctx.addEvent({
                type: "narrative_event",
                text: effect.selfSabotageMessage || `${actor.name}'s attack backfires, causing self-harm!`,
                html_content: `<p class="narrative-self-sabotage">${actor.name}'s attack backfires!</p>`,
            });
            return { success: true, message: `Attack backfires on ${actor.name}!` };
        } else {
            primaryTarget.hp = 0;
            ctx.addEvent({
                type: "final_blow_event",
                text: effect.successMessage || `${primaryTarget.name} is incapacitated!`,
                html_content: `<p class="final-blow">${primaryTarget.name} is incapacitated!</p>`,
                targetId: primaryTarget.id
            });
            charactersMarkedForDefeat.add(primaryTarget.id);
            return { success: true, message: effect.successMessage || `${primaryTarget.name} is incapacitated!` };
        }
    }
}

/**
 * Handles TRAIT_TOGGLE effect using unified context.
 * @param {object} ctx - The unified effect context
 * @returns {object} Handler result
 */
export function handleTraitToggle(ctx) {
    const { effect, primaryTarget } = ctx;
    
    if (!primaryTarget || !(effect.traitName in primaryTarget)) {
        ctx.log(`Trait '${effect.traitName}' not found on target for TRAIT_TOGGLE effect`, "warn");
        return { success: false, message: `Trait '${effect.traitName}' not found on target.` };
    }
    
    primaryTarget[effect.traitName] = effect.value;
    const message = `${primaryTarget.name}'s trait '${effect.traitName}' is set to ${effect.value}.`;
    
    return { success: true, message };
}

/**
 * Handles APPLY_CURBSTOMP_RULE effect using unified context.
 * @param {object} ctx - The unified effect context
 * @returns {object} Handler result
 */
export function handleApplyCurbstompRule(ctx) {
    const { effect } = ctx;
    
    if (!effect.ruleId) {
        ctx.log("APPLY_CURBSTOMP_RULE requires a ruleId", "warn");
        return { success: false, message: "APPLY_CURBSTOMP_RULE requires a ruleId." };
    }
    
    // Integration with curbstomp manager pending
    const message = `Applying specific curbstomp rule: ${effect.ruleId}. (Integration pending)`;
    return { success: true, message };
} 
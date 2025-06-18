/**
 * @fileoverview Stat Change Configuration
 * @description Configuration for simple stat change handlers and generic stat change logic.
 * @version 1.0
 */

"use strict";

import { modifyMomentum } from "../engine_momentum.js";
import { clamp } from "../utils_math.js";

/**
 * Configuration for simple stat change handlers.
 */
export const statChangeConfig = {
    hp: {
        clampMin: 0,
        clampMax: 100,
        eventType: "hp_change",
        statName: "hp",
        messageTemplate: (name, value, isIncrease) => 
            `${name} ${isIncrease ? "heals" : "takes"} ${Math.abs(value)} ${isIncrease ? "HP" : "damage"}.`
    },
    energy: {
        clampMin: 0,
        clampMax: 100,
        eventType: "energy_change",
        statName: "energy",
        messageTemplate: (name, value) => `${name} energy changes by ${value}.`
    },
    momentum: {
        clampMin: -100,
        clampMax: 100,
        eventType: "momentum_change",
        statName: "momentum",
        messageTemplate: (name, value) => `Momentum for ${name} changes by ${value}.`,
        customHandler: (target, value, ctx) => {
            modifyMomentum(target, value, "Battle effect");
            return target.momentum;
        }
    }
};

/**
 * Generic stat change handler using configuration.
 * @param {object} ctx - The unified effect context
 * @returns {object} Handler result
 */
export function handleStatChange(ctx) {
    const { effect, primaryTarget } = ctx;
    const config = statChangeConfig[effect.stat];
    
    if (!config) {
        ctx.log(`Unknown stat: ${effect.stat}`, "error");
        return { success: false, message: `Unknown stat: ${effect.stat}` };
    }
    
    if (!primaryTarget || typeof primaryTarget[effect.stat] !== "number") {
        return { success: false, message: `Invalid target for ${effect.stat} change effect.` };
    }
    
    const oldValue = primaryTarget[effect.stat];
    let newValue;
    
    if (config.customHandler) {
        newValue = config.customHandler(primaryTarget, effect.value, ctx);
    } else {
        newValue = clamp(oldValue + effect.value, config.clampMin, config.clampMax);
        primaryTarget[effect.stat] = newValue;
    }
    
    const message = config.messageTemplate(primaryTarget.name, effect.value, effect.value > 0);
    ctx.addStatusEvent(config.eventType, oldValue, newValue, config.statName);
    
    return { success: true, message };
} 
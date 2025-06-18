/**
 * @fileoverview Composite Effect Handler
 * @description Handler for composite effects that trigger multiple sub-effects.
 * @version 1.0
 */

"use strict";

import { createEffectContext } from "./context.js";

/**
 * Handles composite effects that trigger multiple sub-effects.
 * @param {object} ctx - The unified effect context
 * @param {Map} effectHandlers - The effect handlers map for looking up sub-effect handlers
 * @returns {object} Handler result
 */
export function handleCompositeEffect(ctx, effectHandlers) {
    const { effect } = ctx;
    const results = [];
    
    if (!effect.effects || !Array.isArray(effect.effects)) {
        ctx.log("Composite effect requires an effects array", "error");
        return { success: false, message: "Invalid composite effect structure" };
    }
    
    ctx.log(`Processing composite effect with ${effect.effects.length} sub-effects`);
    
    for (const subEffect of effect.effects) {
        const handler = effectHandlers.get(subEffect.type);
        if (handler) {
            const subCtx = createEffectContext(
                subEffect, ctx.actor, ctx.target, ctx.primaryTarget, 
                ctx.battleState, ctx.oldValues, ctx.generatedEvents
            );
            
            // For composite effects, we need to pass the handlers map for recursive calls
            const result = handler.length > 1 ? handler(subCtx, effectHandlers) : handler(subCtx);
            results.push(result);
        } else {
            ctx.log(`No handler found for sub-effect type: ${subEffect.type}`, "warn");
            results.push({ success: false, message: `Unknown sub-effect: ${subEffect.type}` });
        }
    }
    
    const allSuccessful = results.every(r => r.success);
    const messages = results.map(r => r.message).filter(Boolean);
    
    return {
        success: allSuccessful,
        message: effect.description || messages.join(" "),
        subResults: results
    };
} 
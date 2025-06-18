/**
 * @fileoverview Consolidated Constants (Compatibility Layer)
 * @description Compatibility layer that re-exports focused constant modules
 * 
 * This module maintains backward compatibility while delegating to focused modules:
 * - Battle system constants (constants_battle.js)
 * - AI decision constants (constants_ai.js)
 * - Environmental constants (constants_environment.js)
 * - Animation constants (constants_animation.js)
 * 
 * @version 2.0.0 - Refactored to modular architecture
 */

"use strict";

// Import from focused modules
import { BATTLE_CONFIG, MENTAL_STATE_CONFIG, EFFECTIVENESS_CONFIG } from "./constants_battle.js";
import { AI_CONFIG } from "./constants_ai.js";
import { ENVIRONMENT_CONFIG, CURBSTOMP_CONFIG } from "./constants_environment.js";
import { ANIMATION_CONFIG } from "./constants_animation.js";

// Re-export all constants for backward compatibility
export { BATTLE_CONFIG, MENTAL_STATE_CONFIG, EFFECTIVENESS_CONFIG } from "./constants_battle.js";
export { AI_CONFIG } from "./constants_ai.js";
export { ENVIRONMENT_CONFIG, CURBSTOMP_CONFIG } from "./constants_environment.js";
export { ANIMATION_CONFIG } from "./constants_animation.js";

// Legacy helper functions for backward compatibility
export function clampValue(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function getPercentage(base, percentage) {
    return (percentage / 100) * base;
}

export function exceedsThreshold(value, threshold, isPercentage = false) {
    if (isPercentage) {
        return (value >= threshold);
    }
    return (value >= threshold);
} 
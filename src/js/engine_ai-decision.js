/**
 * @fileoverview Avatar Battle Arena - AI Decision Engine (Compatibility Layer)
 * @description REFACTORED: This file now serves as a compatibility layer for the modular AI system.
 * The original monolithic implementation has been split into 6 focused modules under js/ai/
 * @version 10.0 - Modular Architecture Migration
 */

// FILE: engine_ai-decision.js
"use strict";

// ===== COMPATIBILITY LAYER =====
// This file maintains backward compatibility while the system transitions to modular AI
// For new code, import directly from js/ai/ modules instead

// Import from the new modular AI system
import { 
    selectMove as selectMoveModular,
    adaptPersonality as adaptPersonalityModular,
    updateAiMemory as updateAiMemoryModular,
    selectFromDistribution as selectFromDistributionModular,
    DEFAULT_PERSONALITY_PROFILE,
    DEFAULT_AI_MEMORY
} from "./ai/index.js";

// Re-export the modular functions for backward compatibility
export const adaptPersonality = adaptPersonalityModular;
export const updateAiMemory = updateAiMemoryModular;
export const selectFromDistribution = selectFromDistributionModular;
export const selectMove = selectMoveModular;

// Export constants for backward compatibility
export { DEFAULT_PERSONALITY_PROFILE, DEFAULT_AI_MEMORY };
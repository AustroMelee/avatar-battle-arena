/**
 * @fileoverview Escalation Engine (Compatibility Layer)
 * @description Compatibility layer that re-exports focused escalation modules
 * 
 * This module maintains backward compatibility while delegating to focused modules:
 * - Incapacitation score calculation (engine_incapacitation_score.js)
 * - Escalation state determination (engine_escalation_states.js)
 * - Damage modifier application (engine_escalation_modifiers.js)
 * - AI weight calculation (engine_escalation_ai.js)
 * 
 * @version 2.0.0 - Refactored to modular architecture
 */

"use strict";

// Import from focused modules
import { INCAPACITATION_SCORE_VERSION, incapacitationScoreWeights, calculateIncapacitationScore } from "./engine_incapacitation_score.js";
import { ESCALATION_STATES, determineEscalationState } from "./engine_escalation_states.js";
import { applyEscalationDamageModifier } from "./engine_escalation_modifiers.js";
import { getEscalationAIWeights } from "./engine_escalation_ai.js";

// Re-export all functions for backward compatibility
export { INCAPACITATION_SCORE_VERSION, incapacitationScoreWeights, calculateIncapacitationScore } from "./engine_incapacitation_score.js";
export { ESCALATION_STATES, determineEscalationState } from "./engine_escalation_states.js";
export { applyEscalationDamageModifier } from "./engine_escalation_modifiers.js";
export { getEscalationAIWeights } from "./engine_escalation_ai.js"; 
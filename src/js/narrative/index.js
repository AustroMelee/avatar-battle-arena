/**
 * @fileoverview Narrative Engine - Modular Export
 * @description Central barrel export for all narrative functionality.
 * @version 2.0
 */

"use strict";

// Export all string substitution functionality
export * from "./stringSubstitution.js";

// Export all quote engine functionality
export * from "./quoteEngine.js";

// Export all action narration functionality
export * from "./actionNarration.js";

// Export all environment narrative functionality
export * from "./environmentNarrative.js";

// Export all escalation narrative functionality
export * from "./escalationNarrative.js";

// Export all curbstomp narrative functionality
export * from "./curbstompNarrative.js";

// Export all victory narrative functionality
export * from "./victoryNarrative.js";

// Export all status change functionality
export * from "./statusChange.js";

// For convenience, also provide namespaced exports for cleaner organization
import * as StringSubstitution from "./stringSubstitution.js";
import * as QuoteEngine from "./quoteEngine.js";
import * as ActionNarration from "./actionNarration.js";
import * as EnvironmentNarrative from "./environmentNarrative.js";
import * as EscalationNarrative from "./escalationNarrative.js";
import * as CurbstompNarrative from "./curbstompNarrative.js";
import * as VictoryNarrative from "./victoryNarrative.js";
import * as StatusChange from "./statusChange.js";

export {
    StringSubstitution,
    QuoteEngine,
    ActionNarration,
    EnvironmentNarrative,
    EscalationNarrative,
    CurbstompNarrative,
    VictoryNarrative,
    StatusChange
}; 
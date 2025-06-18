/**
 * @fileoverview Curbstomp System - Barrel Exports
 * @description Provides both flat and namespaced access to all curbstomp functionality
 * @version 1.0
 */

'use strict';

// --- CORE MODULES ---
export * from './curbstomp_state.js';
export * from './curbstomp_rule_registry.js';
export * from './curbstomp_rule_engine.js';
export * from './curbstomp_victim_selector.js';
export * from './curbstomp_narrative.js';

// --- NAMESPACED EXPORTS ---
import * as CurbstompState from './curbstomp_state.js';
import * as CurbstompRuleRegistry from './curbstomp_rule_registry.js';
import * as CurbstompRuleEngine from './curbstomp_rule_engine.js';
import * as CurbstompVictimSelector from './curbstomp_victim_selector.js';
import * as CurbstompNarrative from './curbstomp_narrative.js';

export {
    CurbstompState,
    CurbstompRuleRegistry,
    CurbstompRuleEngine,
    CurbstompVictimSelector,
    CurbstompNarrative
};

// --- CONVENIENCE RE-EXPORTS ---
// Main API functions most commonly used
export {
    applyCurbstompRules,
    checkCurbstompConditions
} from './curbstomp_rule_engine.js';

export {
    resetCurbstompState
} from './curbstomp_state.js';

export {
    charactersMarkedForDefeat,
    markCharacterForDefeat,
    isCharacterMarkedForDefeat
} from './curbstomp_state.js';

export {
    getAllCurbstompRulesForBattle,
    getCharacterCurbstompRules,
    getLocationCurbstompRules
} from './curbstomp_rule_registry.js'; 
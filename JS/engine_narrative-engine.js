/**
 * @fileoverview Narrative Engine - Compatibility Layer
 * @description This file maintains backward compatibility by re-exporting from the new modular narrative system.
 * @version 3.0 - Modularized
 * @deprecated Use direct imports from js/narrative/ modules for better performance and maintainability
 */

'use strict';

// Re-export all functions from the modular narrative system
export * from './narrative/index.js';

// This file is kept for backward compatibility.
// New code should import directly from:
// - js/narrative/stringSubstitution.js
// - js/narrative/quoteEngine.js
// - js/narrative/actionNarration.js
// - js/narrative/environmentNarrative.js
// - js/narrative/escalationNarrative.js
// - js/narrative/curbstompNarrative.js
// - js/narrative/victoryNarrative.js
// - js/narrative/statusChange.js
// - js/narrative/index.js (for all functions)

console.warn('[Deprecated] engine_narrative-engine.js is deprecated. Please import directly from js/narrative/ modules.');
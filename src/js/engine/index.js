/**
 * @fileoverview Barrel file for the Battle Engine module.
 * @description Exports the public-facing API of the engine, providing a single entry point for other modules.
 */

"use strict";

export { executeBattle } from '../engine_battle-engine-core.js';
export { resolveMove } from '../engine_move-resolution.js';
export { executePlayerAction } from './action_processor.js';
export { calculateHitSuccess } from './accuracy_calculator.js';
export { calculateMoveDamage } from './damage_calculator.js';
export { applyMoveEffects } from './move_applier.js';
export { processPreTurnEffects, processPostTurnEffects, applyStatusEffectsFromMove } from './effects_processor.js';

// Export all phase-related modules
export * from './phases/index.js'; 
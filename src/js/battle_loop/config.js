/**
 * @fileoverview Configuration for the battle loop manager.
 */

"use strict";

/**
 * @typedef {import('../types.js').BattleLoopConfig} BattleLoopConfig
 */

const DEFAULT_MAX_TURNS = 50;
const MIN_MAX_TURNS = 1;
const MAX_MAX_TURNS = 1000;
const DEFAULT_STALEMATE_THRESHOLD = 20;
const MIN_STALEMATE_THRESHOLD = 1;
const MAX_STALEMATE_THRESHOLD = 100;

export const DEFAULT_BATTLE_LOOP_CONFIG = {
    maxTurns: DEFAULT_MAX_TURNS,
    enableDebugLogging: false,
    enableNarrative: true,
    stalemateThreshold: DEFAULT_STALEMATE_THRESHOLD,
    enableCurbstompRules: true,
};

/**
 * Validates and merges the user-provided configuration with defaults.
 * @param {Partial<BattleLoopConfig>} userConfig
 * @returns {BattleLoopConfig}
 */
export function validateAndMergeConfig(userConfig) {
    const config = { ...DEFAULT_BATTLE_LOOP_CONFIG, ...userConfig };

    if (config.maxTurns < MIN_MAX_TURNS || config.maxTurns > MAX_MAX_TURNS) {
        throw new RangeError(`maxTurns must be between ${MIN_MAX_TURNS} and ${MAX_MAX_TURNS}`);
    }
    if (config.stalemateThreshold < MIN_STALEMATE_THRESHOLD || config.stalemateThreshold > MAX_STALEMATE_THRESHOLD) {
        throw new RangeError(`stalemateThreshold must be between ${MIN_STALEMATE_THRESHOLD} and ${MAX_STALEMATE_THRESHOLD}`);
    }

    return config;
} 
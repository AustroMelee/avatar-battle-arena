'use strict';

/**
 * Central configuration file for global game constants and rules.
 * This file consolidates values that might be tweaked for game balance
 * or overall simulation behavior.
 */

// --- Battle Engine Constants ---
export const MAX_TOTAL_TURNS = 50;
export const MIN_TURNS_BEFORE_CURBSTOMP = 15;
export const CURBSTOMP_HP_THRESHOLD = 0.2;
export const CURBSTOMP_MOMENTUM_THRESHOLD = 20; // Example value, adjust as needed
export const MIN_ENERGY_FOR_ACTION = 10;
export const ENERGY_RECOVERY_PER_TURN = 20;
export const MAX_ENERGY = 100;
export const MAX_CONSECUTIVE_STUNS = 3;
export const STUN_RESISTANCE_INCREASE = 0.2; // How much stun resistance increases per stun

// Add other global constants here as they are identified from other files. 
/**
 * @fileoverview Battle System Constants
 * @description Core battle mechanics constants and thresholds
 * @version 1.0
 */

'use strict';

/**
 * Battle System Configuration
 */
export const BATTLE_CONFIG = {
    // Turn limits
    MAX_TOTAL_TURNS: 6,
    MAX_TURN_TIMEOUT_MS: 30000,
    
    // HP and Energy limits
    MAX_HP: 100,
    MAX_ENERGY: 100,
    MIN_HP: 0,
    MIN_ENERGY: 0,
    
    // Critical thresholds
    LOW_HEALTH_THRESHOLD: 0.3,          // 30% HP
    CRITICAL_HEALTH_THRESHOLD: 0.2,     // 20% HP
    HIGH_HEALTH_THRESHOLD: 0.7,         // 70% HP
    
    // Momentum thresholds
    HIGH_MOMENTUM_THRESHOLD: 5,
    CRITICAL_MOMENTUM_THRESHOLD: 8,
    MOMENTUM_DIFFERENCE_SIGNIFICANT: 6,
    
    // Damage thresholds
    SIGNIFICANT_DAMAGE_THRESHOLD: 25,
    MAJOR_DAMAGE_THRESHOLD: 30,
    CRITICAL_DAMAGE_THRESHOLD: 40,
    
    // Move power thresholds
    WEAK_MOVE_POWER_MAX: 30,
    NORMAL_MOVE_POWER_MAX: 60,
    STRONG_MOVE_POWER_MAX: 85,
    FINISHER_MOVE_POWER_MIN: 70,
    
    // Energy costs
    BASIC_MOVE_ENERGY_COST: 10,
    ADVANCED_MOVE_ENERGY_COST: 20,
    FINISHER_MOVE_ENERGY_COST: 30,
    UTILITY_MOVE_ENERGY_COST: 15
};

/**
 * Mental State Configuration
 */
export const MENTAL_STATE_CONFIG = {
    // Stress thresholds
    STRESS_STABLE_MAX: 20,
    STRESS_STRESSED_MAX: 50,
    STRESS_SHAKEN_MAX: 80,
    // Above 80 is 'broken'
    
    // Stress modification values
    CRITICAL_HIT_RECEIVED_STRESS: 15,
    MAJOR_DAMAGE_RECEIVED_STRESS: 10,
    FINISHER_USED_STRESS_REDUCTION: -5,
    EFFECTIVE_MOVE_STRESS_REDUCTION: -3,
    ENVIRONMENTAL_DAMAGE_STRESS: 8,
    
    // Recovery rates
    STRESS_NATURAL_DECAY_PER_TURN: 2,
    STRESS_VICTORY_REDUCTION: 10,
    STRESS_SUCCESSFUL_COUNTER_REDUCTION: 5
};

/**
 * Effectiveness and Power Scaling
 */
export const EFFECTIVENESS_CONFIG = {
    // Multipliers for different effectiveness levels
    CRITICAL_DAMAGE_MULTIPLIER: 1.8,
    STRONG_DAMAGE_MULTIPLIER: 1.4,
    NORMAL_DAMAGE_MULTIPLIER: 1.0,
    WEAK_DAMAGE_MULTIPLIER: 0.6,
    INEFFECTIVE_DAMAGE_MULTIPLIER: 0.3,
    
    // Momentum changes
    CRITICAL_HIT_MOMENTUM_GAIN: 3,
    STRONG_HIT_MOMENTUM_GAIN: 2,
    NORMAL_HIT_MOMENTUM_GAIN: 1,
    WEAK_HIT_MOMENTUM_GAIN: 0,
    MISS_MOMENTUM_LOSS: -1,
    
    // Energy recovery
    CRITICAL_HIT_ENERGY_RECOVERY: 5,
    COUNTER_ATTACK_ENERGY_BONUS: 3
}; 
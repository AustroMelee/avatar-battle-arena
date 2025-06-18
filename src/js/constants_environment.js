/**
 * @fileoverview Environmental System Constants
 * @description Constants for environmental damage, effects, and curbstomp rules
 * @version 1.0
 */

'use strict';

/**
 * Environmental System Constants
 */
export const ENVIRONMENT_CONFIG = {
    // Damage thresholds
    DAMAGE_MINOR_THRESHOLD: 15,
    DAMAGE_MODERATE_THRESHOLD: 35,
    DAMAGE_SEVERE_THRESHOLD: 65,
    DAMAGE_CATASTROPHIC_THRESHOLD: 85,
    MAX_ENVIRONMENTAL_DAMAGE: 100,
    
    // Collateral damage values
    BASIC_COLLATERAL_DAMAGE: 5,
    MODERATE_COLLATERAL_DAMAGE: 10,
    SEVERE_COLLATERAL_DAMAGE: 20,
    EXTREME_COLLATERAL_DAMAGE: 35,
    
    // Environmental impact modifiers
    ENVIRONMENTAL_STRESS_MODIFIER: 1.2,
    MOBILITY_REDUCTION_PER_DAMAGE_TIER: 0.1,
    ACCURACY_REDUCTION_PER_DAMAGE_TIER: 0.05
};

/**
 * Curbstomp System Constants
 */
export const CURBSTOMP_CONFIG = {
    // Trigger chances by severity
    MINOR_CURBSTOMP_CHANCE: 0.05,
    MODERATE_CURBSTOMP_CHANCE: 0.15,
    MAJOR_CURBSTOMP_CHANCE: 0.30,
    CRITICAL_CURBSTOMP_CHANCE: 0.60,
    
    // Damage values
    MINOR_CURBSTOMP_DAMAGE: 15,
    MODERATE_CURBSTOMP_DAMAGE: 25,
    MAJOR_CURBSTOMP_DAMAGE: 40,
    INSTANT_KO_DAMAGE: 100,
    
    // Momentum penalties
    CURBSTOMP_MOMENTUM_PENALTY: 2,
    SELF_SABOTAGE_MOMENTUM_PENALTY: 3,
    BACKFIRE_MOMENTUM_PENALTY: 4,
    
    // Cooldowns and limits
    RULE_COOLDOWN_TURNS: 2,
    MAX_RULES_PER_BATTLE: 3,
    MAX_CONSECUTIVE_APPLICATIONS: 1
}; 
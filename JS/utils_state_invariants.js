/**
 * @fileoverview Avatar Battle Arena - State Invariant Validation System
 * @description NASA-level runtime validation for critical battle state assumptions to prevent silent corruption
 * @version 2.0.0
 */

'use strict';

//# sourceURL=utils_state_invariants.js

// ============================================================================
// TYPE IMPORTS
// ============================================================================

/**
 * @typedef {import('./types.js').Fighter} Fighter
 * @typedef {import('./types.js').BattleState} BattleState
 * @typedef {import('./types.js').PhaseState} PhaseState
 * @typedef {import('./types.js').EnvironmentState} EnvironmentState
 */

/**
 * @typedef {Object} InvariantViolation
 * @description Describes a violated state invariant
 * @property {string} invariantName - Name of violated invariant
 * @property {string} message - Description of violation
 * @property {any} actualValue - Actual value that violated invariant
 * @property {any} expectedValue - Expected value or range
 * @property {string} severity - Severity level ('critical', 'error', 'warning')
 * @property {string} [context] - Additional context about the violation
 * @property {number} timestamp - When the violation was detected
 */

/**
 * @typedef {Object} InvariantConfig
 * @description Configuration for invariant checking behavior
 * @property {boolean} throwOnCritical - Whether to throw on critical violations
 * @property {boolean} throwOnError - Whether to throw on error violations
 * @property {boolean} throwOnWarning - Whether to throw on warning violations
 * @property {boolean} enableHealthChecks - Enable fighter health validation
 * @property {boolean} enableEnergyChecks - Enable fighter energy validation
 * @property {boolean} enableStateChecks - Enable general state validation
 * @property {boolean} enablePhaseChecks - Enable battle phase validation
 * @property {boolean} enableEnvironmentalChecks - Enable environment validation
 * @property {boolean} enableAiChecks - Enable AI state validation
 * @property {boolean} skipInvariantsInProduction - Skip checks in production
 * @property {number} maxViolationsPerCheck - Maximum violations to report per check
 */

/**
 * @typedef {Object} ValidationResult
 * @description Result of validation check
 * @property {boolean} isValid - Whether validation passed
 * @property {InvariantViolation[]} violations - List of violations found
 * @property {number} checkDuration - Time taken for validation in ms
 * @property {string} context - Context where validation was performed
 * @property {number} checkCount - Sequential check number
 */

/**
 * @typedef {Object} InvariantStatistics
 * @description Statistics about invariant checking
 * @property {number} totalChecks - Total number of checks performed
 * @property {number} totalViolations - Total violations detected
 * @property {number} criticalViolations - Critical violations detected
 * @property {number} errorViolations - Error violations detected
 * @property {number} warningViolations - Warning violations detected
 * @property {number} averageCheckDuration - Average check duration in ms
 * @property {Object<string, number>} violationsByType - Violations grouped by type
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/** @type {InvariantConfig} */
const INVARIANT_CONFIG = {
    // Error handling behavior
    throwOnCritical: true,
    throwOnError: false,
    throwOnWarning: false,
    
    // Enable/disable specific invariant categories
    enableHealthChecks: true,
    enableEnergyChecks: true,
    enableStateChecks: true,
    enablePhaseChecks: true,
    enableEnvironmentalChecks: true,
    enableAiChecks: true,
    
    // Performance settings
    skipInvariantsInProduction: false,
    maxViolationsPerCheck: 10
};

/** @type {string[]} */
const VALID_SEVERITIES = ['critical', 'error', 'warning'];

/** @type {string[]} */
const REQUIRED_FIGHTER_PROPERTIES = ['id', 'name', 'hp', 'maxHp', 'energy', 'maxEnergy'];

/** @type {string[]} */
const REQUIRED_BATTLE_STATE_PROPERTIES = ['fighter1', 'fighter2', 'turn', 'events'];

/** @type {number} */
const MIN_HP = 0;

/** @type {number} */
const MAX_HP = 100;

/** @type {number} */
const MIN_ENERGY = 0;

/** @type {number} */
const MAX_ENERGY = 100;

/** @type {number} */
const MIN_TURN = 0;

/** @type {number} */
const MAX_TURN = 1000;

// ============================================================================
// STATE INVARIANT SYSTEM CLASS
// ============================================================================

/**
 * Main State Invariant Assertion System for runtime validation
 * 
 * @class
 * @since 2.0.0
 * @public
 */
class StateInvariantSystem {
    /**
     * Creates a new StateInvariantSystem instance
     * 
     * @param {InvariantConfig} [config={}] - Configuration options
     * 
     * @throws {TypeError} When config is not an object
     * 
     * @since 2.0.0
     * @public
     */
    constructor(config = {}) {
        if (typeof config !== 'object' || config === null) {
            throw new TypeError('StateInvariantSystem: config must be an object');
        }

        /** @type {InvariantConfig} */
        this.config = { ...INVARIANT_CONFIG, ...config };

        /** @type {InvariantViolation[]} */
        this.violations = [];

        /** @type {number} */
        this.checkCount = 0;

        /** @type {boolean} */
        this.isEnabled = true;

        /** @type {number} */
        this.totalCheckDuration = 0;

        /** @type {Object<string, number>} */
        this.violationCounts = {};

        console.debug('[State Invariants] System initialized with config:', this.config);
    }

    /**
     * Assert all battle state invariants
     * 
     * @param {BattleState} battleState - Complete battle state to validate
     * @param {string} [context='unknown'] - Context where validation is called
     * 
     * @returns {ValidationResult} Validation result with violations and metadata
     * 
     * @throws {TypeError} When battleState is not an object
     * @throws {Error} When critical violations are found and throwOnCritical is true
     * 
     * @example
     * // Validate battle state
     * const result = invariantSystem.assertBattleStateInvariants(battleState, 'after_move');
     * if (!result.isValid) {
     *   console.warn('State validation failed:', result.violations);
     * }
     * 
     * @since 2.0.0
     * @public
     */
    assertBattleStateInvariants(battleState, context = 'unknown') {
        // Input validation
        if (!battleState || typeof battleState !== 'object') {
            throw new TypeError('assertBattleStateInvariants: battleState must be an object');
        }

        if (typeof context !== 'string') {
            throw new TypeError('assertBattleStateInvariants: context must be a string');
        }

        if (!this.isEnabled || (this.config as InvariantConfig).skipInvariantsInProduction) {
            return {
                isValid: true,
                violations: [],
                checkDuration: 0,
                context,
                checkCount: this.checkCount
            };
        }

        this.checkCount++;
        /** @type {number} */
        const startTime = performance.now();

        /** @type {InvariantViolation[]} */
        const violations = [];

        try {
            // Core state validation
            if ((this.config as InvariantConfig).enableHealthChecks) {
                violations.push(...this.assertFighterHealthInvariants(battleState));
            }
            
            if ((this.config as InvariantConfig).enableEnergyChecks) {
                violations.push(...this.assertEnergyInvariants(battleState));
            }
            
            if ((this.config as InvariantConfig).enableStateChecks) {
                violations.push(...this.assertGeneralStateInvariants(battleState));
            }
            
            if ((this.config as InvariantConfig).enablePhaseChecks) {
                violations.push(...this.assertPhaseInvariants(battleState));
            }
            
            if ((this.config as InvariantConfig).enableEnvironmentalChecks) {
                violations.push(...this.assertEnvironmentalInvariants(battleState));
            }
            
            if ((this.config as InvariantConfig).enableAiChecks) {
                violations.push(...this.assertAiStateInvariants(battleState));
            }

            // Limit violations if configured
            if ((this.config as InvariantConfig).maxViolationsPerCheck > 0 && violations.length > (this.config as InvariantConfig).maxViolationsPerCheck) {
                violations.splice(this.config.maxViolationsPerCheck);
                violations.push({
                    invariantName: 'max_violations_exceeded',
                    message: `Maximum violations per check exceeded (${this.config.maxViolationsPerCheck})`,
                    actualValue: violations.length,
                    expectedValue: this.config.maxViolationsPerCheck,
                    severity: 'warning',
                    timestamp: Date.now()
                });
            }

            /** @type {number} */
            const endTime = performance.now();
            /** @type {number} */
            const checkDuration = endTime - startTime;
            this.totalCheckDuration += checkDuration;

            /** @type {ValidationResult} */
            const result = {
                isValid: violations.length === 0,
                violations,
                checkDuration,
                context,
                checkCount: this.checkCount
            };

            // Process violations
            if (violations.length > 0) {
                this.handleViolations(violations, context, battleState);
            }

            console.debug(`[State Invariants] Check ${this.checkCount} completed in ${checkDuration.toFixed(2)}ms. Context: ${context}. Violations: ${violations.length}`);

            return result;

        } catch (error) {
            console.error('[State Invariants] Invariant checking failed:', error);
            
            return {
                isValid: false,
                violations: [{
                    invariantName: 'invariant_check_error',
                    message: `Invariant checking failed: ${error.message}`,
                    actualValue: error,
                    expectedValue: 'successful check',
                    severity: 'critical',
                    timestamp: Date.now()
                }],
                checkDuration: performance.now() - startTime,
                context,
                checkCount: this.checkCount
            };
        }
    }

    /**
     * Validate fighter health and HP-related invariants
     * 
     * @param {BattleState} battleState - Battle state to validate
     * 
     * @returns {InvariantViolation[]} List of health-related violations
     * 
     * @private
     * @since 2.0.0
     */
    assertFighterHealthInvariants(battleState) {
        /** @type {InvariantViolation[]} */
        const violations = [];

        if (!battleState.fighter1 || !battleState.fighter2) {
            violations.push({
                invariantName: 'fighters_exist',
                message: 'Both fighters must exist',
                actualValue: { f1: !!battleState.fighter1, f2: !!battleState.fighter2 },
                expectedValue: { f1: true, f2: true },
                severity: 'critical',
                timestamp: Date.now()
            });
            return violations; // Can't check further without fighters
        }

        /** @type {Fighter[]} */
        const fighters = [battleState.fighter1, battleState.fighter2];

        fighters.forEach((fighter, index) => {
            /** @type {string} */
            const fighterName = `fighter${index + 1}`;

            // HP bounds checking
            if (typeof fighter.hp !== 'number' || fighter.hp < MIN_HP || fighter.hp > MAX_HP) {
                violations.push({
                    invariantName: 'hp_bounds',
                    message: `${fighterName} HP must be between ${MIN_HP} and ${MAX_HP}`,
                    actualValue: fighter.hp,
                    expectedValue: `${MIN_HP} <= hp <= ${MAX_HP}`,
                    severity: 'critical',
                    timestamp: Date.now()
                });
            }

            // Max HP consistency
            if (typeof fighter.maxHp !== 'number' || fighter.maxHp <= 0 || fighter.maxHp > MAX_HP) {
                violations.push({
                    invariantName: 'max_hp_valid',
                    message: `${fighterName} maxHp must be a positive number <= ${MAX_HP}`,
                    actualValue: fighter.maxHp,
                    expectedValue: `0 < maxHp <= ${MAX_HP}`,
                    severity: 'error',
                    timestamp: Date.now()
                });
            }

            // HP should not exceed maxHp
            if (typeof fighter.hp === 'number' && typeof fighter.maxHp === 'number' && fighter.hp > fighter.maxHp) {
                violations.push({
                    invariantName: 'hp_not_exceed_max',
                    message: `${fighterName} HP cannot exceed maxHp`,
                    actualValue: { hp: fighter.hp, maxHp: fighter.maxHp },
                    expectedValue: 'hp <= maxHp',
                    severity: 'critical',
                    timestamp: Date.now()
                });
            }
        });

        return violations;
    }

    /**
     * Validate energy-related invariants
     * @param {Object} battleState - Battle state
     * @returns {InvariantViolation[]} List of violations
     */
    assertEnergyInvariants(battleState) {
        const violations = [];
        const fighters = [battleState.fighter1, battleState.fighter2];

        fighters.forEach((fighter, index) => {
            if (!fighter) return;
            
            const fighterName = `fighter${index + 1}`;

            // Energy bounds checking
            if (typeof fighter.energy !== 'number' || fighter.energy < 0 || fighter.energy > 100) {
                violations.push({
                    invariantName: 'energy_bounds',
                    message: `${fighterName} energy must be between 0 and 100`,
                    actualValue: fighter.energy,
                    expectedValue: '0 <= energy <= 100',
                    severity: 'critical'
                });
            }

            // Max energy consistency
            if (typeof fighter.maxEnergy !== 'number' || fighter.maxEnergy <= 0 || fighter.maxEnergy > 100) {
                violations.push({
                    invariantName: 'max_energy_valid',
                    message: `${fighterName} maxEnergy must be a positive number <= 100`,
                    actualValue: fighter.maxEnergy,
                    expectedValue: '0 < maxEnergy <= 100',
                    severity: 'error'
                });
            }

            // Energy should not exceed maxEnergy
            if (fighter.energy > fighter.maxEnergy) {
                violations.push({
                    invariantName: 'energy_not_exceed_max',
                    message: `${fighterName} energy cannot exceed maxEnergy`,
                    actualValue: { energy: fighter.energy, maxEnergy: fighter.maxEnergy },
                    expectedValue: 'energy <= maxEnergy',
                    severity: 'critical'
                });
            }
        });

        return violations;
    }

    /**
     * Validate general state invariants
     * @param {Object} battleState - Battle state
     * @returns {InvariantViolation[]} List of violations
     */
    assertGeneralStateInvariants(battleState) {
        const violations = [];

        // Turn number should be non-negative
        if (typeof battleState.turn !== 'number' || battleState.turn < 0) {
            violations.push({
                invariantName: 'turn_non_negative',
                message: 'Turn number must be non-negative',
                actualValue: battleState.turn,
                expectedValue: 'turn >= 0',
                severity: 'error'
            });
        }

        // Turn number should be reasonable (not infinite)
        if (battleState.turn > 1000) {
            violations.push({
                invariantName: 'turn_reasonable',
                message: 'Turn number exceeds reasonable bounds',
                actualValue: battleState.turn,
                expectedValue: 'turn <= 1000',
                severity: 'warning'
            });
        }

        // Battle should have required properties
        const requiredProperties = ['fighter1', 'fighter2', 'turn'];
        requiredProperties.forEach(prop => {
            if (!(prop in battleState)) {
                violations.push({
                    invariantName: 'required_property',
                    message: `Battle state missing required property: ${prop}`,
                    actualValue: prop in battleState,
                    expectedValue: true,
                    severity: 'critical'
                });
            }
        });

        return violations;
    }

    /**
     * Validate battle phase invariants
     * @param {Object} battleState - Battle state
     * @returns {InvariantViolation[]} List of violations
     */
    assertPhaseInvariants(battleState) {
        const violations = [];

        if (battleState.phaseState) {
            const phase = battleState.phaseState.currentPhase;
            
            // Phase should be valid
            const validPhases = ['Opening', 'Escalation', 'Climax', 'Resolution'];
            if (typeof phase !== 'string' || !validPhases.includes(phase)) {
                violations.push({
                    invariantName: 'valid_phase',
                    message: 'Current phase must be valid',
                    actualValue: phase,
                    expectedValue: validPhases,
                    severity: 'error'
                });
            }

            // Phase turn count should be non-negative
            if (typeof battleState.phaseState.phaseTurnCount !== 'number' || battleState.phaseState.phaseTurnCount < 0) {
                violations.push({
                    invariantName: 'phase_turn_count_valid',
                    message: 'Phase turn count must be non-negative',
                    actualValue: battleState.phaseState.phaseTurnCount,
                    expectedValue: 'phaseTurnCount >= 0',
                    severity: 'error'
                });
            }
        }

        return violations;
    }

    /**
     * Validate environmental state invariants
     * @param {Object} battleState - Battle state
     * @returns {InvariantViolation[]} List of violations
     */
    assertEnvironmentalInvariants(battleState) {
        const violations = [];

        if (battleState.environmentState) {
            const env = battleState.environmentState;

            // Damage level should be non-negative
            if (typeof env.damageLevel !== 'number' || env.damageLevel < 0) {
                violations.push({
                    invariantName: 'damage_level_non_negative',
                    message: 'Environmental damage level must be non-negative',
                    actualValue: env.damageLevel,
                    expectedValue: 'damageLevel >= 0',
                    severity: 'error'
                });
            }

            // Damage level should be reasonable
            if (env.damageLevel > 1000) {
                violations.push({
                    invariantName: 'damage_level_reasonable',
                    message: 'Environmental damage level exceeds reasonable bounds',
                    actualValue: env.damageLevel,
                    expectedValue: 'damageLevel <= 1000',
                    severity: 'warning'
                });
            }

            // Specific impacts should be a Set
            if (env.specificImpacts && !(env.specificImpacts instanceof Set)) {
                violations.push({
                    invariantName: 'specific_impacts_set',
                    message: 'Specific impacts should be a Set',
                    actualValue: typeof env.specificImpacts,
                    expectedValue: 'Set',
                    severity: 'error'
                });
            }
        }

        return violations;
    }

    /**
     * Validate AI state invariants
     * @param {Object} battleState - Battle state
     * @returns {InvariantViolation[]} List of violations
     */
    assertAiStateInvariants(battleState) {
        const violations = [];
        const fighters = [battleState.fighter1, battleState.fighter2];

        fighters.forEach((fighter, index) => {
            if (!fighter) return;
            
            const fighterName = `fighter${index + 1}`;

            // AI log should be an array
            if (fighter.aiLog && !Array.isArray(fighter.aiLog)) {
                violations.push({
                    invariantName: 'ai_log_array',
                    message: `${fighterName} aiLog should be an array`,
                    actualValue: typeof fighter.aiLog,
                    expectedValue: 'Array',
                    severity: 'error'
                });
            }

            // Move history should be an array
            if (fighter.moveHistory && !Array.isArray(fighter.moveHistory)) {
                violations.push({
                    invariantName: 'move_history_array',
                    message: `${fighterName} moveHistory should be an array`,
                    actualValue: typeof fighter.moveHistory,
                    expectedValue: 'Array',
                    severity: 'error'
                });
            }

            // Stun duration should be non-negative
            if (fighter.stunDuration && (typeof fighter.stunDuration !== 'number' || fighter.stunDuration < 0)) {
                violations.push({
                    invariantName: 'stun_duration_non_negative',
                    message: `${fighterName} stunDuration must be non-negative`,
                    actualValue: fighter.stunDuration,
                    expectedValue: 'stunDuration >= 0',
                    severity: 'error'
                });
            }
        });

        return violations;
    }

    /**
     * Handle detected invariant violations
     * @param {InvariantViolation[]} violations - List of violations
     * @param {string} context - Context where violations occurred
     * @param {Object} battleState - Battle state for debugging
     */
    handleViolations(violations, context, battleState) {
        this.violations.push(...violations);

        violations.forEach(violation => {
            const logMessage = `[State Invariants] ${violation.severity.toUpperCase()}: ${violation.invariantName} - ${violation.message} (Context: ${context})`;
            
            switch (violation.severity) {
                case 'critical':
                    console.error(logMessage, { violation, battleState });
                    if (this.config.throwOnCritical) {
                        throw new Error(`Critical invariant violation: ${violation.message}`);
                    }
                    break;
                
                case 'error':
                    console.error(logMessage, { violation });
                    if (this.config.throwOnError) {
                        throw new Error(`Invariant violation: ${violation.message}`);
                    }
                    break;
                
                case 'warning':
                    console.warn(logMessage, { violation });
                    if (this.config.throwOnWarning) {
                        throw new Error(`Invariant warning: ${violation.message}`);
                    }
                    break;
                
                default:
                    console.log(logMessage, { violation });
            }
        });
    }

    /**
     * Get invariant checking statistics
     * @returns {Object} Statistics about invariant checking
     */
    getStatistics() {
        const violationsByType = {};
        const violationsBySeverity = { critical: 0, error: 0, warning: 0 };

        this.violations.forEach(violation => {
            violationsByType[violation.invariantName] = (violationsByType[violation.invariantName] || 0) + 1;
            violationsBySeverity[violation.severity] = (violationsBySeverity[violation.severity] || 0) + 1;
        });

        return {
            totalChecks: this.checkCount,
            totalViolations: this.violations.length,
            violationsByType,
            violationsBySeverity,
            isEnabled: this.isEnabled
        };
    }

    /**
     * Clear all recorded violations
     */
    clearViolations() {
        this.violations = [];
        console.log('[State Invariants] Violation history cleared');
    }

    /**
     * Enable or disable invariant checking
     * @param {boolean} enabled - Whether to enable checking
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        console.log(`[State Invariants] Invariant checking ${enabled ? 'enabled' : 'disabled'}`);
    }
}

// Create global instance
const stateInvariants = new StateInvariantSystem();

// Export convenience functions
export function assertBattleStateInvariants(battleState, context = 'unknown') {
    stateInvariants.assertBattleStateInvariants(battleState, context);
}

export function getInvariantStatistics() {
    return stateInvariants.getStatistics();
}

export function clearInvariantViolations() {
    stateInvariants.clearViolations();
}

export function enableInvariantChecking(enabled = true) {
    stateInvariants.setEnabled(enabled);
}

// Export configuration for customization
export { INVARIANT_CONFIG };

// Export class for advanced usage
export { StateInvariantSystem }; 
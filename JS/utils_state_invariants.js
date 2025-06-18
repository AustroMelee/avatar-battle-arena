/**
 * @fileoverview State Invariant Assertions - NASA-Level Runtime Validation
 * @description Validates critical assumptions about battle state during runtime to prevent
 * silent corruption. Used in spacecraft flight software to validate system state every tick.
 * @version 1.0
 */

'use strict';

//# sourceURL=utils_state_invariants.js

/**
 * @typedef {Object} InvariantViolation
 * @property {string} invariantName - Name of violated invariant
 * @property {string} message - Description of violation
 * @property {*} actualValue - Actual value that violated invariant
 * @property {*} expectedValue - Expected value or range
 * @property {string} severity - Severity level (critical, error, warning)
 */

/**
 * Configuration for invariant checking behavior
 */
const INVARIANT_CONFIG = {
    // Controls whether invariant violations should throw errors or just log
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

/**
 * Main State Invariant Assertion System
 */
class StateInvariantSystem {
    constructor() {
        this.violations = [];
        this.checkCount = 0;
        this.isEnabled = true;
    }

    /**
     * Assert all battle state invariants
     * @param {Object} battleState - Complete battle state to validate
     * @param {string} context - Context where validation is called (e.g., "after_move", "battle_start")
     */
    assertBattleStateInvariants(battleState, context = 'unknown') {
        if (!this.isEnabled || INVARIANT_CONFIG.skipInvariantsInProduction) {
            return;
        }

        this.checkCount++;
        const violations = [];

        try {
            // Clear previous violations for this check
            const startTime = performance.now();

            // Core state validation
            if (INVARIANT_CONFIG.enableHealthChecks) {
                violations.push(...this.assertFighterHealthInvariants(battleState));
            }
            
            if (INVARIANT_CONFIG.enableEnergyChecks) {
                violations.push(...this.assertEnergyInvariants(battleState));
            }
            
            if (INVARIANT_CONFIG.enableStateChecks) {
                violations.push(...this.assertGeneralStateInvariants(battleState));
            }
            
            if (INVARIANT_CONFIG.enablePhaseChecks) {
                violations.push(...this.assertPhaseInvariants(battleState));
            }
            
            if (INVARIANT_CONFIG.enableEnvironmentalChecks) {
                violations.push(...this.assertEnvironmentalInvariants(battleState));
            }
            
            if (INVARIANT_CONFIG.enableAiChecks) {
                violations.push(...this.assertAiStateInvariants(battleState));
            }

            const endTime = performance.now();
            const checkDuration = endTime - startTime;

            // Process violations
            if (violations.length > 0) {
                this.handleViolations(violations, context, battleState);
            }

            console.debug(`[State Invariants] Check ${this.checkCount} completed in ${checkDuration.toFixed(2)}ms. Context: ${context}. Violations: ${violations.length}`);

        } catch (error) {
            console.error('[State Invariants] Invariant checking failed:', error);
            // Don't let invariant checking break the game
        }
    }

    /**
     * Validate fighter health and HP-related invariants
     * @param {Object} battleState - Battle state
     * @returns {InvariantViolation[]} List of violations
     */
    assertFighterHealthInvariants(battleState) {
        const violations = [];

        if (!battleState.fighter1 || !battleState.fighter2) {
            violations.push({
                invariantName: 'fighters_exist',
                message: 'Both fighters must exist',
                actualValue: { f1: !!battleState.fighter1, f2: !!battleState.fighter2 },
                expectedValue: { f1: true, f2: true },
                severity: 'critical'
            });
            return violations; // Can't check further without fighters
        }

        const fighters = [battleState.fighter1, battleState.fighter2];

        fighters.forEach((fighter, index) => {
            const fighterName = `fighter${index + 1}`;

            // HP bounds checking
            if (typeof fighter.hp !== 'number' || fighter.hp < 0 || fighter.hp > 100) {
                violations.push({
                    invariantName: 'hp_bounds',
                    message: `${fighterName} HP must be between 0 and 100`,
                    actualValue: fighter.hp,
                    expectedValue: '0 <= hp <= 100',
                    severity: 'critical'
                });
            }

            // Max HP consistency
            if (typeof fighter.maxHp !== 'number' || fighter.maxHp <= 0 || fighter.maxHp > 100) {
                violations.push({
                    invariantName: 'max_hp_valid',
                    message: `${fighterName} maxHp must be a positive number <= 100`,
                    actualValue: fighter.maxHp,
                    expectedValue: '0 < maxHp <= 100',
                    severity: 'error'
                });
            }

            // HP should not exceed maxHp
            if (fighter.hp > fighter.maxHp) {
                violations.push({
                    invariantName: 'hp_not_exceed_max',
                    message: `${fighterName} HP cannot exceed maxHp`,
                    actualValue: { hp: fighter.hp, maxHp: fighter.maxHp },
                    expectedValue: 'hp <= maxHp',
                    severity: 'critical'
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
                    if (INVARIANT_CONFIG.throwOnCritical) {
                        throw new Error(`Critical invariant violation: ${violation.message}`);
                    }
                    break;
                
                case 'error':
                    console.error(logMessage, { violation });
                    if (INVARIANT_CONFIG.throwOnError) {
                        throw new Error(`Invariant violation: ${violation.message}`);
                    }
                    break;
                
                case 'warning':
                    console.warn(logMessage, { violation });
                    if (INVARIANT_CONFIG.throwOnWarning) {
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
/**
 * @fileoverview Avatar Battle Arena - State Invariant Validation System
 * @description NASA-level runtime validation for critical battle state assumptions to prevent silent corruption
 * @version 2.1.0
 */

"use strict";

// ============================================================================
// TYPE IMPORTS
// ============================================================================
/**
 * @typedef {import('./utils/validation/invariants/types.js').InvariantViolation} InvariantViolation
 * @typedef {import('./utils/validation/invariants/types.js').InvariantConfig} InvariantConfig
 * @typedef {import('./utils/validation/invariants/types.js').ValidationResult} ValidationResult
 * @typedef {import('./types/battle.js').BattleState} BattleState
 */

import { INVARIANT_CONFIG } from "./utils/validation/invariants/types.js";
import * as invariantChecks from "./utils/validation/invariants/index.js";


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
        if (typeof config !== "object" || config === null) {
            throw new TypeError("StateInvariantSystem: config must be an object");
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

        console.debug("[State Invariants] System initialized with config:", this.config);
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
     */
    assertBattleStateInvariants(battleState, context = "unknown") {
        if (!battleState || typeof battleState !== "object") {
            throw new TypeError("assertBattleStateInvariants: battleState must be an object");
        }
        if (typeof context !== "string") {
            throw new TypeError("assertBattleStateInvariants: context must be a string");
        }

        if (!this.isEnabled || this.config.skipInvariantsInProduction) {
            return { isValid: true, violations: [], checkDuration: 0, context, checkCount: this.checkCount };
        }

        this.checkCount++;
        const startTime = performance.now();
        const violations = [];

        try {
            if (this.config.enableHealthChecks) {
                violations.push(...invariantChecks.assertFighterHealthInvariants(battleState));
            }
            if (this.config.enableEnergyChecks) {
                violations.push(...invariantChecks.assertEnergyInvariants(battleState));
            }
            if (this.config.enableStateChecks) {
                violations.push(...invariantChecks.assertGeneralStateInvariants(battleState));
            }
            if (this.config.enablePhaseChecks) {
                violations.push(...invariantChecks.assertPhaseInvariants(battleState));
            }
            if (this.config.enableEnvironmentalChecks) {
                violations.push(...invariantChecks.assertEnvironmentalInvariants(battleState));
            }
            if (this.config.enableAiChecks) {
                violations.push(...invariantChecks.assertAiStateInvariants(battleState));
            }

            if (this.config.maxViolationsPerCheck > 0 && violations.length > this.config.maxViolationsPerCheck) {
                violations.splice(this.config.maxViolationsPerCheck);
                violations.push({
                    invariantName: "max_violations_exceeded",
                    message: `Maximum violations per check exceeded (${this.config.maxViolationsPerCheck})`,
                    actualValue: violations.length,
                    expectedValue: this.config.maxViolationsPerCheck,
                    severity: "warning",
                    timestamp: Date.now()
                });
            }

            const endTime = performance.now();
            const checkDuration = endTime - startTime;
            this.totalCheckDuration += checkDuration;

            const result = {
                isValid: violations.length === 0,
                violations,
                checkDuration,
                context,
                checkCount: this.checkCount
            };

            if (violations.length > 0) {
                this.handleViolations(violations, context, battleState);
            }

            console.debug(`[State Invariants] Check ${this.checkCount} completed in ${checkDuration.toFixed(2)}ms. Context: ${context}. Violations: ${violations.length}`);

            return result;

        } catch (error) {
            console.error("[State Invariants] Invariant checking failed:", error);
            
            return {
                isValid: false,
                violations: [{
                    invariantName: "invariant_check_error",
                    message: `Invariant checking failed: ${error.message}`,
                    actualValue: error,
                    expectedValue: "successful check",
                    severity: "critical",
                    timestamp: Date.now()
                }],
                checkDuration: performance.now() - startTime,
                context,
                checkCount: this.checkCount
            };
        }
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
                case "critical":
                    console.error(logMessage, { violation, battleState });
                    if (this.config.throwOnCritical) {
                        throw new Error(`Critical invariant violation: ${violation.message}`);
                    }
                    break;
                case "error":
                    console.error(logMessage, { violation });
                    if (this.config.throwOnError) {
                        throw new Error(`Invariant violation: ${violation.message}`);
                    }
                    break;
                case "warning":
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
            if (violationsBySeverity[violation.severity] !== undefined) {
                violationsBySeverity[violation.severity]++;
            }
        });

        return {
            totalChecks: this.checkCount,
            totalViolations: this.violations.length,
            violationsByType,
            violationsBySeverity,
            isEnabled: this.isEnabled,
            averageCheckDuration: this.checkCount > 0 ? this.totalCheckDuration / this.checkCount : 0,
        };
    }

    /**
     * Clear all recorded violations
     */
    clearViolations() {
        this.violations = [];
        console.log("[State Invariants] Violation history cleared");
    }

    /**
     * Enable or disable invariant checking
     * @param {boolean} enabled - Whether to enable checking
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        console.log(`[State Invariants] Invariant checking ${enabled ? "enabled" : "disabled"}`);
    }
}

// Create global instance
const stateInvariants = new StateInvariantSystem();

// Export convenience functions
export function assertBattleStateInvariants(battleState, context = "unknown") {
    return stateInvariants.assertBattleStateInvariants(battleState, context);
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
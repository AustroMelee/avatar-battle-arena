/**
 * @fileoverview Analyzes the environmental impact on a battle.
 */

"use strict";

import { locationConditions } from "../../location-battle-conditions.js";

/**
 * @typedef {import('../../types/battle.js').EnvironmentState} EnvironmentState
 * @typedef {import('../../types/ui_analysis.js').EnvironmentAnalysis} EnvironmentAnalysis
 */

/**
 * Analyzes the environmental impact on the battle.
 * @param {EnvironmentState} environmentState
 * @param {string} locationId
 * @returns {EnvironmentAnalysis}
 */
export function analyzeEnvironmentalImpact(environmentState, locationId) {
    const location = locationConditions[locationId] || { name: "Unknown Location", effects: [] };
    const significantEffects = environmentState?.activeEffects?.map(e => e.name) || [];
    
    // Placeholder for more sophisticated impact calculation
    const environmentalImpact = significantEffects.length * 10;

    return {
        locationId,
        locationName: location.name,
        significantEffects,
        environmentalImpact,
        summary: `The environment played a ${environmentalImpact > 50 ? "major" : "minor"} role.`,
    };
} 
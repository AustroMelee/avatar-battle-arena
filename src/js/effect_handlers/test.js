/**
 * @fileoverview Effect Handler Testing System
 * @description Automated testing framework for all effect handlers.
 * @version 1.0
 */

"use strict";

import { createMockContext } from "./context.js";

/**
 * Tests an effect handler with mock data.
 * @param {string} effectType - The effect type to test
 * @param {Map} effectHandlers - The effect handlers map
 * @param {object} customEffect - Custom effect data for testing
 * @returns {object} Test result
 */
export function testEffectHandler(effectType, effectHandlers, customEffect = {}) {
    const handler = effectHandlers.get(effectType);
    if (!handler) {
        return { success: false, error: `No handler found for effect type: ${effectType}` };
    }
    
    try {
        const mockContext = createMockContext(effectType, customEffect);
        
        // Handle composite effects differently (they need the handlers map)
        const result = handler.length > 1 ? handler(mockContext, effectHandlers) : handler(mockContext);
        
        return { 
            success: true, 
            result, 
            events: mockContext.generatedEvents,
            finalState: mockContext.primaryTarget 
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Runs automated tests on all registered effect handlers.
 * @param {Map} effectHandlers - The effect handlers map
 * @returns {object} Test results summary
 */
export function runAllEffectHandlerTests(effectHandlers) {
    console.log("[Effect Handlers] Running automated tests on all handlers...");
    const results = {};
    let passed = 0;
    let failed = 0;
    
    for (const effectType of effectHandlers.keys()) {
        if (effectType === "COMPOSITE_EFFECT") continue; // Skip composite for auto-testing
        
        const testResult = testEffectHandler(effectType, effectHandlers);
        results[effectType] = testResult;
        
        if (testResult.success) {
            passed++;
            console.log(`✓ ${effectType}: PASSED`);
        } else {
            failed++;
            console.error(`✗ ${effectType}: FAILED - ${testResult.error}`);
        }
    }
    
    console.log(`[Effect Handlers] Test Summary: ${passed} passed, ${failed} failed`);
    return { results, summary: { passed, failed, total: passed + failed } };
}

/**
 * Runs a specific test suite for an effect type with multiple scenarios.
 * @param {string} effectType - The effect type to test
 * @param {Map} effectHandlers - The effect handlers map
 * @param {Array} testScenarios - Array of test scenarios with custom effects
 * @returns {object} Detailed test results
 */
export function runEffectTestSuite(effectType, effectHandlers, testScenarios = []) {
    console.log(`[Effect Testing] Running test suite for ${effectType}...`);
    const results = [];
    
    // Default test scenario
    results.push({
        scenario: "default",
        result: testEffectHandler(effectType, effectHandlers)
    });
    
    // Custom test scenarios
    testScenarios.forEach((scenario, index) => {
        results.push({
            scenario: scenario.name || `scenario_${index}`,
            result: testEffectHandler(effectType, effectHandlers, scenario.effect)
        });
    });
    
    const passed = results.filter(r => r.result.success).length;
    const failed = results.length - passed;
    
    console.log(`[Effect Testing] ${effectType} test suite: ${passed}/${results.length} passed`);
    
    return {
        effectType,
        results,
        summary: { passed, failed, total: results.length }
    };
} 
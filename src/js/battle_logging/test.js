/**
 * @fileoverview Basic Test for Battle Logging System
 * @description Simple tests to verify the modular logging system works
 */

"use strict";

// Test the new modular system
import { 
    createAndLogEvent, 
    createAndLogRoll, 
    createAndLogPerformance,
    EVENT_TYPES,
    ROLL_TYPES,
    toHTML,
    toBattleSummary
} from "./index.js";

// Test compatibility layer
import { 
    generateLogEvent as legacyGenerateLogEvent,
    logRoll as legacyLogRoll
} from "../utils_log_event.js";

/**
 * Simple test runner
 */
function runTests() {
    console.log("🧪 Running Battle Logging System Tests...\n");
    
    const battleLog = [];
    const mockBattleState = {
        turn: 1,
        currentPhase: "opening",
        environmentState: { environmentalImpactCount: 0 }
    };
    
    try {
        // Test 1: Basic event creation
        console.log("Test 1: Basic Event Creation");
        const basicEvent = createAndLogEvent(battleLog, mockBattleState, {
            type: EVENT_TYPES.DAMAGE,
            actorId: "aang",
            text: "Aang takes 15 damage",
            damage: 15
        });
        console.log("✅ Basic event created:", basicEvent.eventId);
        
        // Test 2: Dice roll event
        console.log("\nTest 2: Dice Roll Event");
        const rollEvent = createAndLogRoll(battleLog, mockBattleState, {
            rollType: ROLL_TYPES.CRIT_CHECK,
            actorId: "azula",
            roll: 0.95,
            threshold: 0.9,
            outcome: "success",
            moveName: "Blue Fire Blast"
        });
        console.log("✅ Roll event created:", rollEvent.eventId);
        
        // Test 3: Performance tracking
        console.log("\nTest 3: Performance Event");
        const perfEvent = createAndLogPerformance(battleLog, mockBattleState, "Test Operation", 42.5);
        console.log("✅ Performance event created:", perfEvent.eventId);
        
        // Test 4: HTML formatting
        console.log("\nTest 4: HTML Formatting");
        const html = toHTML(battleLog, { includeMajorOnly: false });
        console.log("✅ HTML generated:", html.length, "characters");
        
        // Test 5: Battle summary
        console.log("\nTest 5: Battle Summary");
        const summary = toBattleSummary(battleLog);
        console.log("✅ Summary generated:", Object.keys(summary.eventsByType));
        
        // Test 6: Compatibility layer
        console.log("\nTest 6: Compatibility Layer");
        const legacyEvent = legacyGenerateLogEvent(mockBattleState, {
            type: "test_legacy",
            text: "Legacy compatibility test"
        });
        console.log("✅ Legacy event created:", legacyEvent.eventId);
        
        console.log("\n🎉 All tests passed! Battle Logging System is working correctly.");
        console.log(`📊 Total events logged: ${battleLog.length}`);
        
    } catch (error) {
        console.error("❌ Test failed:", error.message);
        console.error(error.stack);
    }
}

// Run tests if this file is executed directly
if (typeof window === "undefined") {
    runTests();
}

export { runTests }; 
/**
 * @fileoverview Example Usage of Modular Debug System
 * @description Demonstrates different ways to use the modular debug utilities
 */

"use strict";

// Example 1: Using the main DebugUtils class
import { DebugUtils } from "./debugUtils.js";

const debug = new DebugUtils();

// Simulate a battle result for testing
const mockBattleResult = {
    log: [
        { type: "action", actorId: "aang", turnNumber: 1 },
        { type: "damage", actorId: "azula", turnNumber: 2 },
        { type: "phase_header_event", phaseKey: "escalation", turnNumber: 3 }
    ],
    winnerId: "aang",
    finalState: {
        fighter1: {
            name: "Aang",
            hp: 85,
            energy: 70,
            momentum: 15,
            moveHistory: [{ effectiveness: "effective" }, { effectiveness: "super_effective" }]
        },
        fighter2: {
            name: "Azula",
            hp: 45,
            energy: 60,
            momentum: 8,
            moveHistory: [{ effectiveness: "not_very_effective" }]
        }
    }
};

// Analyze the battle
debug.analyzeBattle(mockBattleResult);

// Take a memory snapshot
debug.takeMemorySnapshot();

// Generate and export a report
const report = debug.generateReport();
console.log("Report generated, see below:");
console.log(report);

// Example 2: Using individual modules
import { analyzeBattle } from "./battleAnalysis.js";
import { takeMemorySnapshot } from "./performanceTracking.js";
import { generateReport } from "./reporting.js";

// Use individual functions
analyzeBattle(mockBattleResult);
takeMemorySnapshot([]);
generateReport({ log: [], errorLog: [], performanceMetrics: [], memorySnapshots: [] });

// Example 3: Using namespaced imports
import { BattleAnalysis, PerformanceTracking } from "./index.js";

BattleAnalysis.analyzeBattle(mockBattleResult);
PerformanceTracking.takeMemorySnapshot([]);

// Example 4: Quick analysis helper
import { quickAnalyzeBattle } from "./index.js";

quickAnalyzeBattle(mockBattleResult);

console.log("✅ All example usage patterns completed successfully"); 
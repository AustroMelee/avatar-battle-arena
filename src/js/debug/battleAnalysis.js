/**
 * @fileoverview Battle Analysis Module for Debug Utilities
 * @description Specialized functions for analyzing battle results and performance
 * @version 1.0.0
 */

"use strict";

/**
 * Analyzes a complete battle result with detailed breakdown.
 * 
 * @param {Object} battleResult - Complete battle result object
 * @param {Array} battleResult.log - Battle event log
 * @param {Object} battleResult.finalState - Final character states
 * @param {string} battleResult.winnerId - Winner character ID
 * 
 * @example
 * const result = simulateBattle('aang', 'azula', 'fire-nation-capital', 'noon');
 * analyzeBattle(result);
 */
export function analyzeBattle(battleResult) {
    console.group("🔍 Battle Analysis");
    
    // Basic battle info
    console.log("📊 Battle Overview");
    console.log(`Winner: ${battleResult.winnerId || "Draw"}`);
    console.log(`Total Events: ${battleResult.log.length}`);
    console.log(`Battle Duration: ${calculateBattleDuration(battleResult.log)}ms`);
    
    // Event type breakdown
    analyzeEventTypes(battleResult.log);
    
    // Character performance
    analyzeCharacterPerformance(battleResult);
    
    // Phase analysis
    analyzePhases(battleResult.log);
    
    // Performance metrics
    analyzePerformance(battleResult.log);
    
    console.groupEnd();
}

/**
 * Analyzes event types and frequencies in the battle log.
 * 
 * @param {Array} battleLog - Array of battle events
 */
export function analyzeEventTypes(battleLog) {
    console.log("📈 Event Type Analysis");
    
    const eventTypes = {};
    const actorActions = {};
    const phaseEvents = {};
    
    battleLog.forEach(event => {
        // Count event types
        eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
        
        // Count actions by actor
        if (event.actorId) {
            actorActions[event.actorId] = (actorActions[event.actorId] || 0) + 1;
        }
        
        // Count events by phase
        if (event.phase) {
            phaseEvents[event.phase] = (phaseEvents[event.phase] || 0) + 1;
        }
    });
    
    console.table(eventTypes);
    console.table(actorActions);
    console.table(phaseEvents);
}

/**
 * Analyzes character performance metrics.
 * 
 * @param {Object} battleResult - Complete battle result
 */
export function analyzeCharacterPerformance(battleResult) {
    console.log("⚔️ Character Performance");
    
    const { finalState } = battleResult;
    
    Object.entries(finalState).forEach(([key, fighter]) => {
        if (key.startsWith("fighter")) {
            console.group(`${fighter.name} Performance`);
            console.log(`Final HP: ${fighter.hp}/100`);
            console.log(`Final Energy: ${fighter.energy}/100`);
            console.log(`Final Momentum: ${fighter.momentum}`);
            console.log(`Moves Used: ${fighter.moveHistory?.length || 0}`);
            console.log(`Mental State: ${fighter.mentalState?.level || "unknown"}`);
            
            // Analyze move effectiveness
            if (fighter.moveHistory && fighter.moveHistory.length > 0) {
                const effectiveness = {};
                fighter.moveHistory.forEach(move => {
                    effectiveness[move.effectiveness] = (effectiveness[move.effectiveness] || 0) + 1;
                });
                console.log("Move Effectiveness:", effectiveness);
            }
            
            console.groupEnd();
        }
    });
}

/**
 * Analyzes battle phases and transitions.
 * 
 * @param {Array} battleLog - Array of battle events
 */
export function analyzePhases(battleLog) {
    console.log("🔄 Phase Analysis");
    
    const phaseTransitions = battleLog.filter(event => event.type === "phase_header_event");
    const phaseDurations = {};
    
    let currentPhase = "opening";
    let phaseStartTurn = 0;
    
    phaseTransitions.forEach(transition => {
        const duration = transition.turnNumber - phaseStartTurn;
        phaseDurations[currentPhase] = duration;
        
        currentPhase = transition.phaseKey;
        phaseStartTurn = transition.turnNumber;
    });
    
    // Add final phase duration
    const lastTurn = Math.max(...battleLog.map(e => e.turnNumber || 0));
    phaseDurations[currentPhase] = lastTurn - phaseStartTurn;
    
    console.table(phaseDurations);
}

/**
 * Analyzes performance metrics from the battle.
 * 
 * @param {Array} battleLog - Array of battle events
 */
export function analyzePerformance(battleLog) {
    console.log("⚡ Performance Analysis");
    
    const performanceEvents = battleLog.filter(e => e.type === "performance");
    
    if (performanceEvents.length === 0) {
        console.log("No performance events found");
        return;
    }
    
    const operations = {};
    let totalDuration = 0;
    let slowOperations = 0;
    
    performanceEvents.forEach(event => {
        const op = event.operation;
        if (!operations[op]) {
            operations[op] = { count: 0, totalTime: 0, maxTime: 0 };
        }
        
        operations[op].count++;
        operations[op].totalTime += event.duration;
        operations[op].maxTime = Math.max(operations[op].maxTime, event.duration);
        
        totalDuration += event.duration;
        
        if (event.duration > 100) {
            slowOperations++;
        }
    });
    
    // Calculate averages
    Object.keys(operations).forEach(op => {
        operations[op].avgTime = operations[op].totalTime / operations[op].count;
    });
    
    console.table(operations);
    console.log(`Total Performance Time: ${totalDuration.toFixed(2)}ms`);
    console.log(`Slow Operations (>100ms): ${slowOperations}`);
}

/**
 * Calculates the total duration of a battle from event timestamps.
 * 
 * @param {Array} battleLog - Array of battle events
 * @returns {number} Battle duration in milliseconds
 */
export function calculateBattleDuration(battleLog) {
    if (battleLog.length === 0) return 0;
    
    const timestamps = battleLog
        .map(e => e.performanceTimestamp)
        .filter(t => typeof t === "number");
    
    if (timestamps.length === 0) return 0;
    
    return Math.max(...timestamps) - Math.min(...timestamps);
} 
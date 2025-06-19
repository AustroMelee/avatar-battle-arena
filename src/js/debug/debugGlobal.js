/**
 * @fileoverview Global Debug Utilities Attachment for Avatar Battle Arena
 * @description Attaches debug utilities to global window object and provides dev shortcuts
 * @version 1.0.0
 */

// @ts-nocheck
"use strict";

import { DebugUtils } from "./debugUtils.js";
import { DEBUG_CONFIG } from "./debugConfig.js";

/**
 * Initialize and attach debug utilities to the global window object.
 * Only available in development builds.
 */
function initializeGlobalDebug() {
    // Check if we're in a development environment
    const isDevelopment = DEBUG_CONFIG.enableConsoleLogging;
    
    if (!isDevelopment) {
        console.log("[Debug Global] Debug utilities disabled in production mode");
        return;
    }

    // Create global debug instance
    if (typeof window !== "undefined") {
        window.DEBUG = new DebugUtils();
        
        // Add convenience methods to window for quick access
        window.DEBUG_QUICK = {
            // Battle analysis shortcuts
            analyze: (battleResult) => window.DEBUG.analyzeBattle(battleResult),
            performance: () => window.DEBUG.analyzePerformanceMetrics(),
            errors: () => window.DEBUG.analyzeErrors(),
            
            // Memory monitoring shortcuts
            memory: () => window.DEBUG.takeMemorySnapshot(),
            startMemory: (interval) => window.DEBUG.startMemoryMonitoring(interval),
            stopMemory: () => window.DEBUG.stopMemoryMonitoring(),
            
            // Export shortcuts
            export: (filename) => window.DEBUG.exportDebugData(filename),
            exportCSV: (filename) => window.DEBUG.exportPerformanceCSV(filename),
            
            // Data management shortcuts
            clear: () => window.DEBUG.clearDebugData(),
            status: () => window.DEBUG.getStatus(),
            
            // Utility shortcuts
            log: (message, level, data) => window.DEBUG.log(message, level, data),
            measure: (fn, label) => window.DEBUG.measureExecutionTime(fn, label)
        };
        
        // Console introduction
        console.log("%c🔧 Avatar Battle Arena Debug Utilities Loaded", "font-weight: bold; color: #00ff00;");
        console.log("%cVersion 1.0.0 - Modular Debug System", "color: #888;");
        console.log("");
        console.log("Available commands:");
        console.log("%c  DEBUG.analyzeBattle(result)%c - Analyze battle results", "color: #00aaff;", "color: inherit;");
        console.log("%c  DEBUG.generateReport()%c - Generate debug report", "color: #00aaff;", "color: inherit;");
        console.log("%c  DEBUG.exportDebugData()%c - Export debug data", "color: #00aaff;", "color: inherit;");
        console.log("%c  DEBUG.clearDebugData()%c - Clear all debug data", "color: #00aaff;", "color: inherit;");
        console.log("");
        console.log("Quick shortcuts (DEBUG_QUICK):");
        console.log("%c  DEBUG_QUICK.analyze(result)%c - Quick battle analysis", "color: #ffaa00;", "color: inherit;");
        console.log("%c  DEBUG_QUICK.performance()%c - Quick performance analysis", "color: #ffaa00;", "color: inherit;");
        console.log("%c  DEBUG_QUICK.memory()%c - Take memory snapshot", "color: #ffaa00;", "color: inherit;");
        console.log("%c  DEBUG_QUICK.export()%c - Quick export", "color: #ffaa00;", "color: inherit;");
        console.log("%c  DEBUG_QUICK.status()%c - System status", "color: #ffaa00;", "color: inherit;");
        console.log("");
        console.log("For full API documentation, see the individual module files.");
        
        // Add keyboard shortcuts for common operations
        setupKeyboardShortcuts();
        
        // Set up automatic memory monitoring in development
        if (DEBUG_CONFIG.enableMemoryTracking) {
            console.log("[Debug Global] Starting automatic memory monitoring...");
            window.DEBUG.startMemoryMonitoring(10000); // Every 10 seconds
        }
        
        console.log("[Debug Global] Global debug utilities initialized successfully");
    } else {
        console.warn("[Debug Global] Window object not available - running in non-browser environment");
    }
}

/**
 * Sets up keyboard shortcuts for common debug operations.
 * @private
 */
function setupKeyboardShortcuts() {
    if (typeof document === "undefined") return;
    
    document.addEventListener("keydown", (event) => {
        // Ctrl+Shift+D: Quick debug status
        if (event.ctrlKey && event.shiftKey && event.key === "D") {
            event.preventDefault();
            console.log("🔧 Debug Status:", window.DEBUG.getStatus());
        }
        
        // Ctrl+Shift+M: Take memory snapshot
        if (event.ctrlKey && event.shiftKey && event.key === "M") {
            event.preventDefault();
            const snapshot = window.DEBUG.takeMemorySnapshot();
            console.log("📸 Memory Snapshot:", snapshot);
        }
        
        // Ctrl+Shift+E: Export debug data
        if (event.ctrlKey && event.shiftKey && event.key === "E") {
            event.preventDefault();
            window.DEBUG.exportDebugData();
        }
        
        // Ctrl+Shift+C: Clear debug data
        if (event.ctrlKey && event.shiftKey && event.key === "C") {
            event.preventDefault();
            window.DEBUG.clearDebugData();
            console.log("🗑️ Debug data cleared");
        }
    });
    
    console.log("[Debug Global] Keyboard shortcuts registered:");
    console.log("  Ctrl+Shift+D - Debug status");
    console.log("  Ctrl+Shift+M - Memory snapshot");
    console.log("  Ctrl+Shift+E - Export data");
    console.log("  Ctrl+Shift+C - Clear data");
}

/**
 * Clean up global debug utilities.
 * Should be called when shutting down the application.
 */
function cleanupGlobalDebug() {
    if (typeof window !== "undefined" && window.DEBUG) {
        window.DEBUG.destroy();
        delete window.DEBUG;
        delete window.DEBUG_QUICK;
        console.log("[Debug Global] Global debug utilities cleaned up");
    }
}

// Auto-initialize when this module is imported
initializeGlobalDebug();

// Cleanup on page unload
if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", cleanupGlobalDebug);
}

// Export functions for manual control
export { initializeGlobalDebug, cleanupGlobalDebug }; 
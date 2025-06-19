// @ts-nocheck
"use strict";

/**
 * @fileoverview Debug Utilities for Avatar Battle Arena - Compatibility Layer
 * @description Legacy compatibility layer for the modular debug system
 * 
 * This file now serves as a compatibility layer that imports from the modular debug system.
 * For new development, consider importing from the modular system directly:
 * 
 * - import { DebugUtils } from './debug/debugUtils.js';
 * - import './debug/debugGlobal.js'; // For global DEBUG object
 * - import { analyzeBattle } from './debug/battleAnalysis.js';
 * 
 * @version 2.0.0 (Modular)
 * @author Battle Arena Development Team
 * @since 1.0.0
 * @deprecated Consider using the modular debug system directly
 */

console.log("[Debug Utilities] Loading modular debug system...");

// Import the modular debug system
import { DebugUtils } from "./debug/debugUtils.js";
import "./debug/debugGlobal.js"; // This auto-initializes the global DEBUG object

// Export the DebugUtils class for backward compatibility
export { DebugUtils };

// Legacy global configuration (maintained for compatibility)
// The actual configuration is now in ./debug/debugConfig.js
window.DEBUG_CONFIG = {
    enableConsoleLogging: true,
    enablePerformanceTracking: true,
    enableMemoryTracking: true,
    enableErrorTracking: true,
    logLevel: "debug", // 'debug', 'info', 'warn', 'error'
    maxLogEntries: 1000
};

console.log("[Debug Utilities] ✅ Modular debug system loaded successfully");
console.log("[Debug Utilities] ⚠️ This compatibility layer is deprecated. Consider using:");
console.log("[Debug Utilities]   - import { DebugUtils } from \"./debug/debugUtils.js\";");
console.log("[Debug Utilities]   - import \"./debug/debugGlobal.js\"; // For global DEBUG");
console.log("[Debug Utilities]   - import { analyzeBattle } from \"./debug/battleAnalysis.js\";");

// Note: The global DEBUG object is automatically available via debugGlobal.js
// All the original functionality is preserved but now comes from the modular system 
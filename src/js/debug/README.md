# Debug Module

## Overview

The Debug module provides a comprehensive, modular toolkit for introspection, analysis, and debugging of the Avatar Battle Arena application. It is designed for developers to monitor performance, track errors, analyze battle outcomes, and export detailed reports.

This system is built to be used in a development environment and can be completely excluded from a production build to avoid any performance overhead. When active, it attaches a global `DEBUG` object to the `window` for easy console access.

## Architectural Constraints

- This module should have **no dependencies** on other major game modules like `engine` or `ai`. It is a standalone utility that analyzes the *output* of those systems (e.g., the `battleResult` object).
- It is designed to be attached to the global `window` object but can also be used modularly without global pollution.
- It should be configured via `debugConfig.js` and can be enabled or disabled with feature flags.

## Files

-   **`index.js`**: The main entry point for the module. It provides barrel exports for all other files, offering flat and namespaced access patterns (e.g., `BattleAnalysis.analyzeBattle()`). It also provides a factory function `createDebugUtils()` for creating isolated instances.
-   **`debugUtils.js`**: Contains the main `DebugUtils` class that orchestrates all the other modules. This class holds the debug state (logs, metrics, errors) and provides a unified API to access all debugging functionalities.
-   **`debugGlobal.js`**: Responsible for attaching the `DebugUtils` instance to the global `window.DEBUG` object. It also creates the `DEBUG_QUICK` helper and sets up keyboard shortcuts (`Ctrl+Shift+D` for status, etc.) for ease of use during development. This is the primary file to import for browser-based debugging.
-   **`debugConfig.js`**: A centralized location for all debug-related configuration. It contains the main `DEBUG_CONFIG` object and `DEBUG_FLAGS` to enable or disable features like performance tracking or error monitoring.
-   **`battleAnalysis.js`**: A pure analysis module that takes a completed `battleResult` object and prints a detailed breakdown to the console. It includes functions to analyze event frequency, character performance, phase durations, and performance bottlenecks. Exports `analyzeBattle()`.
-   **`errorTracking.js`**: Sets up global error handlers (`window.addEventListener`) to automatically catch and log JavaScript errors and unhandled promise rejections. Exports `setupGlobalErrorHandling()` and `logError()`.
-   **`performanceTracking.js`**: Handles performance and memory monitoring. It uses the `PerformanceObserver` API to track resource loading and custom measurements, and provides functions for taking and analyzing memory snapshots. Exports `setupPerformanceObserver()` and `takeMemorySnapshot()`.
-   **`reporting.js`**: Contains functions for generating and exporting debug data. `generateReport()` compiles all collected data into a single object, and `exportDebugData()` can save that report as a JSON file for offline analysis.
-   **`example-usage.js`**: Contains example code demonstrating how to use the debug module in various ways (via the main class, individual functions, or namespaced objects).

## Usage

The easiest way to use the debug module in a browser is to import the `debugGlobal.js` file once in your main application entry point.

```javascript
// In main.js, for development builds only
import './js/debug/debugGlobal.js';
```

Once loaded, you can access the debug tools from the browser's developer console:

```javascript
// Run a full battle simulation
const battleResult = await runFullBattle(fighter1, fighter2);

// --- In the console: ---

// Get a detailed, multi-part analysis of the last battle
DEBUG.analyzeBattle(battleResult);

// Take a snapshot of the current JavaScript heap memory usage
DEBUG.takeMemorySnapshot();

// Get the current status of the debug system
DEBUG.getStatus();

// Generate a complete report of all captured data
const report = DEBUG.generateReport();
console.log(report);

// Export the full report to a downloadable JSON file
DEBUG.exportDebugData('my-battle-report.json');

// Clear all collected debug data to start fresh
DEBUG.clearDebugData();
```

## Features

### 🔍 Battle Analysis
- Complete battle result breakdown
- Event type frequency analysis
- Character performance metrics
- Phase transition analysis
- Performance bottleneck identification

### 🚨 Error Tracking
- Global error handling setup
- Custom error logging
- Error pattern analysis
- Serialization for export

### ⚡ Performance Tracking
- Performance Observer integration
- Memory usage monitoring
- Execution time measurement
- Bottleneck identification

### 📊 Reporting & Export
- Comprehensive debug reports
- JSON and CSV export options
- Data visualization helpers
- Automated cleanup

## Configuration

```javascript
// Default configuration in debugConfig.js
export const DEBUG_CONFIG = {
    enableConsoleLogging: true,
    enablePerformanceTracking: true,
    enableMemoryTracking: true,
    enableErrorTracking: true,
    logLevel: 'debug',
    maxLogEntries: 1000
};

// Feature flags
export const DEBUG_FLAGS = {
    BATTLE_ANALYSIS: true,
    PERFORMANCE_TRACKING: true,
    ERROR_TRACKING: true,
    MEMORY_MONITORING: true,
    EXPORT_FEATURES: true
};
```

## API Reference

### DebugUtils Class

#### Battle Analysis
- `analyzeBattle(battleResult)` - Complete battle analysis
- `analyzeEventTypes(battleLog)` - Event frequency analysis
- `analyzeCharacterPerformance(battleResult)` - Character metrics
- `analyzePhases(battleLog)` - Phase transition analysis

#### Error Tracking
- `logError(error, context)` - Log custom errors
- `analyzeErrors()` - Analyze error patterns
- `getErrorLog()` - Get current error log

#### Performance Tracking
- `takeMemorySnapshot()` - Take memory snapshot
- `startMemoryMonitoring(interval)` - Start automatic monitoring
- `stopMemoryMonitoring()` - Stop monitoring
- `measureExecutionTime(fn, label)` - Measure function execution
- `analyzePerformanceMetrics()` - Analyze performance data

#### Reporting
- `generateReport()` - Generate comprehensive report
- `exportDebugData(filename)` - Export as JSON
- `exportPerformanceCSV(filename)` - Export performance as CSV
- `clearDebugData()` - Clear all data

#### Utilities
- `log(message, level, data)` - Custom logging
- `getConfig()` - Get current configuration
- `getStatus()` - Get system status
- `destroy()` - Cleanup and shutdown

## Keyboard Shortcuts (Global Mode)

- `Ctrl+Shift+D` - Show debug status
- `Ctrl+Shift+M` - Take memory snapshot
- `Ctrl+Shift+E` - Export debug data
- `Ctrl+Shift+C` - Clear debug data

## Benefits of Modular Design

### 🎯 Single Responsibility
Each module has a focused purpose:
- Battle analysis doesn't handle errors
- Error tracking doesn't export data
- Performance monitoring is isolated

### 👥 Team Development Friendly
- Clear ownership boundaries
- Easier code reviews
- Parallel development possible
- Reduced merge conflicts

### 🤖 AI/Cursor Optimized
- Smaller, focused files for AI editing
- Clear interfaces between modules
- Easy to add new features
- Simplified testing and debugging

### 🚀 Performance Optimized
- Tree-shaking friendly
- Selective imports
- Lazy loading possible
- Reduced memory footprint

### 🔧 Hot-Swappable
- Reload individual modules
- A/B test debug features
- Development vs production builds
- Plugin-like architecture

## Production Considerations

### Build Flags
```javascript
// Only load in development
if (process.env.NODE_ENV !== 'production') {
    import('./debug/debugGlobal.js');
}
```

### Conditional Loading
```javascript
// Feature detection
if (DEBUG_CONFIG.enableConsoleLogging) {
    // Load debug modules
}
```

### Tree Shaking
The modular design supports tree shaking - unused modules won't be included in production builds.

## CLI and Node.js Usage

The analytics modules can be used outside the browser:

```javascript
// Node.js usage
import { analyzeBattle, calculateBattleDuration } from './debug/battleAnalysis.js';

// CLI tool example
const battleResult = JSON.parse(fs.readFileSync('battle-log.json'));
analyzeBattle(battleResult);
```

## Migration from Legacy Debug Utilities

The modular system maintains backward compatibility:

```javascript
// Legacy usage still works
const debug = new DebugUtils();
debug.analyzeBattle(battleResult);

// But you can now also use modular imports
import { analyzeBattle } from './debug/index.js';
analyzeBattle(battleResult);
```

## Contributing

When adding new debug features:

1. **Choose the right module** - Battle analysis goes in `battleAnalysis.js`, etc.
2. **Follow the pattern** - Export functions, keep modules focused
3. **Update the barrel export** - Add new exports to `index.js`
4. **Document the API** - Add JSDoc comments
5. **Test in isolation** - Each module should be testable independently

## Future Enhancements

- Battle replay visualization
- Real-time performance dashboards
- Automated regression testing
- Integration with external monitoring tools
- WebSocket-based remote debugging 
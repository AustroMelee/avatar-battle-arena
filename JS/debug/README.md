# Debug Utilities - Modular Debug System

A comprehensive, modular debugging toolkit for the Avatar Battle Arena project.

## Overview

The debug utilities have been refactored from a monolithic "debug god object" into a modular system that follows Single Responsibility Principle and supports collaborative development.

## Architecture

```
js/debug/
├── debugConfig.js          # Configuration and flags
├── debugUtils.js           # Main orchestrator class
├── debugGlobal.js          # Global window attachment
├── battleAnalysis.js       # Battle result analysis
├── errorTracking.js        # Error logging and analysis
├── performanceTracking.js  # Performance monitoring
├── reporting.js            # Report generation and export
├── index.js                # Barrel exports
└── README.md               # This file
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

## Usage

### Basic Usage

```javascript
// Import the main class
import { DebugUtils } from './debug/debugUtils.js';

// Create an instance
const debug = new DebugUtils();

// Analyze a battle
const battleResult = simulateBattle('aang', 'azula', 'fire-nation-capital', 'noon');
debug.analyzeBattle(battleResult);
```

### Global Usage (Browser)

```javascript
// Import global setup (auto-initializes)
import './debug/debugGlobal.js';

// Use global DEBUG object
DEBUG.analyzeBattle(battleResult);
DEBUG.generateReport();
DEBUG.exportDebugData();

// Use quick shortcuts
DEBUG_QUICK.analyze(battleResult);
DEBUG_QUICK.memory();
DEBUG_QUICK.export();
```

### Modular Usage

```javascript
// Import specific modules
import { analyzeBattle } from './debug/battleAnalysis.js';
import { takeMemorySnapshot } from './debug/performanceTracking.js';
import { generateReport } from './debug/reporting.js';

// Use individual functions
analyzeBattle(battleResult);
const snapshot = takeMemorySnapshot([]);
const report = generateReport([], [], []);
```

### Namespaced Usage

```javascript
// Import namespaced modules
import { BattleAnalysis, PerformanceTracking, Reporting } from './debug/index.js';

// Use namespaced functions
BattleAnalysis.analyzeBattle(battleResult);
PerformanceTracking.takeMemorySnapshot(snapshots);
Reporting.generateReport(metrics, snapshots, errors);
```

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
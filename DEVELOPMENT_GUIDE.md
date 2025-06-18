# Development Guide - Avatar Battle Arena

## 🚀 Getting Started

This guide provides comprehensive instructions for developing, testing, and debugging the Avatar Battle Arena system. Whether you're a new developer joining the project or an AI agent tasked with understanding the codebase, this guide will help you navigate the system effectively.

## 🏗️ Development Environment Setup

### Prerequisites
- Modern web browser with ES6+ support
- Local web server (Python, Node.js, or similar)
- Text editor with JavaScript syntax highlighting
- Browser developer tools familiarity

### Initial Setup
```bash
# Clone the repository
git clone [repository-url]
cd avatar-battle-arena

# Start a local web server (choose one method)
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (if you have http-server installed)
npx http-server -p 8000

# Access the application
# Open browser to http://localhost:8000
```

### Development Tools Configuration

#### Browser Developer Tools Setup
1. **Console Logging**: Enable all console levels (debug, info, warn, error)
2. **Network Tab**: Monitor asset loading and performance
3. **Application Tab**: Check for console errors and storage usage
4. **Performance Tab**: Profile battle simulation performance

#### Recommended Extensions
- **JavaScript Debugger**: For step-through debugging
- **JSON Formatter**: For readable battle state inspection
- **Performance Monitor**: For memory and CPU usage tracking

## 🔧 Code Architecture Overview

### Module Organization
```
js/
├── engines/           # Core battle logic
│   ├── engine_battle-engine-core.js    # Main orchestrator
│   ├── engine_ai-decision.js           # AI decision making
│   ├── engine_narrative-engine.js      # Story generation
│   └── engine_*.js                     # Specialized engines
├── data/              # Game data and configuration
│   ├── data_characters.js              # Character definitions
│   ├── data_narrative_*.js             # Narrative content
│   └── data_*.js                       # Various game data
├── ui/                # User interface components
│   ├── ui_battle-results.js            # Battle outcome display
│   ├── ui_character-selection.js       # Character picker
│   └── ui_*.js                         # UI components
└── utils/             # Utility functions
    ├── utils_math.js                   # Mathematical operations
    ├── utils_log_event.js              # Event logging
    └── utils_*.js                      # Helper functions
```

### Key Design Patterns

#### 1. Event-Driven Architecture
```javascript
// Events flow through the system
const battleEvent = generateLogEvent(battleState, {
  type: 'damage',
  actorId: 'aang',
  damage: 15,
  text: 'Aang takes 15 damage'
});
battleEventLog.push(battleEvent);
```

#### 2. Dependency Injection
```javascript
// Systems receive dependencies rather than importing directly
function calculateMove(move, attacker, defender, conditions, log, aiLog) {
  // Function receives all needed dependencies
}
```

#### 3. Immutable State Updates
```javascript
// Create new state objects rather than mutating existing ones
const newBattleState = {
  ...currentBattleState,
  turn: currentBattleState.turn + 1,
  environmentState: {
    ...currentBattleState.environmentState,
    impactLevel: newImpactLevel
  }
};
```

## 🧪 Testing Strategy

### Manual Testing Procedures

#### 1. Basic Battle Simulation Test
```javascript
// Open browser console and run:
const result = simulateBattle('aang', 'azula', 'fire-nation-capital', 'noon');
console.log('Battle Result:', result);

// Verify:
// - Battle completes without errors
// - Winner is determined correctly
// - Event log contains expected events
// - Character states are valid
```

#### 2. Deterministic Testing
```javascript
// Enable deterministic randomness for reproducible tests
// In config_game.js, set:
export const USE_DETERMINISTIC_RANDOM = true;
export const RANDOM_SEED = 12345;

// Run the same battle multiple times - results should be identical
const result1 = simulateBattle('aang', 'azula', 'fire-nation-capital', 'noon');
const result2 = simulateBattle('aang', 'azula', 'fire-nation-capital', 'noon');

// Compare results
console.assert(result1.winnerId === result2.winnerId, 'Results should be identical');
```

#### 3. Edge Case Testing
```javascript
// Test extreme scenarios
const testCases = [
  // Very short battles
  { f1: 'aang', f2: 'azula', turns: 1 },
  
  // Maximum length battles
  { f1: 'aang', f2: 'azula', turns: 100 },
  
  // Invalid inputs
  { f1: 'invalid', f2: 'azula' },
  { f1: 'aang', f2: 'invalid' },
  { f1: null, f2: 'azula' }
];

testCases.forEach(testCase => {
  try {
    const result = simulateBattle(testCase.f1, testCase.f2, 'fire-nation-capital', 'noon');
    console.log(`Test passed: ${testCase.f1} vs ${testCase.f2}`);
  } catch (error) {
    console.log(`Test failed (expected): ${error.message}`);
  }
});
```

### Automated Testing Framework

#### Unit Test Template
```javascript
// Create test files following this pattern
// test_utils_math.js
function testMathUtils() {
  console.group('Math Utils Tests');
  
  // Test clamp function
  console.assert(clamp(5, 0, 10) === 5, 'clamp: normal value');
  console.assert(clamp(-5, 0, 10) === 0, 'clamp: below minimum');
  console.assert(clamp(15, 0, 10) === 10, 'clamp: above maximum');
  
  // Test error conditions
  try {
    clamp('invalid', 0, 10);
    console.assert(false, 'clamp: should throw on invalid input');
  } catch (error) {
    console.assert(error instanceof TypeError, 'clamp: should throw TypeError');
  }
  
  console.groupEnd();
}

// Run tests
testMathUtils();
```

#### Integration Test Template
```javascript
// test_battle_integration.js
function testBattleIntegration() {
  console.group('Battle Integration Tests');
  
  // Test complete battle flow
  const startTime = performance.now();
  const result = simulateBattle('aang', 'azula', 'fire-nation-capital', 'noon');
  const duration = performance.now() - startTime;
  
  // Validate result structure
  console.assert(result.log, 'Result should have log');
  console.assert(result.finalState, 'Result should have final state');
  console.assert(result.winnerId || result.isDraw, 'Result should have outcome');
  
  // Performance validation
  console.assert(duration < 5000, `Battle should complete quickly (${duration}ms)`);
  
  // Log validation
  console.assert(result.log.length > 0, 'Log should contain events');
  console.assert(result.log.every(event => event.timestamp), 'All events should have timestamps');
  
  console.groupEnd();
}

testBattleIntegration();
```

## 🐛 Debugging Techniques

### Console Debugging

#### 1. Enable Debug Logging
```javascript
// In browser console, enable debug logging
localStorage.setItem('debug', 'true');

// Or modify console levels
console.debug = console.log; // Show debug messages
```

#### 2. Battle State Inspection
```javascript
// Inspect battle state during simulation
function debugBattleState(battleState) {
  console.group('Battle State Debug');
  console.log('Turn:', battleState.turn);
  console.log('Phase:', battleState.currentPhase);
  console.log('Environment:', battleState.environmentState);
  console.log('Conditions:', battleState.locationConditions);
  console.groupEnd();
}

// Add to battle loop for debugging
debugBattleState(currentBattleState);
```

#### 3. Event Log Analysis
```javascript
// Analyze battle events
function analyzeBattleLog(battleLog) {
  const eventTypes = {};
  const actorActions = {};
  
  battleLog.forEach(event => {
    // Count event types
    eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
    
    // Count actor actions
    if (event.actorId) {
      actorActions[event.actorId] = (actorActions[event.actorId] || 0) + 1;
    }
  });
  
  console.table(eventTypes);
  console.table(actorActions);
}

// Use after battle simulation
const result = simulateBattle('aang', 'azula', 'fire-nation-capital', 'noon');
analyzeBattleLog(result.log);
```

### Performance Debugging

#### 1. Performance Profiling
```javascript
// Profile battle simulation performance
function profileBattle() {
  console.time('Battle Simulation');
  
  const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
  const result = simulateBattle('aang', 'azula', 'fire-nation-capital', 'noon');
  const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
  
  console.timeEnd('Battle Simulation');
  console.log('Memory Usage:', (endMemory - startMemory) / 1024 / 1024, 'MB');
  
  return result;
}

profileBattle();
```

#### 2. Event Performance Analysis
```javascript
// Analyze performance of individual events
function analyzeEventPerformance(battleLog) {
  const performanceEvents = battleLog.filter(e => e.type === 'performance');
  
  performanceEvents.forEach(event => {
    if (event.duration > 100) {
      console.warn(`Slow operation: ${event.operation} (${event.duration}ms)`);
    }
  });
  
  const avgDuration = performanceEvents.reduce((sum, e) => sum + e.duration, 0) / performanceEvents.length;
  console.log(`Average operation duration: ${avgDuration.toFixed(2)}ms`);
}
```

### Error Debugging

#### 1. Error Tracking
```javascript
// Global error handler for debugging
window.addEventListener('error', (event) => {
  console.error('Global Error:', event.error);
  console.error('Stack:', event.error.stack);
  console.error('File:', event.filename);
  console.error('Line:', event.lineno);
});

// Promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
});
```

#### 2. Module Error Debugging
```javascript
// Wrap risky operations in try-catch blocks
try {
  const result = calculateMove(move, attacker, defender, conditions);
  console.debug('Move calculation successful:', result);
} catch (error) {
  console.error('Move calculation failed:', error);
  console.error('Move:', move);
  console.error('Attacker:', attacker);
  console.error('Defender:', defender);
  
  // Create error event for logging
  const errorEvent = createErrorEvent(battleState, error, 'Move Calculation', {
    move: move.name,
    attackerId: attacker.id,
    defenderId: defender.id
  });
  
  battleEventLog.push(errorEvent);
}
```

## 🔍 Code Quality Guidelines

### Naming Conventions
```javascript
// Variables: camelCase
const battleResult = simulateBattle();
const currentTurn = battleState.turn;

// Functions: camelCase with descriptive verbs
function calculateDamage() { }
function generateNarrative() { }
function updateCharacterState() { }

// Constants: UPPER_SNAKE_CASE
const MAX_BATTLE_TURNS = 100;
const CRITICAL_HIT_THRESHOLD = 0.9;

// Classes: PascalCase (if used)
class BattleEngine { }
class CharacterState { }
```

### Documentation Standards
```javascript
/**
 * Function description explaining purpose and behavior.
 * 
 * Detailed explanation of what the function does, including:
 * - Algorithm description
 * - Side effects
 * - Performance considerations
 * - Error conditions
 * 
 * @param {Type} paramName - Parameter description
 * @param {Type} [optionalParam] - Optional parameter description
 * 
 * @returns {Type} Return value description
 * 
 * @throws {ErrorType} When this error occurs
 * 
 * @example
 * // Usage example
 * const result = functionName(param1, param2);
 * 
 * @since version.number
 */
function functionName(paramName, optionalParam) {
  // Implementation
}
```

### Error Handling Patterns
```javascript
// Input validation
function processInput(input) {
  if (!input || typeof input !== 'object') {
    throw new TypeError(`Expected object, got ${typeof input}`);
  }
  
  if (!input.requiredField) {
    throw new Error('Missing required field: requiredField');
  }
  
  // Process input
}

// Graceful degradation
function attemptOperation() {
  try {
    return riskyOperation();
  } catch (error) {
    console.warn('Operation failed, using fallback:', error.message);
    return fallbackOperation();
  }
}

// Resource cleanup
function performComplexOperation() {
  const resources = allocateResources();
  
  try {
    return processWithResources(resources);
  } finally {
    cleanupResources(resources);
  }
}
```

## 📊 Performance Optimization

### Optimization Strategies

#### 1. Minimize Object Creation
```javascript
// Avoid creating unnecessary objects in loops
// Bad:
for (let i = 0; i < 1000; i++) {
  const tempObject = { value: i };
  processObject(tempObject);
}

// Good:
const reusableObject = { value: 0 };
for (let i = 0; i < 1000; i++) {
  reusableObject.value = i;
  processObject(reusableObject);
}
```

#### 2. Efficient Array Operations
```javascript
// Use appropriate array methods
// For finding: use find() instead of filter()[0]
const targetEvent = battleLog.find(event => event.type === 'damage');

// For checking existence: use some() instead of filter().length > 0
const hasDamageEvent = battleLog.some(event => event.type === 'damage');

// For transformation: use map() appropriately
const eventTypes = battleLog.map(event => event.type);
```

#### 3. Lazy Evaluation
```javascript
// Delay expensive operations until needed
class BattleAnalyzer {
  constructor(battleLog) {
    this.battleLog = battleLog;
    this._statistics = null; // Lazy-loaded
  }
  
  get statistics() {
    if (!this._statistics) {
      this._statistics = this.calculateStatistics();
    }
    return this._statistics;
  }
  
  calculateStatistics() {
    // Expensive calculation
    return this.battleLog.reduce((stats, event) => {
      // Complex analysis
    }, {});
  }
}
```

### Memory Management
```javascript
// Clean up event listeners
function setupBattleUI() {
  const button = document.getElementById('start-battle');
  
  function handleClick() {
    startBattle();
  }
  
  button.addEventListener('click', handleClick);
  
  // Return cleanup function
  return () => {
    button.removeEventListener('click', handleClick);
  };
}

// Use WeakMap for object associations
const characterData = new WeakMap();
characterData.set(character, { stats: calculateStats(character) });

// Clear large data structures when done
function cleanupBattle(battleResult) {
  // Clear large arrays
  battleResult.log.length = 0;
  
  // Nullify object references
  battleResult.finalState = null;
  battleResult.environmentState = null;
}
```

## 🚀 Deployment Considerations

### Production Optimizations
```javascript
// Disable debug logging in production
const isProduction = location.hostname !== 'localhost';

if (isProduction) {
  console.debug = () => {}; // Disable debug logs
  console.log = () => {};   // Disable info logs (optional)
}

// Minify and compress assets
// Use build tools to:
// - Minify JavaScript files
// - Compress images
// - Bundle and optimize CSS
// - Enable gzip compression
```

### Error Reporting
```javascript
// Production error reporting
if (isProduction) {
  window.addEventListener('error', (event) => {
    // Send error to monitoring service
    fetch('/api/errors', {
      method: 'POST',
      body: JSON.stringify({
        message: event.error.message,
        stack: event.error.stack,
        url: location.href,
        timestamp: new Date().toISOString()
      })
    });
  });
}
```

---

**Last Updated**: [Current Date]
**Version**: 2.1
**Maintainer**: Battle Arena Development Team

This guide is continuously updated as the project evolves. For questions or suggestions, please refer to the project documentation or create an issue in the repository. 
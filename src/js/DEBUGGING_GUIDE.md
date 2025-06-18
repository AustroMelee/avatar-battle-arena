# Debugging Guide - Avatar Battle Arena

## 📋 Overview

This guide provides comprehensive debugging information for all modules in the Avatar Battle Arena system. The codebase implements a consistent debugging strategy across all modular systems to ensure maintainability and troubleshooting efficiency.

---

## 🔧 Debug Logging Standards

### Consistent Logging Format
All modules follow this standardized logging pattern:

```javascript
// Debug information - detailed operational data
console.debug(`[Module Name] Operation: ${operation} with parameters: ${JSON.stringify(params)}`);

// Warnings - potential issues that don't break functionality
console.warn(`[Module Name] Potential issue: ${description}`);

// Errors - critical failures that affect functionality
console.error(`[Module Name] Error in ${operation}:`, error);

// Information - important operational milestones
console.log(`[Module Name] ${milestone} completed successfully`);
```

### Module Naming Convention
Each module uses a consistent identifier in square brackets:
- `[Battle Loop]` - Main battle orchestration
- `[Turn Processor]` - Turn-by-turn processing
- `[HTML Log Builder]` - HTML generation
- `[Event Handler]` - Event processing
- `[Impact Level]` - Impact assessment
- `[Personality Triggers]` - AI personality evaluation
- `[Animated Text Engine]` - Text animation system

---

## 🏗️ Module-Specific Debugging

### Battle Loop & Turn Management

#### `battle_loop_manager.js`
**Debug Features:**
- Battle configuration logging at startup
- Turn-by-turn state tracking with HP/Energy
- Phase transition monitoring
- Curbstomp condition checking

**Key Debug Points:**
```javascript
// Battle initialization
console.debug(`[Battle Loop] Battle configuration: ${this.fighter1.name} vs ${this.fighter2.name}, Turn order: ${this.initiator.name} first`);

// Turn progression
console.debug(`[Battle Loop] Turn ${this.turn}: ${this.initiator.name} (HP: ${this.initiator.health}, Energy: ${this.initiator.energy}) vs ${this.responder.name} (HP: ${this.responder.health}, Energy: ${this.responder.energy})`);
```

#### `engine_turn-processor.js`
**Debug Features:**
- Character state logging before turn processing
- Move selection and resolution tracking
- Effect application monitoring

**Key Debug Points:**
```javascript
// Turn start
console.debug(`[Turn Processor] Processing turn for ${attacker.name} (Phase: ${phaseState.currentPhase}, Turn: ${battleState.turn})`);
console.debug(`[Turn Processor] Attacker state: HP ${attacker.health}, Energy ${attacker.energy}, Stun ${attacker.stunDuration}`);
```

### Logging & HTML Generation

#### `html_log_builder.js`
**Debug Features:**
- Event count tracking
- Event validation and error reporting
- HTML structure validation

**Key Debug Points:**
```javascript
// Build start
console.debug(`[HTML Log Builder] Building HTML log from ${structuredLogEvents.length} events`);

// Error handling
console.error('[HTML Log Builder] Invalid events array provided');
```

#### `event_type_handlers.js`
**Debug Features:**
- Event type identification
- Handler selection tracking
- Processing error recovery

**Key Debug Points:**
```javascript
// Event processing
console.debug(`[Event Handler] Processing event type: ${event.type}`);
```

### Utility Modules

#### `utils_impact_level.js`
**Debug Features:**
- Impact level determination tracking
- Effectiveness mapping debugging
- Fallback behavior logging

**Key Debug Points:**
```javascript
// Impact assessment
console.debug(`[Impact Level] Determining impact for effectiveness: ${effectivenessLabel}, moveType: ${moveType}`);
console.debug(`[Impact Level] Final impact level: ${baseImpact}`);
```

#### `personality_trigger_evaluators.js`
**Debug Features:**
- Trigger evaluation tracking
- Result logging for analysis
- Error handling and recovery

**Key Debug Points:**
```javascript
// Trigger evaluation
console.debug(`[Personality Triggers] Evaluating trigger "${triggerId}" for ${character.name}`);
console.debug(`[Personality Triggers] Trigger "${triggerId}" result: ${result}`);
```

### Animation & Presentation

#### `animated_text_engine.js`
**Debug Features:**
- Animation queue size tracking
- Event processing monitoring
- Animation lifecycle logging

**Key Debug Points:**
```javascript
// Animation start
console.debug(`[Animated Text Engine] Starting animation with ${animationQueueInternal.length} events`);
console.log("[Animated Text Engine] Animation queue finished.");
```

---

## 🐛 Debug Configuration

### Environment-Based Debugging
```javascript
// Production debug control
const DEBUG_ENABLED = process.env.NODE_ENV !== 'production';

// Conditional debug logging
if (DEBUG_ENABLED) {
    console.debug(`[Module Name] Debug information: ${data}`);
}
```

### Debug Levels
The system supports multiple debug levels:

1. **CRITICAL** - `console.error()` - Errors that break functionality
2. **WARNING** - `console.warn()` - Issues that might cause problems
3. **INFO** - `console.log()` - Important operational milestones
4. **DEBUG** - `console.debug()` - Detailed operational data

### Browser Debug Console Filtering
Use browser console filters to focus on specific modules:
```
[Battle Loop]     # Only battle loop messages
[Turn Processor]  # Only turn processing messages
[Debug]           # Only debug utility messages
```

---

## 🔍 Common Debugging Scenarios

### Battle Flow Issues
**Check These Logs:**
1. `[Battle Loop]` - Overall battle progression
2. `[Turn Processor]` - Individual turn issues
3. `[Phase Manager]` - Phase transition problems

**Key Indicators:**
- Stalled turn progression
- Incorrect character state transitions
- Phase transition failures

### Animation Problems
**Check These Logs:**
1. `[Animated Text Engine]` - Animation queue issues
2. `[Event Handler]` - Event processing problems
3. `[HTML Log Builder]` - HTML generation errors

**Key Indicators:**
- Empty animation queues
- Malformed HTML content
- Event type handling failures

### AI Decision Issues
**Check These Logs:**
1. `[Personality Triggers]` - Trigger evaluation
2. `[AI Decision]` - Move selection process
3. `[Impact Level]` - Move impact assessment

**Key Indicators:**
- Unexpected personality triggers
- Poor move selections
- Incorrect impact assessments

### Data Flow Problems
**Check These Logs:**
1. `[Log Event]` - Event creation and logging
2. `[Safe Accessor]` - Safe property access
3. `[Number Validation]` - Mathematical operations

**Key Indicators:**
- Data access failures
- Mathematical calculation errors
- Event logging failures

---

## 🛠️ Debug Tools Integration

### Browser Developer Tools
**Console Usage:**
```javascript
// Filter by module
console.log('%c[Battle Loop] %cBattle started', 'color: blue; font-weight: bold', 'color: black');

// Performance monitoring
console.time('[Battle Loop] Full battle execution');
// ... battle code ...
console.timeEnd('[Battle Loop] Full battle execution');

// Object inspection
console.table(battleState); // For tabular data
console.dir(character);     // For object inspection
```

### Debug Utilities Module
The dedicated debug system (`js/debug/`) provides advanced debugging:

```javascript
import { DebugUtils } from './debug/debugUtils.js';

const debug = new DebugUtils();
debug.analyzeBattle(battleResult);
debug.generateReport();
```

### Memory and Performance Debugging
```javascript
// Memory usage tracking
console.debug(`[Module Name] Memory usage: ${(performance.memory?.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);

// Performance timing
const startTime = performance.now();
// ... operation ...
const duration = performance.now() - startTime;
console.debug(`[Module Name] ${operation} took ${duration.toFixed(2)}ms`);
```

---

## 📊 Debug Data Analysis

### Log Pattern Analysis
Common log patterns to look for:

**Successful Operation:**
```
[Module Name] Starting operation with params: {...}
[Module Name] Operation completed successfully
```

**Error Pattern:**
```
[Module Name] Starting operation with params: {...}
[Module Name] Error in operation: ErrorMessage
[Module Name] Falling back to default behavior
```

**Performance Issue Pattern:**
```
[Module Name] Operation took 2000ms (expected < 100ms)
```

### Debug Data Export
```javascript
// Export debug logs for analysis
const debugLogs = console.history || []; // If available
localStorage.setItem('battleDebugLogs', JSON.stringify(debugLogs));

// Export specific module logs
const battleLogs = debugLogs.filter(log => log.includes('[Battle Loop]'));
```

---

## 🔄 Debugging Workflows

### Basic Battle Debug Workflow
1. **Start with high-level logs** - `[Battle Loop]`, `[Battle Engine]`
2. **Drill down to specific systems** - Turn processing, AI decisions
3. **Check utility operations** - Math, validation, safe access
4. **Verify data integrity** - Event logging, state consistency

### Performance Debug Workflow
1. **Identify slow operations** - Performance timing logs
2. **Check resource usage** - Memory, DOM manipulation
3. **Analyze bottlenecks** - Event processing, animation queues
4. **Optimize critical paths** - Hot code paths, frequent operations

### Error Debug Workflow
1. **Locate error source** - Module-specific error logs
2. **Check input validation** - Parameter validation logs
3. **Verify error handling** - Fallback behavior logs
4. **Test edge cases** - Boundary conditions, null values

---

## 🚀 Best Practices

### Debug Log Best Practices
1. **Use consistent formatting** - Always include module identifier
2. **Log meaningful data** - Include relevant parameters and state
3. **Avoid excessive logging** - Don't log every minor operation
4. **Use appropriate levels** - Error for failures, debug for details
5. **Include context** - Function names, operation types, relevant IDs

### Performance Considerations
1. **Minimize string concatenation** - Use template literals
2. **Avoid object serialization in hot paths** - Log references, not full objects
3. **Use conditional logging** - Check debug flags before expensive operations
4. **Group related logs** - Use console.group() for related operations

### Production Debugging
1. **Implement log levels** - Allow runtime configuration
2. **Use feature flags** - Enable/disable debug features
3. **Sanitize sensitive data** - Remove personal information from logs
4. **Implement remote logging** - Send debug data to monitoring systems

---

## 📈 Debug Metrics and Monitoring

### Key Performance Indicators
- Battle execution time
- Turn processing duration
- Animation queue processing speed
- Memory usage patterns
- Error rates by module

### Monitoring Integration
```javascript
// Example monitoring integration
function logMetric(metricName, value, tags = {}) {
    if (window.analytics) {
        window.analytics.track(metricName, { value, ...tags });
    }
    console.debug(`[Metrics] ${metricName}: ${value}`, tags);
}

// Usage
logMetric('battle.duration', battleDuration, { characters: [fighter1.id, fighter2.id] });
```

---

## 🔧 Troubleshooting Quick Reference

### Common Issues and Solutions

| Issue | Module | Check | Solution |
|-------|--------|-------|----------|
| Battle won't start | `[Battle Loop]` | Character state initialization | Verify character data integrity |
| Animation stuck | `[Animated Text Engine]` | Queue processing logs | Check event validation and DOM state |
| Incorrect move selection | `[Personality Triggers]` | Trigger evaluation results | Verify battle state context |
| HTML rendering broken | `[HTML Log Builder]` | Event structure validation | Check event html_content properties |
| Performance issues | All modules | Performance timing logs | Identify bottleneck modules |

### Emergency Debug Commands
```javascript
// Stop all animations
window.DEBUG_stopAnimations = true;

// Dump current battle state
console.log('Battle State:', window.DEBUG_battleState);

// Force battle conclusion
window.DEBUG_forceBattleEnd = true;

// Enable verbose logging
window.DEBUG_verboseLogging = true;
```

---

**Last Updated**: Current  
**Version**: 1.0  
**Coverage**: All Modules  
**Maintenance**: Active 
# Battle Logging System

A modular battle event logging system with clean separation of concerns, designed for the Avatar Battle Arena project.

## Architecture Overview

The battle logging system has been refactored from a monolithic `utils_log_event.js` file into 6 specialized modules:

```
js/battle_logging/
├── battle_event_types.js     # Event type constants and structure definitions
├── battle_event_factory.js   # Pure event construction functions (no side effects)
├── battle_event_validators.js # Validation logic for all event types
├── battle_log_writer.js      # Log writing, rotation, and batch operations
├── battle_log_formatters.js  # Convert events to HTML, CSV, JSON, debug formats
├── battle_log_debug.js       # Console output and external monitoring
└── index.js                  # Barrel exports and convenience functions
```

## Key Benefits

- **Single Responsibility**: Each module has one clear purpose
- **Testability**: Isolated functions are easy to unit test
- **Maintainability**: Changes to one concern don't affect others
- **Performance**: Tree-shaking and selective imports
- **Extensibility**: Easy to add new event types or output formats

## Usage Examples

### Basic Event Creation and Logging

```javascript
import { createAndLogEvent } from './battle_logging/index.js';

// Simple event
createAndLogEvent(battleLog, battleState, {
    type: 'damage',
    actorId: 'aang',
    text: 'Aang takes 15 damage'
});
```

### Dice Roll Logging

```javascript
import { createAndLogRoll } from './battle_logging/index.js';

createAndLogRoll(battleLog, battleState, {
    rollType: 'critCheck',
    actorId: 'azula',
    roll: 0.95,
    threshold: 0.9,
    outcome: 'success',
    moveName: 'Blue Fire Blast'
});
```

### Performance Tracking

```javascript
import { createAndLogPerformance } from './battle_logging/index.js';

const startTime = performance.now();
// ... perform operation ...
const duration = performance.now() - startTime;

createAndLogPerformance(battleLog, battleState, 'AI Decision', duration);
```

### Advanced Usage - Individual Modules

```javascript
// Direct module imports for advanced usage
import { createDiceRollEvent } from './battle_logging/battle_event_factory.js';
import { writeEvent } from './battle_logging/battle_log_writer.js';
import { toHTML } from './battle_logging/battle_log_formatters.js';
import { validateRollData } from './battle_logging/battle_event_validators.js';

// Validate data before creating event
validateRollData(rollData);

// Create event without side effects
const rollEvent = createDiceRollEvent(battleState, rollData);

// Write to log
writeEvent(battleLog, rollEvent);

// Export to HTML
const htmlOutput = toHTML(battleLog, { includeMajorOnly: true });
```

### Formatting and Output

```javascript
import { toHTML, toCSV, toBattleSummary } from './battle_logging/battle_log_formatters.js';

// Generate HTML for UI display
const html = toHTML(battleLog, { 
    includeMajorOnly: true,
    cssClasses: true 
});

// Export data for analysis
const csv = toCSV(battleLog);

// Create battle summary report
const summary = toBattleSummary(battleLog, {
    includePerformanceData: true,
    includeTimeline: true
});
```

### Debug Control

```javascript
import { setDebugLevel, enableConsoleLogging } from './battle_logging/battle_log_debug.js';

// Control debug output
setDebugLevel('WARN'); // Only warnings and errors
enableConsoleLogging(false); // Disable console output
```

## Event Types

The system supports these event types:

- **Combat**: `damage`, `healing`, `critical_hit`, `miss`, `block`, `counter`
- **Dice Rolls**: `dice_roll` with various roll types
- **Battle Flow**: `battle_start`, `battle_end`, `turn_start`, `turn_end`, `phase_change`
- **AI**: `ai_decision`, `ai_strategy_change`
- **Environmental**: `environmental_effect`, `location_effect`
- **System**: `performance`, `error`, `debug`, `timeout_event`
- **Narrative**: `quote`, `narration`, `escalation`
- **Special**: `curbstomp`, `momentum_shift`, `stalemate`

## Migration from Original System

The original `utils_log_event.js` functions are replaced as follows:

| Original Function | New Module/Function |
|-------------------|-------------------|
| `generateLogEvent()` | `battle_event_factory.createBaseEvent()` |
| `logRoll()` | `createAndLogRoll()` convenience function |
| `createPerformanceEvent()` | `battle_event_factory.createPerformanceEvent()` |
| `createErrorEvent()` | `battle_event_factory.createErrorEvent()` |

## Backward Compatibility

A compatibility layer will be maintained in the original `utils_log_event.js` file that imports from the new modular system, ensuring no breaking changes to existing code.

## Future Enhancements

The modular structure enables:

- **Custom Event Types**: Easy to add new event types for specific features
- **Multiple Output Formats**: JSON, XML, database logging, etc.
- **Advanced Analytics**: Real-time battle analysis and AI behavior tracking
- **External Monitoring**: Integration with logging services
- **Replay System**: Enhanced event structure for battle replays
- **A/B Testing**: Easy to swap logging behaviors for experiments 
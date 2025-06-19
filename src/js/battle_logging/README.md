# Battle Logging Module

## Overview

The Battle Logging module provides a robust, centralized system for creating, validating, formatting, and writing all events that occur within a battle. It is designed to be the single source of truth for "what happened" in a simulation, converting raw game actions into a structured, queryable log.

This module is critical for debugging, generating user-facing battle reports (in HTML), creating battle summaries, and potentially for building a replay system in the future.

## Architectural Constraints

- This module is a low-level utility and **should not** have dependencies on high-level modules like `engine` or `ai`.
- It can be imported by any module that needs to log an event.
- All functions within this module should be as pure as possible. The `battle_log_writer.js` contains the only stateful logic for managing the log array itself.

## Module Interaction

```mermaid
graph TD
    A[Engine, AI, UI, etc.] --> B{Battle Logging Module}
    
    subgraph Battle Logging Module
        C[index.js]
        D[battle_event_factory.js]
        E[battle_event_validators.js]
        F[battle_log_writer.js]
        G[battle_log_formatters.js]
    end

    B --> C
    C --> D
    C --> E
    C --> F
    C --> G

    subgraph Output
        H[Battle Log (Array)]
        I[Console Debug]
        J[HTML Report]
        K[Data (CSV/JSON)]
    end

    F --> H
    B --> I
    G --> J
    G --> K
```
- **Other Modules** (Engine, AI, etc.): Call `createAndLogEvent()` or other convenience functions from `index.js` to add events to the battle log.
- **Log Array**: The `battle_log_writer.js` is responsible for pushing events into the global `battleLog` array.
- **Outputs**: The `battle_log_formatters.js` can then take this `battleLog` array and convert it into various formats like HTML for the UI or CSV for analysis.

## Files

-   **`index.js`**: The main entry point for the module. It provides barrel exports for all other files and offers high-level convenience functions like `createAndLogEvent()`, `createAndLogRoll()`, and `createAndLogPerformance()` which combine creation, validation, writing, and console debugging into a single call.
-   **`battle_event_factory.js`**: Contains pure functions for constructing event objects. Each function (`createBaseEvent`, `createDiceRollEvent`, etc.) takes battle state and data, and returns a fully formed, validated event object without any side effects.
-   **`battle_event_types.js`**: A centralized registry of constants. It defines all valid event types (`EVENT_TYPES`), roll types (`ROLL_TYPES`), and outcome types (`OUTCOME_TYPES`). It also includes JSDoc `@typedef`s for the structure of different event objects.
-   **`battle_event_validators.js`**: Provides functions to validate the structure and data types of event objects. `validateLogEvent()` and `validateRollData()` ensure that only correctly formed events enter the log, preventing data corruption.
-   **`battle_log_writer.js`**: Manages the battle log array itself. The `BattleLogWriter` class handles writing events, batching for performance, and log rotation (culling old events to prevent the log from growing indefinitely).
-   **`battle_log_formatters.js`**: Contains a suite of functions to transform the raw event log into human-readable or machine-readable formats. Exports `toHTML()`, `toCSV()`, `toJSON()`, and `toBattleSummary()`.
-   **`battle_log_debug.js`**: Controls all console output. The `BattleLogDebugger` class can filter logs by severity (`INFO`, `WARN`, `ERROR`), format them for readability, and send them to an external monitor.
-   **`test.js`**: A simple test script to verify that the core functionalities of the logging system are working as expected.

## Usage

Here is a typical example of how the `engine` would log a damage event.

```javascript
// Any file that needs to log an event
import { createAndLogEvent, EVENT_TYPES } from './js/battle_logging/index.js';

// Assume 'battleLog' and 'battleState' are available in the current scope.
function applyDamage(actor, amount) {
    // ... logic to apply damage ...

    // Create a structured log event for this action.
    createAndLogEvent(
        battleLog,      // The global battle log array
        battleState,    // The current state of the battle
        {
            type: EVENT_TYPES.DAMAGE,
            actorId: actor.id,
            text: `${actor.name} takes ${amount} damage.`,
            damage: amount,
            isMajorEvent: true, // This is a significant event
        }
    );
}
```

To generate an HTML report from the log:

```javascript
import { toHTML } from './js/battle_logging/index.js';

// After the battle is over...
const battleReportHtml = toHTML(battleLog, { 
    includeMajorOnly: false, // Show all events
    cssClasses: true,        // Add CSS classes for styling
});

// This HTML can then be injected into the DOM.
document.getElementById('battle-report-container').innerHTML = battleReportHtml;
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
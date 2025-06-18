# Standalone Modules Documentation

## 📋 Overview

This document provides comprehensive documentation for standalone JavaScript modules in the Avatar Battle Arena that don't have their own dedicated directories but are critical components of the modular architecture.

---

## 🔄 Battle Loop & Turn Management

### `battle_loop_manager.js` - **Main Battle Orchestrator**
**Purpose**: Manages the complete battle simulation lifecycle from start to finish

**Key Classes:**
- `BattleLoopManager` - Main orchestrator class

**Key Methods:**
- `executeBattleLoop()` - Main battle execution
- `executeTurn()` - Single turn processing
- `processTurnSegment(attacker, defender)` - Individual character actions
- `handlePhaseTransitions()` - Battle phase progression
- `checkBattleEndConditions()` - Terminal state evaluation

**Features:**
- Turn order management with proper switching
- Pre/post-battle phase handling
- Stalemate detection and prevention
- Curbstomp integration
- Comprehensive event logging

### `engine_turn-processor.js` - **Turn Action Processor**
**Purpose**: Handles all logic within a single character's turn

**Key Functions:**
- `processTurn(attacker, defender, battleState, phaseState)` - Main turn processor
- `generateActionNarrative()` - Turn-specific narrative generation
- `handleInaction()` - Stunned/low energy handling

**Features:**
- AI decision integration
- Move resolution coordination
- Effect application management
- Manipulation attempt handling
- Energy and stun state management

### `engine_phase-manager.js` - **Phase Transition Controller**
**Purpose**: Manages battle phase transitions and associated narrative

**Key Functions:**
- `managePhaseTransition(phaseState, attacker, defender, battleState)` - Phase transition logic

**Features:**
- Environmental state reset on phase change
- Phase-specific dialogue generation
- Phase header event creation
- Character quote integration

---

## 📝 Logging & HTML Generation

### `html_log_builder.js` - **HTML Battle Log Constructor**
**Purpose**: Converts structured battle events into formatted HTML display

**Key Classes:**
- `HtmlLogBuilder` - Builder pattern implementation for HTML generation

**Key Methods:**
- `build(structuredLogEvents)` - Main HTML construction
- `processEvent(event)` - Individual event processing
- `handleTurnMarker()` - Turn grouping
- `handlePhaseHeader()` - Phase organization
- `handleRegularEvent()` - Standard event processing

**Features:**
- Clean HTML structure with semantic grouping
- Turn and phase organization
- Event validation and error handling
- Fallback content generation

### `event_type_handlers.js` - **Event Processing Strategy**
**Purpose**: Strategy pattern for handling different event types in animation queue

**Key Functions:**
- `processEventForAnimation(event)` - Main event processor
- `registerEventHandler(eventType, handlerFunction)` - Dynamic handler registration
- Handler functions for specific event types

**Features:**
- Extensible event handling system
- Impact level determination
- Animation timing configuration
- Error recovery and fallbacks

### `battle_log_transformer.js` - **Log Format Converter**
**Purpose**: Transforms structured logs for different output formats

**Key Functions:**
- `transformEventsToAnimationQueue(structuredLogEvents)` - Animation conversion
- `transformEventsToHtmlLog(structuredLogEvents)` - HTML conversion

**Features:**
- Impact level preprocessing
- KO event deduplication
- Animation queue optimization
- HTML builder integration

---

## 🧮 Utility Modules

### `utils_impact_level.js` - **Impact Assessment System**
**Purpose**: Determines narrative and animation impact levels for events

**Key Functions:**
- `determineImpactLevel(effectiveness, moveType)` - Impact calculation
- `getPauseDurationForImpact(impactLevel)` - Animation timing

**Features:**
- Multi-factor impact assessment
- Animation timing optimization
- Consistent impact scaling

### `utils_interpolation.js` - **Mathematical Interpolation**
**Purpose**: Provides smooth interpolation and animation utilities

**Key Functions:**
- `lerp(start, end, t)` - Linear interpolation
- `distance(x1, y1, x2, y2)` - Distance calculation

**Features:**
- Debug logging for interpolation
- Boundary validation
- Performance optimized calculations

### `utils_percentage.js` - **Percentage Conversion Utilities**
**Purpose**: Handles percentage calculations and conversions

**Key Functions:**
- `toPercentage(value, min, max, clampResult)` - Value to percentage
- `fromPercentage(percentage, min, max)` - Percentage to value

**Features:**
- Clamping options
- Debug logging
- Range validation

### `utils_number_validation.js` - **Number Processing Utilities**
**Purpose**: Provides safe number operations and validations

**Key Functions:**
- `clamp(num, min, max)` - Value clamping
- `inRange(num, min, max)` - Range checking
- `roundTo(num, decimals)` - Precise rounding

**Features:**
- Debug logging for all operations
- Boundary validation
- Precision control

### `utils_random.js` - **Random Number Generation**
**Purpose**: Provides controlled random number generation

**Key Functions:**
- `randomRange(min, max)` - Range-based random numbers

**Features:**
- Debug logging for random generation
- Deterministic seed support integration
- Boundary validation

### `utils_safe_accessor.js` - **Safe Object Access**
**Purpose**: Provides safe object property access with fallbacks

**Key Functions:**
- `safeGet(obj, path, defaultValue, contextName)` - Safe property access

**Features:**
- Nested path traversal
- Debug context tracking
- Graceful error handling

### `utils_narrative-filters.js` - **Narrative Content Filtering**
**Purpose**: Filters and processes narrative content based on context

**Key Functions:**
- Context-aware narrative filtering

**Features:**
- Character-specific filtering
- Contextual appropriateness
- Dynamic content adaptation

---

## 🎮 Specialized Systems

### `personality_trigger_evaluators.js` - **AI Personality System**
**Purpose**: Evaluates personality-based triggers for AI behavior

**Features:**
- Character-specific personality evaluation
- Trigger condition assessment
- Behavioral adaptation logic

### `animated_text_engine.js` - **Text Animation System**
**Purpose**: Handles animated text display for battle events

**Features:**
- Queue-based animation processing
- Timing control and pacing
- Visual effect coordination

### `log_to_animation_queue.js` - **Animation Queue Builder**
**Purpose**: Converts battle logs to animation sequences

**Features:**
- Event timing optimization
- Animation sequence construction
- Performance-optimized queuing

---

## 🏗️ Configuration Modules

### `config_phase_transitions.js` - **Phase Transition Configuration**
**Purpose**: Defines phase transition rules and conditions

**Features:**
- Phase progression logic
- Transition condition definitions
- Stalemate configuration

### `constants_*.js` Files - **System Constants**
**Purpose**: Centralized constant definitions for different systems

**Files:**
- `constants_ai.js` - AI decision constants
- `constants_animation.js` - Animation timing constants
- `constants_battle.js` - Battle mechanics constants
- `constants_consolidated.js` - Shared constants
- `constants_environment.js` - Environmental system constants

**Features:**
- Centralized configuration
- System-specific organization
- Easy maintenance and updates

---

## 🔧 Development & Simulation

### `dev_mode_manager.js` - **Development Mode Controller**
**Purpose**: Manages development-specific features and batch simulation

**Features:**
- Batch battle simulation
- Debug output compilation
- Clipboard integration for results

### `dev_progress_ui.js` - **Development Progress Display**
**Purpose**: Provides UI feedback during development operations

**Features:**
- Progress tracking display
- User feedback during batch operations
- Status indication

### `dev_log_formatter.js` - **Development Log Formatting**
**Purpose**: Formats logs for development analysis

**Features:**
- Log aggregation and formatting
- Development-specific output
- Analysis-friendly structure

### `dev_batch_simulator.js` - **Batch Simulation Engine**
**Purpose**: Runs multiple battle simulations for analysis

**Features:**
- Automated batch processing
- Statistical analysis support
- Results compilation

### `simulation_*.js` Files - **Simulation Management**
**Files:**
- `simulation_mode_manager.js` - Mode control and switching
- `simulation_state_manager.js` - State persistence and management
- `simulation_dom_manager.js` - DOM manipulation for simulation UI

**Features:**
- Mode switching (instant vs animated)
- State persistence
- UI coordination

---

## 🎯 Engine Modules

### `engine_escalation_*.js` Files - **Escalation System**
**Files:**
- `engine_escalation.js` - Core escalation logic
- `engine_escalation_ai.js` - AI escalation behavior
- `engine_escalation_modifiers.js` - Escalation effect modifiers
- `engine_escalation_states.js` - Escalation state definitions

**Features:**
- Dynamic battle intensity
- AI behavior adaptation
- Environmental impact scaling

### `engine_incapacitation_score.js` - **Incapacitation Assessment**
**Purpose**: Calculates and tracks character incapacitation levels

**Features:**
- Health-based scoring
- Progression tracking
- Terminal state prediction

---

## 🎨 Data Files

### `data_effectiveness-flavors.js` - **Move Effectiveness Descriptions**
**Purpose**: Provides flavor text for different effectiveness levels

**Features:**
- Contextual effectiveness descriptions
- Character-specific flavor text
- Dynamic narrative enhancement

### `data_dev_mode_matchups.js` - **Development Battle Configurations**
**Purpose**: Predefined battle scenarios for testing

**Features:**
- Quick test scenario setup
- Reproducible battle conditions
- Development workflow optimization

---

## 🐛 Debugging Guidelines

### Debug Logging Standards
All modules should implement consistent debug logging:

```javascript
// Debug logging pattern
console.debug(`[Module Name] Operation: ${operation} with parameters: ${params}`);
console.warn(`[Module Name] Potential issue: ${issue}`);
console.error(`[Module Name] Error: ${error}`);
```

### Performance Monitoring
Key modules include performance tracking:

```javascript
// Performance monitoring pattern
const startTime = performance.now();
// ... operation ...
const duration = performance.now() - startTime;
console.debug(`[Module Name] ${operation} took ${duration.toFixed(2)}ms`);
```

### Error Handling
Consistent error handling across modules:

```javascript
// Error handling pattern
try {
    // ... operation ...
} catch (error) {
    console.error(`[Module Name] ${operation} failed:`, error);
    return fallbackValue;
}
```

---

## 🚀 Usage Patterns

### Import Patterns
```javascript
// Direct function imports
import { functionName } from './module.js';

// Class imports
import { ClassName } from './module.js';

// Namespace imports for related utilities
import * as ModuleUtils from './module.js';
```

### Error Recovery
All modules implement graceful error recovery:
- Fallback values for failed operations
- Default behaviors for missing data
- Graceful degradation of functionality

### Performance Considerations
- Lazy loading where appropriate
- Minimal object creation in hot paths
- Efficient algorithm implementations
- Debug logging that can be disabled in production

---

## 📊 Module Interaction Map

```
Battle Loop Manager
├── Turn Processor
├── Phase Manager
├── HTML Log Builder
└── Event Type Handlers

Utility Layer
├── Impact Level Assessment
├── Mathematical Utilities
├── Validation & Safety
└── Random Generation

Data Processing
├── Log Transformation
├── Animation Queue Building
└── Narrative Filtering

Development Tools
├── Batch Simulation
├── Progress UI
└── Log Formatting
```

---

**Last Updated**: Current
**Version**: 1.0
**Architecture**: Modular, Single Responsibility, Debuggable 
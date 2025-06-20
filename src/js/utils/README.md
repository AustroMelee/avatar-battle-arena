# 🛠️ Utility Module

## 📜 Purpose

The Utility module (`src/js/utils/` and related `src/js/utils_*.js` files) is the foundational layer of the application, providing a collection of reusable, cross-cutting functions that support all other modules. These utilities are designed to be pure, standalone, and highly reliable, following strict defensive programming principles.

The primary goal of this module is to abstract common tasks (like deep cloning, safe object access, and random number generation), prevent code duplication, and enforce runtime stability through comprehensive validation and state invariant checks.

## 🗂️ Files & Exports

The utility functions are organized into standalone files based on their category.

### Core Utilities

-   **`utils_safe_accessor.js`**: Provides functions to safely access nested properties of objects without throwing errors on null or undefined intermediate values.
    -   `safeGet()`: Safely retrieves a property using a dot-notation string path, with a fallback to a default value.
-   **`utils/cloning.js`**: Contains a robust deep-cloning utility.
    -   `safeClone()`: Deep-clones an object while handling cyclical references and enforcing a maximum depth to prevent infinite loops.
-   **`utils_random.js`**: A barrel file that aggregates and exports all random number generation functions from the `src/js/random/` subdirectory, which includes:
    -   Numeric, boolean, and collection-based randomness.
    -   Seeded random number generation for deterministic, replayable results.
-   **`utils_narrative-string-builder.js`**: A utility for constructing dynamic narrative strings from templates and data.

### State Validation & Logging

-   **`utils_state_invariants.js`**: Exports a powerful, "NASA-level" runtime validation system. It checks the entire `battleState` against a set of predefined rules (invariants) to catch data corruption and logical errors during execution. It is highly configurable and provides detailed reports on violations.
    -   `assertBattleStateInvariants()`: The main function to run all checks.
    -   This system relies on the specialized check functions defined in the `utils/validation/invariants/` subdirectory.
-   **`utils/validation/invariants/`**: This subdirectory contains the specific invariant checks for different parts of the battle state, such as `fighter_health.js`, `battle_phase.js`, and `ai_state.js`.
-   **`utils_log_event.js`**: A facade that simplifies the creation of structured, validated battle log events. It uses the `src/js/battle_logging/` module internally to handle the detailed work of creating, validating, and writing log entries.
    -   `generateLogEvent()`: Creates a standard battle event.
    -   `logRoll()`: Creates a specialized event for dice rolls.

## 🧩 Module Interactions

The Utility module is a foundational layer, meaning it is imported by almost every other module in the application but should not have dependencies on them.

```mermaid
graph TD
    subgraph Application Modules
        direction LR
        A[Engine]
        B[AI]
        C[UI]
        D[Data]
    end

    subgraph Utility Layer
        E(utils_safe_accessor.js)
        F(utils/cloning.js)
        G(utils_random.js)
        H(utils_state_invariants.js)
    end

    A --> E;
    A --> F;
    A --> G;
    A --> H;

    B --> E;
    B --> G;
    B --> H;

    C --> G;
    C --> E;

    D --> F;
```

-   **Engine**: Heavily uses `utils_state_invariants` to validate state between turns, `cloning` for simulations, and `random` for calculations.
-   **AI**: Uses `random` for decision-making, `cloning` to simulate future states, and `safe_accessor` to read the battle state.
-   **UI**: Uses `random` for cosmetic effects and `safe_accessor` to read from state objects without risking crashes.
-   **Data**: May use `cloning` to create unique instances of character templates.

## 📝 Architectural Constraints

From `.cursorcontext`:
-   **Utils Layer (`src/js/utils/*.js`)**:
    -   **Purpose**: Shared utility functions across modules.
    -   **Should not import from anything except other `/utils` files.**

This is the most important rule for this module. Utilities must remain generic and self-contained to be truly reusable and to prevent circular dependencies. A utility function should never know about the specific business logic of the `engine` or `ui`.

## Usage Example

Using the state invariant system to ensure data integrity after a complex operation in the engine.

```javascript
// In a file like src/js/engine_turn-processor.js

import { assertBattleStateInvariants } from '../utils_state_invariants.js';

/**
 * Processes a full turn in the battle.
 * @param {BattleState} battleState
 * @returns {BattleState} The new battle state.
 */
export function processTurn(battleState) {
    // ... complex logic to apply moves, effects, etc. ...
    const nextState = applyAllTurnEffects(battleState);
    
    // After all modifications, validate the new state.
    // This will throw a detailed error if, for example, a fighter's HP is
    // negative or a status effect has an invalid duration.
    try {
        assertBattleStateInvariants(nextState, 'end_of_turn');
    } catch (error) {
        console.error("A critical state corruption was detected!", error);
        // Potentially halt the battle or revert to a safe state.
        return battleState; // Return original state on failure
    }

    return nextState;
}
```

## 🏗️ Architecture Overview

All utility functions follow these principles:
- **Type Safety**: Comprehensive JSDoc type annotations with TypeScript checking
- **Input Validation**: Every function validates parameters with specific error messages
- **Defensive Programming**: Boundary checking, null/undefined safety, and error recovery
- **Performance**: Optimized algorithms with benchmarking and monitoring
- **Testability**: Pure functions that are easy to unit test
- **Documentation**: Complete JSDoc with examples and usage patterns

## 📁 Utility Module Categories

### 🧮 **Mathematical Utilities**

#### `utils_math.js` - Core Mathematical Operations
**Purpose**: Provides type-safe mathematical operations with defensive programming
**Key Functions**:
- `clamp(value, min, max)` - Constrains values to specified range
- `lerp(start, end, t)` - Linear interpolation with boundary validation
- `inverseLerp(start, end, value)` - Inverse linear interpolation
- `mapRange(value, fromMin, fromMax, toMin, toMax)` - Maps value between ranges
- `roundToDecimalPlaces(value, places)` - Precise decimal rounding

```javascript
import { clamp, lerp, mapRange } from './utils_math.js';

// Clamp damage to valid range
const damage = clamp(calculatedDamage, 0, 100);

// Interpolate between battle phases
const progress = lerp(0, 100, battleProgress);

// Map momentum to UI scale
const uiMomentum = mapRange(momentum, -100, 100, 0, 200);
```

#### `utils_percentage.js` - Percentage Calculations
**Purpose**: Accurate percentage calculations with formatting and validation
**Key Functions**:
- `calculatePercentage(value, total)` - Calculate percentage with validation
- `percentageToDecimal(percentage)` - Convert percentage to decimal
- `formatPercentage(value, decimals)` - Format percentage for display
- `isValidPercentage(value)` - Validate percentage range

```javascript
import { calculatePercentage, formatPercentage } from './utils_percentage.js';

// Calculate HP percentage
const hpPercentage = calculatePercentage(currentHP, maxHP);

// Format for UI display
const displayText = `HP: ${formatPercentage(hpPercentage, 1)}`;
```

#### `utils_interpolation.js` - Advanced Interpolation and Geometry
**Purpose**: Complex interpolation methods and geometric calculations
**Key Functions**:
- `bezierCurve(t, p0, p1, p2, p3)` - Cubic Bezier curve interpolation
- `smoothStep(edge0, edge1, x)` - Smooth step function
- `calculateDistance(p1, p2)` - Distance between points
- `normalizeVector(vector)` - Vector normalization

```javascript
import { bezierCurve, smoothStep } from './utils_interpolation.js';

// Smooth animation curves
const animationProgress = smoothStep(0, 1, timeProgress);

// Complex UI movement
const position = bezierCurve(t, start, control1, control2, end);
```

### 🎲 **Random Number Generation**

#### `utils_random.js` - General Random Operations
**Purpose**: Comprehensive random number generation with validation
**Key Functions**:
- `randomFloat(min, max)` - Random float in range
- `randomInt(min, max)` - Random integer in range
- `randomChance(probability)` - Random boolean with probability
- `randomElement(array)` - Random array element selection
- `shuffleArray(array)` - Fisher-Yates array shuffle

```javascript
import { randomFloat, randomChance, randomElement } from './utils_random.js';

// Random damage variation
const damage = randomFloat(minDamage, maxDamage);

// Critical hit chance
const isCritical = randomChance(0.15);

// Random move selection
const move = randomElement(availableMoves);
```

#### `utils_seeded_random.js` - Deterministic Random Generation
**Purpose**: Seeded random number generation for reproducible results
**Key Functions**:
- `seededRandom(seed)` - Initialize seeded random generator
- `getRandomElementSeeded(array, seed)` - Deterministic array selection
- `randomFloatSeeded(min, max, seed)` - Seeded float generation
- `createReproducibleSequence(seed, length)` - Generate reproducible sequences

```javascript
import { seededRandom, getRandomElementSeeded } from './utils_seeded_random.js';

// Reproducible battle simulation
const battleSeed = 'battle_001';
const generator = seededRandom(battleSeed);

// Deterministic move selection
const move = getRandomElementSeeded(moves, battleSeed);
```

### 🔍 **Validation and Safety**

#### `utils_number_validation.js` - Comprehensive Number Validation
**Purpose**: Robust numeric validation with detailed error reporting
**Key Functions**:
- `validateNumber(value, context)` - Basic number validation
- `validateRange(value, min, max, context)` - Range validation
- `validateInteger(value, context)` - Integer validation
- `sanitizeNumericInput(input)` - Input sanitization
- `isValidBattleValue(value, type)` - Battle-specific validation

```javascript
import { validateRange, sanitizeNumericInput } from './utils_number_validation.js';

// Validate HP value
validateRange(newHP, 0, maxHP, 'Fighter HP');

// Sanitize user input
const cleanValue = sanitizeNumericInput(userInput);
```

#### `utils_state_invariants.js` - System State Validation
**Purpose**: NASA-level runtime validation for system consistency
**Key Functions**:
- `validateFighter(fighter, context)` - Complete fighter validation
- `validateBattleState(battleState, context)` - Battle state consistency
- `checkInvariants(state, rules)` - General invariant checking
- `reportViolation(violation, context)` - Violation reporting

```javascript
import { validateFighter, validateBattleState } from './utils_state_invariants.js';

// Validate fighter state before battle
validateFighter(fighter, 'Pre-battle validation');

// Ensure battle state consistency
validateBattleState(battleState, 'Turn transition');
```

#### `utils_safe_accessor.js` - Safe Object Property Access
**Purpose**: Null-safe object property access with fallbacks
**Key Functions**:
- `safeGet(object, path, defaultValue)` - Safe property access
- `safeSet(object, path, value)` - Safe property setting
- `hasProperty(object, path)` - Property existence check
- `deepClone(object)` - Deep object cloning

```javascript
import { safeGet, safeSet } from './utils_safe_accessor.js';

// Safe property access
const hp = safeGet(fighter, 'stats.hp', 100);

// Safe property modification
safeSet(fighter, 'status.effects.stunned', true);
```

### 🎨 **UI and Rendering Utilities**

#### `utils_efficient_rendering.js` - Performance-Optimized Rendering
**Purpose**: High-performance DOM manipulation and rendering optimization
**Key Functions**:
- `batchDOMUpdates(operations)` - Batch DOM operations for performance
- `createDebouncedFunction(fn, delay)` - Debounce function calls
- `performanceMonitor(operation)` - Monitor rendering performance
- `createDocumentFragment(elements)` - Efficient DOM fragment creation

```javascript
import { batchDOMUpdates, performanceMonitor } from './utils_efficient_rendering.js';

// Batch UI updates for performance
batchDOMUpdates([
    () => updateHP(newHP),
    () => updateMomentum(newMomentum),
    () => updatePhase(newPhase)
]);

// Monitor performance
const result = performanceMonitor(() => renderBattleLog(events));
```

#### `utils_description-generator.js` - Dynamic Description Generation
**Purpose**: Generates contextual descriptions for UI elements
**Key Functions**:
- `generateMoveDescription(move, context)` - Move descriptions
- `generateStatusDescription(status)` - Status effect descriptions
- `getModifierDescription(modifier)` - Modifier explanations
- `formatBattleEvent(event)` - Event descriptions

```javascript
import { generateMoveDescription, getModifierDescription } from './utils_description-generator.js';

// Generate move tooltip
const tooltip = generateMoveDescription(move, { actor, target, phase });

// Explain modifier effects
const explanation = getModifierDescription(environmentalModifier);
```

### 📊 **Data Processing and Analysis**

#### `utils_impact_level.js` - Battle Impact Assessment
**Purpose**: Analyzes and categorizes the impact level of battle events
**Key Functions**:
- `determineImpactLevel(event)` - Assess event impact (0-4 scale)
- `getImpactDescription(level)` - Get impact description
- `getPauseDurationForImpact(level)` - Get pause timing for animations
- `getEmojiForMove(move)` - Get emoji representation

```javascript
import { determineImpactLevel, getPauseDurationForImpact } from './utils_impact_level.js';

// Assess move impact for animation timing
const impactLevel = determineImpactLevel(battleEvent);
const pauseDuration = getPauseDurationForImpact(impactLevel);
```

### 📝 **Logging and Events**

#### `utils_log_event.js` - Battle Event Logging
**Purpose**: Comprehensive battle event logging with structured data
**Key Functions**:
- `generateLogEvent(type, data, battleState)` - Create log events
- `createPerformanceEvent(operation, duration)` - Performance logging
- `createErrorEvent(error, context)` - Error logging
- `validateEventData(event)` - Event validation

```javascript
import { generateLogEvent, createPerformanceEvent } from './utils_log_event.js';

// Log battle event
const event = generateLogEvent('damage', {
    actorId: 'aang',
    targetId: 'azula',
    damage: 25
}, battleState);

// Log performance metrics
const perfEvent = createPerformanceEvent('AI Decision', duration);
```

### 🔄 **System Integration and Development**

#### `utils_type_automation.js` - Type Annotation Automation
**Purpose**: Tools for systematic type annotation across the codebase
**Key Functions**:
- `addTypeAnnotations(code, filename)` - Add JSDoc annotations
- `inferParameterTypes(params, functionName)` - Infer parameter types
- `generateValidationCode(types)` - Generate validation code
- `analyzeCodeStructure(code)` - Analyze code patterns

```javascript
import { addTypeAnnotations, generateValidationCode } from './utils_type_automation.js';

// Automatically add type annotations
const annotatedCode = addTypeAnnotations(originalCode, 'utils_math.js');

// Generate validation for function
const validation = generateValidationCode(parameterTypes);
```

#### `utils_clipboard.js` - Clipboard Operations
**Purpose**: Browser clipboard integration for debug and export features
**Key Functions**:
- `copyToClipboard(text)` - Copy text to clipboard
- `copyBattleLog(battleLog)` - Copy formatted battle log
- `exportBattleData(data, format)` - Export battle data
- `isClipboardSupported()` - Check clipboard support

```javascript
import { copyToClipboard, copyBattleLog } from './utils_clipboard.js';

// Copy battle results
await copyToClipboard(battleSummary);

// Export battle log
await copyBattleLog(battleEvents);
```

#### `utils_deterministic_replay.js` - Battle Replay System
**Purpose**: Deterministic battle replay and state snapshots
**Key Functions**:
- `createBattleSnapshot(battleState)` - Create state snapshot
- `replayFromSnapshot(snapshot)` - Replay from snapshot
- `validateReplay(original, replayed)` - Validate replay accuracy
- `generateReplayCode(battle)` - Generate replay code

```javascript
import { createBattleSnapshot, replayFromSnapshot } from './utils_deterministic_replay.js';

// Create battle snapshot for replay
const snapshot = createBattleSnapshot(currentBattleState);

// Replay battle from snapshot
const replayResult = replayFromSnapshot(snapshot);
```

## 🎯 Usage Patterns

### Basic Import Pattern
```javascript
// Import specific functions
import { clamp, lerp } from './utils_math.js';
import { randomFloat, randomChance } from './utils_random.js';
import { validateRange } from './utils_number_validation.js';
```

### Defensive Programming Pattern
```javascript
import { validateRange, clamp } from './utils_math.js';
import { safeGet } from './utils_safe_accessor.js';

function updateHP(fighter, newHP) {
    // Validate input
    validateRange(newHP, 0, Infinity, 'Fighter HP');
    
    // Safe access with fallback
    const maxHP = safeGet(fighter, 'maxHp', 100);
    
    // Clamp to valid range
    const clampedHP = clamp(newHP, 0, maxHP);
    
    // Safe update
    fighter.hp = clampedHP;
}
```

### Performance Monitoring Pattern
```javascript
import { performanceMonitor } from './utils_efficient_rendering.js';
import { createPerformanceEvent } from './utils_log_event.js';

function optimizedOperation() {
    const result = performanceMonitor(() => {
        // Expensive operation
        return complexCalculation();
    });
    
    // Log performance metrics
    const perfEvent = createPerformanceEvent('Complex Calculation', result.duration);
    
    return result.value;
}
```

## 🔧 Type Safety Implementation

All utility functions include comprehensive type annotations:

```javascript
/**
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} Clamped value
 * @throws {TypeError} When parameters are not numbers
 * @throws {RangeError} When min > max
 */
export function clamp(value, min, max) {
    // Comprehensive validation
    if (typeof value !== 'number' || typeof min !== 'number' || typeof max !== 'number') {
        throw new TypeError('clamp: all parameters must be numbers');
    }
    
    if (min > max) {
        throw new RangeError(`clamp: min (${min}) cannot be greater than max (${max})`);
    }
    
    return Math.min(Math.max(value, min), max);
}
```

## 🚀 Benefits of Modular Utilities

### ✅ **Type Safety**
- Machine-verified type guarantees
- Comprehensive input validation
- Zero runtime type errors in critical paths

### ✅ **Performance**
- Optimized algorithms with benchmarking
- Tree-shaking for minimal bundle size
- Cached calculations where appropriate

### ✅ **Reliability**
- Defensive programming patterns
- Comprehensive error handling
- Graceful degradation

### ✅ **Testability**
- Pure functions easy to unit test
- Isolated functionality
- Mock-friendly interfaces

### ✅ **Developer Experience**
- Comprehensive documentation
- Clear naming conventions
- Consistent interfaces

## 🔮 Future Extensibility

The utility system is designed for easy extension:

- **New Mathematical Operations**: Add to `utils_math.js` following patterns
- **Enhanced Validation**: Extend `utils_number_validation.js` with new rules
- **Performance Optimizations**: Add new monitoring to `utils_efficient_rendering.js`
- **Additional Random Distributions**: Extend `utils_random.js` with new algorithms
- **Advanced Interpolation**: Add new curves to `utils_interpolation.js`

## 📋 Development Guidelines

When adding new utilities:

1. **Follow Naming Convention**: Use `utils_category.js` format
2. **Add Type Annotations**: Complete JSDoc with type checking
3. **Include Validation**: Validate all inputs with specific error messages
4. **Write Tests**: Unit tests for all functions
5. **Document Examples**: Include usage examples in JSDoc
6. **Performance Considerations**: Optimize for common use cases
7. **Error Handling**: Provide meaningful error messages and recovery

This module provides a robust set of utilities for handling numbers, ensuring type safety, and performing common mathematical operations.

### Key Files
- `utils/validation/number_validator.js`: Core validation functions (`validateNumber`, `validateInteger`, `validateRange`).
- `utils/validation/number_sanitizer.js`: Functions for sanitizing numbers (`sanitizeRange`, `sanitizePrecision`).
- `utils/validation/number_checker.js`: Simple boolean checks for numbers (`isPositiveNumber`, `isInRange`).
- `utils/validation/number_utils.js`: Specialized utilities and converters (`validatePercentage`, `percentageToRatio`).
- `utils_math.js`: Core mathematical functions like `clamp`, `normalize`, etc.
- `utils_random.js`: Utilities for generating random numbers and probabilities.

### Usage Example

```javascript
import { validateRange } from './validation/number_validator.js';
import { sanitizeRange } from './validation/number_sanitizer.js';

// Validate that a value is within a specific range
const { isValid, errors } = validateRange(newHP, { min: 0, max: 100 });
if (!isValid) {
    console.error('HP validation failed:', errors);
}

// Sanitize a number to ensure it falls within a range
const sanitizedHP = sanitizeRange(userInput, { min: 0, max: 100 });
```

## State Management (`state_manager.js`) 
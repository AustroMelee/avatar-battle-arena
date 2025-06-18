# Avatar Battle Arena - Extended API Documentation

This document provides comprehensive API documentation for all public interfaces in the Avatar Battle Arena system, enabling developers to effectively integrate, extend, and maintain the codebase.

## 🎯 **API Overview**

The Avatar Battle Arena exposes several categories of APIs:
- **Core Battle Engine API** - Primary battle simulation interfaces
- **AI System API** - Artificial intelligence and decision-making interfaces
- **UI Component API** - User interface and rendering interfaces
- **Utility API** - Mathematical, validation, and helper functions
- **State Management API** - Battle state and data management interfaces
- **Event System API** - Battle event logging and handling interfaces

## ⚔️ **Core Battle Engine API**

### **Battle Simulation**

#### `simulateBattle(fighter1Id, fighter2Id, locationId, timeOfDay, emotionalMode)`

Primary battle simulation entry point.

```javascript
import { simulateBattle } from './js/engine_battle-engine-core.js';

/**
 * @param {string} fighter1Id - First fighter identifier
 * @param {string} fighter2Id - Second fighter identifier  
 * @param {string} locationId - Battle location identifier
 * @param {string} timeOfDay - Time setting ('day'|'night'|'sunset')
 * @param {boolean} emotionalMode - Enable emotional battle dynamics
 * @returns {BattleResult} Complete battle result with logs and analysis
 * @throws {ValidationError} When fighter or location IDs are invalid
 * @throws {BattleEngineError} When battle engine fails to initialize
 */

// Example Usage
const result = simulateBattle(
    'aang-airbending-only',
    'azula', 
    'fire-nation-capital',
    'day',
    true
);
console.log(`Winner: ${result.winner}`);
console.log(`Battle Events: ${result.log.length}`);
```

### **State Initialization**

#### `initializeFighterState(characterId, battleConditions)`

Creates battle-ready fighter state from character data.

```javascript
import { initializeFighterState } from './js/engine_state_initializer.js';

/**
 * @param {string} characterId - Character identifier from character registry
 * @param {BattleConditions} battleConditions - Location and environmental conditions
 * @returns {Fighter} Fully initialized fighter state
 * @throws {CharacterNotFoundError} When character ID doesn't exist
 * @throws {ValidationError} When battle conditions are invalid
 */

// Example Usage
const fighter = initializeFighterState('aang-airbending-only', {
    location: 'fire-nation-capital',
    timeOfDay: 'day',
    weatherConditions: { type: 'clear', intensity: 0 }
});
```

### **Move Resolution**

#### `calculateMove(actor, target, move, battleState, locationConditions)`

Processes a single combat move with full resolution.

```javascript
import { calculateMove } from './js/engine_move-resolution.js';

/**
 * @param {Fighter} actor - Fighter performing the move
 * @param {Fighter} target - Fighter being targeted
 * @param {Move} move - Move data and configuration
 * @param {BattleState} battleState - Current battle state
 * @param {LocationConditions} locationConditions - Environmental modifiers
 * @returns {MoveResult} Complete move result with damage, effects, and narrative
 * @throws {InvalidMoveError} When move cannot be performed
 * @throws {TargetingError} When target is invalid for move
 */

// Example Usage
const moveResult = calculateMove(
    aang, azula,
    { id: 'air-scooter', name: 'Air Scooter', energyCost: 15 },
    battleState,
    locationConditions
);
console.log(`Damage dealt: ${moveResult.damage}`);
console.log(`Energy remaining: ${moveResult.energyRemaining}`);
```

## 🧠 **AI System API**

### **AI Decision Making**

#### `selectMove(actor, defender, conditions, turn, currentPhase)`

Main AI decision interface for intelligent move selection.

```javascript
import { selectMove } from './js/ai/ai_decision_engine.js';

/**
 * @param {Fighter} actor - AI-controlled fighter
 * @param {Fighter} defender - Opponent fighter
 * @param {BattleConditions} conditions - Current battle conditions
 * @param {number} turn - Current turn number
 * @param {string} currentPhase - Current battle phase
 * @returns {AIDecisionResult} Selected move with reasoning and confidence
 * @throws {AIDecisionError} When AI cannot make a valid decision
 */

// Example Usage
const decision = selectMove(azula, aang, battleConditions, 5, 'mid-battle');
console.log(`Selected move: ${decision.move.name}`);
console.log(`Confidence: ${decision.confidence}`);
console.log(`Reasoning: ${decision.reasoning}`);
```

### **AI Memory and Learning**

#### `updateAiMemory(learner, opponent, moveResult, battleContext)`

Updates AI memory with battle experience for future learning.

```javascript
import { updateAiMemory } from './js/ai/ai_memory.js';

/**
 * @param {Fighter} learner - AI fighter gaining experience
 * @param {Fighter} opponent - Opponent fighter for pattern recognition
 * @param {MoveResult} moveResult - Result of move for effectiveness learning
 * @param {BattleContext} battleContext - Situational context for learning
 * @returns {void}
 * @throws {MemoryUpdateError} When memory cannot be updated
 */

// Example Usage
updateAiMemory(azula, aang, moveResult, {
    phase: 'opening',
    momentum: 'neutral',
    environmentalDamage: 'low'
});
```

### **AI Personality System**

#### `adaptPersonality(fighter, battleOutcome, opponentData)`

Adapts AI personality based on battle results and experiences.

```javascript
import { adaptPersonality } from './js/ai/ai_personality.js';

/**
 * @param {Fighter} fighter - Fighter whose personality to adapt
 * @param {BattleOutcome} battleOutcome - Result of recent battle
 * @param {OpponentData} opponentData - Information about opponent
 * @returns {PersonalityProfile} Updated personality profile
 * @throws {PersonalityAdaptationError} When adaptation fails
 */

// Example Usage
const newPersonality = adaptPersonality(azula, {
    result: 'victory',
    margin: 'decisive',
    duration: 'short'
}, aang.profile);
```

## 🎨 **UI Component API**

### **Battle Results Display**

#### `displayCompleteBattleResults(battleResult, locationId)`

Renders complete battle results with analysis and controls.

```javascript
import { displayCompleteBattleResults } from './js/ui/index.js';

/**
 * @param {BattleResult} battleResult - Complete battle result data
 * @param {string} locationId - Location identifier for context
 * @returns {void}
 * @throws {RenderError} When UI cannot be rendered
 */

// Example Usage
displayCompleteBattleResults(battleResult, 'fire-nation-capital');
```

### **Character Selection**

#### `initializeCharacterSelection(containerElement, onSelectionChange)`

Sets up interactive character selection interface.

```javascript
import { initializeCharacterSelection } from './js/ui_character-selection.js';

/**
 * @param {HTMLElement} containerElement - DOM container for selection UI
 * @param {(selection: CharacterSelection) => void} onSelectionChange - Selection callback
 * @returns {CharacterSelectionManager} Manager for the selection interface
 * @throws {InitializationError} When UI cannot be initialized
 */

// Example Usage
const selectionManager = initializeCharacterSelection(
    document.getElementById('character-selection'),
    (selection) => {
        console.log(`Selected: ${selection.characterId}`);
        updateBattleConfiguration(selection);
    }
);
```

### **Battle Analysis**

#### `analyzeBattleResults(battleResult)`

Performs comprehensive analysis of battle results for display.

```javascript
import { analyzeBattleResults } from './js/ui/battle_analysis.js';

/**
 * @param {BattleResult} battleResult - Raw battle result data
 * @returns {BattleAnalysis} Structured analysis with metrics and insights
 * @throws {AnalysisError} When analysis cannot be performed
 */

// Example Usage
const analysis = analyzeBattleResults(battleResult);
console.log(`Battle duration: ${analysis.duration} turns`);
console.log(`Damage efficiency: ${analysis.damageEfficiency}%`);
console.log(`Tactical rating: ${analysis.tacticalRating}/10`);
```

## 🔧 **Utility API**

### **Mathematical Operations**

#### `clamp(value, min, max)`

Constrains a value to specified range with validation.

```javascript
import { clamp } from './js/utils_math.js';

/**
 * @param {number} value - Value to constrain
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} Clamped value within range
 * @throws {TypeError} When parameters are not numbers
 * @throws {RangeError} When min > max
 */

// Example Usage
const hp = clamp(calculatedHP, 0, 100); // Ensures HP stays 0-100
const damage = clamp(baseDamage * modifier, 1, 50); // Damage range 1-50
```

#### `lerp(start, end, t)`

Linear interpolation between two values.

```javascript
import { lerp } from './js/utils_math.js';

/**
 * @param {number} start - Starting value
 * @param {number} end - Ending value  
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 * @throws {TypeError} When parameters are not numbers
 * @throws {RangeError} When t is outside 0-1 range
 */

// Example Usage
const animationProgress = lerp(0, 100, timeProgress); // 0-100% animation
const colorInterpolation = lerp(255, 0, damageRatio); // Red to black fade
```

### **Random Number Generation**

#### `randomFloat(min, max)`

Generates random floating-point number in specified range.

```javascript
import { randomFloat } from './js/utils_random.js';

/**
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (exclusive)
 * @returns {number} Random float in range [min, max)
 * @throws {TypeError} When parameters are not numbers
 * @throws {RangeError} When min >= max
 */

// Example Usage
const criticalChance = randomFloat(0, 1); // 0.0 to 0.999...
const damageVariation = randomFloat(0.8, 1.2); // ±20% damage variation
```

#### `seededRandom(seed)`

Creates deterministic random number generator for reproducible results.

```javascript
import { seededRandom } from './js/utils_seeded_random.js';

/**
 * @param {string|number} seed - Seed value for reproducible randomness
 * @returns {() => number} Random number generator function
 * @throws {TypeError} When seed is invalid type
 */

// Example Usage
const battleRNG = seededRandom('battle_replay_001');
const move1Damage = battleRNG() * 50; // Reproducible damage calculation
const move2Success = battleRNG() > 0.8; // Reproducible success check
```

### **Validation and Safety**

#### `validateRange(value, min, max, context)`

Validates that a value falls within specified range.

```javascript
import { validateRange } from './js/utils_number_validation.js';

/**
 * @param {number} value - Value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @param {string} context - Description for error messages
 * @returns {void}
 * @throws {RangeError} When value is outside range
 * @throws {TypeError} When value is not a number
 */

// Example Usage
validateRange(newHP, 0, fighter.maxHP, 'Fighter HP update');
validateRange(energyCost, 0, 100, 'Move energy cost');
```

#### `safeGet(object, path, defaultValue)`

Safely accesses nested object properties with fallback.

```javascript
import { safeGet } from './js/utils_safe_accessor.js';

/**
 * @param {Object} object - Object to access properties from
 * @param {string} path - Dot-separated property path
 * @param {any} defaultValue - Value to return if property doesn't exist
 * @returns {any} Property value or default value
 * @throws {TypeError} When object is null/undefined
 */

// Example Usage
const hp = safeGet(fighter, 'stats.currentHP', 100);
const ability = safeGet(character, 'traits.abilities.firebending', false);
```

## 📊 **State Management API**

### **State Updates**

#### `updateGameState(newState)`

Updates global game state with validation and change detection.

```javascript
import { updateGameState } from './js/state_manager.js';

/**
 * @param {Partial<GameState>} newState - Partial state object with updates
 * @returns {void}
 * @throws {StateValidationError} When state update is invalid
 */

// Example Usage
updateGameState({
    ui: { 
        mode: 'battle-results',
        loading: false 
    },
    battle: { 
        phase: 'completed',
        winner: 'aang'
    }
});
```

#### `forceRender()`

Forces re-render of all UI components.

```javascript
import { forceRender } from './js/state_manager.js';

/**
 * @returns {void}
 * @throws {RenderError} When render fails
 */

// Example Usage  
forceRender(); // Re-render after major state changes
```

### **State Validation**

#### `validateBattleState(battleState, context)`

Validates battle state consistency and invariants.

```javascript
import { validateBattleState } from './js/utils_state_invariants.js';

/**
 * @param {BattleState} battleState - Battle state to validate
 * @param {string} context - Context description for error reporting
 * @returns {void}
 * @throws {StateValidationError} When state is invalid
 */

// Example Usage
validateBattleState(currentBattleState, 'Pre-turn validation');
validateBattleState(updatedState, 'Post-move resolution');
```

## 📝 **Event System API**

### **Event Creation**

#### `generateLogEvent(type, data, battleState)`

Creates structured battle event for logging system.

```javascript
import { generateLogEvent } from './js/utils_log_event.js';

/**
 * @param {string} type - Event type identifier
 * @param {Object} data - Event-specific data
 * @param {BattleState} battleState - Current battle state for context
 * @returns {BattleEvent} Structured event object
 * @throws {EventCreationError} When event cannot be created
 */

// Example Usage
const damageEvent = generateLogEvent('damage', {
    actorId: 'aang',
    targetId: 'azula',
    damage: 25,
    moveId: 'air-blast'
}, battleState);
```

### **Event Logging**

#### `createAndLogEvent(battleLog, battleState, eventData)`

Creates and logs event in single operation.

```javascript
import { createAndLogEvent } from './js/battle_logging/index.js';

/**
 * @param {BattleEvent[]} battleLog - Battle log array to append to
 * @param {BattleState} battleState - Current battle state
 * @param {Object} eventData - Event data to log
 * @returns {BattleEvent} Created and logged event
 * @throws {LoggingError} When logging fails
 */

// Example Usage
const event = createAndLogEvent(battleLog, battleState, {
    type: 'phase_change',
    fromPhase: 'opening',
    toPhase: 'mid-battle',
    reason: 'Turn threshold reached'
});
```

## 🔌 **Integration Examples**

### **Custom Battle Simulation**

```javascript
// Complete battle simulation with custom configuration
import { simulateBattle } from './js/engine_battle-engine-core.js';

async function runCustomBattle(config) {
    try {
        const result = simulateBattle(
            config.fighter1Id,
            config.fighter2Id,
            config.locationId,
            config.timeOfDay,
            config.emotionalMode
        );
        
        return {
            success: true,
            result,
            metadata: { configuration: config }
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            configuration: config
        };
    }
}
```

### **AI Training System**

```javascript
// AI training with multiple battles and learning
import { selectMove, updateAiMemory, adaptPersonality } from './js/ai/index.js';

class AITrainingSystem {
    constructor(traineeId, opponentIds) {
        this.traineeId = traineeId;
        this.opponentIds = opponentIds;
        this.trainingHistory = [];
    }
    
    async runTrainingSession(numBattles = 100) {
        for (let i = 0; i < numBattles; i++) {
            const opponentId = this.opponentIds[i % this.opponentIds.length];
            const result = await this.runTrainingBattle(this.traineeId, opponentId);
            
            // Update AI memory and personality
            this.updateAIFromBattle(result);
            this.trainingHistory.push(result);
        }
        
        return this.analyzeTrainingResults();
    }
    
    updateAIFromBattle(battleResult) {
        const trainee = battleResult.fighters[this.traineeId];
        const opponent = battleResult.fighters[battleResult.opponentId];
        
        // Update memory with battle experience
        updateAiMemory(trainee, opponent, battleResult.moveResults, battleResult.context);
        
        // Adapt personality based on outcome
        adaptPersonality(trainee, battleResult.outcome, opponent.profile);
    }
}
```

### **Custom UI Components**

```javascript
// Creating custom battle analysis component
import { analyzeBattleResults } from './js/ui/battle_analysis.js';
import { batchDOMUpdates } from './js/utils_efficient_rendering.js';

class CustomBattleAnalyzer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.analysisCache = new Map();
    }
    
    displayAnalysis(battleResult) {
        // Use caching for performance
        const cacheKey = this.generateCacheKey(battleResult);
        let analysis = this.analysisCache.get(cacheKey);
        
        if (!analysis) {
            analysis = analyzeBattleResults(battleResult);
            this.analysisCache.set(cacheKey, analysis);
        }
        
        // Batch DOM updates for performance
        batchDOMUpdates([
            () => this.renderOverview(analysis),
            () => this.renderTimeline(analysis.timeline),
            () => this.renderStatistics(analysis.statistics),
            () => this.renderInsights(analysis.insights)
        ]);
    }
    
    renderOverview(analysis) {
        const overviewElement = this.container.querySelector('.analysis-overview');
        overviewElement.innerHTML = `
            <h3>Battle Analysis</h3>
            <p>Duration: ${analysis.duration} turns</p>
            <p>Winner: ${analysis.winner}</p>
            <p>Victory Condition: ${analysis.victoryCondition}</p>
        `;
    }
}
```

## 🔧 **Error Handling**

### **Standard Error Types**

All APIs use consistent error types for predictable error handling:

```javascript
// Battle Engine Errors
class BattleEngineError extends Error {
    constructor(message, code, context) {
        super(message);
        this.name = 'BattleEngineError';
        this.code = code;
        this.context = context;
    }
}

// AI Decision Errors  
class AIDecisionError extends Error {
    constructor(message, actorId, context) {
        super(message);
        this.name = 'AIDecisionError';
        this.actorId = actorId;
        this.context = context;
    }
}

// Validation Errors
class ValidationError extends Error {
    constructor(message, fieldName, value) {
        super(message);
        this.name = 'ValidationError';
        this.fieldName = fieldName;
        this.value = value;
    }
}
```

### **Error Handling Patterns**

```javascript
// Comprehensive error handling example
async function robustBattleSimulation(config) {
    try {
        const result = await simulateBattle(
            config.fighter1Id,
            config.fighter2Id, 
            config.locationId,
            config.timeOfDay,
            config.emotionalMode
        );
        return { success: true, result };
    } catch (error) {
        switch (error.constructor) {
            case ValidationError:
                return {
                    success: false,
                    errorType: 'validation',
                    message: `Invalid configuration: ${error.message}`,
                    field: error.fieldName
                };
            case BattleEngineError:
                return {
                    success: false,
                    errorType: 'engine',
                    message: `Battle simulation failed: ${error.message}`,
                    code: error.code
                };
            default:
                return {
                    success: false,
                    errorType: 'unknown',
                    message: `Unexpected error: ${error.message}`
                };
        }
    }
}
```

## 📋 **API Usage Checklist**

Before using any API:

- [ ] **Import the correct module** and functions
- [ ] **Validate input parameters** match expected types
- [ ] **Handle all documented error types** with appropriate responses
- [ ] **Check return value structure** matches documentation
- [ ] **Use TypeScript checking** or JSDoc validation where available
- [ ] **Follow defensive programming** patterns for robustness
- [ ] **Test with edge cases** and invalid inputs
- [ ] **Monitor performance** for computationally expensive operations

## 🔮 **API Evolution**

The Avatar Battle Arena API follows semantic versioning:

- **Major versions** (3.x.x) - Breaking changes to public API
- **Minor versions** (2.x.x) - New features, backward compatible
- **Patch versions** (2.1.x) - Bug fixes, no API changes

### **Deprecated APIs**

Deprecated functions are marked and will be removed in future versions:

```javascript
/**
 * @deprecated Use simulateBattle() instead [since: 2.0.0] [removeIn: 3.0.0]
 */
export function oldBattleEngine() {
    console.warn('oldBattleEngine is deprecated. Use simulateBattle() instead.');
    // Legacy implementation
}
```

---

**This API documentation ensures developers can effectively integrate with and extend the Avatar Battle Arena system while maintaining type safety and error handling standards.** 
# JSDoc Conventions - Avatar Battle Arena

This document outlines the comprehensive JSDoc standards used throughout the Avatar Battle Arena codebase to achieve 99th percentile type safety and developer experience.

## 🎯 **Overview**

The Avatar Battle Arena uses JSDoc for TypeScript-level type checking without requiring a build step. Our JSDoc conventions provide:
- **Machine-verified type safety** with `jsconfig.json` strict checking
- **Comprehensive documentation** for all public APIs
- **IDE integration** for autocomplete and error detection
- **AI-friendly patterns** for code generation and maintenance

## 📋 **Core JSDoc Patterns**

### **1. Function Documentation Template**

Every function must follow this comprehensive template:

```javascript
/**
 * Brief function description explaining what it does and why it exists
 * 
 * Detailed explanation of behavior, edge cases, and important context.
 * Include algorithm complexity, performance considerations, or business logic details.
 * 
 * @param {Type} paramName - Parameter description with constraints/validation rules
 * @param {Type} [optionalParam] - Optional parameter (square brackets indicate optional)
 * @param {Type} [optionalParam=defaultValue] - Optional with default value
 * @returns {ReturnType} Description of return value, including possible states
 * @throws {ErrorType} When specific error conditions occur
 * @throws {ErrorType} When validation fails (be specific about failure conditions)
 * 
 * @example
 * // Comprehensive usage example with context
 * const result = functionName(validInput, { option: true });
 * console.log(result); // Expected output
 * 
 * @example
 * // Error case example
 * try {
 *   functionName(invalidInput);
 * } catch (error) {
 *   console.error('Expected error:', error.message);
 * }
 * 
 * @since 2.0.0
 * @public
 * @performance O(n) time complexity
 * @security Validates all inputs to prevent injection
 */
export function functionName(paramName, optionalParam = defaultValue) {
    // Implementation with comprehensive validation
}
```

### **2. Type Import Pattern**

All files must import types at the top with this pattern:

```javascript
/**
 * @fileoverview Brief file description and purpose
 * @description Detailed description of module functionality and architecture
 * @version 1.0.0
 */

'use strict';

// --- TYPE IMPORTS ---
/**
 * @typedef {import('./types.js').Fighter} Fighter
 * @typedef {import('./types.js').BattleState} BattleState
 * @typedef {import('./types.js').BattleEvent} BattleEvent
 */
```

### **3. Variable Type Annotations**

All variables must be typed, especially complex objects:

```javascript
/** @type {Fighter} */
const fighter = initializeFighter(characterData);

/** @type {BattleEvent[]} */
const battleLog = [];

/** @type {Object<string, number>} */
const scoreMap = {};

/** @type {HTMLElement | null} */
const element = document.getElementById('battle-ui');

/** @type {(event: Event) => void} */
const eventHandler = (event) => {
    // Handler implementation
};
```

### **4. Class Documentation**

Classes require comprehensive documentation:

```javascript
/**
 * Class description explaining purpose and usage patterns
 * 
 * @class
 * @public
 * @since 2.0.0
 * 
 * @example
 * // Basic usage
 * const manager = new BattleManager(config);
 * manager.initialize();
 */
export class BattleManager {
    /**
     * Creates a new BattleManager instance
     * 
     * @param {BattleConfig} config - Battle configuration object
     * @throws {TypeError} When config is invalid
     * @throws {ValidationError} When config fails validation
     */
    constructor(config) {
        /** @type {BattleConfig} @private */
        this.config = this.validateConfig(config);
        
        /** @type {boolean} @private */
        this.initialized = false;
    }
    
    /**
     * Method description with full context
     * 
     * @param {string} battleId - Unique battle identifier
     * @returns {Promise<BattleResult>} Battle result with complete data
     * @async
     * @throws {BattleError} When battle execution fails
     * 
     * @example
     * const result = await manager.startBattle('battle_001');
     */
    async startBattle(battleId) {
        // Implementation
    }
}
```

## 🔧 **Type System Integration**

### **1. Central Type Registry**

All types are defined in `js/types.js`:

```javascript
/**
 * @typedef {Object} Fighter
 * @description Complete fighter state during battle
 * @property {string} id - Unique fighter identifier
 * @property {string} name - Display name
 * @property {number} hp - Current hit points (0-100)
 * @property {number} energy - Current energy (0-100)
 * @property {MentalState} mentalState - Psychological state
 * @property {FighterTraits} traits - Character abilities
 */
```

### **2. Complex Type Patterns**

#### **Union Types**
```javascript
/**
 * @param {'fire'|'water'|'earth'|'air'} element - Bending element
 * @param {string|number} identifier - Character ID or index
 * @param {BattleEvent|BattleEvent[]} events - Single event or array
 */
```

#### **Generic Types**
```javascript
/**
 * @template T
 * @param {T[]} array - Array of any type
 * @param {(item: T) => boolean} predicate - Filter function
 * @returns {T[]} Filtered array
 */
```

#### **Function Types**
```javascript
/**
 * @typedef {(fighter: Fighter, move: Move) => number} DamageCalculator
 * @typedef {(state: BattleState) => boolean} StateValidator
 * @typedef {() => void} EventHandler
 */
```

## 🛡️ **Validation Documentation**

### **1. Input Validation Pattern**

All functions must document validation:

```javascript
/**
 * Updates fighter HP with comprehensive validation
 * 
 * @param {Fighter} fighter - Fighter to update (must be valid Fighter object)
 * @param {number} newHP - New HP value (must be 0-100, integer)
 * @returns {Fighter} Updated fighter object
 * @throws {TypeError} When fighter is not a valid Fighter object
 * @throws {RangeError} When newHP is outside 0-100 range
 * @throws {ValidationError} When fighter.maxHp is invalid
 * 
 * @validation
 * - fighter: Must have id, name, hp, maxHp properties
 * - newHP: Must be number between 0 and fighter.maxHp
 * - Clamps HP to valid range if slightly out of bounds
 */
export function updateFighterHP(fighter, newHP) {
    // Validation implementation
    if (!fighter || typeof fighter !== 'object') {
        throw new TypeError('updateFighterHP: fighter must be a valid Fighter object');
    }
    
    if (typeof newHP !== 'number' || newHP < 0) {
        throw new RangeError(`updateFighterHP: newHP must be >= 0, got ${newHP}`);
    }
    
    // Implementation
}
```

### **2. Error Documentation Pattern**

Document all possible errors with specific conditions:

```javascript
/**
 * @throws {TypeError} When battleState is null or undefined
 * @throws {TypeError} When battleState.fighters is not an array
 * @throws {ValidationError} When battleState has no valid fighters
 * @throws {RangeError} When turn number is negative
 * @throws {BattleEngineError} When battle engine is in invalid state
 * @throws {TimeoutError} When operation exceeds maximum allowed time
 */
```

## 📊 **Performance Documentation**

### **1. Performance Annotations**

Document performance characteristics:

```javascript
/**
 * Calculates move effectiveness with optimized lookup
 * 
 * @param {Move} move - Move to calculate effectiveness for
 * @param {Fighter} target - Target fighter
 * @returns {number} Effectiveness multiplier (0.5-2.0)
 * 
 * @performance O(1) lookup time using pre-computed effectiveness matrix
 * @performance Cached results for identical move-target combinations
 * @performance ~0.1ms execution time for typical cases
 * 
 * @memory Uses 2KB effectiveness cache, cleared every 100 calls
 */
```

### **2. Complexity Documentation**

```javascript
/**
 * @complexity Time: O(n log n) where n is number of available moves
 * @complexity Space: O(n) for sorting temporary arrays
 * @complexity Best case: O(1) when move is cached
 * @complexity Worst case: O(n²) when all moves require recalculation
 */
```

## 🎨 **Documentation Quality Standards**

### **1. Description Quality**

#### **Good Examples:**
```javascript
/**
 * Calculates battle momentum change based on move effectiveness and current state
 * 
 * Momentum shifts create dynamic battle flow where successful moves build
 * advantage while failures create openings for counterattacks.
 */
```

#### **Bad Examples:**
```javascript
/**
 * Updates momentum  // Too brief, no context
 * 
 * This function does momentum stuff  // Vague and unprofessional
 */
```

### **2. Parameter Documentation**

#### **Good Examples:**
```javascript
/**
 * @param {number} damage - Damage amount (0-100, validated against maxHP)
 * @param {string} moveId - Move identifier (must exist in move registry)
 * @param {Fighter} attacker - Attacking fighter (must be active in battle)
 */
```

#### **Bad Examples:**
```javascript
/**
 * @param {number} damage - The damage
 * @param {string} moveId - Move ID
 * @param {Fighter} attacker - Attacker
 */
```

## 🔍 **Documentation Testing**

### **1. JSDoc Validation**

Use TypeScript checking to validate JSDoc:

```json
// jsconfig.json
{
    "compilerOptions": {
        "checkJs": true,
        "strict": true,
        "noImplicitAny": true,
        "noImplicitReturns": true,
        "noImplicitThis": true
    }
}
```

### **2. Documentation Completeness Check**

```javascript
// Add to development tools
function validateDocumentation() {
    // Check for missing @param tags
    // Verify @returns accuracy
    // Validate @throws documentation
    // Ensure examples are current
}
```

## 📚 **Module-Specific Conventions**

### **1. Engine Modules**

Engine modules require additional documentation:

```javascript
/**
 * @fileoverview Battle Engine Core - Primary battle simulation orchestrator
 * @description Coordinates all battle systems including AI, move resolution,
 *              state management, and narrative generation
 * @module BattleEngineCore
 * @requires ./types.js
 * @requires ./engine_state_initializer.js
 * @version 2.1.0
 * @author Avatar Battle Arena Team
 * @since 1.0.0
 */

/**
 * @namespace BattleEngine
 * @description Core battle simulation functionality
 */

/**
 * @memberof BattleEngine
 * @function simulateBattle
 */
```

### **2. Utility Modules**

Utility modules emphasize reusability:

```javascript
/**
 * @fileoverview Mathematical Utilities - Pure mathematical functions
 * @description Provides type-safe mathematical operations with comprehensive
 *              validation and error handling. All functions are pure.
 * @module MathUtils
 * @pure All functions are side-effect free
 * @threadsafe All functions are thread-safe
 */

/**
 * @pure Function has no side effects
 * @threadsafe Function is safe for concurrent use
 * @deterministic Function always returns same output for same input
 */
```

### **3. UI Modules**

UI modules document accessibility and user interaction:

```javascript
/**
 * @fileoverview Character Selection UI - Accessible character selection interface
 * @description Provides WCAG-compliant character selection with keyboard
 *              navigation and screen reader support
 * @module CharacterSelectionUI
 * @accessibility WCAG 2.1 AA compliant
 * @keyboard Full keyboard navigation support
 * @screenreader ARIA labels and descriptions
 */

/**
 * @accessibility Supports screen readers with ARIA labels
 * @keyboard Handles Tab, Enter, Space, Arrow keys
 * @focus Manages focus appropriately for accessibility
 */
```

## 🔧 **Development Workflow**

### **1. Pre-commit Documentation Check**

```javascript
// Development tool to validate JSDoc before commit
function validateJSDoc() {
    // Check all exported functions have JSDoc
    // Verify parameter documentation matches function signature
    // Ensure return types are documented
    // Validate example code syntax
}
```

### **2. Documentation Generation**

```javascript
/**
 * @automated This documentation is automatically validated
 * @generated Examples are auto-tested for correctness
 * @version This version matches the file's actual version
 */
```

## 🎯 **Benefits of These Conventions**

### **✅ Type Safety**
- Machine-verified type checking without build step
- IDE autocomplete and error detection
- Runtime validation guided by documentation

### **✅ Developer Experience**
- Comprehensive API documentation
- Clear usage examples and patterns
- Error handling guidance

### **✅ AI-Friendly**
- Consistent patterns for code generation
- Complete context for AI understanding
- Validation rules for AI-generated code

### **✅ Maintainability**
- Self-documenting code
- Clear interfaces between modules
- Comprehensive error documentation

## 📋 **JSDoc Checklist**

Before committing any function, verify:

- [ ] **Function has comprehensive description**
- [ ] **All parameters documented with types and constraints**
- [ ] **Return value documented with type and description**
- [ ] **All possible errors documented with conditions**
- [ ] **At least one usage example provided**
- [ ] **Performance characteristics noted if relevant**
- [ ] **Type imports at file level**
- [ ] **Variable type annotations for complex objects**
- [ ] **Validation rules clearly specified**
- [ ] **Examples are syntactically correct and current**

## 🔮 **Future Enhancements**

- **Automated Documentation Testing**: Validate examples execute correctly
- **Documentation Coverage Reports**: Track JSDoc completeness metrics
- **API Documentation Generation**: Auto-generate comprehensive API docs
- **Interactive Documentation**: Live examples with code execution
- **Documentation Versioning**: Track documentation changes with code changes

---

**Adherence to these conventions ensures the Avatar Battle Arena maintains its 99th percentile type safety and developer experience standards.** 
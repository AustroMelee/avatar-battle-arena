# Curbstomp System - Modular Architecture

## Overview
The Avatar Battle Arena Curbstomp System has been refactored from a monolithic structure into a clean, modular architecture that follows the Single Responsibility Principle. This modular approach provides better maintainability, testability, and extensibility.

## Architecture

### Core Modules

#### 1. `curbstomp_state.js` - State Management
**Responsibility:** Purely tracks who's marked for defeat
- Manages the `charactersMarkedForDefeat` Set
- Provides reset, query, and serialization functionality
- No side effects or business logic

**Key Functions:**
- `resetCurbstompState()` - Clear all marked characters
- `markCharacterForDefeat(characterId)` - Mark a character
- `isCharacterMarkedForDefeat(characterId)` - Check mark status
- `serializeState()` / `restoreState()` - Save/load support

#### 2. `curbstomp_rule_registry.js` - Rule Data Management
**Responsibility:** Loads/organizes rules from data files
- Imports from `data_mechanics_characters.js` and `data_mechanics_locations.js`
- Provides filtering and lookup helpers
- No rule evaluation logic

**Key Functions:**
- `getAllCurbstompRulesForBattle(fighter1, fighter2, locationId)` - Get applicable rules
- `filterApplicableRules(rules, fighter1, fighter2, battleState)` - Filter by criteria
- `getRulesForFighter(rules, fighter, opponent, battleState)` - Fighter-specific rules

#### 3. `curbstomp_rule_engine.js` - Core Logic Engine
**Responsibility:** Evaluates/applies rules, no side effects
- Determines which rules trigger
- Orchestrates rule application
- Delegates all narrative and logging to other modules

**Key Functions:**
- `applyCurbstompRules(fighter1, fighter2, battleState, battleEventLog, isPreBattle)` - Main entry point
- `checkCurbstompConditions(attacker, defender, locId, battleState)` - Overwhelming advantage detection

#### 4. `curbstomp_victim_selector.js` - Victim Selection Logic
**Responsibility:** Who gets curbstomped?
- Handles weighting logic and randomness
- Supports complex probability distributions
- Includes miraculous survival checks

**Key Functions:**
- `selectCurbstompVictim(options)` - Main victim selection
- `calculateSelectionWeights(attacker, defender, battleState)` - Weight calculation
- `checkMiraculousSurvival(character, rule, survivalChance)` - Miracle survival

#### 5. `curbstomp_narrative.js` - Narrative Generation
**Responsibility:** Only for generating narrative/logging events
- Keeps text, HTML, and debug output separate from logic
- Provides specialized narrative generators for different event types
- Manages AI log entries

**Key Functions:**
- `generateRuleTriggerNarrative()` - Rule trigger events
- `generateCurbstompDetectionNarrative()` - Overwhelming advantage
- `generateInstantWinNarrative()` - Victory outcomes
- `addCurbstompAiLog()` - AI log management

#### 6. `index.js` - Barrel Exports
**Responsibility:** Public API coordination
- Provides both flat and namespaced exports
- Convenience re-exports for common functions
- Tree-shaking friendly

## Usage Examples

### Basic Usage (Backward Compatible)
```javascript
import { resetCurbstompState, applyCurbstompRules, checkCurbstompConditions } from './curbstomp/index.js';

// Same API as before
resetCurbstompState();
applyCurbstompRules(fighter1, fighter2, battleState, battleEventLog, false);
const isOverwhelming = checkCurbstompConditions(attacker, defender, locationId, battleState);
```

### Modular Usage (New Capabilities)
```javascript
import { CurbstompRuleRegistry, CurbstompVictimSelector } from './curbstomp/index.js';

// Get rules for specific fighters
const rules = CurbstompRuleRegistry.getRulesForFighter(allRules, fighter, opponent, battleState);

// Calculate selection weights
const weights = CurbstompVictimSelector.calculateSelectionWeights(attacker, defender, battleState);
```

### Namespaced Usage
```javascript
import { CurbstompNarrative } from './curbstomp/index.js';

// Generate specific narrative types
const survivalEvent = CurbstompNarrative.generateSurvivalMiracleNarrative(battleState, character, rule);
const winEvent = CurbstompNarrative.generateInstantWinNarrative(battleState, winner, loser, rule);
```

## Benefits of Modular Architecture

### 🧪 **Testability**
- Each module can be unit tested in isolation
- Victim selection logic is now easily testable
- Mock dependencies for focused testing

### 🔧 **Maintainability**
- Single Responsibility Principle enforced
- Changes to narrative don't affect rule logic
- Clear ownership boundaries for team development

### 🚀 **Extensibility**
- Easy to add new rule types
- New narrative generators can be added without touching core logic
- Alternative victim selection algorithms can be swapped in

### 🎯 **AI/Cursor Friendly**
- Smaller, focused files
- Clear module boundaries
- Self-documenting structure

### ⚡ **Performance**
- Tree-shaking support
- Selective imports
- Hot-swappable modules for A/B testing

### 🔄 **Backward Compatibility**
- Original API preserved through compatibility layer
- Gradual migration path
- No breaking changes

## Migration Notes

The existing `engine_curbstomp_manager.js` has been converted to a compatibility layer that:
1. Imports from the new modular system
2. Re-exports the original API
3. Provides enhanced functions for advanced usage
4. Maintains 100% backward compatibility

## Testing

Each module can be tested independently:

```javascript
// Test state management
import { markCharacterForDefeat, isCharacterMarkedForDefeat } from './curbstomp_state.js';

// Test rule filtering
import { filterApplicableRules } from './curbstomp_rule_registry.js';

// Test victim selection
import { selectCurbstompVictim } from './curbstomp_victim_selector.js';

// Test narrative generation
import { generateInstantWinNarrative } from './curbstomp_narrative.js';
```

## Future Enhancements

The modular architecture enables:
- **Rule Editor UI** - Visual rule creation/editing
- **Analytics Dashboard** - Rule effectiveness tracking
- **A/B Testing Framework** - Different victim selection algorithms
- **Save/Load System** - Battle state persistence
- **CLI Tools** - Batch rule analysis
- **Plugin System** - Third-party rule extensions

## File Structure
```
js/curbstomp/
├── README.md                    # This documentation
├── index.js                     # Barrel exports
├── curbstomp_state.js          # State management
├── curbstomp_rule_registry.js  # Rule data & filtering
├── curbstomp_rule_engine.js    # Core logic engine
├── curbstomp_victim_selector.js # Victim selection
└── curbstomp_narrative.js      # Narrative generation
```

This architecture transforms the curbstomp system from a maintenance burden into a flexible, extensible foundation for complex battle mechanics. 
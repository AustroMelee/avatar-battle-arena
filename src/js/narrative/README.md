# Narrative Engine - Modular Architecture

## Overview

The Avatar Battle Arena narrative engine has been refactored from a monolithic "kitchen sink" file into a focused, modular architecture. Each module handles a single responsibility, making the system more maintainable, testable, and AI-editing friendly.

## Architecture

### Module Breakdown

```
js/narrative/
├── index.js                  # Barrel export (central coordinator)
├── stringSubstitution.js     # Token replacement engine
├── quoteEngine.js           # Character dialogue & quote system
├── actionNarration.js       # Move action descriptions
├── environmentNarrative.js  # Environmental damage & impact
├── escalationNarrative.js   # Character state changes
├── curbstompNarrative.js    # Overwhelming victory narratives
├── victoryNarrative.js      # Final victory lines
├── statusChange.js          # HP/energy/momentum/stun narratives
└── README.md               # This documentation
```

### Separation of Concerns

| Module | Responsibility | Key Functions |
|--------|---------------|---------------|
| **stringSubstitution** | Token replacement in templates | `substituteTokens()` |
| **quoteEngine** | Finding and formatting character quotes | `findNarrativeQuote()`, `formatQuoteEvent()` |
| **actionNarration** | Action descriptions and turn narration | `generateActionDescriptionObject()`, `generateTurnNarrationObjects()` |
| **environmentNarrative** | Environmental damage and impact lines | `generateCollateralDamageEvent()`, `generateEnvironmentalSummaryEvent()`, `getEnvironmentImpactLine()` |
| **escalationNarrative** | Character escalation state changes | `generateEscalationNarrative()` |
| **curbstompNarrative** | Overwhelming victory descriptions | `generateCurbstompNarration()` |
| **victoryNarrative** | Final battle conclusion lines | `getFinalVictoryLine()` |
| **statusChange** | All status change narratives | `generateStatusChangeEvent()` |

## Usage Patterns

### Option 1: Flat Imports (Recommended for specific functions)

```javascript
import { substituteTokens } from './narrative/stringSubstitution.js';
import { findNarrativeQuote, formatQuoteEvent } from './narrative/quoteEngine.js';
import { generateActionDescriptionObject } from './narrative/actionNarration.js';
```

### Option 2: Barrel Import (Convenient for multiple functions)

```javascript
import { 
    substituteTokens, 
    findNarrativeQuote, 
    generateActionDescriptionObject,
    generateCollateralDamageEvent 
} from './narrative/index.js';
```

### Option 3: Namespaced Imports (Best for organization)

```javascript
import { QuoteEngine, ActionNarration, EnvironmentNarrative } from './narrative/index.js';

// Usage:
const quote = QuoteEngine.findNarrativeQuote(actor, recipient, type, phase, context);
const action = ActionNarration.generateActionDescriptionObject(move, actor, defender, result, battleState);
const envEvent = EnvironmentNarrative.generateCollateralDamageEvent(move, actor, result, envState, battleState);
```

### Option 4: Backward Compatibility

```javascript
// Still works - re-exported from old file for compatibility
import { findNarrativeQuote } from './engine_narrative-engine.js';
```

## Key Benefits

### 1. **Single Responsibility Principle**
- Each file handles one narrative concern
- Easy to locate specific functionality
- Reduced cognitive load when editing

### 2. **Team Development Friendly**
- Multiple developers can work on different narrative types
- Merge conflicts minimized
- Clear ownership boundaries

### 3. **Performance Optimized**
- Faster imports (only load what you need)
- Better tree-shaking in bundlers
- Reduced memory footprint

### 4. **AI-Editing Friendly**
- Smaller, focused files are easier for AI to understand
- Clear context boundaries
- Predictable file structure

### 5. **Testing & Maintenance**
- Each module can be tested independently
- Easier to mock dependencies
- Clear error isolation

### 6. **Discovery & Documentation**
- File names clearly indicate functionality
- Easier to navigate codebase
- Self-documenting architecture

## Function Migration Guide

| Old Location | New Location | Notes |
|-------------|-------------|--------|
| `substituteTokens()` | `stringSubstitution.js` | No changes |
| `findNarrativeQuote()` | `quoteEngine.js` | No changes |
| `formatQuoteEvent()` | `quoteEngine.js` | No changes |
| `generateActionDescriptionObject()` | `actionNarration.js` | No changes |
| `generateTurnNarrationObjects()` | `actionNarration.js` | No changes |
| `getEnvironmentImpactLine()` | `environmentNarrative.js` | **Now exported** (was private) |
| `generateCollateralDamageEvent()` | `environmentNarrative.js` | No changes |
| `generateEnvironmentalSummaryEvent()` | `environmentNarrative.js` | No changes |
| `generateEscalationNarrative()` | `escalationNarrative.js` | No changes |
| `generateCurbstompNarration()` | `curbstompNarrative.js` | No changes |
| `getFinalVictoryLine()` | `victoryNarrative.js` | No changes |
| `generateStatusChangeEvent()` | `statusChange.js` | No changes |

## Adding New Narrative Types

### Step 1: Create New Module
```javascript
// js/narrative/newNarrativeType.js
export function generateNewNarrative(/* params */) {
    // Implementation
}
```

### Step 2: Update Barrel Export
```javascript
// js/narrative/index.js
export * from './newNarrativeType.js';

import * as NewNarrativeType from './newNarrativeType.js';
export { NewNarrativeType };
```

### Step 3: Update Documentation
Add entry to this README and function migration guide.

## Performance Considerations

- **Prefer specific imports** over barrel imports when only using 1-2 functions
- **Use namespaced imports** when using multiple functions from the same module
- **Avoid importing unused modules** - the old monolithic approach loaded everything

## Migration Timeline

- **Phase 1** ✅ - Modular system created, backward compatibility maintained
- **Phase 2** 🔄 - Update existing imports to use new modules
- **Phase 3** 📋 - Remove deprecated compatibility layer
- **Phase 4** 📋 - Performance optimizations and tree-shaking

## Examples

### Generating a Complete Turn Narrative
```javascript
import { 
    generateTurnNarrationObjects 
} from './narrative/actionNarration.js';
import { 
    findNarrativeQuote, 
    formatQuoteEvent 
} from './narrative/quoteEngine.js';

// Get pre-action quote
const quote = findNarrativeQuote(actor, opponent, 'beforeAttack', phase, context);
const events = quote ? [{ quote, actor }] : [];

// Generate complete turn narrative
const narrativeEvents = generateTurnNarrationObjects(
    events, move, actor, opponent, result, 
    environmentState, locationConditions, currentPhaseKey
);
```

### Environmental Impact Chain
```javascript
import { 
    generateCollateralDamageEvent,
    generateEnvironmentalSummaryEvent,
    getEnvironmentImpactLine 
} from './narrative/environmentNarrative.js';

// Generate individual impact
const collateralEvent = generateCollateralDamageEvent(move, actor, result, envState, battleState);

// Get specific impact line
const impactLine = getEnvironmentImpactLine(locationId, envState, isCrit);

// Generate phase summary
const summaryEvent = generateEnvironmentalSummaryEvent(battleState, envState);
```

This modular architecture transforms the narrative system from a monolithic "kitchen sink" into a maintainable, scalable, and developer-friendly codebase. 
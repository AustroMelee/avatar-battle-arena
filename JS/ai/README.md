# AI Decision System - Modular Architecture

The Avatar Battle Arena AI system has been completely refactored from a monolithic 301-line file into a clean, modular architecture with separated concerns.

## Architecture Overview

### Previous Issues (Monolithic `engine_ai-decision.js`)
- **Multiple responsibilities mixed together**: personality, memory, strategy, scoring, selection
- **Heavy parameter passing** with nested structures
- **Difficult unit testing** - couldn't test components in isolation
- **Adding features became increasingly fragile** as complexity grew
- **AI logging and randomness mixed with core logic**

### New Modular Structure

```
js/ai/
├── ai_personality.js        # Personality profiles & adaptation
├── ai_memory.js            # Working memory & opponent modeling  
├── ai_strategy_intent.js   # Strategic intent determination
├── ai_move_scoring.js      # Move weight calculation
├── ai_move_selection.js    # Randomization & selection
├── ai_decision_engine.js   # Top-level orchestrator
├── index.js               # Barrel exports
└── README.md              # This file
```

## Module Responsibilities

### `ai_personality.js` - Character Traits & Adaptation
- **Pure personality state management**
- Handles trait adaptation based on battle results
- Calculates dynamic personality modifiers
- No decision logic - just personality data

```javascript
import { adaptPersonality, getDynamicPersonality } from './ai/ai_personality.js';

// Adapt based on recent failures/successes
adaptPersonality(actor);

// Get personality modified by phase/mental state
const profile = getDynamicPersonality(actor, currentPhase);
```

### `ai_memory.js` - Learning & Opponent Modeling
- **AI "working memory" without decision logic**
- Tracks move effectiveness and opponent patterns
- Manages cooldowns and learning data
- Pure data management with helper queries

```javascript
import { updateAiMemory, getMoveEffectivenessScore } from './ai/ai_memory.js';

// Learn from recent battle events
updateAiMemory(learner, opponent);

// Query learned effectiveness
const score = getMoveEffectivenessScore(actor.aiMemory, 'Lightning Bolt');
```

### `ai_strategy_intent.js` - Strategic Analysis
- **Determines "why should I do this?" logic**
- Analyzes battle state to determine strategic intent
- Pure analysis without move weighting or selection
- Returns intent strings that drive scoring

```javascript
import { determineStrategicIntent, STRATEGIC_INTENTS } from './ai/ai_strategy_intent.js';

const intent = determineStrategicIntent(actor, defender, turn, phase);
// Returns: 'PressAdvantage', 'DesperateGambit', 'FinishingBlowAttempt', etc.
```

### `ai_move_scoring.js` - Weight Calculation
- **Pure scoring logic based on personality + intent**
- Calculates move weights from multiple factors
- No randomness - deterministic scoring only
- Separates personality, contextual, and intent modifiers

```javascript
import { calculateMoveWeights, getViableMoves } from './ai/ai_move_scoring.js';

const weightedMoves = calculateMoveWeights(actor, defender, conditions, intent, phase);
const viableMoves = getViableMoves(weightedMoves);
```

### `ai_move_selection.js` - Randomization & Probability
- **Handles all randomness and probability math**
- Softmax probability conversion with temperature
- Distribution sampling and fallback handling
- Pure selection logic without game state

```javascript
import { selectMoveFromWeights, getSoftmaxProbabilities } from './ai/ai_move_selection.js';

const chosenMove = selectMoveFromWeights(weightedMoves, predictability);
const probabilities = getSoftmaxProbabilities(weightedMoves, temperature);
```

### `ai_decision_engine.js` - Top-Level Orchestrator
- **Composes all modules for the main `selectMove` interface**
- Handles logging, state updates, and error cases
- Maintains backward compatibility
- Coordinates between subsystems

```javascript
import { selectMove } from './ai/ai_decision_engine.js';

// Main interface - same signature as before
const result = selectMove(actor, defender, conditions, turn, currentPhase);
```

## Usage Patterns

### Simple Usage (Main Interface)
```javascript
import { selectMove } from './ai/index.js';

// Same interface as the old monolithic system
const { move, aiLogEntryFromSelectMove } = selectMove(actor, defender, conditions, turn, phase);
```

### Modular Usage (Individual Components)
```javascript
import { AiStrategy, AiScoring, AiSelection } from './ai/index.js';

// Use components individually for testing/analysis
const intent = AiStrategy.determineIntent(actor, defender, turn, phase);
const weights = AiScoring.calculateWeights(actor, defender, conditions, intent, phase);
const choice = AiSelection.select(weights, predictability);
```

### Analysis & Debugging
```javascript
import { analyzeAiDecision, getAiSummary } from './ai/index.js';

// Get detailed analysis without making a decision
const analysis = analyzeAiDecision(actor, defender, conditions, turn, phase);

// Post-battle AI performance summary
const summary = getAiSummary(actor);
```

## Benefits of Modular Architecture

### 🧪 **Enhanced Testability**
- Each module can be unit tested in isolation
- Mock different components for focused testing
- Test personality changes without full AI pipeline

### 🚀 **Development Velocity**
- Team members can work on different modules simultaneously
- Clear ownership boundaries prevent merge conflicts
- Easier to reason about and debug individual components

### 🔧 **AI/Cursor Friendly**
- Smaller files are easier for AI to understand and edit
- Clear separation of concerns guides AI suggestions
- Focused context reduces hallucination

### ⚡ **Performance Optimized**
- Tree-shaking eliminates unused code
- Selective imports reduce bundle size
- Hot-swappable modules for A/B testing

### 🔮 **Future-Proofed**
- Easy to add new AI personalities or intents
- Modular scoring allows experimentation
- Clean interfaces support rule editors and analytics

### 🛠 **Production Ready**
- Conditional loading based on build flags
- CLI/Node.js compatible for automation
- Enhanced error handling and validation

## Migration from Old System

The refactor maintains **100% backward compatibility**. Existing code continues to work:

```javascript
// OLD (still works)
import { selectMove } from './engine_ai-decision.js';

// NEW (recommended)
import { selectMove } from './ai/index.js';
```

For advanced usage, gradually migrate to modular imports:

```javascript
// Migration path: start using individual modules
import { AiPersonality, AiMemory } from './ai/index.js';
```

## Architecture Principles

1. **Single Responsibility Principle** - Each module has one clear purpose
2. **Dependency Injection** - Modules receive data, don't fetch it
3. **Pure Functions** - Most functions avoid side effects when possible  
4. **Explicit Dependencies** - Clear imports show module relationships
5. **Backward Compatibility** - Existing code continues working during transition

## Adding New Features

### New AI Personality Trait
Add to `ai_personality.js` without touching other modules.

### New Strategic Intent
Add to `STRATEGIC_INTENTS` in `ai_strategy_intent.js` and corresponding multipliers in `ai_move_scoring.js`.

### New Selection Algorithm
Implement in `ai_move_selection.js` without affecting scoring logic.

The modular architecture makes the AI system **maintainable, testable, and extensible** while preserving all existing functionality. 
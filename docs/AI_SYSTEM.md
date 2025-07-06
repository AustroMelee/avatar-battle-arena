# Advanced Battle AI System

This directory contains the advanced AI system for the Avatar Battle Arena, featuring context awareness, tactical intent planning, and sophisticated move scoring.

## 🎯 Overview

The advanced AI system consists of three core modules that work together to create intelligent, context-aware battle decisions:

1. **BattleContext Analysis** (`battleAwareness.ts`) - Analyzes the current battle situation
2. **Intent/Goal System** (`intentSystem.ts`) - Sets tactical objectives for multiple turns
3. **Contextual Move Scoring** (`contextualMoveScoring.ts`) - Scores moves based on context and intent

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Battle Log    │───▶│ Battle Context  │───▶│   Intent        │
│   & State       │    │   Analysis      │    │   Selection     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ Contextual Move │◀───│   Move          │
                       │   Scoring       │    │   Selection     │
                       └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Final Move    │
                       │   Decision      │
                       └─────────────────┘
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { chooseAbilityWithLogging } from './chooseAbility';
import { BattleCharacter, BattleLogEntry } from '../../types';

// Your battle state
const character: BattleCharacter = /* your character */;
const enemy: BattleCharacter = /* enemy character */;
const battleLog: BattleLogEntry[] = /* battle history */;
const turn = 5;

// Make AI decision with advanced system
const { ability, aiLog, newState } = chooseAbilityWithLogging(
  character, 
  enemy, 
  turn, 
  battleLog, 
  previousState // optional, for intent continuity
);

console.log(`AI chose: ${ability.name}`);
console.log(`Reasoning: ${aiLog.reasoning}`);
```

### Advanced Usage with State Management

```typescript
import { chooseAbilityWithAdvancedAI, getAIStateSummary } from './advancedAIController';

let aiState: AdvancedAIState | null = null;

// In your battle loop
for (let turn = 1; turn <= maxTurns; turn++) {
  const { ability, aiLog, newState } = chooseAbilityWithAdvancedAI(
    character,
    enemy,
    turn,
    battleLog,
    aiState // Pass previous state for intent continuity
  );
  
  // Update state for next turn
  aiState = newState;
  
  // Optional: Debug AI state
  console.log(getAIStateSummary(aiState));
  
  // Execute the chosen ability
  executeAbility(ability);
}
```

## 📊 Battle Context Analysis

The `BattleContext` provides comprehensive situational awareness:

```typescript
interface BattleContext {
  // Current state metrics
  myHealth: number;
  myDefense: number;
  myChi: number;
  enemyHealth: number;
  enemyDefense: number;
  enemyChi: number;
  
  // Tactical assessments
  isLosing: boolean;
  isDominating: boolean;
  enemyIsTurtling: boolean;
  enemyVulnerable: boolean;
  hasMomentum: boolean;
  
  // Resource and threat analysis
  burstAvailable: boolean;
  enemyBurstThreat: boolean;
  chiPressure: boolean;
  healthPressure: boolean;
  
  // Pattern recognition
  enemyPattern: 'aggressive' | 'defensive' | 'mixed' | 'unknown';
  myPattern: 'aggressive' | 'defensive' | 'mixed' | 'unknown';
  
  // Game phase analysis
  isEarlyGame: boolean;
  isMidGame: boolean;
  isLateGame: boolean;
  
  // And much more...
}
```

### Example Context Analysis

```typescript
import { getBattleContext } from './battleAwareness';

const context = getBattleContext(character, enemy, battleLog);

if (context.enemyIsTurtling && context.burstAvailable) {
  console.log("Enemy is turtling and we have burst - perfect opportunity!");
}

if (context.healthPressure && context.enemyBurstThreat) {
  console.log("Critical situation - need to defend!");
}
```

## 🎯 Intent System

The intent system sets tactical objectives that guide multiple turns of decision-making:

### Available Intents

- `break_defense` - Break through enemy's defensive stance
- `go_for_finish` - End the fight with a decisive blow
- `defend` - Prioritize survival and defense
- `stall` - Play defensively and look for opportunities
- `restore_chi` - Recover resources
- `pressure_enemy` - Apply consistent pressure
- `build_momentum` - Build on existing advantage
- `desperate_attack` - All-or-nothing approach
- `counter_attack` - Respond to aggressive enemy
- `conservative_play` - Safe, measured approach

### Example Intent Usage

```typescript
import { chooseIntent, shouldMaintainIntent } from './intentSystem';

const intent = chooseIntent(context);

if (intent.type === 'go_for_finish') {
  console.log("AI is going for the finish!");
}

// Check if intent should continue
if (shouldMaintainIntent(currentIntent, newContext)) {
  console.log("Continuing current strategy");
} else {
  console.log("Changing tactics");
}
```

## 🎲 Contextual Move Scoring

Moves are scored based on multiple factors:

### Scoring Factors

1. **Intent Alignment** - How well the move fits the current tactical goal
2. **Context Bonuses** - Situational advantages (enemy vulnerable, momentum, etc.)
3. **Resource Management** - Chi costs, cooldowns, health pressure
4. **Damage Potential** - Expected damage vs enemy defense
5. **Pattern Recognition** - Countering enemy patterns

### Example Move Scoring

```typescript
import { scoreMovesWithContext } from './contextualMoveScoring';

const scoredMoves = scoreMovesWithContext(
  availableMoves,
  character,
  enemy,
  context,
  intent
);

// Each scored move includes:
// - score: numerical rating
// - reasons: why this score was given
// - contextFactors: situational bonuses
// - intentAlignment: how well it fits the intent (0-10)
```

## 🔧 Integration with Existing Systems

### Backward Compatibility

The system maintains full backward compatibility. If no battle log is provided, it falls back to the legacy AI system:

```typescript
// Legacy usage (still works)
const { ability, aiLog } = chooseAbilityWithLogging(character, enemy, turn);

// Advanced usage (recommended)
const { ability, aiLog, newState } = chooseAbilityWithLogging(
  character, enemy, turn, battleLog, previousState
);
```

### Updating Battle Simulator

To integrate with your battle simulator:

```typescript
// In your battle simulation service
export class BattleSimulator {
  private aiStates: Map<string, AdvancedAIState> = new Map();
  
  private processAITurn(character: BattleCharacter, enemy: BattleCharacter, turn: number) {
    const previousState = this.aiStates.get(character.name) || null;
    
    const { ability, aiLog, newState } = chooseAbilityWithLogging(
      character,
      enemy,
      turn,
      this.battleLog,
      previousState
    );
    
    // Store state for next turn
    this.aiStates.set(character.name, newState);
    
    // Execute the ability
    return this.executeAbility(ability, character, enemy);
  }
}
```

## 🧪 Testing and Debugging

### AI State Summary

```typescript
import { getAIStateSummary } from './advancedAIController';

console.log(getAIStateSummary(aiState));
// Output:
// AI State Summary:
// - Intent: go_for_finish (Enemy is vulnerable and we have finishing power. End the fight!)
// - Intent Duration: 2 turns
// - Health: 45 vs 18
// - Momentum: Yes
// - Enemy Pattern: defensive
// - Game Phase: Late
// - Burst Available: Yes
// - Enemy Threat: No
// - Chi Pressure: No
// - Health Pressure: No
```

### Enhanced AI Logs

The new system provides much more detailed AI logs:

```typescript
// Enhanced reasoning includes intent and context
console.log(aiLog.reasoning);
// "Intent: go_for_finish (Enemy is vulnerable and we have finishing power. End the fight!) - Base attack (25 damage) - High power for finishing blow - Enemy vulnerable - perfectly aligned with their tactical goal"

// Detailed move analysis
aiLog.consideredActions.forEach(action => {
  console.log(`${action.move}: ${action.score} - ${action.reason}`);
});
```

## 🎮 Example Scenarios

### Scenario 1: Enemy Turtling
```typescript
// Context: Enemy has been defending for 3+ turns
// Intent: break_defense
// Result: AI prioritizes high-power or piercing moves
```

### Scenario 2: Low Health Crisis
```typescript
// Context: AI health < 30, enemy has burst threat
// Intent: defend
// Result: AI prioritizes defense buffs and survival
```

### Scenario 3: Finishing Opportunity
```typescript
// Context: Enemy health < 30, AI has burst available
// Intent: go_for_finish
// Result: AI uses highest damage moves to end the fight
```

### Scenario 4: Resource Management
```typescript
// Context: AI chi < 2, no immediate threat
// Intent: restore_chi
// Result: AI uses low-cost moves and builds defense
```

## 🔮 Future Enhancements

- **Learning System** - AI learns from battle outcomes
- **Personality Integration** - Character personalities influence intent selection
- **Team Tactics** - Multi-character coordination
- **Environmental Factors** - Location-based tactical considerations
- **Advanced Pattern Recognition** - Machine learning for move prediction

## 📝 API Reference

### Core Functions

- `getBattleContext(me, enemy, log)` - Analyze battle situation
- `chooseIntent(context)` - Select tactical intent
- `scoreMovesWithContext(moves, me, enemy, context, intent)` - Score moves
- `chooseAbilityWithAdvancedAI(character, enemy, turn, log, state)` - Full AI decision
- `chooseAbilityWithLogging(character, enemy, turn, log?, state?)` - Backward compatible

### Types

- `BattleContext` - Comprehensive battle analysis
- `Intent` - Tactical objective with priority and duration
- `ContextualMoveScore` - Enhanced move scoring with reasoning
- `AdvancedAIState` - Complete AI decision state

This advanced AI system transforms your battle AI from simple move selection to sophisticated tactical decision-making with real situational awareness!

## SRP Compliance

All AI, battle, and narrative services now follow the Single Responsibility Principle (SRP):
- Each service handles only one domain concern (e.g., move execution, narrative composition, emotional policy).
- Orchestration files (e.g., tacticalMove.service.ts, NarrativeCoordinator.ts) only delegate to focused services.
- This enables safe, autonomous AI-driven refactoring and prevents architectural drift or circular dependencies.

## Status Effect Integration - COMPLETE

The AI system now fully integrates with the status effect system:

### ✅ **Status Effect Awareness**
- **AI recognizes status effects** when evaluating moves
- **AI values status effect application** in move scoring
- **AI considers existing status effects** when making decisions
- **AI adapts strategy** based on status effect opportunities

### ✅ **Status Effect Valuation**
- **Debuff Application**: AI highly values applying debuffs to healthy enemies
- **Buff Application**: AI values applying buffs to self, especially when not already active
- **Status Effect Duration**: AI considers effect duration in decision making
- **Status Effect Synergy**: AI recognizes combinations of status effects

### ✅ **AI Decision Making with Status Effects**
```typescript
// Example: AI valuing Blue Fire for its BURN effect
if (move.appliesEffect) {
  const effect = move.appliesEffect;
  if (effect.category === 'debuff') {
    // Highly value applying debuffs to healthy enemies
    if (!enemy.activeEffects.some(e => e.type === effect.type)) {
      score += 25; // High bonus for applying a new, impactful debuff
      reasoning += `Applies a powerful ${effect.type} debuff. `;
    }
  } else { // It's a buff
    // Value applying buffs to self, especially when not already active
    if (!self.activeEffects.some(e => e.type === effect.type)) {
      score += 20;
      reasoning += `Applies a useful ${effect.type} self-buff. `;
    }
  }
}
```

## Core AI Architecture

### Decision Making Pipeline
1. **State Analysis**: AI analyzes current battle state, positioning, and status effects
2. **Move Filtering**: Filters available moves based on constraints and requirements
3. **Move Scoring**: Scores each move based on multiple tactical factors
4. **Move Selection**: Selects the highest-scoring move with reasoning
5. **Execution**: Executes the chosen move with proper state updates

### Tactical Factors Considered
- **Positioning**: Current position and environmental advantages
- **Status Effects**: Active effects on self and enemy
- **Escalation State**: Forced escalation awareness and response
- **Pattern Recognition**: Adaptation to opponent patterns
- **Move Variety**: Prevention of repetitive move usage
- **Resource Management**: Chi cost and availability
- **Environmental Context**: Location-based bonuses and constraints

### AI Services Architecture

#### `tacticalAI.service.ts`
- **Responsibility**: Core tactical decision making
- **Features**: Move scoring, reasoning generation, tactical analysis
- **Integration**: Status effects, positioning, escalation awareness

#### `attackMoveScoring.service.ts`
- **Responsibility**: Attack move evaluation
- **Features**: Damage calculation, status effect valuation, context awareness
- **Integration**: Status effects, enemy state, tactical context

#### `defenseMoveScoring.service.ts`
- **Responsibility**: Defense move evaluation
- **Features**: Defense value calculation, self-status effect consideration
- **Integration**: Status effects, health pressure, resource management

#### `battleStateAwareness.ts`
- **Responsibility**: Battle state analysis and context building
- **Features**: State perception, tactical context, pattern recognition
- **Integration**: All battle systems for comprehensive awareness

## AI Decision Making Process

### 1. State Analysis
```typescript
// Analyze current battle state
const context = buildTacticalContext(self, enemy, location);
const patterns = analyzeMovePatterns(enemy.moveHistory);
const statusEffects = analyzeStatusEffects(self.activeEffects, enemy.activeEffects);
```

### 2. Move Filtering
```typescript
// Filter moves based on constraints
const usableMoves = availableMoves.filter(move => 
  canUseMove(move, self, enemy, location) &&
  hasRequiredResources(move, self) &&
  !isOnCooldown(move, self)
);
```

### 3. Move Scoring
```typescript
// Score each move based on multiple factors
const scoredMoves = usableMoves.map(move => {
  let score = 0;
  let reasoning = "";
  
  // Status effect scoring
  if (move.appliesEffect) {
    score += evaluateStatusEffectValue(move.appliesEffect, self, enemy);
  }
  
  // Positioning scoring
  score += evaluatePositioningValue(move, self, enemy, location);
  
  // Escalation scoring
  if (self.flags?.forcedEscalation === 'true') {
    score += evaluateEscalationValue(move, self, enemy);
  }
  
  return { move, score, reasoning };
});
```

### 4. Move Selection
```typescript
// Select best move with reasoning
const bestMove = scoredMoves.sort((a, b) => b.score - a.score)[0];
return {
  move: bestMove.move,
  reasoning: bestMove.reasoning,
  tacticalAnalysis: buildTacticalAnalysis(bestMove, context)
};
```

## AI Learning and Adaptation

### Pattern Recognition
- **Move History Analysis**: Tracks opponent's move patterns
- **Adaptation**: Adjusts strategy based on recognized patterns
- **Counter-Strategy**: Develops counters to repetitive patterns

### Escalation Awareness
- **Forced Escalation Detection**: Recognizes when escalation is forced
- **Escalation Response**: Adjusts strategy for high-damage, aggressive play
- **Escalation Recovery**: Returns to tactical play when escalation ends

### Status Effect Strategy
- **Effect Application**: Strategically applies status effects
- **Effect Exploitation**: Takes advantage of existing status effects
- **Effect Prevention**: Avoids moves that would be countered by status effects

## AI Logging and Debugging

### AI Decision Logs
```typescript
// Comprehensive AI decision logging
const aiLogEntry = {
  turn: state.turn,
  agent: self.name,
  reasoning: tacticalResult.reasoning,
  perceivedState: buildPerceivedState(self, enemy),
  consideredActions: scoredMoves.slice(0, 3),
  chosenAction: chosenMove.name,
  tacticalAnalysis: tacticalResult.tacticalAnalysis,
  timestamp: Date.now()
};
```

### Debug Information
- **Move Scoring Details**: Shows how each move was scored
- **Reasoning Chains**: Explains why specific moves were chosen
- **State Perception**: Shows how AI perceives the current battle state
- **Tactical Analysis**: Provides tactical context for decisions

## Performance and Optimization

### Efficient Decision Making
- **Move Filtering**: Early filtering reduces scoring computation
- **Caching**: Caches expensive calculations where appropriate
- **Lazy Evaluation**: Only evaluates moves that meet basic criteria

### Memory Management
- **State Immutability**: Uses immutable state updates
- **Object Pooling**: Reuses objects where possible
- **Garbage Collection**: Proper cleanup of temporary objects

## Future Enhancements

### Planned AI Improvements
- **Machine Learning Integration**: Potential for ML-based decision making
- **Advanced Pattern Recognition**: More sophisticated pattern analysis
- **Predictive Modeling**: Predict opponent moves and counter them
- **Dynamic Difficulty**: Adjust AI difficulty based on player skill

### Status Effect Enhancements
- **Effect Combinations**: AI recognition of status effect synergies
- **Effect Timing**: Strategic timing of status effect application
- **Effect Removal**: AI strategies for removing negative effects
- **Effect Amplification**: AI use of effect amplification mechanics

## Integration Points

### Battle System Integration
- **Move Execution**: AI decisions feed into move execution pipeline
- **State Updates**: AI decisions trigger proper state updates
- **Logging**: AI decisions are logged for analysis and debugging

### Narrative System Integration
- **AI Reasoning**: AI reasoning feeds into narrative generation
- **Tactical Context**: AI tactical analysis enhances narrative context
- **Character Behavior**: AI decisions reflect character personality

### Status Effect System Integration
- **Effect Application**: AI can apply status effects through moves
- **Effect Consideration**: AI considers status effects in decision making
- **Effect Strategy**: AI develops strategies around status effects

The AI system is now a sophisticated, status-effect-aware decision-making engine that provides challenging and engaging gameplay while maintaining transparency through comprehensive logging and reasoning. 
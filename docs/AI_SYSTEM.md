# Advanced Battle AI System

This directory contains the advanced AI system for the Avatar Battle Arena, featuring context awareness, tactical intent planning, and sophisticated move scoring with enhanced escalation handling.

## 🎯 Overview

The advanced AI system consists of four core modules that work together to create intelligent, context-aware, and character-driven battle decisions:

1. **BattleContext Analysis** (`battleAwareness.ts`) - Analyzes the current battle situation
2. **Intent/Goal System** (`intentSystem.ts`) - Sets tactical objectives for multiple turns
3. **Contextual Move Scoring** (`contextualMoveScoring.ts`) - Scores moves based on context and intent
4. **Identity-Driven Tactical Behavior** (`identity/`) - Character personality and mental state influence
5. **Tactical AI with Escalation Handling** (`tacticalAI.service.ts`) - Enhanced AI with Basic Strike prevention

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Battle Log    │───▶│ Battle Context  │───▶│   Intent        │
│   & State       │    │   Analysis      │    │   Selection     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Character     │    │ Contextual Move │◀───│   Move          │
│   Identity &    │    │   Scoring       │    │   Selection     │
│   Mental State  │    └─────────────────┘    └─────────────────┘
└─────────────────┘              │                       │
         │                       ▼                       │
         └─────────────────▶┌─────────────────┐◀────────┘
                            │   Identity      │
                            │   Adjustments   │
                            └─────────────────┘
                                       │
                                       ▼
                            ┌─────────────────┐
                            │   Escalation    │
                            │   Handling      │
                            └─────────────────┘
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
import { selectTacticalMove } from './tacticalAI.service';
import { BattleCharacter, Move } from '../../types';

// Your battle state
const character: BattleCharacter = /* your character */;
const enemy: BattleCharacter = /* enemy character */;
const availableMoves: Move[] = /* available moves */;
const location = 'Fire Nation Throne Hall';

// Make AI decision with tactical system
const { move, reasoning, tacticalAnalysis } = selectTacticalMove(
  character, 
  enemy, 
  availableMoves, 
  location
);

console.log(`AI chose: ${move.name}`);
console.log(`Reasoning: ${reasoning}`);
console.log(`Tactical Factors: ${tacticalAnalysis}`);
```

### Advanced Usage with Escalation Handling

```typescript
import { selectTacticalMove } from './tacticalAI.service';

// AI automatically handles escalation state
const result = selectTacticalMove(character, enemy, availableMoves, location);

// During escalation, Basic Strike is automatically disabled
if (character.flags?.forcedEscalation === 'true') {
  console.log('AI is in escalation mode - Basic Strike disabled');
  console.log('Signature moves prioritized');
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
  
  // Escalation state
  isInEscalation: boolean;
  escalationType?: string;
  
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

if (context.isInEscalation) {
  console.log("In escalation mode - avoiding Basic Strike, prioritizing signature moves");
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

Moves are scored based on multiple factors with enhanced escalation handling:

### Scoring Factors

1. **Intent Alignment** - How well the move fits the current tactical goal
2. **Context Bonuses** - Situational advantages (enemy vulnerable, momentum, etc.)
3. **Resource Management** - Chi costs, cooldowns, health pressure
4. **Damage Potential** - Expected damage vs enemy defense
5. **Pattern Recognition** - Countering enemy patterns
6. **Character Identity** - Personality traits and core values
7. **Mental State** - Current psychological state influence
8. **Escalation Handling** - Special rules during escalation phases

### Escalation-Specific Scoring

```typescript
// Basic Strike completely disabled during escalation
if (self.flags?.forcedEscalation === 'true' && move.id.includes('Basic')) {
  score = -1000; // Effectively disable Basic Strike during escalation
  reasoning += "Basic Strike completely disabled during escalation! ";
}

// Signature moves get bonuses during escalation
if (self.flags?.forcedEscalation === 'true' && 
    (move.id.includes('Blazing') || move.id.includes('Wind') || 
     move.id.includes('Blue') || move.id.includes('Fire') || 
     move.id.includes('Slice'))) {
  score += 20; // Bonus for signature move repetition during escalation
  reasoning += "Signature move repetition during escalation. ";
}

// Reduced cooldown penalties for signature moves during escalation
if (self.flags?.forcedEscalation === 'true' && 
    (move.id.includes('Blazing') || move.id.includes('Wind') || 
     move.id.includes('Blue') || move.id.includes('Fire') || 
     move.id.includes('Slice'))) {
  score -= 5; // Reduced penalty for signature moves during escalation
} else {
  score -= 10; // Normal cooldown penalty
}
```

### Example Move Scoring

```typescript
import { selectTacticalMove } from './tacticalAI.service';

const result = selectTacticalMove(character, enemy, availableMoves, location);

console.log(`Selected move: ${result.move.name}`);
console.log(`Score breakdown:`);
console.log(`- Intent alignment: +30`);
console.log(`- Context bonus: +25`);
console.log(`- Resource management: -10`);
console.log(`- Escalation handling: ${character.flags?.forcedEscalation === 'true' ? 'Basic Strike disabled' : 'Normal'}`);
```

## 🎭 Identity-Driven Tactical Behavior

Characters have distinct personalities that influence their decision-making:

### Character Identity System

```typescript
interface CharacterIdentity {
  // Core personality traits
  dominance: number;        // 0-100: How much they prefer powerful moves
  aggression: number;       // 0-100: How aggressive they are
  caution: number;          // 0-100: How defensive they prefer to be
  adaptability: number;     // 0-100: How quickly they change tactics
  
  // Mental state tracking
  mentalState: MentalState;
  opponentPerception: OpponentPerception;
  
  // Irreversible mental thresholds
  mentalThresholdsCrossed: {
    unhinged?: boolean;     // Has composure ever broken?
    broken?: boolean;       // Has reached point of no return?
  };
}
```

### Example Identity Influence

```typescript
// Azula's dominance trait influences move selection
if (character.personality === 'Azula') {
  if (move.power > 20) {
    score += 15; // Azula prefers powerful moves
    reasoning += "Dominance value favors powerful moves. ";
  }
}

// Aang's evasion tendency
if (character.personality === 'Aang') {
  if (move.type === 'evade' || move.changesPosition === 'repositioning') {
    score += 10; // Aang prefers evasive moves
    reasoning += "Evasion tendency favors evasive moves. ";
  }
}
```

## 🔄 Fallback Logic

The system includes sophisticated fallback logic for when primary moves are unavailable:

### Enhanced Fallback System

```typescript
// During escalation, NEVER use Basic Strike
if (isInEscalation) {
  const signatureMoves = ['Wind Slice', 'Blue Fire', 'Blazing Counter', 'Flowing Evasion'];
  const damagingMoves = ['Fire Dash', 'Air Glide', 'Lightning Strike'];
  
  // Try to find a signature move first, then any non-Basic Strike move
  fallbackMove = availableMoves.find(m => signatureMoves.includes(m.name)) ||
                availableMoves.find(m => damagingMoves.includes(m.name)) ||
                availableMoves.find(m => m.id !== 'basic_strike' && m.name !== 'Basic Strike') ||
                availableMoves[0];
  
  // Double-check to avoid Basic Strike
  if (fallbackMove.id === 'basic_strike' || fallbackMove.name === 'Basic Strike') {
    fallbackMove = availableMoves.find(m => m.id !== 'basic_strike' && m.name !== 'Basic Strike') || availableMoves[0];
  }
}
```

## 📈 Performance Metrics

### Recent AI Performance

- **Strategic Decision Quality**: Enhanced with environmental and tactical awareness
- **Move Variety**: Good balance between signature moves and tactical options
- **Escalation Handling**: 100% Basic Strike prevention during escalation
- **Fallback Logic**: Intelligent selection of alternative moves
- **Character Authenticity**: Moves reflect character personalities and abilities

### System Improvements

- **Escalation Integration**: Seamless handling of escalation states
- **Basic Strike Prevention**: Complete elimination during escalation phases
- **Signature Move Prioritization**: Enhanced during escalation events
- **Debug Logging**: Comprehensive logging for troubleshooting and analysis

## 🔧 Configuration

### Escalation Thresholds

```typescript
const ESCALATION_TRIGGERS = {
  DAMAGE_THRESHOLD: 25,           // Force escalation if total damage < 25 by turn 35
  TURNS_WITHOUT_DAMAGE: 15,       // Force escalation after 15 turns without damage
  REPOSITION_SPAM: 8,             // Force close combat after 8 reposition attempts
  STALEMATE_TURNS: 30,            // Force climax after 30 turns of stalemate
  ESCALATION_COOLDOWN: 15         // Minimum turns between escalation triggers
};
```

### AI Scoring Weights

```typescript
const SCORING_WEIGHTS = {
  INTENT_ALIGNMENT: 30,
  CONTEXT_BONUS: 25,
  RESOURCE_MANAGEMENT: -10,
  ESCALATION_BASIC_STRIKE_PENALTY: -1000,
  SIGNATURE_MOVE_ESCALATION_BONUS: 20,
  COOLDOWN_PENALTY: 10,
  ESCALATION_COOLDOWN_PENALTY: 5
};
```

## 🚀 Future Enhancements

### Planned Improvements

1. **Dynamic Threshold Adjustment**: Escalation thresholds that adapt based on battle context
2. **Character-Specific Escalation**: Different escalation patterns for different character types
3. **Environmental Escalation**: Location-based escalation triggers
4. **Advanced Pattern Recognition**: More sophisticated pattern detection and countering
5. **Machine Learning Integration**: AI that learns from battle outcomes

### Monitoring and Analytics

- **AI Decision Quality**: Track strategic decision-making effectiveness
- **Escalation Handling**: Monitor Basic Strike prevention and signature move usage
- **Character Authenticity**: Analyze how well AI reflects character personalities
- **Performance Metrics**: Monitor system performance and optimization opportunities

## 📚 Related Documentation

- [Escalation System](./ESCALATION_SYSTEM.md) - Detailed escalation mechanics
- [Tactical Battle System](./TACTICAL_BATTLE_SYSTEM.md) - Tactical combat mechanics
- [Identity-Driven Tactical Behavior](./IDENTITY_DRIVEN_TACTICAL_BEHAVIOR.md) - Character personality system
- [Status Effect System](./STATUS_EFFECT_SYSTEM.md) - Status effect mechanics

## SRP Compliance

All AI, battle, and narrative services now follow the Single Responsibility Principle (SRP):
- Each service handles only one domain concern (e.g., move execution, narrative composition, emotional policy).
- Orchestration files (e.g., tacticalMove.service.ts, NarrativeCoordinator.ts) only delegate to focused services.
- This enables safe, autonomous AI-driven refactoring and prevents architectural drift or circular dependencies.

## Identity-Driven Tactical Behavior Integration - COMPLETE

The AI system now fully integrates with the Identity-Driven Tactical Behavior (IDTB) system:

### ✅ **Character Identity Integration**
- **AI considers character personality** when making decisions
- **AI respects moral boundaries** (lethal vs non-lethal)
- **AI follows tactical tendencies** (precision, evasion, etc.)
- **AI adapts to core values** (control, dominance, balance, pacifism)

### ✅ **Mental State Influence**
- **AI responds to psychological states** (focused, enraged, fearful, unhinged)
- **AI considers pride levels** in decision making
- **AI adapts to stability changes** throughout the battle
- **AI reflects character emotional state** in move selection

### ✅ **Identity-Based Scoring**
```typescript
// Example: Aang's pacifist nature penalizing lethal moves
if (profile.coreValues.includes('pacifism')) {
  if (move.damage > 20) {
    adjustment -= 15; // Penalty for high-damage moves
    reasons.push('Pacifism value penalizes high-damage moves');
  }
}

// Example: Azula's control obsession favoring precision
if (profile.tacticalTendencies.includes('prefers_precision')) {
  if (move.critChance && move.critChance > 0.15) {
    adjustment += 15; // Bonus for high-crit moves
    reasons.push('Control value favors precision moves');
  }
}
```

### ✅ **Mental State Updates**
- **Real-time psychological tracking** during battle
- **State changes based on events** (damage, misses, criticals)
- **Character-specific reactions** to battle outcomes
- **Psychological state logging** for analysis

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

## Behavioral Traits & Manipulation Resilience

**Manipulation Resilience** is a new stat (0-100) for each character, representing their resistance to psychological manipulation and mind games. This value is now tracked in the `BattleCharacter` and `PerceivedState` types, and is used by the AI to determine susceptibility to manipulation-based tactics, narrative events, and certain abilities.

- **Behavioral Traits**: Each character now has a list of `behavioralTraits` (instances of `BehavioralTraitInstance`), which influence tactical preferences, risk tolerance, and narrative responses.
- **AI Integration**: The AI system now considers both `manipulationResilience` and `behavioralTraits` when evaluating moves, responding to narrative hooks, and adapting to psychological strategies.
- **State Tracking**: These properties are updated in real time and logged for introspective analysis and debugging. 
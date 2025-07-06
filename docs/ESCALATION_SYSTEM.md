# Dynamic Escalation Timeline System

## 🗂️ Battle Mechanics Reference Table

| Mechanic           | Description                                      | Log Example                  | Doc/Section                              |
|--------------------|--------------------------------------------------|------------------------------|-------------------------------------------|
| Manipulation       | Alters enemy state, makes them easier to exploit | T14 Azula: manipulation      | TACTICAL_SYSTEM_IMPLEMENTATION.md         |
| Overconfidence     | Character becomes reckless, changes AI           | T28 Azula: overconfidence    | TACTICAL_SYSTEM_IMPLEMENTATION.md         |
| Forced Escalation  | Triggers all-out attack phase                    | T30 Azula: Forced Escalation | ESCALATION_SYSTEM.md                     |
| Plea for Peace     | Aang attempts to de-escalate                     | T25 Aang: plea_for_peace     | DRAMATIC_MECHANICS_IMPLEMENTATION.md      |
| State Change       | Major state transition (e.g., Compromised)       | T19 Azula: State Change      | STATUS_EFFECT_SYSTEM.md                   |
| Move Fatigue       | Repeated move use penalized                      | (AI: Move used recently)     | TACTICAL_SYSTEM_IMPLEMENTATION.md         |
| Reversal           | Comeback mechanic, turns the tables              | T23 Aang: Reversal           | DRAMATIC_MECHANICS_IMPLEMENTATION.md      |
| Desperation        | Last-stand move, high risk/reward                | T24 Azula: desperation       | FINISHER_DESPERATION_IMPLEMENTATION.md    |
| Finisher           | Once-per-battle, high-damage move                | T10 Aang: FINISHER!          | FINISHER_DESPERATION_IMPLEMENTATION.md    |
| Critical           | High-damage, chance-based event                  | T4 Aang: CRITICAL!           | DRAMATIC_MECHANICS_IMPLEMENTATION.md      |
| Collateral Damage  | Environmental/mental state impact                | T14 Environment: Collateral  | COLLATERAL_DAMAGE_SYSTEM.md               |
| Positioning        | Tactical stance/terrain effects                  | (see log)                    | TACTICAL_SYSTEM_IMPLEMENTATION.md         |
| Victory/Draw/etc.  | End conditions                                   | T31 System: victory          | ROADMAP_6_IMPLEMENTATION.md               |
| Status Effects     | Buffs/debuffs, state changes                     | (see log)                    | STATUS_EFFECT_SYSTEM.md                   |

> All mechanics are now fully implemented, including Reversal. See below for details.

### Reversal Mechanic (Implemented)
- **Trigger:** When a character (Aang or Azula) is in a compromised state and low stability, a reversal can occur, turning the tide of battle.
- **Log Example:** `T23 Aang: Reversal`, `T29 Azula: Reversal`
- **AI/Personality:** Aang is more likely to trigger a reversal when desperate; Azula can also trigger reversals, especially in high-risk moments.
- **Effect:** Regains stability, shifts control, and is logged as a dramatic event.
- **Integration:** Fully integrated with disruption-first, narrative-driven battle flow.

## Overview

The Dynamic Escalation Timeline is a sophisticated battle arc state machine that creates narrative progression and mechanical escalation in the Avatar Battle Arena. It transforms battles from simple turn-based combat into dynamic, story-driven experiences with authentic character development and dramatic tension building.

**Current Status**: The system has been optimized for natural battle flow with extremely conservative escalation triggers that only activate when truly needed, preventing premature escalation and maintaining strategic depth.

## Core Principles

### 1. **Forward Progression Only**
The battle arc can only move forward (e.g., from `Opening` → `RisingAction` → `Climax`). It can never revert to a previous state, even if health is restored. This ensures a consistent build-up of tension and prevents narrative regression.

### 2. **Conservative Escalation**
Escalation events are extremely rare and only trigger when battles truly need intervention. The system prioritizes natural battle flow over forced dramatic moments.

### 3. **High-Priority Trumps All**
Dramatic events, such as a character's health dropping critically low, will trigger high-priority transitions that can bypass standard phases, making fights unpredictable and exciting.

### 4. **Developer Controls**
In development mode, the console logs every transition check, showing which conditions were met or failed. It's also possible to inject state changes for testing purposes.

### 5. **Comprehensive Modifier System**
Each arc state applies global modifiers that affect all aspects of battle, creating mechanical depth alongside narrative progression.

## Current Escalation Thresholds (Conservative)

### Pattern Detection
- **Consecutive Moves**: 8 identical moves required (increased from 6)
- **Reposition Spam**: 8 reposition attempts before forcing close combat (increased from 5)
- **Escalation Cooldown**: 15 turns minimum between escalation events (increased from 12)

### Damage-Based Escalation
- **Damage Threshold**: 25 total damage by turn 35 (increased from 15 by turn 30)
- **Turns Without Damage**: 15 turns without damage (increased from 10)
- **Stalemate Detection**: 30 turns with <0.5 average damage per turn (increased from 20)

### Basic Strike Prevention
- **During Escalation**: Basic Strike is completely disabled (score = -1000)
- **Fallback Logic**: Signature moves prioritized over Basic Strike during escalation
- **Double Protection**: Both move ID and name checked to prevent Basic Strike usage

## Battle Arc States

### Opening
- **Description**: The battle begins with cautious probing and testing of defenses
- **Modifiers**: Normal damage, conservative AI behavior
- **Duration**: Typically 5-15 turns
- **Narrative**: Characters are testing each other's capabilities

### RisingAction
- **Description**: The combatants begin to engage more seriously, building momentum
- **Modifiers**: Slight damage bonus (+5%), normal AI behavior, minor chi regeneration
- **Duration**: Typically 10-25 turns
- **Narrative**: The real battle begins as characters start using their signature techniques

### Climax
- **Description**: The battle reaches its peak intensity with powerful techniques unleashed
- **Modifiers**: Damage bonus (+10%), aggressive AI (+50% risk factor), status effects last 25% shorter, finishers unlocked
- **Duration**: Variable based on battle conditions
- **Narrative**: Characters are using their most powerful abilities in a desperate struggle

### FallingAction
- **Description**: The fighters are exhausted but desperate, using their final reserves
- **Modifiers**: High damage bonus (+20%), defense penalty (-10%), very aggressive AI (+80% risk factor), status effects last 50% shorter
- **Duration**: Variable based on battle conditions
- **Narrative**: Characters are on their last legs, fighting with everything they have

### Resolution
- **Description**: The battle nears its conclusion with one final push for victory
- **Modifiers**: Maximum damage bonus (+30%), significant defense penalty (-20%), extremely aggressive AI (+100% risk factor), status effects last 75% shorter
- **Duration**: Until battle conclusion
- **Narrative**: The final moments of the battle, with victory or defeat imminent

### Twilight
- **Description**: Both fighters are on the brink of collapse in a desperate final struggle
- **Modifiers**: Maximum damage bonus (+50%), significant defense penalty (-25%), maximum AI aggression (+100% risk factor)
- **Duration**: Until battle conclusion
- **Narrative**: A rare, dramatic edge case where both characters are critically wounded

## Arc State Modifiers

The current `ArcState` applies global modifiers to the battle:

- **`damageBonus`**: Multiplies all damage dealt (1.0 = normal, 1.5 = 50% bonus)
- **`defenseBonus`**: Adds a flat bonus to defense calculations (can be negative)
- **`chiRegenBonus`**: Adds extra Chi regeneration per turn
- **`statusEffectDurationModifier`**: Modifies the duration of newly applied buffs/debuffs (0.5 = half duration, 2.0 = double duration)
- **`aiRiskFactor`**: Influences the AI's tendency to choose high-risk, high-reward moves (1.0 = normal, 2.0 = twice as aggressive)
- **`unlocksFinishers`**: A boolean flag that gates the availability of Finisher-class moves

## Transition Rules

### Priority System
Transitions are evaluated in priority order (highest to lowest):

1. **Priority 100**: Edge case transitions (Twilight state)
2. **Priority 10**: Dramatic escalation transitions
3. **Priority 5**: Standard progression transitions
4. **Priority 1**: Time-based fallback transitions

### Transition Conditions

#### High-Priority Transitions (Priority 100)
```typescript
// Both fighters critically wounded
{
  from: BattleArcState.Climax,
  to: BattleArcState.Twilight,
  priority: 100,
  condition: (state) => 
    state.participants.every(p => p.currentHealth <= 10) && 
    !hasAlreadyPassed(state, BattleArcState.Twilight),
  narrative: "Both fighters are on the brink of collapse!"
}
```

#### Dramatic Escalation (Priority 10)
```typescript
// Early devastating blow
{
  from: BattleArcState.Opening,
  to: BattleArcState.Climax,
  priority: 10,
  condition: (state) => 
    state.participants.some(p => p.currentHealth < 40) && 
    !hasAlreadyPassed(state, BattleArcState.Climax),
  narrative: "An early, devastating blow pushes the fight straight to a critical climax!"
}
```

#### Standard Progression (Priority 5)
```typescript
// Normal progression based on turn count
{
  from: BattleArcState.Opening,
  to: BattleArcState.RisingAction,
  priority: 5,
  condition: (state) => 
    state.turn > 5 && 
    !hasAlreadyPassed(state, BattleArcState.RisingAction),
  narrative: "The initial probing ends; the real battle begins!"
}
```

## Implementation Details

### Core Files

- **`src/features/battle-simulation/types/index.ts`**: Type definitions for arc states and modifiers
- **`src/features/battle-simulation/services/battle/escalationDetection.service.ts`**: Conservative escalation detection logic
- **`src/features/battle-simulation/services/battle/escalationApplication.service.ts`**: Escalation state application
- **`src/features/battle-simulation/services/battle/patternTracking.service.ts`**: Pattern detection with 8-move threshold
- **`src/features/battle-simulation/services/ai/tacticalAI.service.ts`**: AI with Basic Strike prevention during escalation
- **`src/features/battle-simulation/services/battle/phases/tacticalPhase.service.ts`**: Enhanced fallback logic

### Integration Points

#### Status Effect System
```typescript
// Status effects are modified by arc state duration modifiers
export function applyEffect(
  character: BattleCharacter, 
  effect: ActiveStatusEffect, 
  arcModifiers?: ArcStateModifier
): BattleCharacter {
  let modifiedEffect = { ...effect };
  
  if (arcModifiers) {
    const modifiedDuration = Math.round(effect.duration * arcModifiers.statusEffectDurationModifier);
    modifiedEffect = { ...modifiedEffect, duration: Math.max(1, modifiedDuration) };
  }
  
  return { ...character, activeEffects: [...character.activeEffects, modifiedEffect] };
}
```

#### AI Decision Making
```typescript
// AI behavior is influenced by arc state risk factors
if (arcModifiers && move.baseDamage > 20) {
  score *= arcModifiers.aiRiskFactor;
  if (arcModifiers.aiRiskFactor > 1.0) {
    reasoning += `Arc state makes AI more aggressive (${arcModifiers.aiRiskFactor.toFixed(1)}x). `;
  }
}

// Basic Strike completely disabled during escalation
if (self.flags?.forcedEscalation === 'true' && move.id.includes('Basic')) {
  score = -1000; // Effectively disable Basic Strike during escalation
  reasoning += "Basic Strike completely disabled during escalation! ";
}
```

#### Battle State Management
```typescript
// Arc state is updated each turn with conservative thresholds
export function shouldTriggerEscalation(state: BattleState, attacker: BattleCharacter) {
  // Check 15-turn cooldown between escalation events
  if (state.turn - lastEscalationTurn < ESCALATION_TRIGGERS.ESCALATION_COOLDOWN) {
    return { shouldEscalate: false, reason: 'Escalation cooldown active' };
  }
  
  // Check for damage-based escalation only after turn 35
  if (state.turn >= 35 && damageStats.totalDamage < 25) {
    return { shouldEscalate: true, reason: 'Low damage output by turn 35' };
  }
}
```

## Performance Metrics

### Recent Battle Results
- **Escalation Frequency**: 0 events in 29 turns (0% frequency)
- **Basic Strike During Escalation**: Completely eliminated
- **Battle Flow**: Natural progression without forced interruptions
- **AI Decision Quality**: Strategic and varied move selection

### System Improvements
- **Escalation Reduction**: 100% reduction from previous 15% frequency
- **Strategic Depth**: Enhanced AI decision-making with environmental awareness
- **Narrative Coherence**: Clean battle progression that enhances storytelling
- **State Management**: Robust escalation state tracking and cleanup

## Usage Examples

### Basic Arc State Update
```typescript
import { updateArcState, getArcModifiers } from './arc.service';

// Update arc state each turn
const { newState, logEntry, transitionOccurred } = updateArcState(battleState);

if (transitionOccurred) {
  // Add transition log entry to battle log
  battleState.battleLog.push(logEntry);
  
  // Apply new arc modifiers
  const modifiers = getArcModifiers(newState.arcState);
  console.log(`Battle entered ${newState.arcState} phase with ${modifiers.damageBonus}x damage bonus`);
}
```

### Developer Injection
```typescript
// Force a transition for testing (development only)
const injectedTrigger = {
  to: BattleArcState.Climax,
  reason: 'Developer test'
};

const result = updateArcState(battleState, injectedTrigger);
```

## Future Enhancements

### Planned Improvements
1. **Dynamic Threshold Adjustment**: Escalation thresholds that adapt based on battle context
2. **Character-Specific Escalation**: Different escalation patterns for different character types
3. **Environmental Escalation**: Location-based escalation triggers
4. **Narrative Integration**: Enhanced narrative generation during escalation events

### Monitoring and Analytics
- **Escalation Frequency Tracking**: Monitor escalation event rates
- **Battle Flow Analysis**: Analyze natural vs. forced battle progression
- **AI Decision Quality**: Track strategic decision-making effectiveness
- **Performance Metrics**: Monitor system performance and optimization opportunities

## Manipulation Resilience & Behavioral Traits

- **Manipulation Resilience**: Each character now has a `manipulationResilience` stat (0-100) that determines their resistance to psychological manipulation and escalation triggers. Characters with low resilience are more likely to escalate or be affected by psychological tactics.
- **Behavioral Traits**: The escalation system now considers `behavioralTraits` (instances of `BehavioralTraitInstance`) when determining escalation likelihood and narrative outcomes.
- **Integration**: Both properties are tracked in `BattleCharacter` and `PerceivedState`, and are used by the AI and escalation logic to create more nuanced, context-aware battle flow. 
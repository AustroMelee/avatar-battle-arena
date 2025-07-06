# Status Effect System

## Overview

The Status Effect System is a comprehensive buff/debuff system that unifies all status effects into a single `activeEffects` array on characters. The system provides configurable status effect application, processing, and integration with all battle mechanics.

## ✅ **System Status: COMPLETE**

The status effect system is fully operational with:
- ✅ **Unified status effects** in `activeEffects` array
- ✅ **Status effect application** with chance and duration
- ✅ **Status effect processing** with turn-based damage/healing
- ✅ **AI integration** with status effect valuation
- ✅ **Battle log integration** for status effect events
- ✅ **Damage modification** based on status effects
- ✅ **Complete debugging and logging**

## Core Architecture

### Status Effect Types

```typescript
type StatusEffectType = 
  | 'BURN'           // Damage over time
  | 'DEFENSE_UP'     // Increase defense
  | 'ATTACK_UP'      // Increase attack power
  | 'DEFENSE_DOWN'   // Decrease defense
  | 'STUN'           // Prevent actions
  | 'HEAL_OVER_TIME' // Healing over time
  | 'CRIT_CHANCE_UP' // Increase critical hit chance
  | 'SLOW';          // Reduce action speed
```

### Status Effect Structure

```typescript
interface ActiveStatusEffect {
  id: string;
  name: string;
  type: StatusEffectType;
  duration: number;        // Turns remaining
  potency: number;         // Effect strength
  source: string;          // Character who applied it
  appliedBy: string;       // Move that applied it
  category: 'buff' | 'debuff';
}
```

### Move Integration

```typescript
interface Move {
  // ... other properties
  appliesEffect?: {
    type: StatusEffectType;
    chance: number;        // 0.0 to 1.0 probability
    duration: number;      // Turn duration
    potency: number;       // Effect strength
  };
}
```

## Implementation Details

### Status Effect Application

Status effects are applied during move execution:

```typescript
// In attackMove.service.ts
if (ability.appliesEffect) {
  const shouldApply = !ability.appliesEffect.chance || 
                     Math.random() < ability.appliesEffect.chance;
  
  if (shouldApply) {
    const statusEffect = createStatusEffect(
      ability.name,
      ability.appliesEffect,
      target.name
    );
    
    const updatedTarget = applyEffect(newState.participants[targetIndex], statusEffect);
    newState.participants[targetIndex] = updatedTarget;
  }
}
```

### Status Effect Processing

Status effects are processed each turn:

```typescript
// In statusEffect.service.ts
export function processTurnEffects(character: BattleCharacter): BattleCharacter {
  const updatedCharacter = { ...character };
  const remainingEffects: ActiveStatusEffect[] = [];
  
  for (const effect of character.activeEffects) {
    // Apply effect for this turn
    updatedCharacter = applyEffectForTurn(updatedCharacter, effect);
    
    // Decrease duration
    const newDuration = effect.duration - 1;
    
    if (newDuration > 0) {
      remainingEffects.push({
        ...effect,
        duration: newDuration
      });
    }
  }
  
  updatedCharacter.activeEffects = remainingEffects;
  return updatedCharacter;
}
```

### Damage Modification

Status effects modify damage calculation:

```typescript
export function modifyDamageWithEffects(
  damage: number, 
  attacker: BattleCharacter, 
  target: BattleCharacter
): number {
  let modifiedDamage = damage;
  
  // ATTACK_UP on attacker increases damage
  const attackUpEffect = attacker.activeEffects.find(e => e.type === 'ATTACK_UP');
  if (attackUpEffect) {
    modifiedDamage *= (1 + attackUpEffect.potency / 100);
  }
  
  // DEFENSE_DOWN on target increases damage taken
  const defenseDownEffect = target.activeEffects.find(e => e.type === 'DEFENSE_DOWN');
  if (defenseDownEffect) {
    modifiedDamage *= (1 + defenseDownEffect.potency / 100);
  }
  
  return Math.round(modifiedDamage);
}
```

## Current Status Effects

### BURN (Blue Fire)
- **Source**: Azula's Blue Fire move
- **Chance**: 70%
- **Duration**: 3 turns
- **Potency**: 2 damage per turn
- **Effect**: Deals damage over time

### DEFENSE_DOWN (Wind Slice)
- **Source**: Aang's Wind Slice move
- **Chance**: 50%
- **Duration**: 2 turns
- **Potency**: 3 defense reduction
- **Effect**: Reduces target's defense

### DEFENSE_UP (Air Shield)
- **Source**: Aang's Air Shield move
- **Chance**: 100%
- **Duration**: 2 turns
- **Potency**: 5 defense increase
- **Effect**: Increases user's defense

## AI Integration

### Status Effect Valuation

The AI system recognizes and values status effects:

```typescript
// In tacticalAI.service.ts
if (move.appliesEffect) {
  const effect = move.appliesEffect;
  if (effect.category === 'debuff') {
    // Highly value applying debuffs to healthy enemies
    if (!enemy.activeEffects.some(e => e.type === effect.type)) {
      score += 25;
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

### AI Decision Making

The AI considers status effects when:
- **Choosing moves**: Values moves that apply useful status effects
- **Targeting**: Prioritizes targets with beneficial status effects
- **Timing**: Considers status effect duration and timing
- **Synergy**: Recognizes status effect combinations

## Battle Log Integration

### Status Effect Events

Status effects are logged in the battle log:

```typescript
// Status effect application
{
  turn: 8,
  actor: "Azula",
  type: "MOVE",
  action: "Blue Fire",
  target: "Aang",
  result: "Aang takes 12 damage and begins to burn",
  narrative: "Azula unleashes her signature blue flames...",
  meta: {
    statusEffect: {
      type: "BURN",
      duration: 3,
      potency: 2
    }
  }
}

// Status effect damage
{
  turn: 9,
  actor: "System",
  type: "STATUS",
  action: "Burn Damage",
  target: "Aang",
  result: "Aang takes 2 burn damage",
  narrative: "The blue flames continue to burn Aang..."
}
```

### Debug Logging

Comprehensive debug logging for status effects:

```typescript
console.log(`⚡⚡⚡ STATUS EFFECT CHECK - ${ability.name} has appliesEffect:`, ability.appliesEffect);
console.log(`⚡⚡⚡ STATUS EFFECT CHANCE - ${ability.name} chance: ${ability.appliesEffect.chance}, shouldApply: ${shouldApply}`);
console.log(`🎯🎯🎯 STATUS EFFECT APPLIED - ${attacker.name} applied ${statusEffect.name} to ${target.name} for ${statusEffect.duration} turns 🎯🎯🎯`);
console.log(`🔄🔄🔄 PROCESSING TURN EFFECTS - ${character.name} on turn ${turn} 🔄🔄🔄`);
```

## System Integration

### Move Execution Pipeline

1. **Move Selection**: AI chooses move considering status effects
2. **Move Execution**: Move is executed with damage calculation
3. **Status Effect Application**: Status effects are applied based on chance
4. **State Update**: Character states are updated with new effects
5. **Logging**: Status effect events are logged

### Turn Processing Pipeline

1. **Turn Start**: Turn begins with state initialization
2. **Effect Processing**: Status effects are processed for each character
3. **Effect Application**: Effects apply their turn-based effects
4. **Duration Update**: Effect durations are decreased
5. **Expiration**: Expired effects are removed
6. **Logging**: Effect processing is logged

### Battle State Management

```typescript
// Character state includes active effects
type BattleCharacter = Character & {
  // ... other properties
  activeEffects: ActiveStatusEffect[];
};

// Battle state tracks all participants
type BattleState = {
  participants: [BattleCharacter, BattleCharacter];
  // ... other properties
};
```

## Performance Considerations

### Efficient Processing
- **Effect Filtering**: Only process effects that need turn-based updates
- **Immutable Updates**: Use immutable state updates for performance
- **Lazy Evaluation**: Only calculate effects when needed

### Memory Management
- **Effect Cleanup**: Properly remove expired effects
- **Object Reuse**: Reuse effect objects where possible
- **Garbage Collection**: Minimize object creation

## Future Enhancements

### Planned Features
- **Effect Combinations**: Synergistic effects that enhance each other
- **Effect Removal**: Moves that can remove status effects
- **Effect Amplification**: Effects that increase other effects
- **Effect Resistance**: Characters with resistance to certain effects
- **Effect Immunity**: Complete immunity to certain effect types

### Advanced Mechanics
- **Effect Stacking**: Multiple instances of the same effect
- **Effect Transfer**: Effects that can be transferred between characters
- **Effect Reflection**: Effects that can be reflected back to the caster
- **Effect Absorption**: Effects that can be absorbed for benefits

## Testing and Validation

### Status Effect Testing
- **Application Testing**: Verify effects are applied with correct chance
- **Processing Testing**: Verify effects are processed correctly each turn
- **Expiration Testing**: Verify effects expire at the correct time
- **Integration Testing**: Verify effects work with all battle systems

### AI Integration Testing
- **Valuation Testing**: Verify AI correctly values status effects
- **Decision Testing**: Verify AI makes decisions based on status effects
- **Strategy Testing**: Verify AI develops strategies around status effects

The Status Effect System is now a complete, integrated system that enhances the battle experience with strategic depth and tactical complexity. 
# Narrative-Driven Behavioral System

## Overview

The Narrative-Driven Behavioral System is a sophisticated character personality system that makes characters feel truly alive by weaving their unique traits directly into the game's mechanics. This system interrupts normal combat flow, influences AI decisions based on personality, and provides clear, dynamic feedback to users.

## Core Principles

### 1. **No Diluting** 
- Behavioral traits are **powerful and meaningful**, not cosmetic
- Each trait has **significant mechanical impact** on battle outcomes
- Traits **interrupt normal flow** and create dramatic moments
- **Clear visual feedback** shows when traits are active

### 2. **Character Authenticity**
- Traits reflect **canonical character personalities**
- Azula's **manipulation and overconfidence** create tactical vulnerabilities
- Aang's **plea for peace** leaves him exposed but true to character
- Each trait has **narrative justification** and mechanical consequences

### 3. **Strategic Depth**
- Traits create **tactical opportunities** for opponents
- AI **reacts intelligently** to behavioral states
- Traits have **cooldowns and conditions** to prevent abuse
- **Counter-play mechanics** allow opponents to exploit weaknesses

## System Architecture

### Behavioral Traits

Each character has a set of behavioral traits that define their personality:

```typescript
interface BehavioralTrait {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  isActive: (context: TraitTriggerContext) => boolean;
  onTrigger: (context: TraitTriggerContext) => TraitEffectResult;
}
```

### Active Flags

Behavioral effects are tracked through active flags with duration:

```typescript
interface ActiveFlag {
  duration: number;
  source: string;
  appliedTurn: number;
}
```

### Trait Effects

When triggered, traits produce mechanical effects:

```typescript
interface TraitEffect {
  type: 'apply_flag' | 'modify_stat';
  target: 'self' | 'opponent';
  flag?: string;
  duration: number;
  uiIcon: string;
  uiTooltip: string;
}
```

## Character Traits

### Azula - Psychological Manipulation

**Trait ID**: `manipulation`

**Description**: Attempts to influence an opponent, lowering their defenses or causing tactical errors.

**Trigger Conditions**:
- Opponent health < 80%
- Opponent mental stability < 90
- Not already manipulated
- Turn > 3 (not too early)

**Mechanical Effects**:
- 70% chance to apply `isManipulated` flag (2 turns)
- Manipulated characters take defense penalties
- AI prioritizes aggression when manipulated

**Success Rate**: `90 - opponent.manipulationResilience` (minimum 10%)

### Azula - Overconfidence

**Trait ID**: `overconfidence`

**Description**: If Azula is winning decisively, she may toy with her opponent, missing finishing blows or leaving herself open.

**Trigger Conditions**:
- Health advantage > 40 points
- Not already overconfident
- Health > 60%

**Mechanical Effects**:
- Applies `overconfidenceActive` flag (1 turn)
- Completely disables finisher moves
- AI prefers flashy, high-damage moves
- Breaks when taking >20 damage

### Aang - Plea for Peace

**Trait ID**: `plea_for_peace`

**Description**: Aang attempts to persuade the opponent to stop fighting, leaving himself exposed.

**Trigger Conditions**:
- Health < 50%
- Health < 40% (truly desperate)
- Has not pleaded this battle

**Mechanical Effects**:
- Applies `isExposed` flag (1 turn)
- Exposed targets take 50% more damage
- Flag is consumed on first hit
- Applies `hasPleadedThisBattle` flag (99 turns)

## AI Integration

### Manipulation Effects

When a character is manipulated:
- **Defense moves penalized** (-50 score)
- **Aggression slightly boosted** (+15 score for high-damage moves)
- **AI reasoning**: "Their mind is clouded, making defense difficult"

### Overconfidence Effects

When Azula is overconfident:
- **Finisher moves disabled** (score = -Infinity)
- **Flashy moves prioritized** (+70 score for high-damage/showy moves)
- **AI reasoning**: "Her arrogance demands a flashy display"

### Exposed Target Effects

When a target is exposed:
- **Massive attack priority** (+100 score)
- **AI reasoning**: "Target is completely exposed - perfect opportunity!"

## Damage Calculation

### Exposed Target Mechanic

```typescript
// In moveLogic.service.ts
if (target.activeFlags.has('isExposed')) {
  damage = Math.round(damage * 1.5); // 50% more damage
  target.activeFlags.delete('isExposed'); // Consume flag
}
```

## UI Integration

### Visual Feedback

Behavioral flags are displayed in the character cards:

- **🧠 Manipulated**: Red color, defense penalty tooltip
- **👑 Overconfident**: Yellow color, finisher disable tooltip  
- **💔 Exposed**: Red color, damage vulnerability tooltip
- **🕊️ Has Pleaded**: Blue color, peace attempt tooltip

### Flag Display

```typescript
// In PlayerCardHorizontal.tsx
{character.activeFlags && character.activeFlags.size > 0 && (
  <div className={styles.behavioralFlagsRow}>
    {getActiveFlagsWithUI(character).map(({ flag, data, ui }) => (
      <div 
        key={flag} 
        className={styles.behavioralFlagIcon}
        title={`${ui.tooltip} (${data.duration} turns left)`}
      >
        <span className={styles.flagIcon}>{ui.icon}</span>
        <span className={styles.flagDuration}>{data.duration}</span>
      </div>
    ))}
  </div>
)}
```

## Battle Integration

### Turn Processing

The behavioral system is processed at the start of each turn:

```typescript
// In processTurn.ts
const behavioralResult = processBehavioralSystemForTurn(attacker, target, state);
state.participants[attackerIndex] = behavioralResult.updatedSelf;
state.participants[targetIndex] = behavioralResult.updatedOpponent;
state.battleLog.push(...behavioralResult.logEntries);
```

### Flag Management

Flags are automatically managed:
- **Duration ticks down** each turn
- **Expired flags removed** automatically
- **State-based flag clearing** (e.g., overconfidence breaks on damage)
- **Log entries generated** for flag changes

## Adding New Traits

### 1. Define the Trait

```typescript
export const newTrait: BehavioralTrait = {
  id: "new_trait",
  name: "Trait Name",
  description: "Description of the trait",
  cooldown: 5,
  isActive: ({ self, opponent, state }) => {
    // Define trigger conditions
    return condition;
  },
  onTrigger: ({ self, opponent }) => {
    return {
      log: "Narrative description of the trait activation",
      effects: [{
        type: 'apply_flag',
        target: 'self', // or 'opponent'
        flag: 'newFlag',
        duration: 3,
        uiIcon: '🎯',
        uiTooltip: 'Description of the effect'
      }]
    };
  }
};
```

### 2. Add to Character Data

```typescript
// In characterData.ts
{
  // ... character properties
  behavioralTraits: [
    { traitId: 'new_trait', lastTriggeredTurn: -99 }
  ]
}
```

### 3. Add UI Support

```typescript
// In behavioralUI.service.ts
case 'newFlag':
  return {
    icon: '🎯',
    tooltip: 'Description of the effect',
    color: '#ff6b6b'
  };
```

### 4. Add AI Integration

```typescript
// In tacticalAI.service.ts
if (self.activeFlags.has('newFlag')) {
  // Add AI scoring logic
  score += 50;
  reasoning += "Affected by new trait. ";
}
```

## Performance Considerations

### Efficient Processing

- **Lazy evaluation**: Traits only check conditions when needed
- **Cooldown tracking**: Prevents excessive trait activation
- **Flag cleanup**: Automatic removal of expired flags
- **Minimal state changes**: Only update when necessary

### Memory Management

- **Map-based flags**: Efficient flag storage and lookup
- **Duration tracking**: Automatic cleanup prevents memory leaks
- **Log entry batching**: Efficient logging of multiple changes

## Future Enhancements

### Planned Features

1. **Trait Chaining**: Traits that trigger other traits
2. **Environmental Influence**: Location affects trait activation
3. **Mental State Integration**: Mental state influences trait behavior
4. **Counter-Traits**: Traits that specifically counter other traits
5. **Trait Evolution**: Traits that change over the course of battle

### Extensibility

The system is designed for easy extension:
- **Modular trait definitions**
- **Pluggable AI scoring**
- **Configurable UI display**
- **Extensible flag system**

## Conclusion

The Narrative-Driven Behavioral System creates authentic, engaging character interactions that feel true to the source material while providing meaningful tactical depth. By weaving personality directly into mechanics, characters become more than just stat blocks - they become living, breathing individuals with distinct behavioral patterns that players can learn, predict, and exploit.

The system's modular design ensures that new traits can be easily added while maintaining the core principles of meaningful impact, clear feedback, and strategic depth. 
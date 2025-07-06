# Defensive Mechanics System

This system handles all active defensive maneuvers like Evasion and Parrying. It is designed to be easily extensible and provides character-specific defensive abilities that reflect their personalities and fighting styles.

## Overview

The defensive system consists of three main components:

1. **Defensive Stances** - Visual state tracking for UI/VFX
2. **Active Defenses** - Mechanical defensive abilities that can be countered
3. **Clash Resolution** - Logic for resolving attacks against active defenses

## Current Defensive Types

### Evasion (Aang - Flowing Evasion)
- **Mechanic**: Percentage-based chance to completely avoid damage
- **Power**: 75% evade chance
- **Character**: Aang uses airbending to flow around attacks
- **Narrative**: "Aang is in the wind, anticipating an attack!"

### Parry/Retaliate (Azula - Blazing Counter)
- **Mechanic**: Blocks attacks below a damage threshold and creates counter-attack opportunities
- **Power**: Can parry attacks with 20 damage or less
- **Character**: Azula uses precise fire blasts to intercept attacks
- **Narrative**: "Azula's gaze sharpens—she's waiting for a mistake!"

## How to Add a New Defensive Style

To add a new defensive type (e.g., "Absorb"), follow these five steps:

| Step | File to Modify | Action to Take |
| :--- | :------------- | :------------- |
| 1. | `src/common/types/index.ts` | Add your new type (e.g., `'absorb'`) to the `Ability`'s `type` union. |
| 2. | `src/features/battle-simulation/types/index.ts` | Add your new stance (e.g., `'absorbing'`) to the `DefensiveStance` type union. |
| 3. | `src/features/character-selection/data/characterData.ts` | Create a new ability for a character using your new `'absorb'` type. |
| 4. | `src/features/battle-simulation/services/battle/defensiveResolution.service.ts` | In `resolveClash`, add a new `if (defender.activeDefense.type === 'absorb')` block with its unique logic. |
| 5. | `src/features/battle-simulation/services/ai/tacticalAI.service.ts` | In the AI's move scoring, teach it the strategic situations where using "Absorb" is a good idea. |

### Example: Adding "Absorb" Defense

#### Step 1: Update Ability Types
```typescript
// src/common/types/index.ts
export type Ability = {
  // ... existing properties
  type: 'attack' | 'defense_buff' | 'evade' | 'parry_retaliate' | 'absorb';
  // ... rest of properties
};
```

#### Step 2: Update Defensive Stances
```typescript
// src/features/battle-simulation/types/index.ts
export type DefensiveStance = 'none' | 'evading' | 'parrying' | 'absorbing';
```

#### Step 3: Add Character Ability
```typescript
// src/features/character-selection/data/characterData.ts
{
  name: 'Earth Absorption',
  type: 'absorb',
  power: 50, // Absorbs 50% of damage as healing
  description: 'Uses earthbending to absorb and convert damage into healing energy',
  chiCost: 6,
  cooldown: 4,
  tags: ['defensive', 'absorption']
}
```

#### Step 4: Add Clash Resolution Logic
```typescript
// src/features/battle-simulation/services/battle/defensiveResolution.service.ts
if (defender.activeDefense.type === 'absorb') {
  const absorbedDamage = Math.floor(attackingMove.baseDamage * 0.5);
  const actualDamage = attackingMove.baseDamage - absorbedDamage;
  
  defender.activeDefense = undefined;
  defender.defensiveStance = 'none';
  defender.currentHealth = Math.min(100, defender.currentHealth + absorbedDamage);
  
  return {
    outcome: 'absorbed',
    damageDealt: actualDamage,
    narrative: `${defender.name} absorbs the impact of ${attackingMove.name}, converting damage into healing energy!`
  };
}
```

#### Step 5: Add AI Scoring
```typescript
// src/features/battle-simulation/services/ai/tacticalAI.service.ts
// In evaluateDefensiveMoves function
const isAbsorbMove = move.id.includes('absorb') || move.id.includes('absorption');

if (isAbsorbMove) {
  // Earthbenders prefer absorption when health is moderate
  if (self.currentHealth < 70 && self.currentHealth > 30) {
    score += 35;
  }
  // Don't absorb when health is already high
  if (self.currentHealth > 80) {
    score -= 20;
  }
}
```

## Mixup Attack System

The system supports "mixup" attacks that can counter specific defensive styles:

```typescript
// Example: An attack that specifically counters evasion
{
  name: 'Predictive Strike',
  type: 'attack',
  power: 3,
  beatsDefenseType: 'evade', // This attack bypasses evasion
  description: 'A carefully timed strike that anticipates evasive movements'
}
```

## AI Strategic Behavior

### Aang (Airbender)
- **Prefers**: Evasion when mobile or at low health
- **Uses**: Flowing Evasion when enemy is charging or when health < 50%
- **Avoids**: Defensive moves when winning or during escalation

### Azula (Firebender)
- **Prefers**: Parry/counter when enemy is predictable
- **Uses**: Blazing Counter against enemies with damage ≤ 20
- **Avoids**: Defensive moves when she has counter-attack opportunities

## Technical Implementation

### State Tracking
- `defensiveStance`: Visual state for UI/VFX ('none', 'evading', 'parrying')
- `activeDefense`: Mechanical state with type, source ability, and parameters
- `flags.isCountering`: Tracks if character has counter-attack opportunity

### Integration Points
- **Move Execution**: Defensive moves set stance and active defense
- **Attack Resolution**: Clash system checks for active defenses before damage
- **AI Decision Making**: Strategic scoring for defensive move selection

## Future Extensions

### Potential New Defensive Types
- **Reflect**: Bounces damage back to attacker
- **Dodge**: Completely avoids damage but doesn't create openings
- **Block**: Reduces damage by a fixed amount
- **Redirect**: Changes attack direction to hit another target

### Advanced Features
- **Defensive Combos**: Chain multiple defensive moves
- **Environmental Defenses**: Location-specific defensive bonuses
- **Defensive Stances**: Persistent defensive states that modify all incoming attacks

By following this pattern, new defensive mechanics can be added without breaking existing ones, maintaining the system's extensibility and character-driven design. 
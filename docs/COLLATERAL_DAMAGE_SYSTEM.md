# Collateral Damage System

## Overview

The Collateral Damage System introduces environmental damage mechanics to the Avatar Battle Arena, creating more realistic and narratively rich battles. Powerful moves can now damage the battle environment, with different locations having varying tolerance levels for such damage.

## Core Concepts

### Environmental Damage
- **Definition**: Damage caused to the battle environment by powerful moves
- **Tracking**: Each move can have a `collateralDamage` property indicating damage level
- **Narrative**: Environmental damage creates story-driven consequences
- **AI Awareness**: Characters consider collateral damage when choosing moves

### Location Tolerance
- **Definition**: Each location has a `collateralTolerance` level
- **Effect**: Locations with low tolerance are more easily damaged
- **Narrative**: Tolerance levels are reflected in location descriptions
- **Gameplay**: High-damage moves may be filtered out in sensitive locations

### Mental State Impact
- **Connection**: Environmental destruction can affect character mental states
- **Permanence**: Mental state changes from environmental damage can be irreversible
- **Behavior**: Characters may become more reckless or cautious based on environmental damage

## Implementation

### Data Structure

#### Location Data
```typescript
interface Location {
  name: string;
  description: string;
  image: string;
  collateralTolerance: number; // 0-100, higher = more tolerant
  toleranceNarrative: string; // Description of damage tolerance
}
```

#### Ability Data
```typescript
interface Ability {
  // ... existing properties
  collateralDamage?: number; // 0-10, damage level to environment
  collateralDamageNarrative?: string; // Story description of environmental damage
}
```

#### Battle Character
```typescript
interface BattleCharacter {
  // ... existing properties
  mentalThresholdsCrossed: {
    unhinged: boolean; // Permanent mental state change
    broken: boolean;   // Severe permanent mental state change
  };
}
```

### Core Services

#### Move Filtering
The `getAvailableMoves` function in `moveUtils.ts` filters moves based on collateral damage tolerance:

```typescript
export function getAvailableMoves(
  character: BattleCharacter,
  metaState: MetaState,
  location: Location
): Ability[] {
  const moves = getCharacterMoves(character.name);
  
  // Filter based on collateral damage tolerance
  return moves.filter(move => {
    if (!move.collateralDamage || move.collateralDamage === 0) {
      return true; // No environmental damage
    }
    
    // Check if move damage exceeds location tolerance
    const damageLevel = move.collateralDamage;
    const tolerance = location.collateralTolerance;
    
    return damageLevel <= tolerance;
  });
}
```

#### Battle Log Integration
Environmental damage is logged in the battle system:

```typescript
// In tacticalMove.service.ts
if (move.collateralDamage && move.collateralDamage > 0) {
  const collateralLogEntry: BattleLogEntry = {
    id: `collateral-${state.turn}-${Date.now()}`,
    turn: state.turn,
    actor: 'Environment',
    type: 'NARRATIVE',
    action: 'Collateral Damage',
    result: `A nearby structure was damaged by ${move.name}.`,
    narrative: move.collateralDamageNarrative || `The force of ${move.name} causes environmental damage.`,
    timestamp: Date.now(),
    meta: { damageLevel: move.collateralDamage },
  };
  
  return {
    // ... other properties
    collateralLogEntry
  };
}
```

#### AI Decision Making
The AI considers collateral damage when choosing moves:

```typescript
// In tacticalAI.service.ts
export function selectTacticalMove(
  character: BattleCharacter,
  state: BattleState,
  location: Location
): Ability {
  const availableMoves = getAvailableMoves(character, metaState, location);
  
  // AI scoring considers environmental factors
  const scoredMoves = availableMoves.map(move => ({
    move,
    score: calculateMoveScore(move, character, state, location)
  }));
  
  return selectBestMove(scoredMoves);
}
```

## Game Mechanics

### Damage Levels
- **Level 1-3**: Minor environmental damage (cracks, small fires)
- **Level 4-6**: Moderate environmental damage (structural damage, large fires)
- **Level 7-10**: Severe environmental damage (building collapse, massive destruction)

### Tolerance Levels
- **0-20**: Very sensitive (temples, sacred sites)
- **21-40**: Sensitive (residential areas, markets)
- **41-60**: Moderate (streets, plazas)
- **61-80**: Tolerant (industrial areas, training grounds)
- **81-100**: Very tolerant (wastelands, battlefields)

### Mental State Effects
- **Environmental Destruction**: Can trigger mental state changes
- **Unhinged State**: Characters become more reckless with environmental damage
- **Broken State**: Characters may avoid environmental damage entirely
- **Permanent Effects**: Some mental state changes are irreversible

## Narrative Integration

### Environmental Damage Stories
Each move with collateral damage includes narrative descriptions:

```typescript
// Example: Blue Fire ability
{
  name: "Blue Fire",
  collateralDamage: 5,
  collateralDamageNarrative: "Azula's blue fire scorches the ancient stonework, leaving behind molten trails that crack the foundation."
}
```

### Location-Specific Narratives
Locations include tolerance descriptions:

```typescript
// Example: Fire Nation Capital
{
  name: "Fire Nation Capital",
  collateralTolerance: 30,
  toleranceNarrative: "The ancient capital's stone structures are surprisingly fragile, with centuries of wear making them vulnerable to powerful bending."
}
```

### Battle Log Entries
Environmental damage appears in battle logs:

```
T10 Environment: Collateral Damage
T14 Environment: Collateral Damage
T22 Environment: Collateral Damage
```

## AI Behavior

### Environmental Awareness
- **Tolerance Checking**: AI filters moves based on location tolerance
- **Damage Consideration**: AI weighs environmental damage against tactical benefits
- **Character Personality**: Different characters have varying attitudes toward environmental damage

### Mental State Influence
- **Unhinged Characters**: May ignore environmental damage considerations
- **Broken Characters**: May become overly cautious about environmental damage
- **Normal Characters**: Balance tactical needs with environmental concerns

## Configuration

### Adding Collateral Damage to Moves
```typescript
// In characterData.ts
{
  name: "Devastating Strike",
  type: "attack",
  power: 15,
  collateralDamage: 8,
  collateralDamageNarrative: "The sheer force of this attack sends shockwaves through the ground, cracking stone and toppling nearby structures."
}
```

### Setting Location Tolerance
```typescript
// In locationData.ts
{
  name: "Sacred Temple",
  description: "An ancient temple with delicate architecture",
  collateralTolerance: 15,
  toleranceNarrative: "The temple's ancient stonework is fragile and sacred, easily damaged by powerful bending."
}
```

## Testing

### Manual Testing
1. Select characters with high-damage moves
2. Choose locations with low tolerance
3. Observe move filtering in AI decisions
4. Check battle logs for environmental damage entries
5. Verify mental state changes from environmental damage

### Automated Testing
```typescript
// Test move filtering
test('filters moves based on collateral damage tolerance', () => {
  const location = { collateralTolerance: 20 };
  const moves = [
    { name: 'Safe Move', collateralDamage: 0 },
    { name: 'Damaging Move', collateralDamage: 25 }
  ];
  
  const available = getAvailableMoves(character, metaState, location);
  expect(available).toHaveLength(1);
  expect(available[0].name).toBe('Safe Move');
});
```

## Future Enhancements

### Planned Features
- **Dynamic Environment**: Environment changes based on damage
- **Repair Mechanics**: Environment can be repaired over time
- **Weather Effects**: Environmental damage affected by weather
- **Character Reactions**: Characters react to environmental damage
- **Multi-location Battles**: Battles that move between different environments

### Technical Improvements
- **Performance Optimization**: Efficient damage calculation
- **Visual Effects**: Environmental damage visualization
- **Sound Integration**: Environmental damage audio cues
- **Particle Systems**: Visual feedback for environmental damage

## Conclusion

The Collateral Damage System adds depth and realism to the Avatar Battle Arena by:
- Creating environmental consequences for powerful moves
- Adding strategic considerations for move selection
- Enhancing narrative storytelling
- Influencing character mental states
- Providing location-specific gameplay mechanics

This system makes battles more immersive and creates meaningful choices for both players and AI characters. 
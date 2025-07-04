# Cooldown System Implementation

## Overview

The cooldown system prevents ability spamming in the Avatar Battle Arena by implementing turn-based cooldowns, use limits, and resource management. This system ensures strategic gameplay and prevents the repetitive use of powerful abilities.

## Problem Solved

Based on the battle logs analysis, moves like "Wind Slice" and "Air Blast" were being spammed without restriction:

```
Turn 1: Aang uses Wind Slice (6 chi). It hits Azula, dealing 1 damage.
Turn 3: Aang uses Wind Slice (6 chi). It hits Azula, dealing 1 damage.
Turn 13: Aang uses Air Blast (4 chi). It hits Azula, dealing 1 damage.
Turn 23: Aang uses Air Blast (4 chi). It hits Azula, dealing 1 damage.
```

The cooldown system prevents this by:
- Enforcing turn-based cooldowns for abilities
- Limiting uses per battle for powerful moves
- Validating chi costs and health requirements
- Providing visual feedback for availability status

## Architecture

### Type System

The cooldown system uses comprehensive TypeScript types for type safety:

```typescript
// Core cooldown state types
export type AbilityCooldownState = {
  lastUsedTurn: number;
  usesRemaining: number | undefined;
  isOnCooldown: boolean;
  cooldownTurnsRemaining: number;
};

export type CharacterCooldownState = {
  abilityStates: Record<string, AbilityCooldownState>;
  currentTurn: number;
};
```

### Service Layer

The `cooldownManager.service.ts` provides core functionality:

- **`initializeCooldownState()`** - Sets up initial cooldown tracking
- **`checkAbilityAvailability()`** - Validates if an ability can be used
- **`updateAbilityCooldownState()`** - Updates state when ability is used
- **`advanceCooldownTurn()`** - Advances cooldowns by one turn
- **`resetCooldowns()`** - Resets for new battles

### React Hook

The `useCooldownManager.hook.ts` provides React integration:

```typescript
const cooldownManager = useCooldownManager({
  abilities: character.abilities,
  startingTurn: 0,
  availableChi: character.resources.chi,
  currentHealthPercentage: healthPercentage
});
```

## Implementation Details

### Cooldown Values

Based on battle analysis, the following cooldowns were implemented:

| Ability | Previous Cooldown | New Cooldown | Reason |
|---------|------------------|--------------|---------|
| Wind Slice | 2 turns | 3 turns | High damage, frequently spammed |
| Air Blast | 0 turns | 2 turns | Moderate damage, spammed |
| Air Shield | 1 turn | 4 turns | Defensive ability, overused |
| Blue Fire | 0 turns | 1 turn | Basic attack, needs restriction |
| Phoenix Rage | 0 turns | 5 turns | Desperation move, powerful |
| Lightning Storm | 0 turns | 6 turns | Desperation move, very powerful |

### Validation Rules

The system enforces several validation rules:

1. **Chi Cost Validation**: Abilities require sufficient chi
2. **Cooldown Validation**: Abilities must be off cooldown
3. **Use Limit Validation**: Limited-use abilities check remaining uses
4. **Health Threshold Validation**: Desperation moves require low health
5. **Turn Advancement**: Cooldowns only decrease when turns advance

### Visual Feedback

The UI provides comprehensive visual feedback:

- **Color-coded buttons**: Different colors for different states
- **Cooldown progress bars**: Visual representation of cooldown progress
- **Tooltips**: Detailed explanations of why abilities are unavailable
- **Uses remaining**: Display of remaining uses for limited abilities
- **Desperation indicators**: Special styling for desperation moves

## Components

### AbilityButton

A reusable component for displaying individual abilities with cooldown information:

```typescript
<AbilityButton
  ability={ability}
  displayInfo={cooldownManager.getDisplayInfo(ability)}
  onClick={handleAbilitySelect}
  showTooltips={true}
/>
```

### AbilityPanel

A comprehensive panel showing all abilities for a character:

```typescript
<AbilityPanel
  character={battleCharacter}
  isActive={isActive}
  onAbilitySelect={handleAbilitySelect}
  showTooltips={true}
/>
```

### CooldownDemo

An interactive demo component for testing the cooldown system:

```typescript
<CooldownDemo showTooltips={true} />
```

## Integration with Battle System

The cooldown system integrates with the existing battle system through:

1. **Battle State**: Cooldown state is part of the battle character state
2. **Turn Processing**: Cooldowns advance with each turn
3. **AI Decision Making**: AI considers cooldowns when selecting moves
4. **Battle Logging**: Cooldown violations are logged

## Accessibility Features

The cooldown system includes comprehensive accessibility support:

- **ARIA Labels**: All interactive elements have proper labels
- **Keyboard Navigation**: Full keyboard support for all controls
- **Screen Reader Support**: Hidden descriptions for screen readers
- **High Contrast Mode**: Special styling for high contrast preferences
- **Reduced Motion**: Respects user motion preferences

## Performance Considerations

The implementation includes several performance optimizations:

- **Memoization**: Expensive calculations are memoized
- **Efficient Updates**: Only necessary state updates are performed
- **Lazy Evaluation**: Cooldown checks are performed on-demand
- **Minimal Re-renders**: Components only re-render when necessary

## Testing

The cooldown system includes comprehensive validation:

- **Input Validation**: All parameters are validated with specific error messages
- **Boundary Testing**: Edge cases are handled (negative values, invalid states)
- **State Consistency**: Cooldown state is validated for consistency
- **Error Recovery**: Graceful handling of invalid states

## Future Enhancements

Potential future improvements:

1. **Per-Player Cooldowns**: Different cooldown states for each player
2. **Team Cooldowns**: Shared cooldowns for team abilities
3. **Dynamic Cooldowns**: Cooldowns that change based on battle conditions
4. **Cooldown Reduction**: Abilities that reduce other cooldowns
5. **Cooldown Acceleration**: Items or effects that speed up cooldowns

## Usage Examples

### Basic Usage

```typescript
// Initialize cooldown manager
const cooldownManager = useCooldownManager({
  abilities: character.abilities,
  startingTurn: 0,
  availableChi: 10,
  currentHealthPercentage: 80
});

// Check if ability is available
const availability = cooldownManager.isAbilityAvailable(ability);
if (availability.isAvailable) {
  cooldownManager.useAbility(ability);
  // Execute ability logic
}

// Advance turn
cooldownManager.advanceTurn();
```

### Integration with Battle System

```typescript
// In battle turn processing
function processTurn(battleState: BattleState): BattleState {
  // Advance cooldowns for all participants
  battleState.participants = battleState.participants.map(participant => ({
    ...participant,
    cooldownState: advanceCooldownTurn(participant.cooldownState)
  }));
  
  // Process AI decisions with cooldown awareness
  const aiDecision = selectAIMove(participant, battleState);
  
  return battleState;
}
```

## Conclusion

The cooldown system successfully addresses the ability spamming issue identified in the battle logs while maintaining the strategic depth of the battle system. The implementation follows strict TypeScript guidelines and provides a robust foundation for future enhancements. 
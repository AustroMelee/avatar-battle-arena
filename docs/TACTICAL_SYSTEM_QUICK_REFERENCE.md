# Tactical Battle System - Quick Reference Guide

## Key Files

### Core System
- `src/features/battle-simulation/services/battle/processTurn.ts` - Main turn processing
- `src/features/battle-simulation/services/battle/positioningMechanics.service.ts` - Tactical mechanics
- `src/features/battle-simulation/services/ai/tacticalAI.service.ts` - AI decision making
- `src/features/battle-simulation/types/move.types.ts` - Move definitions and types

### State Management
- `src/features/battle-simulation/services/battle/state.ts` - Battle state management
- `src/features/battle-simulation/types/index.ts` - Core type definitions

## Quick Commands

### Add a New Move
```typescript
// In move.types.ts
export const NEW_CHARACTER_MOVES: Move[] = [
  {
    id: 'new_move',
    name: 'New Move',
    chiCost: 5,
    baseDamage: 4,
    cooldown: 3,
    maxUses: 2, // Optional: limit uses per battle
    isChargeUp: true, // Optional: charge-up move
    chargeTime: 2, // Turns to charge
    canBeInterrupted: true,
    chargeInterruptionPenalty: 3,
    onlyIfEnemyState: ["repositioning", "stunned"], // Optional: conditions
    punishIfCharging: true, // Optional: punish move
    environmentalConstraints: ["Open", "Air-Friendly"], // Optional: location limits
    repositionSuccessRate: 0.8, // Optional: repositioning chance
    description: 'Description of the move'
  }
];
```

### Add Debug Logging
```typescript
// In any service file
console.log(`DEBUG: ${character.name} attempting ${action}`);
console.log(`DEBUG: ${character.name} state:`, {
  position: character.position,
  isCharging: character.isCharging,
  chargeProgress: character.chargeProgress
});
```

### Check Move Usage
```typescript
// Check if move can be used
const canUse = canUseMove(move, character, enemy, location);

// Check remaining uses
const usesLeft = character.usesLeft?.[move.name] ?? move.maxUses;
```

## Common Patterns

### Tactical Window Creation
```typescript
// Create vulnerability opportunity
participant.position = "repositioning"; // or "stunned"
participant.isCharging = true;
participant.chargeProgress = 50;
```

### AI Move Selection
```typescript
// Get tactical move selection
const tacticalResult = selectTacticalMove(
  attacker,
  target,
  availableMoves,
  location
);

// Access results
const chosenMove = tacticalResult.move;
const reasoning = tacticalResult.reasoning;
const tacticalFactors = tacticalResult.tacticalAnalysis;
```

### State Propagation
```typescript
// Ensure tactical states are visible to opponents
propagateTacticalStates(state, attackerIndex, targetIndex);

// Reset temporary states
if (character.position === "repositioning") {
  character.position = "neutral";
}
```

## Debug Commands

### Enable Debug Logging
```typescript
// Add to processTurn.ts for AI decisions
console.log(`T${state.turn} ${attacker.name} AI: ${tacticalResult.reasoning}`);

// Add to tacticalAI.service.ts for move scoring
console.log(`DEBUG: ${self.name} move selection:`, {
  bestMove: bestMove.move.name,
  score: bestMove.score,
  reasoning: bestMove.reasoning
});
```

### Check Battle State
```typescript
// Log current tactical state
console.log(`DEBUG: Battle state:`, {
  turn: state.turn,
  participants: state.participants.map(p => ({
    name: p.name,
    position: p.position,
    isCharging: p.isCharging,
    chargeProgress: p.chargeProgress
  }))
});
```

## Testing

### Run Battle Test
1. Start dev server: `npm run dev`
2. Open browser console (F12)
3. Run battle simulation
4. Check debug logs for tactical decisions

### Verify Tactical Mechanics
- Look for "PUNISHING VULNERABLE ENEMY!" messages
- Check move usage limits are enforced
- Verify tactical windows are created and exploited
- Monitor AI reasoning and move selection

## Troubleshooting

### Common Issues

**Move Usage Limits Not Working**
- Check `maxUses` property is set on move
- Verify `usesLeft` tracking in `executeTacticalMove`
- Ensure usage is updated for charge-up moves

**Tactical Windows Not Exploited**
- Check AI scoring for punish opportunities
- Verify enemy state is properly propagated
- Ensure tactical windows are created

**Repetitive Move Patterns**
- Check move variety penalties are applied
- Verify recent use penalties are working
- Monitor repositioning spam penalties

### Debug Checklist
- [ ] Console logs showing AI decisions
- [ ] Move usage tracking working
- [ ] Tactical windows being created
- [ ] State propagation between turns
- [ ] Environmental constraints enforced
- [ ] Character-specific tactics applied

## Performance Tips

### Optimization
- Use efficient state cloning
- Minimize object creation in hot paths
- Cache move scoring results
- Use proper TypeScript types for safety

### Memory Management
- Clean up temporary states
- Use efficient logging levels
- Avoid memory leaks in state updates
- Proper cleanup of event listeners

## Extension Points

### Adding New Characters
1. Define character moves in `move.types.ts`
2. Add character-specific tactics in `tacticalAI.service.ts`
3. Update character selection logic
4. Test with debug logging

### Adding New Mechanics
1. Extend type definitions
2. Update move validation logic
3. Modify AI scoring system
4. Add debug logging
5. Test thoroughly

### Custom Battle Modes
1. Extend `BattleState` interface
2. Modify turn processing logic
3. Add mode-specific AI behavior
4. Update UI components
5. Test with various scenarios 
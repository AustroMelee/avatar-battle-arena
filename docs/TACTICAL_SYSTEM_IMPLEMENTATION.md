# Tactical Battle System Implementation

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

The Avatar Battle Arena now features a comprehensive tactical positioning and charge-up system that adds strategic depth and character authenticity to battles. This system implements the user's vision of realistic combat where characters use positioning, environmental awareness, and tactical timing to gain advantages.

## Core Mechanics

### 1. Positioning System

**Position Types:**
- `neutral` - Default stance, balanced
- `defensive` - Defensive posture, better defense
- `aggressive` - Offensive stance, better damage
- `high_ground` - Tactical advantage position
- `cornered` - Disadvantaged position
- `flying` - Airbender advantage position
- `stunned` - Temporarily incapacitated
- `charging` - Preparing a powerful attack
- `repositioning` - Moving to new position

**Environmental Constraints:**
- `Desert` - Limits repositioning (except for airbenders)
- `Enclosed` - Restricts movement, airbender disadvantage
- `Air-Friendly` - Airbender advantage
- `Fire-Friendly` - Firebender advantage
- `Water-Friendly` - Waterbender advantage
- `Earth-Friendly` - Earthbender advantage
- `Open` - Default terrain

### 2. Charge-Up System

**High-Risk, High-Reward Mechanics:**
- **Aang's Charged Air Tornado**: 99 damage, instant win if lands
- **Azula's Lightning**: 99 damage, instant win if lands
- **Requirements**: Only usable when opponent is vulnerable (repositioning, stunned, or charging)
- **Interruption Risk**: 40% chance of being punished while charging
- **Environmental Factors**: Desert allows Aang's tornado, any location for Azula's lightning

### 3. Repositioning Mechanics

**Character-Specific Success Rates:**
- **Aang (Airbender)**: 90% base success rate
- **Azula (Firebender)**: 70% base success rate
- **Others**: 60% base success rate

**Diminishing Returns:**
- Each reposition attempt reduces success rate by 10%
- Maximum penalty of 30%
- Failed reposition results in "cornered" status

**Environmental Impact:**
- Desert: Repositioning fails unless airbender
- Enclosed spaces: Limited movement options
- Air-friendly locations: Enhanced airbender mobility

## Implementation Files

### Core Types and Data
- `src/features/battle-simulation/types/move.types.ts` - Extended move definitions with tactical properties
- `src/features/battle-simulation/types/index.ts` - Enhanced battle state with positioning context

### Tactical Mechanics
- `src/features/battle-simulation/services/battle/positioningMechanics.service.ts` - Core positioning and charge-up logic
- `src/features/battle-simulation/services/ai/tacticalAI.service.ts` - AI decision making with tactical awareness

### Battle Integration
- `src/features/battle-simulation/services/battle/state.ts` - Enhanced battle state initialization
- `src/features/battle-simulation/services/battle/processTurn.ts` - Turn processing with tactical mechanics

## Character Move Sets

### Aang's Tactical Moves
```typescript
{
  id: 'reposition',
  name: 'Air Glide',
  chiCost: 1,
  baseDamage: 0,
  cooldown: 1,
  changesPosition: "repositioning",
  repositionSuccessRate: 0.9, // High success rate for airbender
  environmentalConstraints: ["Open", "Air-Friendly"],
  description: 'Aang glides through the air to reposition himself.'
},
{
  id: 'charged_tornado',
  name: 'Charged Air Tornado',
  chiCost: 8,
  baseDamage: 99, // Basically instant-win if lands
  cooldown: 8,
  isChargeUp: true,
  chargeTime: 1,
  requiresPosition: ["neutral", "flying"],
  onlyIfEnemyState: ["repositioning", "stunned", "charging"],
  environmentalConstraints: ["Desert", "Open"],
  canBeInterrupted: true,
  chargeInterruptionPenalty: 5,
  description: 'Aang channels immense airbending power into a devastating tornado.'
}
```

### Azula's Tactical Moves
```typescript
{
  id: 'fire_dash',
  name: 'Fire Dash',
  chiCost: 2,
  baseDamage: 0,
  cooldown: 2,
  changesPosition: "repositioning",
  repositionSuccessRate: 0.7, // Lower than Aang but still good
  environmentalConstraints: ["Open", "Fire-Friendly"],
  description: 'Azula uses fire propulsion to quickly reposition.'
},
{
  id: 'lightning',
  name: 'Lightning',
  chiCost: 10,
  baseDamage: 99, // Instant kill, but see above
  cooldown: 10,
  isChargeUp: true,
  chargeTime: 1,
  onlyIfEnemyState: ["repositioning", "stunned", "charging"],
  canBeInterrupted: true,
  chargeInterruptionPenalty: 8, // High penalty for failed lightning
  description: 'Azula channels lightning. Only usable when opponent is vulnerable.'
}
```

## AI Tactical Decision Making

### Priority System
1. **Punish Opportunities** (50 points) - Attack charging/repositioning enemies
2. **Charge-Up Opportunities** (40 points) - Use charge moves when safe
3. **Position Advantages** (20 points) - Exploit position bonuses
4. **Repositioning Strategy** (Variable) - Tactical movement
5. **Environmental Advantages** (15 points) - Location-specific bonuses
6. **Character-Specific Tactics** (Variable) - Bending-specific strategies

### Character-Specific AI Behavior
- **Aang**: Prefers repositioning, excels in open spaces, avoids enclosed areas
- **Azula**: Maintains pressure, uses fire propulsion, capitalizes on vulnerabilities

## Battle Flow Examples

### Example 1: Desert Battle
```
Turn 1: Aang attempts Air Glide → Success (90% chance)
Turn 2: Azula uses Blue Fire → Hits for 3 damage
Turn 3: Aang sees Azula repositioning → Uses Charged Air Tornado
Turn 4: Azula's reposition fails (desert constraint) → Cornered
Turn 5: Aang's tornado completes → 99 damage, instant victory
```

### Example 2: Enclosed Space Battle
```
Turn 1: Azula uses Fire Dash → Success (70% chance)
Turn 2: Aang attempts Air Glide → Fails (enclosed space penalty)
Turn 3: Aang becomes cornered → Takes 2 damage
Turn 4: Azula capitalizes → Uses Lightning (Aang is cornered)
Turn 5: Lightning completes → 99 damage, instant victory
```

## Environmental Impact

### Location-Specific Mechanics
- **Fire Nation Throne Room**: Enclosed, limits airbender mobility
- **Si Wong Desert**: Prevents repositioning, allows Aang's tornado
- **Air Temple**: Air-friendly, enhances airbender tactics
- **Open Field**: Balanced terrain, full tactical options

### Environmental Factors
- Repositioning success rates modified by location
- Charge-up moves have location-specific requirements
- Character advantages/disadvantages based on environment
- Narrative integration with location context

## Technical Implementation

### State Management
- Battle state includes positioning, charge progress, environmental factors
- Turn processing integrates tactical mechanics
- AI decision making considers tactical context
- Logging system tracks tactical events

### Performance Considerations
- Efficient move filtering based on constraints
- Cached environmental factor calculations
- Optimized AI scoring algorithms
- Minimal state updates for performance

## Future Enhancements

### Potential Extensions
1. **Chain Positioning**: Multiple position changes in sequence
2. **Environmental Hazards**: Location-specific dangers
3. **Weather Effects**: Dynamic environmental changes
4. **Team Tactics**: Multi-character positioning
5. **Advanced AI**: Machine learning for tactical decisions

### Balance Considerations
- Charge-up interruption rates may need tuning
- Repositioning success rates could be adjusted
- Environmental penalties might need refinement
- Character-specific advantages could be expanded

## Conclusion

The tactical system successfully implements the user's vision of realistic, character-authentic combat. Aang's agility and Azula's pressure tactics are now properly represented, with environmental factors and positioning mechanics creating dynamic, strategic battles that feel true to the Avatar universe.

The system provides a solid foundation for future enhancements while maintaining the existing battle mechanics and ensuring smooth integration with the current codebase. 
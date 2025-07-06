# Identity-Driven Tactical Behavior (IDTB) System

## Overview

The Identity-Driven Tactical Behavior (IDTB) system is the "soul" of the AI that makes characters feel truly alive with authentic personalities and decision-making. It models the unique psychology, morality, and emotional state of each fighter, causing their AI to make decisions that are not just tactically optimal, but authentically in-character.

## 🧠 Core Concepts

### Character Identity Profiles
Static psychological and philosophical traits that define a character's core personality:

```typescript
interface IdentityProfile {
  characterName: string;
  coreValues: ('control' | 'dominance' | 'balance' | 'pacifism' | 'survival')[];
  tacticalTendencies: ('prefers_precision' | 'escalates_under_pressure' | 'avoids_retreat' | 'prefers_evasion')[];
  moralBoundaries: 'lethal' | 'non-lethal';
  prideTolerance: number; // 0-100
  retreatPenalty: number; // Self-imposed penalty for defensive moves
}
```

### Mental State Tracking
Dynamic psychological state that changes throughout the battle:

```typescript
interface MentalState {
  stability: number; // 0-100 (calm to unhinged)
  pride: number;     // 0-100 (ego and self-image)
  activeStates: ('enraged' | 'fearful' | 'focused' | 'unhinged')[];
}
```

### Opponent Perception
Character's subjective view of their opponent:

```typescript
interface OpponentPerception {
  threatLevel: number; // 0-100
  respectLevel: number; // 0-100
  fearLevel: number;   // 0-100
  lastUpdate: number;  // Turn when perception was last updated
}
```

## 🎭 Character Profiles

### Aang - The Avatar of Balance
```typescript
{
  characterName: 'Aang',
  coreValues: ['balance', 'pacifism', 'survival'],
  tacticalTendencies: ['prefers_evasion', 'escalates_under_pressure'],
  moralBoundaries: 'non-lethal',
  prideTolerance: 80, // High tolerance - humble nature
  retreatPenalty: 0   // No penalty for being defensive
}
```

**Behavioral Traits:**
- **Pacifist Nature**: Penalizes high-damage moves that violate non-lethal boundaries
- **Evasion Preference**: Favors evasive and defensive moves
- **Survival Instincts**: Escalates under pressure but maintains non-lethal approach
- **High Pride Tolerance**: Doesn't get easily offended or pride-damaged

### Azula - The Fire Princess
```typescript
{
  characterName: 'Azula',
  coreValues: ['control', 'dominance'],
  tacticalTendencies: ['prefers_precision', 'escalates_under_pressure'],
  moralBoundaries: 'lethal',
  prideTolerance: 30, // Low tolerance - easily offended
  retreatPenalty: 25  // Heavy penalty for defensive moves
}
```

**Behavioral Traits:**
- **Control Obsession**: Values precision and calculated moves
- **Dominance Drive**: Escalates aggressively under pressure
- **Lethal Intent**: No moral qualms about high-damage attacks
- **Low Pride Tolerance**: Easily offended, pride affects decisions significantly
- **Retreat Aversion**: Heavy self-penalty for defensive moves

## 🔄 Mental State Dynamics

### Stability Changes
Mental stability is affected by various battle events:

- **Taking Damage**: Decreases stability (more damage = bigger decrease)
- **Being Critically Hit**: Significant stability loss
- **Missing Attacks**: Moderate stability loss
- **Being Interrupted**: Major stability loss
- **Successful Evasions**: Slight stability gain
- **Landing Critical Hits**: Stability gain

### Pride Changes
Character pride is influenced by:

- **Taking Hits**: Decreases pride (especially if pride tolerance is low)
- **Being Outplayed**: Significant pride loss
- **Missing Attacks**: Pride loss
- **Landing Hits**: Pride gain
- **Successful Moves**: Pride gain

### Active State Transitions
Characters can enter different psychological states:

- **Focused**: Default state, optimal decision-making
- **Enraged**: Triggered by low stability, favors aggressive moves
- **Fearful**: Triggered by low health or high opponent threat
- **Unhinged**: Triggered by very low stability, unpredictable behavior

## 🎯 AI Integration

### Identity-Based Scoring
The IDTB system modifies AI move scores based on character identity:

```typescript
function adjustScoresByIdentity(
  character: BattleCharacter,
  availableMoves: Move[]
): ScoreAdjustments
```

**Scoring Factors:**
1. **Core Values**: Moves that align with character values get bonuses
2. **Tactical Tendencies**: Character-specific tactical preferences
3. **Moral Boundaries**: Penalties for moves that violate character morals
4. **Mental State**: Current psychological state influences move preferences
5. **Pride Considerations**: Pride level affects risk-taking behavior

### Mental State Updates
Mental states are updated every turn based on battle events:

```typescript
function updateMentalState(
  character: BattleCharacter,
  logEntries: BattleLogEntry[]
): MentalState
```

**Update Triggers:**
- Damage taken/given
- Critical hits
- Missed attacks
- Status effects
- Battle outcomes

## 🎨 UI Integration

### Mental State Indicators
Character cards display current mental states:

- **Unhinged**: Red indicator with shake animation
- **Enraged**: Orange indicator with pulse animation  
- **Fearful**: Blue indicator with fade animation
- **Focused**: Green indicator (default state)

### Battle Log Integration
Mental state changes are logged in battle events:

```
T7 Aang: Mental state changed - Stability: 85 → 72 (took 15 damage)
T8 Azula: Mental state changed - Pride: 45 → 30 (missed attack)
```

## 📊 System Architecture

### File Structure
```
src/features/battle-simulation/
├── types/
│   └── identity.types.ts          # Core type definitions
├── data/
│   └── identities.ts              # Character identity profiles
└── services/identity/
    ├── mentalState.service.ts     # Mental state management
    ├── tacticalPersonality.engine.ts # Identity-based scoring
    ├── narrativeHooks.service.ts  # Narrative integration
    └── index.ts                   # Service exports
```

### Integration Points
1. **Battle State**: Mental states stored in BattleCharacter objects
2. **AI Decision Making**: Identity adjustments applied to move scoring
3. **Turn Processing**: Mental states updated at end of each turn
4. **Narrative System**: Mental states influence story generation
5. **UI Components**: Visual indicators for mental states

## 🔧 Configuration

### Adding New Characters
1. Define identity profile in `identities.ts`
2. Set appropriate core values and tactical tendencies
3. Configure pride tolerance and retreat penalties
4. Test behavior in battle scenarios

### Mental State Tuning
Adjust sensitivity of mental state changes:

```typescript
// In mentalState.service.ts
const DAMAGE_STABILITY_LOSS = 0.8; // Per point of damage
const CRITICAL_STABILITY_LOSS = 15; // Additional loss for crits
const PRIDE_DAMAGE_RATIO = 0.6;     // Pride loss per damage taken
```

## 🎮 Usage Examples

### Battle Analysis
The IDTB system creates authentic character behavior:

**Aang vs Azula Battle:**
- Aang avoids lethal moves, prefers evasion
- Azula escalates aggressively, uses high-damage attacks
- Aang's stability drops when taking hits but recovers quickly
- Azula's pride is easily damaged, affecting her decision-making

### Debugging
Mental state changes are logged for analysis:

```
T5 Aang: Chose Air Glide. Reason: Evasion tendency favors evasive moves.
T6 Azula: Chose Lightning. Reason: Control value favors precision moves.
T7 Aang: Mental state - Stability: 90, Pride: 85, Active: focused
T8 Azula: Mental state - Stability: 75, Pride: 45, Active: enraged
```

## 🚀 Future Enhancements

### Planned Features
1. **Emotional Memory**: Characters remember past battles and opponents
2. **Relationship Dynamics**: Character relationships affect behavior
3. **Environmental Psychology**: Location affects mental states
4. **Character Growth**: Identity profiles evolve over multiple battles
5. **Advanced States**: More complex psychological conditions

### Integration Opportunities
1. **Narrative Enhancement**: Mental states drive story progression
2. **UI Animations**: Visual effects based on psychological states
3. **Sound Design**: Audio cues for mental state changes
4. **Accessibility**: Clear indicators for all mental states

## 📚 Related Documentation

- **[AI System](./AI_SYSTEM.md)**: Advanced AI decision-making
- **[Tactical Battle System](./TACTICAL_BATTLE_SYSTEM.md)**: Battle mechanics
- **[Status Effect System](./STATUS_EFFECT_SYSTEM.md)**: Buff/debuff system
- **[Narrative System](./NARRATIVE_SYSTEM.md)**: Story generation

## 🎯 System Status

**Status**: ✅ Complete and Operational
**Integration**: Fully integrated with AI, battle system, and UI
**Testing**: Verified with Aang and Azula character profiles
**Performance**: Minimal impact on battle simulation speed

The IDTB system represents a significant advancement in character AI, making battles feel authentic and character-driven rather than purely tactical. 
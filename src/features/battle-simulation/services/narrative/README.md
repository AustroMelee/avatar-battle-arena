# Enhanced Narrative System

## SRP Compliance

The narrative system is now fully SRP-compliant:
- Each file/class has a single responsibility (see SRP_REFACTORING.md, SRP_SUMMARY.md)
- Orchestration, composition, emotional policy, and strategy are all separated
- This enables safe, maintainable, and extensible narrative logic

A comprehensive narrative system that transforms mechanical battle events into compelling, character-driven storytelling. The system uses a modular, single-responsibility architecture where each file has one clear purpose.

## Architecture Overview

### Single-Responsibility File Structure

Each file in the narrative system has exactly one responsibility:

#### Core Engine
- **`narrativeEngine.ts`** - Core orchestration and evaluation logic
- **`index.ts`** - Main export hub and service integration

#### Configuration & Utilities
- **`configManager.ts`** - Configuration management and defaults
- **`utilityManager.ts`** - Utility functions and state tracking

#### Context Analysis
- **`contextBuilder.ts`** - Building complete battle context
- **`mechanicalStateExtractor.ts`** - Extracting mechanical state from characters
- **`battlePhaseAnalyzer.ts`** - Battle phase detection and analysis
- **`narrativeToneAnalyzer.ts`** - Determining narrative tone and focus
- **`statusAnalyzer.ts`** - Health and chi status analysis
- **`locationAnalyzer.ts` - Location-based context analysis

#### Narrative Generation
- **`templateNarrativeGenerator.ts`** - Template-based narrative generation
- **`hookNarrativeGenerator.ts`** - Legacy hook-based narrative generation
- **`narrativeTemplates.ts`** - Template definitions and selection

#### Character & Content
- **`characterHooks.ts`** - Character-specific narrative hooks
- **`narratorHooks.ts`** - Narrator commentary hooks
- **`types.ts`** - Complete type definitions

## Key Features

### 1. Mechanical State Extraction
The system extracts rich mechanical context from battle state:
- **Escalation states**: Forced escalation, damage multipliers
- **Vulnerability detection**: Charging, repositioning, stunned states
- **Pattern analysis**: Move repetition, reposition attempts
- **Performance metrics**: Damage dealt, battle flow analysis
- **Character mechanics**: Desperation, rally, comeback sequences

### 2. Template-Based Narrative Generation
Dynamic narrative templates that adapt to mechanical state:
- **Escalation templates**: For forced escalation scenarios
- **Vulnerability templates**: For punish opportunities
- **Pattern templates**: For repetitive move detection
- **Performance templates**: For damage-based narratives
- **Positioning templates**: For charging and repositioning

### 3. Character-Driven Variations
Each template supports character-specific variations:
- **Aang**: Airbending-focused, defensive, spiritual
- **Azula**: Firebending-focused, aggressive, calculated
- **Generic**: Fallback for other characters

### 4. Dynamic Tone and Intensity
Narrative tone adapts to battle context:
- **Tones**: Desperate, confident, furious, calculated, chaotic, defensive, aggressive
- **Intensity**: Low, medium, high, extreme
- **Focus**: Damage, position, pattern, vulnerability, escalation, recovery

## Usage

### Basic Integration

```typescript
import { createNarrativeService } from './narrative';

const narrativeService = createNarrativeService();

// Generate narratives for a battle event
const narratives = narrativeService.generateNarratives(
  actor,
  target,
  move,
  turnIndex,
  battleLog,
  location,
  isCritical,
  isDesperation,
  damage
);
```

### Advanced Configuration

```typescript
import { createNarrativeService, createNarrativeConfig } from './narrative';

const config = createNarrativeConfig({
  useTemplateSystem: true,
  maxHooksPerTurn: 2,
  enabled: true
});

const narrativeService = createNarrativeService(config);
```

### Direct API Usage

```typescript
import { 
  buildBattleContext, 
  evaluateNarrativeHooks,
  extractMechanicalState 
} from './narrative';

// Build context
const ctx = buildBattleContext(actor, target, move, turnIndex, battleLog, location);

// Extract mechanical state
const mechanics = extractMechanicalState(actor, target, battleLog, damage);

// Evaluate hooks
const narratives = evaluateNarrativeHooks(ctx);
```

## File Responsibilities

### Core Files
- **`narrativeEngine.ts`**: Main evaluation logic, orchestrates template vs hook systems
- **`index.ts`**: Service integration, main API exports, NarrativeService class

### Analysis Files
- **`mechanicalStateExtractor.ts`**: Extracts all mechanical state from battle characters
- **`battlePhaseAnalyzer.ts`**: Determines battle phase (start/mid/end) and first blood
- **`narrativeToneAnalyzer.ts`**: Analyzes mechanical state to determine narrative tone/focus
- **`statusAnalyzer.ts`**: Converts health/chi percentages to status descriptions
- **`locationAnalyzer.ts`**: Calculates location-based context (collateral tolerance)

### Generation Files
- **`templateNarrativeGenerator.ts`**: Generates narratives using the template system
- **`hookNarrativeGenerator.ts`**: Generates narratives using the legacy hook system
- **`narrativeTemplates.ts`**: Template definitions, selection, and text generation

### Support Files
- **`configManager.ts`**: Configuration creation and management
- **`utilityManager.ts`**: Utility functions, state tracking, debugging
- **`contextBuilder.ts`**: Builds complete battle context from all analyzers
- **`types.ts`**: Complete type definitions for the entire system

## Integration with Battle System

The narrative system integrates seamlessly with the battle system:

1. **Battle Events**: Called after each move execution
2. **State Analysis**: Extracts mechanical context from battle state
3. **Narrative Generation**: Produces character-driven narratives
4. **UI Integration**: Displays narratives in battle log and UI components

## Performance Considerations

- **Efficient Analysis**: Mechanical state extraction is optimized for performance
- **Caching**: Used hooks tracking prevents duplicate narratives
- **Lazy Evaluation**: Templates and hooks are evaluated only when needed
- **Memory Management**: State trackers are reset between battles

## Extension Points

### Adding New Templates
1. Define template in `narrativeTemplates.ts`
2. Add character variations
3. Update template selection logic

### Adding New Analyzers
1. Create new analyzer file with single responsibility
2. Export analysis functions
3. Integrate into `contextBuilder.ts`

### Adding New Characters
1. Add character hooks in `characterHooks.ts`
2. Add character variations to templates
3. Update location analysis if needed

## Migration from Hook System

The system maintains backward compatibility:
- **Legacy Hooks**: Still supported via `useTemplateSystem: false`
- **Gradual Migration**: Can use both systems simultaneously
- **Template Priority**: Template system takes precedence when enabled

## Best Practices

1. **Single Responsibility**: Each file has one clear purpose
2. **Type Safety**: All functions are fully typed with JSDoc
3. **Error Handling**: Graceful fallbacks for missing data
4. **Performance**: Efficient analysis and caching
5. **Extensibility**: Clear extension points for new features

## Narrative Examples

### Escalation Narrative
**Mechanical State**: Forced escalation, damage multiplier 1.5x, low damage output
**Generated Narrative**: 
> "Aang's eyes widen with desperation—he lunges forward in a reckless assault! The air shudders with his wild energy, but exhaustion blunts his strikes."

### Vulnerability Punishment
**Mechanical State**: Target charging, punish damage 15, 2x multiplier
**Generated Narrative**:
> "Azula doesn't hesitate. She's seen this move before—her response is merciless, fire lancing through Aang's exposed guard!"

### Pattern Repetition
**Mechanical State**: Move repetition 3+, predictable pattern
**Generated Narrative**:
> "Aang's attacks become predictable—he's running out of ideas, falling back on the same moves again and again."

## Configuration

### Narrative System Config
```typescript
type NarrativeSystemConfig = {
  characterHooks: CharacterNarratives;
  narratorHooks: NarrativeHook[];
  globalHooks: NarrativeHook[];
  enabled: boolean;
  maxHooksPerTurn: number;
  priorityThreshold: number;
  useTemplateSystem?: boolean; // Enable new template system
};
```

### Mechanical State
```typescript
type MechanicalState = {
  // Escalation states
  forcedEscalation: boolean;
  escalationType?: 'damage' | 'repetition' | 'stalemate' | 'reposition';
  escalationMultiplier: number;
  
  // Vulnerability and punishment
  isVulnerable: boolean;
  vulnerabilityType?: 'charging' | 'repositioning' | 'stunned';
  punishMultiplier: number;
  punishDamage: number;
  
  // Pattern and repetition
  moveRepetition: number;
  patternAdaptations: number;
  repositionAttempts: number;
  isRepetitive: boolean;
  
  // ... and more
};
```

## Demo Component

See `NarrativeDemo.tsx` for a complete demonstration of the system's capabilities, including:
- Real-time narrative generation
- Template system toggle
- Mechanical context display
- Generated narrative visualization
- System status monitoring 
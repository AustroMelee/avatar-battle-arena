# Avatar: Battle Simulator

A React + TypeScript battle simulation system featuring characters from Avatar: The Last Airbender with advanced AI, dynamic storytelling, and immersive combat mechanics.

## 🚀 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to the URL provided by Vite (usually `http://localhost:5173`)

## 🏗️ Project Structure

This project follows the **AI-Agentic Cursor & SRP Guide** with a feature-based architecture:

```
src/
├── common/                    # Shared components and types
│   ├── components/           # Reusable UI components
│   └── types/               # Shared TypeScript interfaces
├── features/                 # Feature modules (Domain-Driven)
│   ├── character-selection/  # Character selection feature
│   ├── location-selection/   # Location selection feature
│   ├── battle-simulation/    # Core battle logic
│   ├── battle-log/          # Human-readable battle events
│   └── technical-log/       # AI/technical debugging info
├── styles/                   # Global styles and CSS variables
├── App.tsx                  # Main application component
└── main.tsx                 # React entry point
```

## 🎯 Features

- **Character Selection**: Choose from Avatar characters with visual cards
- **Location Selection**: Pick battle environments with different effects
- **Battle Simulation**: AI-powered battle engine with realistic outcomes
- **Dual Logging**: Human-readable narrative + technical debugging logs
- **Responsive Design**: Modern UI with CSS Modules for zero-conflict styling
- **Advanced AI**: Context-aware decision making with pattern recognition
- **Battle Mechanics**: Cooldowns, desperation moves, finishers, critical hits
- **Dynamic Narrative**: Character-specific dialogue and battle commentary
- **Identity-Driven AI**: Character personality and mental state influence decisions
- **Complete Battle Visibility**: T1 logs always visible by default for analysis

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) folder:

- **[Simulator Mechanics](./docs/SIMULATOR_MECHANICS.md)** - Complete system overview and completion status
- **[AI System](./docs/AI_SYSTEM.md)** - Advanced AI decision-making guide
- **[Cooldown System](./docs/COOLDOWN_SYSTEM.md)** - Battle mechanics implementation
- **[Development Roadmap](./docs/ROADMAP.txt)** - Project direction and milestones
- **[IDTB System](./docs/IDENTITY_DRIVEN_TACTICAL_BEHAVIOR.md)** - Character personality and mental state system

**Overall Completion: 92%** - The simulator is production-ready with advanced features, robust type safety, and character-driven AI.

## 🛠️ Development

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development
- **Styling**: CSS Modules (as per rule 4.1)
- **Architecture**: Feature-based with strict separation of concerns
- **Linting**: ESLint with TypeScript and React rules

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔧 Scalability

This structure is designed for growth:

- **Adding Characters/Locations**: Simply add to the data files
- **Improving AI**: Replace battle logic in `battleSimulator.service.ts`
- **New Features**: Create new feature folders under `src/features/`
- **LLM Integration**: Add prompts directory for AI-powered narratives

## 📝 License

MIT

## SRP-Driven Architecture

This project enforces the Single Responsibility Principle (SRP) at every level:
- **Each file/module implements exactly one domain concept.**
- **No file exceeds 500 lines or 6K characters.**
- **All tactical move logic is orchestrated via pure orchestrator services, with each move type (reposition, charge-up, regular) handled by its own service.**
- **The narrative system is fully modular, with composition, emotional policy, and strategy in separate files.**
- **Types are colocated in `types.ts` or feature-level `types/` folders.**
- **No circular dependencies.**

This ensures maximum maintainability, testability, and AI-editability.

## 🧠 **Identity-Driven Tactical Behavior (IDTB) System - COMPLETE**

The comprehensive character personality and mental state system is now fully operational:

### ✅ **Core Features:**
- **Character Identity Profiles**: Static psychological traits and tactical tendencies
- **Dynamic Mental States**: Real-time psychological state tracking during battle
- **Opponent Perception**: Character's subjective view of their opponent
- **Identity-Based Scoring**: AI move selection influenced by character personality
- **Mental State Updates**: Psychological state changes based on battle events
- **Narrative Integration**: Mental states influence battle narrative generation

### ✅ **Character Profiles:**
- **Aang**: Balance, pacifism, survival instincts, evasion preference
- **Azula**: Control, dominance, lethal precision, escalation under pressure

### ✅ **Mental State Tracking:**
- **Stability**: 0-100 scale (calm to unhinged)
- **Pride**: 0-100 scale (ego and self-image)
- **Active States**: enraged, fearful, focused, unhinged
- **Real-time Updates**: State changes based on hits, misses, criticals, etc.

### ✅ **System Integration:**
- **AI Decision Making**: Identity influences move scoring and selection
- **Battle Logging**: Mental state changes logged in battle events
- **UI Indicators**: Visual indicators for mental states in character cards
- **Narrative Hooks**: Mental states influence move descriptions and battle commentary

## 🎯 **Status Effect System - COMPLETE**

The comprehensive status effect system is now fully operational:

### ✅ **Core Features:**
- **Unified Status Effects**: Buffs and debuffs unified into single `activeEffects` array
- **Status Effect Application**: Moves can apply effects with configurable chance and duration
- **Status Effect Processing**: Effects are processed each turn with damage/healing
- **AI Integration**: AI recognizes and values status effects in decision making
- **Battle Log Integration**: Status effects appear in battle logs and AI decision logs

### ✅ **Implemented Status Effects:**
- **BURN** (Blue Fire) - 70% chance, 3 turns, 2 damage per turn
- **DEFENSE_DOWN** (Wind Slice) - 50% chance, 2 turns, -3 defense
- **DEFENSE_UP** (Air Shield) - 100% chance, 2 turns, +5 defense

### ✅ **System Integration:**
- **Move Resolution**: Status effects integrated into move execution pipeline
- **Damage Modification**: Effects modify damage calculation (ATTACK_UP, DEFENSE_DOWN)
- **Turn Processing**: Effects processed each turn with proper expiration
- **AI Decision Making**: AI considers status effects when choosing moves
- **Battle Logging**: Complete logging of status effect application and processing

## 🔍 **Critical UI Requirements**

### **T1 Log Visibility - MANDATORY**
- **Default Behavior**: T1 logs are ALWAYS visible by default
- **User Control**: Users can optionally switch to "Recent Only" mode
- **Clear Warnings**: UI warns users when T1 logs will be hidden
- **Analysis Support**: Complete battle visibility essential for debugging and analysis

## 🚀 **Current Features**

### Battle System
- **Tactical AI**: Advanced AI with positioning, charge-up, and environmental awareness
- **Status Effects**: Complete buff/debuff system with application and processing
- **Escalation Mechanics**: Dynamic battle escalation with forced escalation states
- **Desperation System**: Low-health mechanics with desperation moves
- **Finisher System**: High-damage finisher moves with conditions
- **Positioning System**: Tactical positioning with environmental bonuses
- **Charge-up Mechanics**: Interruptible charge-up moves with risks/rewards
- **Identity-Driven AI**: Character personality influences all AI decisions

### Narrative System
- **Dynamic Narratives**: Context-aware narrative generation
- **Character-Specific**: Unique narrative styles for each character
- **Emotional Arcs**: Emotional state tracking and narrative reflection
- **Battle Phases**: Narrative adaptation to battle progression
- **Environmental Context**: Location-aware narrative elements
- **Mental State Integration**: Narrative reflects character psychological states

### AI System
- **Tactical Decision Making**: AI considers positioning, status effects, and context
- **Pattern Recognition**: AI adapts to opponent patterns
- **Escalation Awareness**: AI responds to forced escalation states
- **Status Effect Valuation**: AI recognizes and values status effect application
- **Environmental Awareness**: AI considers location and environmental factors
- **Identity-Driven Behavior**: AI decisions reflect character personality and mental state
- **Psychological Modeling**: AI responds to psychological state changes

## 🛠️ **Technical Architecture**

### Type Safety
- **Strict TypeScript**: All code is fully typed with strict settings
- **Defensive Programming**: Comprehensive input validation and error handling
- **Type Annotations**: Complete JSDoc annotations for all functions
- **Interface Contracts**: Well-defined interfaces for all system boundaries

### Modular Design
- **SRP Compliance**: Each module has a single responsibility
- **Dependency Injection**: Services use dependency injection patterns
- **Lazy Initialization**: Services use lazy initialization to prevent circular dependencies
- **Clean Architecture**: Clear separation of concerns across all layers

### Performance
- **Efficient Algorithms**: Optimized battle resolution and AI decision making
- **Memory Management**: Proper cleanup and state management
- **Real-time Analytics**: Battle metrics tracking without performance impact

## 📚 **Documentation**

- **`docs/AI_SYSTEM.md`**: Complete AI system documentation
- **`docs/TACTICAL_BATTLE_SYSTEM.md`**: Tactical battle mechanics
- **`docs/STATUS_EFFECT_SYSTEM.md`**: Status effect system documentation
- **`docs/IDENTITY_DRIVEN_TACTICAL_BEHAVIOR.md`**: IDTB system documentation
- **`docs/COMPLETED FEATURES.txt`**: List of all completed features
- **`docs/ROADMAP.txt`**: Development roadmap and future plans

## 🎮 **Getting Started**

1. **Install Dependencies**: `npm install`
2. **Start Development Server**: `npm run dev`
3. **Run Type Checking**: `npx tsc --noEmit`
4. **Run Linting**: `npm run lint`

## 🏗️ **Development Guidelines**

- **SRP First**: Every file must have a single responsibility
- **Type Safety**: All code must be fully typed
- **Defensive Programming**: Validate all inputs and handle edge cases
- **Documentation**: Document all public APIs and complex logic
- **Testing**: Write tests for all new features
- **T1 Log Visibility**: Never hide T1 logs by default - this is a critical requirement

## 🎯 **Project Status**

**Current Phase**: Identity-Driven Tactical Behavior System Complete ✅
**Next Phase**: Enhanced UI/UX and Performance Optimization
**Overall Progress**: 92% Complete

The Avatar Battle Arena is a sophisticated battle simulation system with advanced AI, dynamic narratives, comprehensive status effects, and character-driven tactical behavior, all built with strict type safety and modular architecture. 
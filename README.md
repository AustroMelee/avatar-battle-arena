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

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) folder:

- **[Simulator Mechanics](./docs/SIMULATOR_MECHANICS.md)** - Complete system overview and completion status
- **[AI System](./docs/AI_SYSTEM.md)** - Advanced AI decision-making guide
- **[Cooldown System](./docs/COOLDOWN_SYSTEM.md)** - Battle mechanics implementation
- **[Development Roadmap](./docs/ROADMAP.txt)** - Project direction and milestones

**Overall Completion: 87%** - The simulator is production-ready with advanced features and robust type safety.

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
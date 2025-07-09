# The Logging System

This document provides a detailed breakdown of the logging system's architecture, types, and usage rules. All developers working on features that produce battle output must adhere to these standards.

## Log Type System (2025 Update)
### LogEntryType
All log entries now have an explicit type field:
- dialogue — In-character speech, taunts, or dialogue. Use logDialogue.
- mechanics — Technical/mechanical outcomes, system events, or developer logs. Use logTechnical.
- narrative — Pure narrative, story-driven lines, or scene-setting. Use logStory.
- system — System-level messages, out-of-band notifications. Use logSystem.

### Log Creation Rules
- Always use the correct log generator for the intent:
  - Character speech: logDialogue({ ... })
  - Mechanics/results: logTechnical({ ... })
  - Narrative/story: logStory({ ... })
  - System message: logSystem({ ... })
- Never create a log entry without a type.
- When loading legacy logs, use the inferLogType(log) helper to assign a type if missing.
- **July 9th, 2025 Overhaul:**
  - All escalation, desperation, and forced ending events must append at least one narrative or dialogue log (not just technical logs).
  - Global anti-repetition and cadence logic: at least one dialogue/scene line every 2 turns in dramatic phases.
  - Narrative pools expanded to 8–10 unique lines per phase/character, with fallback to contextual lines.
  - Forced endings always output unique, cinematic lines.
  - All log creation is type/lint/test enforced, with robust error handling and test coverage.

### Visual Distinction in UI
- **Dialogue:** Speech bubble, quotes, speaker face, 💬 icon
- **Mechanics:** Gear/sword icon, flat box, ⚙️ icon
- **Narrative:** Italic, “storybook” style, NarrativeBubble
- **System:** Subtle, out-of-band message, 🖥️ icon

### Example
```ts
logDialogue({ turn, actor: 'Azula', text: 'You cannot win, Avatar!' });
logTechnical({ turn, actor: 'System', action: 'Chi Drain', result: 'Azula loses 10 chi.' });
logStory({ turn, actor: 'Narrator', narrative: 'The arena trembles as the battle intensifies.' });
logSystem({ turn, actor: 'System', message: 'Battle paused for player input.' });
```

- All log types are enforced by TypeScript and reviewed in code review.
- See src/features/battle-simulation/services/utils/mechanicLogUtils.ts for implementation.
- **Log View Modes:** The UI supports multiple log view modes (see the UI Guide), with clear separation between developer and public-facing options.

---

## July 9th, 2025 Milestone: Engine Complete, Narrative Upgrade Next

- All major events (attacks, effects, escalation, charge/release) are now logged, but output is still debug-style. No cinematic, in-world narrative lines for finishers, charge releases, or KOs yet.
- The system is ready for narrative service integration to generate immersive, story-driven lines.

---


# Narrative Context Matrix: "Avatar-Level" Upgrade

### Purpose
This matrix is the canonical guide for the game's narrative system. It maps every game mechanic and event to specific narrative lines, tones, and emotional states for each character. This ensures a rich, varied, and emotionally resonant experience that adapts to the flow of the battle, achieving an "Avatar-level" quality of storytelling.

**Contributors should use this document as the single source of truth for tone, style, and content when writing new lines.**

--- 

## Core Principles

1.  **Complete Coverage**: Every possible event must have multiple narrative lines.
2.  **Emotional Arc**: Narration must reflect the character's journey from calm to desperate.
3.  **Tactical Clarity**: The narration should tell the *story* of the fight, not just describe actions.
4.  **Anti-Repetition**: The player should never hear the same line for the same event back-to-back.
5.  **Character Voice**: Every line must sound authentic to the character saying it.

--- 

## 📑 How to Use This Matrix

-   **Mechanic**: The game event that triggers the narration (e.g., `Lightning`, `ForcedEscalation`).
-   **Context**: The specific outcome of the mechanic (e.g., `hit`, `miss`, `chargeStart`).
-   **Emotional State**: The character's current mindset (e.g., `Calm`, `Cocky`, `Strained`, `Desperate`). Lines are chosen based on this state.
-   **Narrative Line Examples**: Sample lines that exemplify the required tone. The full pools are in the codebase.

--- 

## Character Voice Guide

### **Aang**
- **Tone**: Hopeful, reluctant, peaceful, but powerful and determined when pushed. Often speaks with a sense of duty and a desire for de-escalation.
- **Vocabulary**: "Balance," "peace," "sorry," "have to," references to spirits and airbending philosophy.
- **Emotional Arc**: Moves from calm and avoidance to resolute determination, and finally to desperate power (Avatar State).

### **Azula**
- **Tone**: Confident, cruel, precise, dominant, and condescending. She sees combat as a performance of perfection.
- **Vocabulary**: "Perfection," "pathetic," "weak," "predictable," taunts, commands.
- **Emotional Arc**: Moves from smug confidence to enraged frustration when her plans fail, and finally to unhinged, wild desperation when her control shatters.

### **Narrator / System**
- **Tone**: Epic, objective, and atmospheric. Sets the scene and describes events with a sense of weight and consequence.
- **Vocabulary**: Evocative, elemental, and grand (e.g., "The ancient stones bear witness," "A tempest of raw power").

--- 

## Narrative Matrix

### Mechanic: `Lightning` (Azula)

| Context       | Emotional State | Narrative Line Examples                                                                 |
|---------------|-----------------|-----------------------------------------------------------------------------------------|
| **chargeStart** | **Confident**   | `"Observe the pinnacle of firebending."`<br/>`"Watch closely. This is true power."`              |
|               | **Strained**    | `"I just need a moment... focus!"`<br/>`"The power is building... I can feel it!"`            |
|               | **Desperate**   | `"This has to work!"`<br/>`"Come on, come on!"`                                                |
| **hit**       | **Confident**   | `"A perfect strike. As expected."`<br/>`"That is what happens when you challenge perfection."` |
|               | **Strained**    | `"Finally! It connected!"`<br/>`"That took more effort than it should have."`                 |
|               | **Desperate**   | `"Yes! That's it!"`<br/>`"Take that! And that!"`                                              |
| **miss**      | **Confident**   | `"Hmph. A waste of energy. A calculated test."`<br/>`"A lucky dodge. It won't happen again."` |
|               | **Strained**    | `"Impossible! My aim is flawless... usually."`<br/>`"Distractions... I must refocus."`      |
|               | **Desperate**   | `"No! How could I miss?!"`<br/>`"This cannot be happening!"`                                  |
| **victory**   | **Confident**   | `"Was there ever any doubt?"`<br/>`"Consider this a lesson in superiority."`               |

---

### Mechanic: `ChargedAirTornado` (Aang)

| Context       | Emotional State | Narrative Line Examples                                                                               |
|---------------|-----------------|-------------------------------------------------------------------------------------------------------|
| **chargeStart** | **Calm**        | `"The winds answer my call."`<br/>`"I need to focus the vortex..."`                                     |
|               | **Strained**    | `"The winds are resisting... I need more focus."`<br/>`"Just a little more..."`                         |
|               | **Desperate**   | `"Come on, winds, help me!"`<br/>`"This has to be enough!"`                                            |
| **hit**       | **Calm**        | `"The storm is overwhelming!"`<br/>`"That should hold you! Are you okay?"`                             |
|               | **Strained**    | `"It hit! But the strain... it's a lot."`<br/>`"Finally! That took everything."`                      |
|               | **Desperate**   | `"Yes! It worked!"`<br/>`"I did it! For everyone!"`                                                   |
| **miss**      | **Calm**        | `"Whoa, a bit too much power!"`<br/>`"I pulled back at the last second. That was too close."`          |
|               | **Strained**    | `"No, the vortex spun out of my control."`<br/>`"I lost my focus for a moment."`                       |
|               | **Desperate**   | `"It didn't work! What do I do now?"`<br/>`"The winds... they didn't listen!"`                           |
| **victory**   | **Calm**        | `"The storm has passed. It is over."`<br/>`"I am sorry it had to end this way. Peace is restored."`  |

---

### Mechanic: `ForcedEscalation` (System Event)

| Context  | Character | Narrative Line Examples                                                                                                       |
|----------|-----------|-------------------------------------------------------------------------------------------------------------------------------|
| **trigger**| **Aang**  | `"I can feel the energy shifting. This is getting serious."`<br/>`"The spirits are restless. Something has changed."`          |
|          | **Azula** | `"Finally, a real fight!"`<br/>`"Done playing games? Good. Don't disappoint me now."`                                    |
|          | **Narrator**| `"The battle reaches a breaking point! Neither fighter can hold back now."`<br/>`"The air crackles with raw power."`         |

---

### Mechanic: `StatusEffect` (Buff/Debuff)

| Context  | Character | Status Effect | Narrative Line Examples                                                                                                       |
|----------|-----------|---------------|-------------------------------------------------------------------------------------------------------------------------------|
| **apply**| **Aang**  | **Burn**      | `"The fire... it stings!"`<br/>`"I have to push through the pain."`                                                       |
| **apply**| **Azula** | **Defense Down**| `"My defenses are weakened? Impossible!"`<br/>`"How did you...? No matter. I'll finish you first."`                  |
| **tick** | **Aang**  | **Burn**      | `"Aang winces as the flames continue to burn." (Narrator)`<br/>`"Gah! Still burning!"`                                  |
| **tick** | **Azula** | **Defense Down**| `"Azula's movements are slightly less confident, her guard less perfect." (Narrator)`                                      |
| **fail** | **Azula** | **Burn**      | `"My fire... it didn't even singe him? How?"`<br/>`"He just brushed it off? That's not possible."`                        |

---

### Mechanic: `SuddenDeath` (System Event)

| Context  | Character | Narrative Line Examples                                                                                                       |
|----------|-----------|-------------------------------------------------------------------------------------------------------------------------------|
| **trigger**| **Narrator**| `"The battle has raged for too long! The next blow will be the last!"`<br/>`"SUDDEN DEATH! One strike to end it all!"` |

---

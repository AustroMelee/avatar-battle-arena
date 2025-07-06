
⚔️ Core Battle Mechanics

1. Manipulation
Alters the enemy’s state, making them easier to exploit in subsequent turns.
 🟦 Triggers only if opponent is vulnerable (low health/stability), not already manipulated, and not too early in the fight. Success is probability-based and affected by opponent’s resilience stat.
2. Overconfidence
Character becomes reckless, changing AI behavior and increasing vulnerability.
 🟦 Triggers only if character is winning decisively, not already overconfident, and still healthy.
3. Forced Escalation
Triggers an all-out attack phase where only powerful/signature moves are allowed.
4. Plea for Peace
Aang attempts to de-escalate the battle, potentially changing its course.
 🟦 Triggers only if the character is in danger, not already pleaded, and at very low health.
5. State Change
Major transitions in character status (e.g., compromised, stunned).
6. Move Fatigue
Penalizes repeated use of the same move, encouraging tactical variety.
7. Reversal
A comeback mechanic that allows a disadvantaged character to turn the tide.
8. Desperation
Last-stand, high-risk/high-reward move available only under dire conditions.
9. Finisher
Once-per-battle, high-damage move that can decisively end a fight.
10. Critical
High-damage, chance-based event that can dramatically shift momentum.
11. Collateral Damage
Environmental or mental state impacts that affect the battle beyond direct attacks.
 🟦 Locations have numeric tolerance and narrative description for collateral damage, affecting mechanics and story.
12. Positioning
Tactical stances and terrain effects that influence move effectiveness and defense.
13. Victory / Draw / Escape
End conditions: win, draw, escape, or mutual KO.
14. Status Effects
Buffs, debuffs, and state changes persisting over turns (e.g., Burn, Defense Up/Down, Stun, Heal Over Time, Crit Chance Up, Slow).
15. Momentum / Initiative
Dynamic turn order and dramatic swings that unlock special actions and comeback opportunities.
16. Environmental Damage
Powerful moves can damage the environment, with locations having unique tolerances and narrative consequences.
17. Mental State Impact
Environmental destruction can cause permanent changes to a character’s mental state, affecting future behavior.
18. Dynamic Escalation Timeline
A battle arc state machine: Opening → Rising Action → Climax → Falling Action → Resolution → Twilight; each state applies unique global modifiers and narrative effects.
19. Pattern Detection
Detects repeated move use or repositioning to trigger escalation or force close combat.
20. Arc State Modifiers
Each battle arc state applies global modifiers (damage, defense, chi regen, status effect duration, AI risk, finisher unlocks).
21. Conditional Move Unlocking
Moves (e.g., finishers, desperation) unlock based on health thresholds or battle state.
22. Desperation Buffs
Low HP triggers damage bonuses and defense penalties for high-stakes moments.
 🟦 Implemented as a desperationBuff object with threshold, bonus, and penalty.
23. Progressive Move Availability
Moves become available as the battle progresses, based on state and conditions.
24. Cooldown System
Prevents ability spamming with turn-based cooldowns, use limits, and resource management.
 🟦 Each trait and move has its own cooldown, tracked per character.
25. Limited Use Moves
Some moves have a maximum number of uses per battle, tracked and enforced.
26. Charge-Up Mechanics
Certain moves require multiple turns to charge—vulnerable while charging, high reward if successful.
27. Environmental Constraints
Locations can restrict or enhance certain moves, affecting tactics.
28. Behavioral Traits
Character-specific personality traits (e.g., manipulation, overconfidence, plea for peace) with mechanical impact, able to interrupt normal combat flow.
 🟦 Each trait tracks cooldown and last triggered turn per character.
29. Active Flags
Temporary states (e.g., isManipulated, overconfidenceActive, isExposed, hasPleadedThisBattle) that modify stats or move availability.
 🟦 Flags are set/cleared by trait and move effects for gating mechanics and AI logic.
30. Trait Effects
Behavioral traits can apply flags, modify stats, or change AI priorities.
31. Identity-Driven Tactical Behavior (IDTB)
AI decision-making is influenced by unique psychology, core values, tactical tendencies, and moral boundaries.
32. Mental State Tracking
Dynamic psychological states (stability, pride, active states) change with battle events and influence behavior.
 🟦 Mental state variables are checked in trait logic and can gate effects.
33. Opponent Perception
Each character tracks subjective views of the opponent (threat, respect, fear), affecting tactics.
34. AI Tactical Intent System
AI sets multi-turn tactical objectives (e.g., break defense, go for finish, stall, pressure, desperate attack, conservative play).
35. AI Pattern Recognition
AI adapts to repeated patterns in opponent behavior, changing tactics accordingly.
36. AI Environmental Awareness
AI considers environmental factors, constraints, and collateral damage when selecting moves.
37. Battle Log & Narrative Integration
All major mechanics and state changes are logged with narrative context; the UI provides visual feedback for dramatic events.
 🟦 Every trait trigger (success or failure) generates a narrative log entry.
38. Accessibility & Visual Feedback
All mechanics are reflected in the UI with badges, color coding, ARIA labels, and animations for clarity and accessibility.

🟦 Additional / Hidden Mechanics

39. Probability-Based Trait Effects
Some traits (e.g., manipulation) have a chance to fail, based on opponent stats.
40. Multi-Condition Gating
Effects/traits often require several conditions (e.g., health, stability, turn, previous flags).
41. Early/Late Battle Gating
Some mechanics restricted to certain battle phases (e.g., manipulation/plea for peace cannot occur too early).
42. Resilience/Resistance Stats
Opponent stats (e.g., manipulationResilience) affect trait success probability.
43. Move Tag System
Moves are tagged (e.g., ['finisher', 'desperation', 'area', 'lightning', 'high-damage']) for filtering, unlock logic, AI.
44. Behavioral System Integration
Characters have a list of behavioralTraits with traitId and lastTriggeredTurn for tracking/cooldowns.
45. Environmental Tolerance & Narrative
Locations have both a numeric collateralTolerance and a toleranceNarrative for environmental damage.
46. Flag-Based Gating
Many mechanics (e.g., move unlocks, AI behavior) are gated by specific flags.
47. Narrative-Driven Environmental Impact
Moves/locations include narrative fields for collateral/environmental impact, surfaced in logs/UI.
48. Combo Move System (Planned)
Referenced in code/docs; not yet implemented.

🟣 Status Effects (Detailed)
BURN: Damage over time (e.g., Azula’s Blue Fire)


DEFENSE_UP: Increases defense (e.g., Aang’s Air Shield)


ATTACK_UP: Increases attack power


DEFENSE_DOWN: Decreases defense (e.g., Aang’s Wind Slice)


STUN: Prevents actions


HEAL_OVER_TIME: Healing over time


CRIT_CHANCE_UP: Increases crit chance


SLOW: Reduces action speed



🟡 Battle Arc States & Modifiers
Opening: Cautious probing, normal damage, conservative AI


Rising Action: Slight damage bonus, normal AI, minor chi regen


Climax: High intensity, damage bonus, aggressive AI, finishers unlocked


Falling Action: Exhaustion, high damage, defense penalty, very aggressive AI


Resolution: Final push, max damage, significant defense penalty, extremely aggressive AI


Twilight: Both fighters critically wounded, max bonuses/penalties, rare edge case



🛠 Other Notable Systems
Turn Processing & State Validation: Ensures mechanic order/state consistency


Battle Termination Conditions: Victory, draw, escape, mutual KO, turn limit


Combo Move System (Planned): Not yet implemented; future mechanic



🧭 Future Features
1. Advanced Environmental Interactivity
 The environment can be manipulated, destroyed, or used tactically (e.g., knockback into hazards, cover, traps).
2. Emotion-Driven Dialogue and Taunts
 Characters dynamically generate taunts, encouragement, or pleas based on emotional/mental state for immersion.




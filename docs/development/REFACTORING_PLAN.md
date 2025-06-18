# Avatar Battle Arena: Module Refactoring Plan

**Date:** June 19, 2025  
**Author:** AI Assistant  
**Status:** 📝 DRAFT

---

## 1. Introduction

This document outlines a strategic plan to refactor large, monolithic JavaScript modules into smaller, more focused, and maintainable components. The primary goal is to improve codebase health, reduce complexity, and enhance developer experience and tooling effectiveness.

The key threshold for refactoring is any module exceeding **500 lines of code**.

## 2. Identified Modules for Refactoring

Based on recent analysis and manual review, the following high-priority modules have been identified for refactoring:

| File Path                                 | Line Count (Approx.) | Priority | Complexity |
| ----------------------------------------- | -------------------- | -------- | ---------- |
| `src/js/ai/ai_decision_engine.js`         | ~1230                | 🚨 HIGH   | High       |
| `src/js/engine_turn-processor.js`         | ~1150                | 🚨 HIGH   | High       |
| `src/js/engine_battle-engine-core.js`     | ~600                 | 🚨 HIGH   | Medium     |

---

## 3. Refactoring Strategy: `ai_decision_engine.js`

**Current State:** A monolithic module responsible for all aspects of AI decision-making, including context analysis, move evaluation, threat assessment, and goal setting.

**Target State:** A primary `ai_decision_engine.js` that acts as a coordinator, delegating specific tasks to new, smaller modules.

### Proposed New Modules:

1.  **`src/js/ai/analysis/context_builder.js`**
    *   **Responsibility:** Constructing the `DecisionContext` object.
    *   **Functions to Move:** `buildDecisionContext`
2.  **`src/js/ai/analysis/threat_assessment.js`**
    *   **Responsibility:** Evaluating the opponent's threat level.
    *   **Functions to Move:** `assessThreatLevel`, `calculateSituationalAggression`, `calculateSituationalRisk`
3.  **`src/js/ai/evaluation/move_evaluator.js`**
    *   **Responsibility:** Evaluating a single move's potential.
    *   **Functions to Move:** `evaluateMove`, `calculateDamageScore`, `calculateAccuracyScore`, `calculateRiskScore`, `calculateStrategicScore`
4.  **`src/js/ai/goals/goal_setter.js`**
    *   **Responsibility:** Determining the AI's primary strategic goal for the turn.
    *   **Functions to Move:** `determinePrimaryGoal`
5.  **`src/js/ai/modifiers/personality_mods.js`**
    *   **Responsibility:** Applying personality-based adjustments to move scores.
    *   **Functions to Move:** `applyPersonalityModifiers`, `getPersonalityInfluence`
6.  **`src/js/ai/utils/ai_helpers.js`**
    *   **Responsibility:** Miscellaneous helper and utility functions.
    *   **Functions to Move:** `getElementalEffectiveness`, `getAvailableMoves`, `validateDecision`, `createFallbackDecision`

---

## 4. Refactoring Strategy: `engine_turn-processor.js`

**Current State:** A large module that handles the entire lifecycle of a single battle turn, from pre-turn effects to post-turn cleanup.

**Target State:** A primary `engine_turn-processor.js` that orchestrates the phases of a turn, delegating the detailed logic to specialized modules.

### Proposed New Modules:

1.  **`src/js/engine/turn_phases/pre_turn.js`**
    *   **Responsibility:** Handling all pre-turn effects (status, environment).
    *   **Functions to Move:** `processPreTurnEffects`
2.  **`src/js/engine/turn_phases/action.js`**
    *   **Responsibility:** Managing the main action of the turn (AI decision, move execution).
    *   **Functions to Move:** `executePlayerAction`, `executeAction`
3.  **`src/js/engine/turn_phases/post_turn.js`**
    *   **Responsibility:** Handling all post-turn effects and cleanup.
    *   **Functions to Move:** `processPostTurnEffects`, `processEnergyRegeneration`, `processCooldownDecrements`
4.  **`src/js/engine/effects/status_effects.js`**
    *   **Responsibility:** Applying and managing status effect logic.
    *   **Functions to Move:** `processStatusEffects`, `applyStatusEffectTick`, `applyDamageEffect`, `applyHealEffect`
5.  **`src/js/engine/effects/environment_effects.js`**
    *   **Responsibility:** Applying and managing environmental effect logic.
    *   **Functions to Move:** `processEnvironmentalEffects`, `applyEnvironmentalEffect`
6.  **`src/js/engine/utils/turn_helpers.js`**
    *   **Responsibility:** Utility functions related to turn processing.
    *   **Functions to Move:** `determineActiveFighter`, `createWorkingBattleState`, `validateTurnInput`

---

## 5. Refactoring Strategy: `engine_battle-engine-core.js`

**Current State:** Acts as the central entry point for starting a battle and running the main battle loop.

**Target State:** A leaner core engine that focuses solely on orchestrating the battle from a high level, delegating state setup and loop management.

### Proposed New Modules:

1.  **`src/js/engine/battle_loop.js`**
    *   **Responsibility:** Managing the main `while` loop that processes turns until a terminal state is reached.
    *   **Functions to Move:** `runBattleLoop`
2.  **`src/js/engine/battle_setup.js`**
    *   **Responsibility:** Initializing the battle, validating parameters, and creating the initial battle state.
    *   **Functions to Move:** `validateBattleParameters` (and parts of `executeBattle`)
3.  **`src/js/engine/battle_summary.js`**
    *   **Responsibility:** Calculating post-battle statistics and summarizing the result.
    *   **Functions to Move:** `calculateBattleStatistics`, `summarizeBattleResult`

---

## 6. Next Steps

1.  **Review & Approve:** Review this plan for feasibility and correctness.
2.  **Implement (File by File):** Execute the refactoring for one file at a time, starting with `ai_decision_engine.js`.
3.  **Test:** Thoroughly test the application after each file is refactored to ensure no regressions have been introduced. 
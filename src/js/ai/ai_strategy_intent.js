/**
 * @fileoverview AI Strategic Intent Determination
 * @description Analyzes battle state and determines strategic intent - the "why" behind AI decisions.
 * Pure strategic analysis without move selection or weighting.
 * @version 1.1.0
 */

"use strict";

import { BATTLE_PHASES } from "../engine_battle-phase.js";
import { ESCALATION_STATES } from "../engine_escalation.js";
import { getDynamicPersonality } from "./ai_personality.js";
import { safeGet } from "../utils_safe_accessor.js";

/**
 * Placeholder for a deleted utility function.
 * @param {any} _actor
 * @param {any} _defender
 * @param {any} _options
 * @returns {boolean}
 */
function isInControl(_actor, _defender, _options) {
    return false;
}

/**
 * Placeholder for a deleted utility function.
 * @param {any} _actor
 * @param {any} _defender
 * @param {any} _options
 * @returns {boolean}
 */
function isDesperateBroken(_actor, _defender, _options) {
    return false;
}

/**
 * @typedef {import('../types/battle.js').Fighter} Fighter
 * @typedef {import('../types/engine.js').BattlePhase} BattlePhase
 * @typedef {import('../types/ai.js').StrategicIntent} StrategicIntent
 */

/**
 * All possible strategic intents the AI can have
 */
export const STRATEGIC_INTENTS = {
    NARRATIVE_ONLY: "NarrativeOnly",
    OPENING_MOVES: "OpeningMoves",
    POKING_PHASE_TACTICS: "PokingPhaseTactics",
    STANDARD_EXCHANGE: "StandardExchange",
    CAUTIOUS_DEFENSE: "CautiousDefense",
    PRESS_ADVANTAGE: "PressAdvantage",
    CAPITALIZE_ON_OPENING: "CapitalizeOnOpening",
    DESPERATE_GAMBIT: "DesperateGambit",
    FINISHING_BLOW_ATTEMPT: "FinishingBlowAttempt",
    CONSERVE_ENERGY: "ConserveEnergy",
    OVERWHELM_OFFENSE: "OverwhelmOffense",
    RECKLESS_OFFENSE: "RecklessOffense"
};

/**
 * Analyzes battle conditions and determines what the AI should be trying to accomplish
 * Returns a strategic intent string that drives move selection
 */
export function determineStrategicIntent(actor, defender, turn, currentPhase) {
    if (!actor || !defender) {
        return STRATEGIC_INTENTS.STANDARD_EXCHANGE;
    }

    const profile = getDynamicPersonality(actor, currentPhase);
    const actorHp = safeGet(actor, "hp", 100, actor.name);
    const defenderHp = safeGet(defender, "hp", 100, defender.name);

    // Phase-specific intents (highest priority)
    if (currentPhase === BATTLE_PHASES.PRE_BANTER) {
        return STRATEGIC_INTENTS.NARRATIVE_ONLY;
    }
    
    if (currentPhase === BATTLE_PHASES.POKING) {
        return STRATEGIC_INTENTS.POKING_PHASE_TACTICS;
    }

    // Advantage/control analysis
    if (isInControl(actor, defender, { characterReceivedCriticalHit: defender.lastMove?.isCrit })) {
        if (profile.opportunism > 0.6) {
            return STRATEGIC_INTENTS.PRESS_ADVANTAGE;
        }
        if (profile.aggression > 0.8) {
            return STRATEGIC_INTENTS.OVERWHELM_OFFENSE;
        }
    }

    // Desperation analysis
    if (isDesperateBroken(actor, defender, {})) {
        if (profile.riskTolerance > 0.6) {
            return STRATEGIC_INTENTS.DESPERATE_GAMBIT;
        }
        if (profile.aggression > 0.7) {
            return STRATEGIC_INTENTS.RECKLESS_OFFENSE;
        }
    }

    // Opponent vulnerability analysis
    const defenderEscalation = safeGet(defender, "escalationState", ESCALATION_STATES.NORMAL, defender.name);
    if (defenderEscalation === ESCALATION_STATES.SEVERELY_INCAPACITATED || 
        defenderEscalation === ESCALATION_STATES.TERMINAL_COLLAPSE) {
        if (profile.opportunism > 0.5 || profile.aggression > 0.7) {
            return STRATEGIC_INTENTS.FINISHING_BLOW_ATTEMPT;
        }
    }

    // Tactical opening analysis
    const defenderIsVulnerable = safeGet(defender, "stunDuration", 0, defender.name) > 0 || 
                                  safeGet(defender, "tacticalState.isPositive", true, defender.name) === false;
    if (profile.opportunism > 0.7 && defenderIsVulnerable) {
        return STRATEGIC_INTENTS.CAPITALIZE_ON_OPENING;
    }

    // Health-based desperation
    if (actorHp < 45 && profile.riskTolerance > 0.7) {
        return STRATEGIC_INTENTS.DESPERATE_GAMBIT;
    }

    // Phase-based defaults
    switch (currentPhase) {
        case BATTLE_PHASES.EARLY:
            return STRATEGIC_INTENTS.OPENING_MOVES;
        case BATTLE_PHASES.MID:
            return STRATEGIC_INTENTS.STANDARD_EXCHANGE;
        case BATTLE_PHASES.LATE:
            return STRATEGIC_INTENTS.FINISHING_BLOW_ATTEMPT;
        default:
            return STRATEGIC_INTENTS.STANDARD_EXCHANGE;
    }
}

/**
 * Gets human-readable description of a strategic intent
 */
export function getIntentDescription(intent) {
    const descriptions = {
        [STRATEGIC_INTENTS.NARRATIVE_ONLY]: "Focus on storytelling and banter",
        [STRATEGIC_INTENTS.OPENING_MOVES]: "Establish positioning and test opponent",
        [STRATEGIC_INTENTS.POKING_PHASE_TACTICS]: "Cautious probing and setup",
        [STRATEGIC_INTENTS.STANDARD_EXCHANGE]: "Balanced offensive and defensive play",
        [STRATEGIC_INTENTS.CAUTIOUS_DEFENSE]: "Prioritize safety and damage mitigation",
        [STRATEGIC_INTENTS.PRESS_ADVANTAGE]: "Maintain momentum while in control",
        [STRATEGIC_INTENTS.CAPITALIZE_ON_OPENING]: "Exploit opponent vulnerability",
        [STRATEGIC_INTENTS.DESPERATE_GAMBIT]: "High-risk moves to turn the tide",
        [STRATEGIC_INTENTS.FINISHING_BLOW_ATTEMPT]: "Go for the victory",
        [STRATEGIC_INTENTS.CONSERVE_ENERGY]: "Preserve resources for later",
        [STRATEGIC_INTENTS.OVERWHELM_OFFENSE]: "Aggressive sustained pressure",
        [STRATEGIC_INTENTS.RECKLESS_OFFENSE]: "All-out attack regardless of risk"
    };
    
    return descriptions[intent] || "Unknown strategic approach";
}

/**
 * Determines if an intent favors aggressive or defensive play
 */
export function isIntentAggressive(intent) {
    const aggressiveIntents = [
        STRATEGIC_INTENTS.PRESS_ADVANTAGE,
        STRATEGIC_INTENTS.CAPITALIZE_ON_OPENING,
        STRATEGIC_INTENTS.DESPERATE_GAMBIT,
        STRATEGIC_INTENTS.FINISHING_BLOW_ATTEMPT,
        STRATEGIC_INTENTS.OVERWHELM_OFFENSE,
        STRATEGIC_INTENTS.RECKLESS_OFFENSE
    ];
    
    return aggressiveIntents.includes(intent);
}

/**
 * Determines if an intent favors defensive or conservative play
 */
export function isIntentDefensive(intent) {
    const defensiveIntents = [
        STRATEGIC_INTENTS.CAUTIOUS_DEFENSE,
        STRATEGIC_INTENTS.CONSERVE_ENERGY,
        STRATEGIC_INTENTS.POKING_PHASE_TACTICS
    ];
    
    return defensiveIntents.includes(intent);
} 
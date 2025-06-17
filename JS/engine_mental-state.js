// FILE: js/engine_mental-state.js
'use strict';

const MENTAL_STATE_THRESHOLDS = {
    broken: 100,
    shaken: 75,
    stressed: 40,
    stable: 0
};

const STRESS_EVENTS = {
    // Event: [Base Stress Gain, Description]
    TAKE_CRITICAL_HIT: [25, "Took a critical hit"],
    TAKE_STRONG_HIT: [15, "Took a strong hit"],
    TAKE_NORMAL_HIT: [8, "Took a normal hit"],
    TAKE_WEAK_HIT: [3, "Took a weak hit"],
    MOVE_FAILED: [10, "Move failed to execute"],
    MOVE_DODGED: [8, "Move was dodged"],
    MOVE_BLOCKED: [5, "Move was blocked"],
    OPPONENT_INTIMIDATE: [12, "Opponent used an intimidating move"],
    ENVIRONMENTAL_HAZARD: [10, "Caught in an environmental hazard"],
    ALLY_DEFEATED: [40, "An ally was defeated"],
    SELF_LOW_HP: [15, "Self HP is critically low"],
    OPPONENT_MENTAL_ATTACK: [20, "Hit by a direct mental attack"],
};

// --- NEW: Location-specific and situational stress modifiers ---
const SITUATIONAL_STRESS = {
    'foggy-swamp': {
        susceptibleCharacter: 'mai', // Mai is uniquely affected
        stressPerTurn: 15,
        reason: "Mai's phobia of the swamp is overwhelming."
    },
    'si-wong-desert': {
        turnThreshold: 15, // Stress applies after this many turns
        stressPerTurn: 5,
        reason: "The endless, scorching desert sun drains morale."
    }
};

function applyStress(fighter, eventKey, battleState) {
    if (!STRESS_EVENTS[eventKey]) return;

    let [stressGain, reason] = STRESS_EVENTS[eventKey];

    // --- NEW: Apply character-specific mental resilience ---
    const resilience = fighter.mentalResilience || 1.0; // Default resilience is 1.0
    stressGain /= resilience;

    fighter.mentalState.stress += Math.round(stressGain);
    fighter.aiLog.push(`[Mental Stress]: +${Math.round(stressGain)} stress from: ${reason}. Resilience mod: x${1/resilience}. Total: ${fighter.mentalState.stress}`);
}


export function updateMentalState(fighter, opponent, moveResult, environmentState, locId, battleState) {
    const originalLevel = fighter.mentalState.level;

    // Apply stress from the move outcome
    if (moveResult.wasAttacker === false) { // The fighter was the defender
        switch (moveResult.effectiveness.label) {
            case 'Critical': applyStress(fighter, 'TAKE_CRITICAL_HIT', battleState); break;
            case 'Strong': applyStress(fighter, 'TAKE_STRONG_HIT', battleState); break;
            case 'Normal': applyStress(fighter, 'TAKE_NORMAL_HIT', battleState); break;
            case 'Weak': applyStress(fighter, 'TAKE_WEAK_HIT', battleState); break;
        }
        if (moveResult.isDodged) applyStress(fighter, 'MOVE_BLOCKED', battleState);
    } else { // The fighter was the attacker
        if (moveResult.effectiveness.label === 'Ineffective') applyStress(fighter, 'MOVE_FAILED', battleState);
        if (moveResult.isDodged) applyStress(fighter, 'MOVE_DODGED', battleState);
    }

    // --- NEW: Apply situational stress from location ---
    const situationalRule = SITUATIONAL_STRESS[locId];
    if (situationalRule) {
        let shouldApply = false;
        // Character-specific susceptibility (e.g., Mai in swamp)
        if (situationalRule.susceptibleCharacter && fighter.id === situationalRule.susceptibleCharacter) {
            shouldApply = true;
        }
        // Time-based susceptibility (e.g., long desert battle)
        if (situationalRule.turnThreshold && battleState.turn >= situationalRule.turnThreshold) {
            shouldApply = true;
        }

        if (shouldApply) {
            let situationalStress = situationalRule.stressPerTurn;
            const resilience = fighter.mentalResilience || 1.0;
            situationalStress /= resilience;
            fighter.mentalState.stress += Math.round(situationalStress);
            fighter.aiLog.push(`[Situational Stress]: +${Math.round(situationalStress)} stress from: ${situationalRule.reason}. Total: ${fighter.mentalState.stress}`);
        }
    }


    // Clamp stress to a max value (e.g., 150) to prevent runaway numbers
    fighter.mentalState.stress = Math.min(fighter.mentalState.stress, 150);

    // Determine new mental state level
    let newLevel = 'stable';
    if (fighter.mentalState.stress >= MENTAL_STATE_THRESHOLDS.broken) {
        newLevel = 'broken';
    } else if (fighter.mentalState.stress >= MENTAL_STATE_THRESHOLDS.shaken) {
        newLevel = 'shaken';
    } else if (fighter.mentalState.stress >= MENTAL_STATE_THRESHOLDS.stressed) {
        newLevel = 'stressed';
    }

    if (newLevel !== originalLevel) {
        fighter.mentalState.level = newLevel;
        fighter.mentalStateChangedThisTurn = true;
        fighter.aiLog.push(`[Mental State Change]: ${fighter.name} is now ${newLevel.toUpperCase()}. (Stress: ${fighter.mentalState.stress})`);
    }
}
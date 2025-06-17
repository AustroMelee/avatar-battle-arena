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
    },
    // NEW: Waterbender-specific stress conditions
    'waterbender_low_supply': {
        stressPerTurn: 10,
        reason: "Lack of sufficient water source diminishes a Waterbender's resolve.",
        locations: ['si-wong-desert', 'fire-nation-capital', 'boiling-rock'], // Locations with low water
        hpThreshold: 0.4, // Apply if HP is below 40%
        momentumThreshold: -30 // Apply if momentum is very low
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

    // --- NEW: Apply situational stress from location and character-specific conditions ---
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

    // NEW: Azula's Perfection High Bar
    if (fighter.id === 'azula') {
        let azulaStressGain = 0;
        let reason = [];

        // Condition 1: Low HP
        if (fighter.hp < fighter.maxHp * 0.5) { // Increased sensitivity from 0.4 to 0.5
            azulaStressGain += 15; // Base stress
            reason.push("low HP");
            if (fighter.hp < fighter.maxHp * 0.2) { // Very low HP adds more stress
                azulaStressGain += 15;
                reason.push("critically low HP");
            }
        }

        // Condition 2: Took multiple critical hits
        if (fighter.criticalHitsTaken >= 1) { // Trigger on 1+ critical hit instead of 2+
            azulaStressGain += 10; // Base stress
            reason.push("critical hits taken");
            if (fighter.criticalHitsTaken >= 3) { // More critical hits adds more stress
                azulaStressGain += 10;
                reason.push("multiple critical hits taken");
            }
        }

        // Condition 3: Significantly negative momentum
        if (fighter.momentum < -20) { // If momentum is very low
            azulaStressGain += 20; // Significant stress from losing momentum
            reason.push("loss of momentum");
            if (fighter.momentum < -40) { // Extremely low momentum
                azulaStressGain += 15;
                reason.push("extreme loss of momentum");
            }
        }

        if (azulaStressGain > 0) {
            const resilience = fighter.mentalResilience || 1.0;
            azulaStressGain /= resilience;
            fighter.mentalState.stress += Math.round(azulaStressGain);
            fighter.aiLog.push(`[Azula Perfectionist Stress]: +${Math.round(azulaStressGain)} stress from ${reason.join(', ')}. Total: ${fighter.mentalState.stress}`);
        }
    }

    // NEW: Mai's LOS/Swamp stress
    if (fighter.id === 'mai' && (locId === 'foggy-swamp' || fighter.criticalHitsTaken >= 1)) {
        const stressGain = 15 / (fighter.mentalResilience || 1.0);
        fighter.mentalState.stress += Math.round(stressGain);
        fighter.aiLog.push(`[Mai Stress]: +${Math.round(stressGain)} stress from poor LOS/swamp. Total: ${fighter.mentalState.stress}`);
    }

    // NEW: Waterbender specific stress
    const waterbenderLowSupplyRule = SITUATIONAL_STRESS['waterbender_low_supply'];
    if (fighter.element === 'water' && waterbenderLowSupplyRule.locations.includes(locId) && 
        (fighter.hp < fighter.maxHp * waterbenderLowSupplyRule.hpThreshold || fighter.momentum < waterbenderLowSupplyRule.momentumThreshold)) {
        const stressGain = waterbenderLowSupplyRule.stressPerTurn / (fighter.mentalResilience || 1.0);
        fighter.mentalState.stress += Math.round(stressGain);
        fighter.aiLog.push(`[Waterbender Stress]: +${Math.round(stressGain)} stress from low water supply/poor performance. Total: ${fighter.mentalState.stress}`);
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

        // NEW: Log mental state change event
        const mentalStateEvent = generateStatusChangeEvent(battleState, fighter, 'mental_state_change', originalLevel, newLevel, 'mentalState');
        if (mentalStateEvent) return mentalStateEvent; // Return the event instead of pushing
    }
    return null; // Return null if no state change occurred
}
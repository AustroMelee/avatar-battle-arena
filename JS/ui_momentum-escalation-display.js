// FILE: ui_momentum-escalation-display.js
'use strict';

// Manages the display of momentum and escalation states.

import { ESCALATION_STATES } from './engine_escalation.js'; // Ensure this path is correct

let fighter1MomentumValue = null;
let fighter2MomentumValue = null;
let fighter1IncapacitationScore = null;
let fighter1EscalationState = null;
let fighter2IncapacitationScore = null;
let fighter2EscalationState = null;

// Initialize DOM element references if they haven't been stored yet.
function initializeDOMElements() {
    if (!fighter1MomentumValue) {
        fighter1MomentumValue = document.getElementById('fighter1-momentum-value');
        fighter2MomentumValue = document.getElementById('fighter2-momentum-value');
        fighter1IncapacitationScore = document.getElementById('fighter1-incapacitation-score');
        fighter1EscalationState = document.getElementById('fighter1-escalation-state');
        fighter2IncapacitationScore = document.getElementById('fighter2-incapacitation-score');
        fighter2EscalationState = document.getElementById('fighter2-escalation-state');
    }
}

/**
 * Updates a fighter's momentum display.
 * @param {string} fighterKey - 'fighter1' or 'fighter2'.
 * @param {number} momentumValue - The current momentum value.
 */
export function updateMomentumDisplay(fighterKey, momentumValue) {
    initializeDOMElements(); // Ensure elements are initialized
    const momentumElement = fighterKey === 'fighter1' ? fighter1MomentumValue : fighter2MomentumValue;
    if (!momentumElement) return;

    momentumElement.textContent = String(momentumValue);
    momentumElement.classList.remove('momentum-positive', 'momentum-negative', 'momentum-neutral');
    if (momentumValue > 0) momentumElement.classList.add('momentum-positive');
    else if (momentumValue < 0) momentumElement.classList.add('momentum-negative');
    else momentumElement.classList.add('momentum-neutral');
}

/**
 * Updates a fighter's escalation state and incapacitation score display.
 * @param {string} fighterKey - 'fighter1' or 'fighter2'.
 * @param {number} score - The incapacitation score.
 * @param {string} state - The escalation state (e.g., 'Normal', 'Pressured').
 */
export function updateEscalationDisplay(fighterKey, score, state) {
    initializeDOMElements(); // Ensure elements are initialized
    const scoreElement = fighterKey === 'fighter1' ? fighter1IncapacitationScore : fighter2IncapacitationScore;
    const stateElement = fighterKey === 'fighter1' ? fighter1EscalationState : fighter2EscalationState;

    if (scoreElement) {
        scoreElement.textContent = `Incap. Score: ${score !== undefined ? score.toFixed(1) : 'N/A'}`;
    }
    if (stateElement) {
        stateElement.textContent = `Escalation: ${state || 'N/A'}`;
        stateElement.className = 'escalation-status'; // Reset classes
        if (state) {
            switch (state) {
                case ESCALATION_STATES.PRESSURED:
                    stateElement.classList.add('escalation-pressured');
                    break;
                case ESCALATION_STATES.SEVERELY_INCAPACITATED:
                    stateElement.classList.add('escalation-severe');
                    break;
                case ESCALATION_STATES.TERMINAL_COLLAPSE:
                    stateElement.classList.add('escalation-terminal');
                    break;
                default: // NORMAL
                    stateElement.classList.add('escalation-normal');
                    break;
            }
        }
    }
}
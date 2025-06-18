// FILE: js/engine_move_availability.js
"use strict";

/**
 * @fileoverview Determines which moves a character can use.
 * @description This module calculates move availability based on character techniques and the current battle phase.
 */

/**
 * @typedef {import('./types/battle.js').Fighter} Fighter
 * @typedef {import('./types/battle.js').Move} Move
 */

// This module determines which moves a character can use based on their
// techniques and the current battle phase.

import { BATTLE_PHASES } from "./engine_battle-phase.js";

const DEFAULT_MOVE_PROPERTIES = {
    power: 30,
    collateralImpact: "none",
    moveTags: [],
    element: "physical",
    type: "Offense"
};

/**
 * Gets the available moves for an actor based on their techniques and the current battle phase.
 * @param {Fighter} actor - The character object.
 * @param {string} currentPhase - The current phase of the battle (e.g., 'Early', 'Poking').
 * @returns {Array<Move>} A list of available move objects.
 */
export function getAvailableMoves(actor, currentPhase) {
    const struggleMove = { name: "Struggle", verb: "struggle", type: "Offense", power: 10, element: "physical", moveTags: [] };
    if (!actor || !actor.techniques) {
        return [struggleMove];
    }
    
    // In our simplified project, we only need the base technique list.
    const currentTechniquesSource = actor.techniques || [];

    let available = currentTechniquesSource.filter(move => {
        if (!move || !move.name || !move.type) return false;
        
        // Lightning Redirection is reactive, not actively chosen
        if (move.name === "Lightning Redirection") return false;

        return true;
    });

    // Poking Phase restrictions
    if (currentPhase === BATTLE_PHASES["POKING"]) {
        available = available.filter(move => {
            if (move.type === "Offense" && (move.power || 0) > 40) return false;
            if (move.type === "Finisher") return false;
            if (move.moveTags && move.moveTags.includes("highRisk")) return false;
            return true;
        });
    }
    
    if (available.length === 0) {
        available.push(struggleMove);
    }

    return available;
}

/**
 * Validates if a move is available for a fighter to use.
 * @param {Move} move - The move object to validate.
 * @param {Fighter} fighter - The fighter attempting to use the move.
 * @returns {boolean} True if the move is valid and available, false otherwise.
 */
export function isValidMove(move, fighter) {
    if (!move || !fighter) {
        return false;
    }
    const availableMoves = getAvailableMoves(fighter, "any"); // 'any' phase for general validation
    return availableMoves.some(availableMove => availableMove.id === move.id);
}
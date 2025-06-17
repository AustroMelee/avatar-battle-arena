// FILE: js/engine_curbstomp_manager.js
'use strict';

// This module isolates the logic for applying pre-battle and in-battle
// "curbstomp" rules, which can grant buffs, debuffs, or instant victories.

import { characterCurbstompRules } from './data_mechanics_characters.js';
import { locationCurbstompRules } from './data_mechanics_locations.js';
import { generateLogEvent } from './utils_log_event.js';

// This Set is exported so other modules can read it, but it should only be
// modified by this manager.
export let charactersMarkedForDefeat = new Set();

/**
 * Resets the set of characters marked for defeat. Should be called before each battle.
 */
export function resetCurbstompState() {
    charactersMarkedForDefeat.clear();
}

/**
 * Selects a victim for a curbstomp rule based on its weighting logic.
 * @param {object} options - Contains attacker, defender, rule, locationData, and battleState.
 * @returns {string|null} The ID of the victim, or null.
 */
function selectCurbstompVictim({ attacker, defender, rule, locationData, battleState }) {
    if (typeof rule.weightingLogic === 'function') {
        const weightedOutcome = rule.weightingLogic({ attacker, defender, rule, location: locationData, situation: { ...battleState, environmentState: battleState.environmentState || { damageLevel: 0 } } });

        if (typeof weightedOutcome === 'string') {
            return weightedOutcome;
        } else if (weightedOutcome && typeof weightedOutcome.victimId === 'string' && typeof weightedOutcome.probability === 'number') {
            const probabilityRoll = (USE_DETERMINISTIC_RANDOM ? seededRandom() : Math.random());
            const didTrigger = probabilityRoll < weightedOutcome.probability;

            battleEventLog.push(generateLogEvent(battleState, {
                type: "dice_roll",
                rollType: "curbstompVictimProbability",
                actorId: attacker.id, // Assuming attacker is context for this roll
                result: probabilityRoll,
                threshold: weightedOutcome.probability,
                outcome: didTrigger ? "triggered" : "not triggered",
                ruleId: rule.id
            }));

            if (didTrigger) {
                return weightedOutcome.victimId;
            }
            return null;
        } else if (weightedOutcome && typeof weightedOutcome.probabilities === 'object') {
            const rand = (USE_DETERMINISTIC_RANDOM ? seededRandom() : Math.random());
            let cumulativeProb = 0;

            battleEventLog.push(generateLogEvent(battleState, {
                type: "dice_roll",
                rollType: "curbstompVictimDistribution",
                actorId: attacker.id, // Assuming attacker is context for this roll
                result: rand,
                details: weightedOutcome.probabilities,
                outcome: "", // Will be filled below
                ruleId: rule.id
            }));

            for (const charId in weightedOutcome.probabilities) {
                cumulativeProb += weightedOutcome.probabilities[charId];
                if (rand < cumulativeProb) {
                    // Update outcome for the previously logged dice_roll event
                    const lastDiceRollEvent = battleEventLog[battleEventLog.length - 1];
                    if (lastDiceRollEvent && lastDiceRollEvent.type === "dice_roll" && lastDiceRollEvent.rollType === "curbstompVictimDistribution") {
                        lastDiceRollEvent.outcome = `selected ${charId}`;
                    }
                    return charId;
                }
            }
            const fallbackVictim = (USE_DETERMINISTIC_RANDOM ? seededRandom() : Math.random()) < 0.5 ? attacker.id : defender.id;
            const lastDiceRollEvent = battleEventLog[battleEventLog.length - 1];
            if (lastDiceRollEvent && lastDiceRollEvent.type === "dice_roll" && lastDiceRollEvent.rollType === "curbstompVictimDistribution") {
                lastDiceRollEvent.outcome = `fallback selected ${fallbackVictim}`;
            }
            return fallbackVictim;
        }
    }

    // Default or fallback victim selection
    if (rule.outcome?.type?.includes("loss_weighted_character") || rule.outcome?.type?.includes("loss_random_character")) {
        const fallbackRoll = (USE_DETERMINISTIC_RANDOM ? seededRandom() : Math.random());
        const selectedFighter = fallbackRoll < 0.5 ? attacker.id : defender.id;

        battleEventLog.push(generateLogEvent(battleState, {
            type: "dice_roll",
            rollType: "curbstompFallbackVictim",
            actorId: attacker.id, // Context for this roll
            result: fallbackRoll,
            threshold: 0.5,
            outcome: `selected ${selectedFighter}`,
            ruleId: rule.id
        }));
        return selectedFighter;
    }
    if (rule.appliesToCharacter && (rule.outcome?.type?.includes("loss_weighted_character") || rule.outcome?.type?.includes("instant_death_character"))) {
        return rule.appliesToCharacter;
    }
    return null;
}

/**
 * Applies all relevant curbstomp rules to the current fighters and state.
 * @param {object} fighter1 - The first fighter.
 * @param {object} fighter2 - The second fighter.
 * @param {object} battleState - The current state of the battle.
 * @param {Array} battleEventLog - The main event log to push narration to.
 * @param {boolean} isPreBattle - Flag indicating if this is before the main loop.
 */
export function applyCurbstompRules(fighter1, fighter2, battleState, battleEventLog, isPreBattle = false) {
    const allRules = [
        ...(characterCurbstompRules[fighter1.id] || []),
        ...(characterCurbstompRules[fighter2.id] || []),
        ...(locationCurbstompRules[battleState.locationId] || [])
    ];

    for (const rule of allRules) {
        const triggerRoll = (USE_DETERMINISTIC_RANDOM ? seededRandom() : Math.random());
        const didRuleTrigger = triggerRoll >= (rule.triggerChance || 1.0); // Renamed for clarity

        battleEventLog.push(generateLogEvent(battleState, {
            type: "dice_roll",
            rollType: "curbstompRuleTrigger",
            ruleId: rule.id,
            result: triggerRoll,
            threshold: rule.triggerChance || 1.0,
            outcome: didRuleTrigger ? "triggered" : "not triggered"
        }));

        if (!didRuleTrigger) continue; // Changed condition

        let protagonists = [];
        let antagonist = null;

        if (rule.appliesToCharacter) {
            if (fighter1.id === rule.appliesToCharacter) protagonists.push(fighter1);
            if (fighter2.id === rule.appliesToCharacter) protagonists.push(fighter2);
        } else if (rule.appliesToPair) {
            if (rule.appliesToPair.includes(fighter1.id) && rule.appliesToPair.includes(fighter2.id)) {
                protagonists.push(fighter1, fighter2);
            }
        } else if (rule.appliesToElement) {
            if (fighter1.element === rule.appliesToElement) protagonists.push(fighter1);
            if (fighter2.element === rule.appliesToElement) protagonists.push(fighter2);
        } else if (rule.appliesToFaction) {
            const isNegated = rule.appliesToFaction.startsWith('!');
            const faction = isNegated ? rule.appliesToFaction.substring(1) : rule.appliesToFaction;
            if (isNegated) {
                if (fighter1.faction !== faction) protagonists.push(fighter1);
                if (fighter2.faction !== faction) protagonists.push(fighter2);
            } else {
                if (fighter1.faction === faction) protagonists.push(fighter1);
                if (fighter2.faction === faction) protagonists.push(fighter2);
            }
        } else if (rule.appliesToAll) {
            protagonists.push(fighter1, fighter2);
        }

        for (const protagonist of protagonists) {
            const opponent = (protagonist.id === fighter1.id) ? fighter2 : fighter1;
            if (rule.conditionLogic && !rule.conditionLogic(protagonist, opponent, battleState)) {
                continue;
            }

            const outcome = rule.outcome;
            if (Math.random() < 0.15 && (outcome.type.includes('instant_') || outcome.type.includes('environmental_kill'))) {
                battleEventLog.push(generateLogEvent(battleState, { type: 'narrative_event', text: `By some miracle, ${protagonist.name} survives what should have been a fatal blow!`, html_content: `<p class="narrative-survivor">By some miracle, ${protagonist.name} survives what should have been a fatal blow!</p>` }));
                protagonist.aiLog.push(`[Survivor's Luck]: Miraculously survived rule '${rule.id}'.`);
                continue;
            }

            let winner, loser;
            switch (outcome.type) {
                case 'instant_win':
                    winner = outcome.winner ? (protagonist.id === outcome.winner ? protagonist : opponent) : protagonist;
                    loser = (winner.id === protagonist.id) ? opponent : protagonist;
                    if (!isPreBattle || battleState.locationConditions[battleState.locationId]?.allowPreBattleCurbstomp) {
                        charactersMarkedForDefeat.add(loser.id);
                    }
                    battleEventLog.push(generateLogEvent(battleState, { type: 'curbstomp_event', text: `${winner.name} secured a decisive victory over ${loser.name} due to ${rule.description}.` }));
                    break;
                case 'instant_loss':
                    loser = protagonist;
                    if (!isPreBattle || battleState.locationConditions[battleState.locationId]?.allowPreBattleCurbstomp) {
                        charactersMarkedForDefeat.add(loser.id);
                    }
                    battleEventLog.push(generateLogEvent(battleState, { type: 'curbstomp_event', text: `${loser.name} was decisively defeated due to ${rule.description}.` }));
                    break;
                case 'environmental_kill':
                    loser = protagonist;
                    if (!isPreBattle || battleState.locationConditions[battleState.locationId]?.allowPreBattleCurbstomp) {
                        charactersMarkedForDefeat.add(loser.id);
                    }
                    battleEventLog.push(generateLogEvent(battleState, { type: 'curbstomp_event', text: `The environment itself proved fatal for ${loser.name}.` }));
                    break;
                case 'buff':
                    protagonist[outcome.property] = (protagonist[outcome.property] || 0) + outcome.value;
                    protagonist.aiLog.push(`[Buff]: Rule '${rule.id}' applied: ${outcome.property} modified by ${outcome.value}.`);
                    break;
                case 'debuff':
                    protagonist[outcome.property] = (protagonist[outcome.property] || 0) + outcome.value;
                    protagonist.aiLog.push(`[Debuff]: Rule '${rule.id}' applied: ${outcome.property} modified by ${outcome.value}.`);
                    break;
                 case 'advantage':
                    antagonist = outcome.target === protagonist.id ? protagonist : opponent;
                    antagonist.momentum += (outcome.value * 100);
                    antagonist.aiLog.push(`[Advantage]: Rule '${rule.id}' granted significant momentum boost.`);
                    break;
                case 'external_intervention':
                    battleEventLog.push(generateLogEvent(battleState, { type: 'narrative_event', text: 'The fight was interrupted by outside forces, ending in a draw.' }));
                    break;
            }
        }
    }
}
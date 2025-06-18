/**
 * @fileoverview Curbstomp Rule Engine
 * @description Core engine: Receives rules, state, and figures out which should be triggered. Delegates side-effects and narrative logging.
 * @version 1.0
 */

"use strict";

import { USE_DETERMINISTIC_RANDOM, MIN_TURNS_BEFORE_CURBSTOMP, CURBSTOMP_HP_THRESHOLD, CURBSTOMP_MOMENTUM_THRESHOLD } from "../config_game.js";
import { seededRandom } from "../utils_seeded_random.js";
import { modifyMomentum } from "../engine_momentum.js";
import { getAllCurbstompRulesForBattle, getRulesForFighter } from "./curbstomp_rule_registry.js";
import { selectCurbstompVictim, checkMiraculousSurvival } from "./curbstomp_victim_selector.js";
import { markCharacterForDefeat } from "./curbstomp_state.js";
import * as CurbstompNarrative from "./curbstomp_narrative.js";

/**
 * Evaluates and applies all relevant curbstomp rules for the current battle state
 * @param {Object} fighter1 - First fighter state
 * @param {Object} fighter2 - Second fighter state
 * @param {Object} battleState - Current battle state
 * @param {Array} battleEventLog - Event log for narrative output
 * @param {boolean} isPreBattle - Whether this is pre-battle evaluation
 * @returns {Array} Events generated from rule application
 */
export function applyCurbstompRules(fighter1, fighter2, battleState, battleEventLog, isPreBattle = false) {
    console.debug(`[Curbstomp Engine] Applying curbstomp rules - Turn: ${battleState.turn}, Pre-battle: ${isPreBattle}`);
    
    const allRules = getAllCurbstompRulesForBattle(fighter1, fighter2, battleState.locationId);
    const events = [];
    
    for (const rule of allRules) {
        const ruleEvents = evaluateAndApplyRule(rule, fighter1, fighter2, battleState, isPreBattle);
        events.push(...ruleEvents);
    }
    
    // Add events to main battle log
    battleEventLog.push(...events);
    
    return events;
}

/**
 * Evaluates a single rule and applies its effects if triggered
 * @private
 */
function evaluateAndApplyRule(rule, fighter1, fighter2, battleState, isPreBattle) {
    const events = [];
    
    // Check if rule triggers
    const triggerResult = evaluateRuleTrigger(rule, battleState);
    events.push(triggerResult.event);
    
    if (!triggerResult.triggered) {
        return events;
    }
    
    // Find applicable fighters
    const applicableFighters = findApplicableFighters(rule, fighter1, fighter2);
    
    // Apply rule to each applicable fighter
    for (const fighter of applicableFighters) {
        const opponent = fighter.id === fighter1.id ? fighter2 : fighter1;
        
        // Check additional conditions
        if (rule.conditionLogic && !rule.conditionLogic(fighter, opponent, battleState)) {
            continue;
        }
        
        const outcomeEvents = applyRuleOutcome(rule, fighter, opponent, battleState, isPreBattle);
        events.push(...outcomeEvents);
    }
    
    return events;
}

/**
 * Evaluates whether a rule triggers based on its chance
 * @private
 */
function evaluateRuleTrigger(rule, battleState) {
    const triggerRoll = USE_DETERMINISTIC_RANDOM ? seededRandom() : Math.random();
    const triggerChance = rule.triggerChance || 1.0;
    const triggered = triggerRoll < triggerChance;
    
    const event = CurbstompNarrative.generateRuleTriggerNarrative(
        battleState, 
        rule, 
        triggered, 
        triggerRoll
    );
    
    return { triggered, event };
}

/**
 * Finds fighters that a rule applies to
 * @private
 */
function findApplicableFighters(rule, fighter1, fighter2) {
    const applicableFighters = [];
    
    if (rule.appliesToCharacter) {
        if (fighter1.id === rule.appliesToCharacter) applicableFighters.push(fighter1);
        if (fighter2.id === rule.appliesToCharacter) applicableFighters.push(fighter2);
    } else if (rule.appliesToPair) {
        if (rule.appliesToPair.includes(fighter1.id) && rule.appliesToPair.includes(fighter2.id)) {
            applicableFighters.push(fighter1, fighter2);
        }
    } else if (rule.appliesToElement) {
        if (fighter1.element === rule.appliesToElement) applicableFighters.push(fighter1);
        if (fighter2.element === rule.appliesToElement) applicableFighters.push(fighter2);
    } else if (rule.appliesToFaction) {
        const isNegated = rule.appliesToFaction.startsWith("!");
        const faction = isNegated ? rule.appliesToFaction.substring(1) : rule.appliesToFaction;
        
        if (isNegated) {
            if (fighter1.faction !== faction) applicableFighters.push(fighter1);
            if (fighter2.faction !== faction) applicableFighters.push(fighter2);
        } else {
            if (fighter1.faction === faction) applicableFighters.push(fighter1);
            if (fighter2.faction === faction) applicableFighters.push(fighter2);
        }
    } else if (rule.appliesToAll) {
        applicableFighters.push(fighter1, fighter2);
    }
    
    return applicableFighters;
}

/**
 * Applies the outcome of a triggered rule
 * @private
 */
function applyRuleOutcome(rule, protagonist, opponent, battleState, isPreBattle) {
    const events = [];
    const outcome = rule.outcome;
    
    // Check for miraculous survival on fatal outcomes
    if (checkMiraculousSurvival(protagonist, rule)) {
        const survivalEvent = CurbstompNarrative.generateSurvivalMiracleNarrative(
            battleState, protagonist, rule
        );
        events.push(survivalEvent);
        
        CurbstompNarrative.addCurbstompAiLog(protagonist, "Survival", rule);
        return events;
    }
    
    // Apply outcome based on type
    switch (outcome.type) {
        case "instant_win":
            events.push(...handleInstantWin(rule, protagonist, opponent, battleState, isPreBattle));
            break;
        case "instant_loss":
            events.push(...handleInstantLoss(rule, protagonist, battleState, isPreBattle));
            break;
        case "environmental_kill":
            events.push(...handleEnvironmentalKill(rule, protagonist, battleState, isPreBattle));
            break;
        case "buff":
        case "debuff":
            events.push(...handleBuffDebuff(rule, protagonist, battleState));
            break;
        case "advantage":
            events.push(...handleAdvantage(rule, protagonist, opponent, battleState));
            break;
        case "external_intervention":
            events.push(...handleExternalIntervention(rule, battleState));
            break;
    }
    
    return events;
}

/**
 * Handles instant win outcomes
 * @private
 */
function handleInstantWin(rule, protagonist, opponent, battleState, isPreBattle) {
    const winner = rule.outcome.winner 
        ? (protagonist.id === rule.outcome.winner ? protagonist : opponent)
        : protagonist;
    const loser = winner.id === protagonist.id ? opponent : protagonist;
    
    if (!isPreBattle || battleState.locationConditions[battleState.locationId]?.allowPreBattleCurbstomp) {
        markCharacterForDefeat(loser.id);
    }
    
    const event = CurbstompNarrative.generateInstantWinNarrative(battleState, winner, loser, rule);
    return [event];
}

/**
 * Handles instant loss outcomes
 * @private
 */
function handleInstantLoss(rule, protagonist, battleState, isPreBattle) {
    if (!isPreBattle || battleState.locationConditions[battleState.locationId]?.allowPreBattleCurbstomp) {
        markCharacterForDefeat(protagonist.id);
    }
    
    const event = CurbstompNarrative.generateInstantLossNarrative(battleState, protagonist, rule);
    return [event];
}

/**
 * Handles environmental kill outcomes
 * @private
 */
function handleEnvironmentalKill(rule, protagonist, battleState, isPreBattle) {
    if (!isPreBattle || battleState.locationConditions[battleState.locationId]?.allowPreBattleCurbstomp) {
        markCharacterForDefeat(protagonist.id);
    }
    
    const event = CurbstompNarrative.generateEnvironmentalKillNarrative(battleState, protagonist, rule);
    return [event];
}

/**
 * Handles buff/debuff outcomes
 * @private
 */
function handleBuffDebuff(rule, protagonist, battleState) {
    const { property, value } = rule.outcome;
    
    protagonist[property] = (protagonist[property] || 0) + value;
    
    const eventType = rule.outcome.type === "buff" ? "Buff" : "Debuff";
    CurbstompNarrative.addCurbstompAiLog(protagonist, eventType, rule, { property, value });
    
    const event = CurbstompNarrative.generateBuffNarrative(battleState, protagonist, rule, property, value);
    return [event];
}

/**
 * Handles advantage (momentum) outcomes
 * @private
 */
function handleAdvantage(rule, protagonist, opponent, battleState) {
    const target = rule.outcome.target === protagonist.id ? protagonist : opponent;
    const momentumChange = rule.outcome.value * 100;
    
    modifyMomentum(target, momentumChange, `Curbstomp Rule: ${rule.id}`);
    CurbstompNarrative.addCurbstompAiLog(target, "Advantage", rule);
    
    const event = CurbstompNarrative.generateMomentumAdvantageNarrative(battleState, target, rule, momentumChange);
    return [event];
}

/**
 * Handles external intervention outcomes
 * @private
 */
function handleExternalIntervention(rule, battleState) {
    const event = CurbstompNarrative.generateExternalInterventionNarrative(battleState, rule);
    return [event];
}

/**
 * Checks for overwhelming advantage conditions that could end the fight prematurely
 * @param {Object} attacker - The attacking character state object
 * @param {Object} defender - The defending character state object
 * @param {string} locId - Location identifier for context
 * @param {Object} battleState - Current battle state
 * @returns {boolean} True if curbstomp conditions are met and battle should end
 */
export function checkCurbstompConditions(attacker, defender, locId, battleState) {
    console.debug(`[Curbstomp Engine] Checking curbstomp conditions - Turn: ${battleState.turn}, Min turns required: ${MIN_TURNS_BEFORE_CURBSTOMP}`);
    console.debug(`[Curbstomp Engine] Attacker HP: ${attacker.hp}, Defender HP: ${defender.hp}, Defender Momentum: ${defender.momentum}`);
    
    // Prevent premature curbstomp detection in early battle phases
    if (battleState.turn < MIN_TURNS_BEFORE_CURBSTOMP) {
        console.debug(`[Curbstomp Engine] Curbstomp check skipped - insufficient turns elapsed (${battleState.turn}/${MIN_TURNS_BEFORE_CURBSTOMP})`);
        return false;
    }

    // Calculate curbstomp conditions: HP differential AND momentum deficit
    const hpRatio = defender.hp / attacker.hp;
    const defenderMomentum = Number(defender.momentum || 0);
    const attackerMomentum = Number(attacker.momentum || 0);
    const isCurbstomp = (hpRatio <= CURBSTOMP_HP_THRESHOLD) && (defenderMomentum <= CURBSTOMP_MOMENTUM_THRESHOLD);
    
    console.debug(`[Curbstomp Engine] Curbstomp analysis - HP ratio: ${hpRatio.toFixed(3)} (threshold: ${CURBSTOMP_HP_THRESHOLD}), Defender momentum: ${defenderMomentum} (threshold: ${CURBSTOMP_MOMENTUM_THRESHOLD})`);

    if (isCurbstomp) {
        console.warn(`[Curbstomp Engine] CURBSTOMP DETECTED! ${attacker.name} has overwhelming advantage over ${defender.name}`);
        console.warn(`[Curbstomp Engine] Curbstomp metrics - HP differential: ${(attacker.hp - defender.hp).toFixed(1)}, Momentum gap: ${(attackerMomentum - defenderMomentum).toFixed(1)}`);
        
        const metrics = {
            hpRatio,
            momentumGap: attackerMomentum - defenderMomentum
        };
        
        // Mark the defender for defeat
        markCharacterForDefeat(defender.id);
        
        // Generate and log AI entries
        CurbstompNarrative.addCurbstompAiLog(attacker, "Overwhelming", { id: "curbstomp_detection" }, {
            attackerName: attacker.name,
            hpRatio,
            momentumGap: metrics.momentumGap
        });
        
        return { detected: true, metrics };
    }
    
    console.debug("[Curbstomp Engine] Curbstomp conditions not met - battle continues");
    return { detected: false };
} 
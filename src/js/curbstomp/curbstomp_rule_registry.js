/**
 * @fileoverview Curbstomp Rule Registry
 * @description Loads/organizes rules from data files and provides helpers for rule lookup and filtering
 * @version 1.0
 */

"use strict";

import { characterCurbstompRules } from "../data_mechanics_characters.js";
import { locationCurbstompRules } from "../data_mechanics_locations.js";

/**
 * Gets all curbstomp rules applicable to a specific battle configuration
 * @param {Object} fighter1 - First fighter state
 * @param {Object} fighter2 - Second fighter state  
 * @param {string} locationId - Location identifier
 * @returns {Array} Array of applicable curbstomp rules
 */
export function getAllCurbstompRulesForBattle(fighter1, fighter2, locationId) {
    const allRules = [
        ...(characterCurbstompRules[fighter1.id] || []),
        ...(characterCurbstompRules[fighter2.id] || []),
        ...(locationCurbstompRules[locationId] || [])
    ];
    
    return allRules;
}

/**
 * Gets character-specific curbstomp rules
 * @param {string} characterId - Character identifier
 * @returns {Array} Array of character-specific rules
 */
export function getCharacterCurbstompRules(characterId) {
    return characterCurbstompRules[characterId] || [];
}

/**
 * Gets location-specific curbstomp rules
 * @param {string} locationId - Location identifier
 * @returns {Array} Array of location-specific rules
 */
export function getLocationCurbstompRules(locationId) {
    return locationCurbstompRules[locationId] || [];
}

/**
 * Filters rules by application criteria
 * @param {Array} rules - Rules to filter
 * @param {Object} fighter1 - First fighter state
 * @param {Object} fighter2 - Second fighter state
 * @param {Object} battleState - Current battle state
 * @returns {Array} Filtered rules that apply to the current battle context
 */
export function filterApplicableRules(rules, fighter1, fighter2, battleState) {
    return rules.filter(rule => {
        // Check if rule applies to specific character
        if (rule.appliesToCharacter) {
            return fighter1.id === rule.appliesToCharacter || fighter2.id === rule.appliesToCharacter;
        }
        
        // Check if rule applies to character pair
        if (rule.appliesToPair) {
            return rule.appliesToPair.includes(fighter1.id) && rule.appliesToPair.includes(fighter2.id);
        }
        
        // Check if rule applies to element
        if (rule.appliesToElement) {
            return fighter1.element === rule.appliesToElement || fighter2.element === rule.appliesToElement;
        }
        
        // Check if rule applies to faction (with negation support)
        if (rule.appliesToFaction) {
            const isNegated = rule.appliesToFaction.startsWith("!");
            const faction = isNegated ? rule.appliesToFaction.substring(1) : rule.appliesToFaction;
            
            if (isNegated) {
                return fighter1.faction !== faction || fighter2.faction !== faction;
            } else {
                return fighter1.faction === faction || fighter2.faction === faction;
            }
        }
        
        // Check if rule applies to all
        if (rule.appliesToAll) {
            return true;
        }
        
        return false;
    });
}

/**
 * Gets rules that apply to a specific fighter in the context of a battle
 * @param {Array} rules - Rules to check
 * @param {Object} fighter - Fighter to check rules against
 * @param {Object} opponent - Opponent fighter
 * @param {Object} battleState - Current battle state
 * @returns {Array} Rules that apply to the specific fighter
 */
export function getRulesForFighter(rules, fighter, opponent, battleState) {
    const applicableRules = [];
    
    for (const rule of rules) {
        let applies = false;
        
        if (rule.appliesToCharacter && fighter.id === rule.appliesToCharacter) {
            applies = true;
        } else if (rule.appliesToPair && rule.appliesToPair.includes(fighter.id) && rule.appliesToPair.includes(opponent.id)) {
            applies = true;
        } else if (rule.appliesToElement && fighter.element === rule.appliesToElement) {
            applies = true;
        } else if (rule.appliesToFaction) {
            const isNegated = rule.appliesToFaction.startsWith("!");
            const faction = isNegated ? rule.appliesToFaction.substring(1) : rule.appliesToFaction;
            applies = isNegated ? fighter.faction !== faction : fighter.faction === faction;
        } else if (rule.appliesToAll) {
            applies = true;
        }
        
        if (applies) {
            applicableRules.push(rule);
        }
    }
    
    return applicableRules;
}

/**
 * Gets rules by outcome type
 * @param {Array} rules - Rules to filter
 * @param {string} outcomeType - Type of outcome to filter by
 * @returns {Array} Rules with the specified outcome type
 */
export function getRulesByOutcomeType(rules, outcomeType) {
    return rules.filter(rule => rule.outcome?.type === outcomeType);
}

/**
 * Gets rules by trigger conditions
 * @param {Array} rules - Rules to filter  
 * @param {number} minChance - Minimum trigger chance
 * @param {number} maxChance - Maximum trigger chance
 * @returns {Array} Rules within the trigger chance range
 */
export function getRulesByTriggerChance(rules, minChance = 0, maxChance = 1) {
    return rules.filter(rule => {
        const chance = rule.triggerChance || 1.0;
        return chance >= minChance && chance <= maxChance;
    });
} 
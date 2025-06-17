// FILE: js/engine_manipulation.js
'use strict';

// This module handles the logic for psychological manipulation attempts,
// a special trait for characters like Azula.

/**
 * Safely retrieves a nested property from an object.
 * @param {object} obj - The object to query.
 * @param {string} path - The dot-separated path to the property.
 * @param {*} defaultValue - The value to return if the path is not found.
 * @returns {*} The property value or the default value.
 */
function safeGet(obj, path, defaultValue) {
    const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
    return (value !== undefined && value !== null) ? value : defaultValue;
}

/**
 * Determines if a character attempts to manipulate their opponent and if it succeeds.
 * @param {object} manipulator - The character attempting the manipulation.
 * @param {object} target - The character being targeted.
 * @returns {object} An object indicating success, the effect, and narration. { success: boolean, effect?: string, narration?: string }
 */
export function attemptManipulation(manipulator, target) {
    if (!manipulator || !target || !target.mentalState || !manipulator.pronouns || !target.pronouns) {
        return { success: false };
    }

    const manipTrait = safeGet(manipulator, 'specialTraits.manipulative', 0);
    if (manipTrait === 0) return { success: false };

    const mentalStateLevel = safeGet(target.mentalState, 'level', 'stable');
    const mentalStateModifier = { 'stable': 0.5, 'stressed': 1.0, 'shaken': 1.5, 'broken': 0.2 }[mentalStateLevel] || 0.5;
    const resilience = safeGet(target, 'specialTraits.resilientToManipulation', 0);
    const attemptChance = manipTrait * mentalStateModifier * (1 - resilience);

    if (Math.random() < attemptChance) {
        const effect = Math.random() > 0.5 ? 'Exposed' : 'Shaken';
        const manipulatorName = manipulator.name || 'Manipulator';
        const manipulatorId = manipulator.id || 'unknown-manipulator';
        const targetName = target.name || 'Target';
        const targetId = target.id || 'unknown-target';
        const targetPronounO = target.pronouns.o || 'them';

        const manipulatorSpan = `<span class="char-${manipulatorId}">${manipulatorName}</span>`;
        const targetSpan = `<span class="char-${targetId}">${targetName}</span>`;
        const narration = `<p class="narrative-manipulation">${manipulatorSpan} unleashes a sharp taunt, preying on ${targetSpan}'s insecurities. It hits home, leaving ${targetPronounO} ${effect}!</p>`;
        
        // Log the successful manipulation
        if(manipulator.aiLog) manipulator.aiLog.push(`[Manipulation]: Successfully manipulated ${targetName}, causing '${effect}'.`);
        if(target.aiLog) target.aiLog.push(`[Manipulation]: Was manipulated by ${manipulatorName}, became '${effect}'.`);

        return { success: true, effect, narration };
    }

    return { success: false };
}
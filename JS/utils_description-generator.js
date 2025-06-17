'use strict';

// Maps numerical modifier ranges to human-readable descriptions for battle conditions.
const modifierToDescription = {
    damage: {
        "[-100, -75]": "almost useless",
        "[-74, -50]": "severely hindered",
        "[-49, -25]": "hindered",
        "[-24, -10]": "slightly hindered",
        "[-9, 9]": "unaffected", // Neutral
        "[10, 24]": "slightly empowered",
        "[25, 49]": "empowered",
        "[50, 74]": "greatly empowered",
        "[75, 100]": "massively empowered"
    },
    energy: {
        "[-100, -75]": "massively draining",
        "[-74, -50]": "extremely draining",
        "[-49, -25]": "very draining",
        "[-24, -10]": "draining",
        "[-9, 9]": "unaffected", // Neutral
        "[10, 24]": "efficient",
        "[25, 49]": "very efficient",
        "[50, 74]": "extremely efficient",
        "[75, 100]": "incredibly efficient"
    }
};

/**
 * Converts a numerical modifier into a human-readable description.
 * @param {number} value - The numerical modifier (e.g., -70, 15).
 * @param {('damage'|'energy')} type - The type of modifier.
 * @returns {string} The human-readable description.
 */
export function getModifierDescription(value, type) {
    const descriptions = modifierToDescription[type];
    for (const range in descriptions) {
        const [min, max] = JSON.parse(`[${range}]`);
        if (value >= min && value <= max) {
            return descriptions[range];
        }
    }
    return "unusually affected"; // Fallback
} 
/**
 * @fileoverview DOM Elements Registry Module
 * @description Caches and manages all relevant DOM nodes for battle results UI.
 * Provides centralized access to DOM elements with lazy initialization.
 * @version 1.0
 */

"use strict";

// Cache for DOM elements
let domCache = {};
let isInitialized = false;

/**
 * Element IDs configuration
 */
const ELEMENT_IDS = {
    results: "results",
    environmentDamageDisplay: "environment-damage-display",
    environmentImpactsList: "environment-impacts-list",
    battleStory: "battle-story",
    analysisList: "analysis-list",
    winnerName: "winner-name",
    winProbability: "win-probability",
    detailedBattleLogsContent: "detailed-battle-logs-content",
    toggleDetailedLogsBtn: "toggle-detailed-logs-btn",
    copyDetailedLogsBtn: "copy-detailed-logs-btn"
};

/**
 * Initializes DOM element cache
 * @param {boolean} force - Force re-initialization even if already initialized
 */
export function initializeDOMElements(force = false) {
    if (isInitialized && !force) return domCache;

    // Clear cache
    domCache = {};

    // Cache all elements
    for (const [key, id] of Object.entries(ELEMENT_IDS)) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`DOM element with ID '${id}' not found`);
        }
        domCache[key] = element;
    }

    isInitialized = true;
    return domCache;
}

/**
 * Gets a specific DOM element by key
 * @param {string} elementKey - Key from ELEMENT_IDS
 * @returns {HTMLElement|null} The cached DOM element or null
 */
export function getDOMElement(elementKey) {
    if (!isInitialized) {
        initializeDOMElements();
    }
    return domCache[elementKey] || null;
}

/**
 * Gets all cached DOM elements
 * @returns {Object} Object containing all cached DOM elements
 */
export function getAllDOMElements() {
    if (!isInitialized) {
        initializeDOMElements();
    }
    return { ...domCache };
}

/**
 * Gets battle results specific elements
 * @returns {Object} Object containing battle results related elements
 */
export function getBattleResultsElements() {
    return {
        resultsSection: getDOMElement("results"),
        analysisList: getDOMElement("analysisList"),
        winnerName: getDOMElement("winnerName"),
        winProbability: getDOMElement("winProbability"),
        battleStory: getDOMElement("battleStory")
    };
}

/**
 * Gets environment display elements
 * @returns {Object} Object containing environment display elements
 */
export function getEnvironmentElements() {
    return {
        damageDisplay: getDOMElement("environmentDamageDisplay"),
        impactsList: getDOMElement("environmentImpactsList")
    };
}

/**
 * Gets battle log control elements
 * @returns {Object} Object containing battle log control elements
 */
export function getBattleLogElements() {
    return {
        logContent: getDOMElement("detailedBattleLogsContent"),
        toggleBtn: getDOMElement("toggleDetailedLogsBtn"),
        copyBtn: getDOMElement("copyDetailedLogsBtn")
    };
}

/**
 * Validates that required elements exist
 * @param {string[]} requiredElements - Array of element keys that must exist
 * @returns {boolean} True if all required elements exist
 */
export function validateRequiredElements(requiredElements) {
    if (!isInitialized) {
        initializeDOMElements();
    }

    const missing = requiredElements.filter(key => !domCache[key]);
    if (missing.length > 0) {
        console.error(`Missing required DOM elements: ${missing.join(", ")}`);
        return false;
    }
    return true;
}

/**
 * Clears the DOM cache (useful for testing or dynamic DOM changes)
 */
export function clearDOMCache() {
    domCache = {};
    isInitialized = false;
}

/**
 * Gets element IDs configuration (for reference)
 * @returns {Object} The ELEMENT_IDS configuration object
 */
export function getElementIDs() {
    return { ...ELEMENT_IDS };
} 
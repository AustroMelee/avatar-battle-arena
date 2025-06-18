/**
 * @fileoverview Avatar Battle Arena - Character Data System
 * @description Central registry for all character definitions, stats, moves, and battle configurations
 * @version 2.0.0
 */

'use strict';

//# sourceURL=data_characters.js

// ============================================================================
// TYPE IMPORTS
// ============================================================================

/**
 * @typedef {import('./types.js').Fighter} Fighter
 * @typedef {import('./types.js').Move} Move
 * @typedef {import('./types.js').AiPersonality} AiPersonality
 */

/**
 * @typedef {string} ElementType
 * @description Element type for characters and moves
 */

/**
 * @typedef {Object} CharacterStats
 * @description Character base statistics
 * @property {number} health - Base health points
 * @property {number} energy - Base energy points
 * @property {number} attack - Attack power
 * @property {number} defense - Defense power  
 * @property {number} speed - Speed rating
 * @property {number} [accuracy] - Accuracy rating (0-100)
 * @property {number} [evasion] - Evasion rating (0-100)
 */

/**
 * @typedef {Object} CharacterTemplate
 * @description Template for creating character instances
 * @property {string} id - Unique character identifier
 * @property {string} name - Character display name
 * @property {string} title - Character title or description
 * @property {ElementType} element - Primary element type
 * @property {CharacterStats} baseStats - Base character statistics
 * @property {string[]} moveIds - Available move identifiers
 * @property {AiPersonality} personality - AI personality configuration
 * @property {string} [image] - Character image URL
 * @property {string} [description] - Character description
 * @property {Object<string, any>} [abilities] - Special abilities
 */

/**
 * @typedef {Object} CharacterRegistry
 * @description Registry containing all character definitions
 * @property {Object<string, CharacterTemplate>} templates - Character templates by ID
 * @property {string[]} availableIds - List of available character IDs
 * @property {Object<string, string[]>} byElement - Characters grouped by element
 * @property {Object<string, string[]>} byNation - Characters grouped by nation
 */

/**
 * @typedef {Object} CharacterCreationOptions
 * @description Options for creating character instances
 * @property {boolean} [includeAllMoves] - Include all moves regardless of level
 * @property {number} [level] - Character level for stat scaling
 * @property {Object<string, number>} [statModifiers] - Stat modifiers to apply
 * @property {boolean} [enableDebug] - Enable debug logging
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { gaangCharacters } from './data_characters_gaang.js';
import { antagonistCharacters } from './data_characters_antagonists.js';

// ============================================================================
// CONSTANTS
// ============================================================================

/** @type {number} */
const DEFAULT_CHARACTER_LEVEL = 1;

/** @type {number} */
const MAX_CHARACTER_LEVEL = 100;

/** @type {CharacterStats} */
const DEFAULT_BASE_STATS = {
    health: 100,
    energy: 100,
    attack: 50,
    defense: 50,
    speed: 50,
    accuracy: 80,
    evasion: 20
};

/** @type {string[]} */
const VALID_ELEMENTS = ['fire', 'water', 'earth', 'air', 'spirit', 'physical'];

/** @type {string[]} */
const VALID_NATIONS = ['fire_nation', 'water_tribe', 'earth_kingdom', 'air_nomads', 'spirit_world'];

/** @type {Object<string, string>} */
const CHARACTER_IMAGE_PATHS = {
    'aang': 'img/img_aang.avif',
    'azula': 'img/img_azula.avif'
};

// ============================================================================
// CHARACTER REGISTRY
// ============================================================================

/** @type {CharacterRegistry} */
let characterRegistry = null;

/**
 * Initializes the character registry with all available characters
 * 
 * @returns {CharacterRegistry} Initialized character registry
 * 
 * @throws {Error} When character data is invalid
 * @throws {Error} When registry initialization fails
 * 
 * @example
 * // Initialize the character registry
 * const registry = initializeCharacterRegistry();
 * console.log(`Loaded ${registry.availableIds.length} characters`);
 * 
 * @since 2.0.0
 * @public
 */
export function initializeCharacterRegistry() {
    if (characterRegistry) {
        return characterRegistry;
    }

    console.debug('[Character Data] Initializing character registry...');

    try {
        // Combine all character sources
        /** @type {Object<string, CharacterTemplate>} */
        const allCharacters = {
            ...gaangCharacters,
            ...antagonistCharacters
        };

        // Validate all character definitions
        validateCharacterDefinitions(allCharacters);

        // Build registry structure
        /** @type {string[]} */
        const availableIds = Object.keys(allCharacters);

        /** @type {Object<string, string[]>} */
        const byElement = groupCharactersByElement(allCharacters);

        /** @type {Object<string, string[]>} */
        const byNation = groupCharactersByNation(allCharacters);

        characterRegistry = {
            templates: allCharacters,
            availableIds,
            byElement,
            byNation
        };

        console.debug(`[Character Data] Registry initialized with ${availableIds.length} characters`);

        return characterRegistry;

    } catch (error) {
        console.error('[Character Data] Failed to initialize character registry:', error);
        throw new Error(`Character registry initialization failed: ${error.message}`);
    }
}

/**
 * Gets the current character registry, initializing if necessary
 * 
 * @returns {CharacterRegistry} Character registry
 * 
 * @throws {Error} When registry cannot be accessed
 * 
 * @since 2.0.0
 * @public
 */
export function getCharacterRegistry() {
    if (!characterRegistry) {
        return initializeCharacterRegistry();
    }
    return characterRegistry;
}

/**
 * Gets a character template by ID
 * 
 * @param {string} characterId - Character identifier
 * 
 * @returns {CharacterTemplate | null} Character template or null if not found
 * 
 * @throws {TypeError} When characterId is invalid
 * 
 * @example
 * // Get Aang's character template
 * const aangTemplate = getCharacterTemplate('aang');
 * if (aangTemplate) {
 *   console.log(`${aangTemplate.name} - ${aangTemplate.title}`);
 * }
 * 
 * @since 2.0.0
 * @public
 */
export function getCharacterTemplate(characterId) {
    if (typeof characterId !== 'string' || !characterId.trim()) {
        throw new TypeError('getCharacterTemplate: characterId must be a non-empty string');
    }

    /** @type {CharacterRegistry} */
    const registry = getCharacterRegistry();

    return registry.templates[characterId] || null;
}

/**
 * Creates a character instance from a template
 * 
 * @param {string} characterId - Character identifier
 * @param {CharacterCreationOptions} [options={}] - Creation options
 * 
 * @returns {Fighter} Character instance ready for battle
 * 
 * @throws {TypeError} When parameters are invalid
 * @throws {Error} When character template is not found
 * @throws {Error} When character creation fails
 * 
 * @example
 * // Create Aang for battle
 * const aang = createCharacter('aang', {
 *   level: 10,
 *   statModifiers: { speed: 10 }
 * });
 * 
 * @since 2.0.0
 * @public
 */
export function createCharacter(characterId, options = {}) {
    // Input validation
    if (typeof characterId !== 'string' || !characterId.trim()) {
        throw new TypeError('createCharacter: characterId must be a non-empty string');
    }

    if (typeof options !== 'object' || options === null) {
        throw new TypeError('createCharacter: options must be an object');
    }

    console.debug(`[Character Data] Creating character: ${characterId}`);

    try {
        // Get character template
        /** @type {CharacterTemplate | null} */
        const template = getCharacterTemplate(characterId);

        if (!template) {
            throw new Error(`Character template not found: ${characterId}`);
        }

        // Validate creation options
        validateCreationOptions(options);

        // Build character instance
        /** @type {Fighter} */
        const character = buildCharacterFromTemplate(template, options);

        // Apply post-creation processing
        applyCharacterPostProcessing(character, template, options);

        console.debug(`[Character Data] Created character: ${character.name} (ID: ${character.id})`);

        return character;

    } catch (error) {
        console.error(`[Character Data] Error creating character ${characterId}:`, error);
        throw new Error(`Character creation failed: ${error.message}`);
    }
}

/**
 * Gets all available character IDs
 * 
 * @returns {string[]} Array of character IDs
 * 
 * @example
 * // Get all character options
 * const characterIds = getAllCharacterIds();
 * console.log(`Available characters: ${characterIds.join(', ')}`);
 * 
 * @since 2.0.0
 * @public
 */
export function getAllCharacterIds() {
    /** @type {CharacterRegistry} */
    const registry = getCharacterRegistry();
    
    return [...registry.availableIds]; // Return copy to prevent mutation
}

/**
 * Gets character IDs by element type
 * 
 * @param {ElementType} element - Element type to filter by
 * 
 * @returns {string[]} Character IDs with the specified element
 * 
 * @throws {TypeError} When element is invalid
 * 
 * @example
 * // Get all fire benders
 * const fireBenders = getCharactersByElement('fire');
 * 
 * @since 2.0.0
 * @public
 */
export function getCharactersByElement(element) {
    if (typeof element !== 'string' || !VALID_ELEMENTS.includes(element)) {
        throw new TypeError(`getCharactersByElement: element must be one of: ${VALID_ELEMENTS.join(', ')}`);
    }

    /** @type {CharacterRegistry} */
    const registry = getCharacterRegistry();

    return [...(registry.byElement[element] || [])]; // Return copy
}

/**
 * Gets character IDs by nation
 * 
 * @param {string} nation - Nation to filter by
 * 
 * @returns {string[]} Character IDs from the specified nation
 * 
 * @throws {TypeError} When nation is invalid
 * 
 * @example
 * // Get all Water Tribe characters
 * const waterTribeChars = getCharactersByNation('water_tribe');
 * 
 * @since 2.0.0
 * @public
 */
export function getCharactersByNation(nation) {
    if (typeof nation !== 'string' || !VALID_NATIONS.includes(nation)) {
        throw new TypeError(`getCharactersByNation: nation must be one of: ${VALID_NATIONS.join(', ')}`);
    }

    /** @type {CharacterRegistry} */
    const registry = getCharacterRegistry();

    return [...(registry.byNation[nation] || [])]; // Return copy
}

/**
 * Validates if a character ID exists
 * 
 * @param {string} characterId - Character ID to validate
 * 
 * @returns {boolean} True if character exists
 * 
 * @throws {TypeError} When characterId is invalid
 * 
 * @example
 * // Check if character exists
 * if (isValidCharacter('aang')) {
 *   const aang = createCharacter('aang');
 * }
 * 
 * @since 2.0.0
 * @public
 */
export function isValidCharacter(characterId) {
    if (typeof characterId !== 'string') {
        throw new TypeError('isValidCharacter: characterId must be a string');
    }

    /** @type {CharacterRegistry} */
    const registry = getCharacterRegistry();

    return registry.availableIds.includes(characterId);
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates character definitions for registry
 * 
 * @param {Object<string, CharacterTemplate>} characters - Character definitions
 * 
 * @returns {void}
 * 
 * @throws {Error} When character definitions are invalid
 * 
 * @private
 * @since 2.0.0
 */
function validateCharacterDefinitions(characters) {
    if (!characters || typeof characters !== 'object') {
        throw new Error('validateCharacterDefinitions: characters must be an object');
    }

    /** @type {string[]} */
    const characterIds = Object.keys(characters);

    if (characterIds.length === 0) {
        throw new Error('validateCharacterDefinitions: no characters provided');
    }

    for (const [id, character] of Object.entries(characters)) {
        try {
            validateCharacterTemplate(character, id);
        } catch (error) {
            throw new Error(`Character '${id}' validation failed: ${error.message}`);
        }
    }

    console.debug(`[Character Data] Validated ${characterIds.length} character definitions`);
}

/**
 * Validates a single character template
 * 
 * @param {CharacterTemplate} template - Character template to validate
 * @param {string} expectedId - Expected character ID
 * 
 * @returns {void}
 * 
 * @throws {Error} When template is invalid
 * 
 * @private
 * @since 2.0.0
 */
function validateCharacterTemplate(template, expectedId) {
    if (!template || typeof template !== 'object') {
        throw new Error('Template must be an object');
    }

    // Validate required fields
    if (!template.id || typeof template.id !== 'string') {
        throw new Error('Template must have a valid id string');
    }

    if (template.id !== expectedId) {
        throw new Error(`Template id '${template.id}' does not match expected '${expectedId}'`);
    }

    if (!template.name || typeof template.name !== 'string') {
        throw new Error('Template must have a valid name string');
    }

    if (!template.element || !VALID_ELEMENTS.includes(template.element)) {
        throw new Error(`Template must have a valid element: ${VALID_ELEMENTS.join(', ')}`);
    }

    // Validate base stats
    if (!template.baseStats || typeof template.baseStats !== 'object') {
        throw new Error('Template must have baseStats object');
    }

    validateCharacterStats(template.baseStats);

    // Validate move IDs
    if (!Array.isArray(template.moveIds)) {
        throw new Error('Template must have moveIds array');
    }

    if (template.moveIds.length === 0) {
        throw new Error('Template must have at least one move');
    }

    for (let i = 0; i < template.moveIds.length; i++) {
        if (typeof template.moveIds[i] !== 'string' || !template.moveIds[i].trim()) {
            throw new Error(`moveIds[${i}] must be a non-empty string`);
        }
    }

    // Validate personality (optional)
    if (template.personality) {
        validateAiPersonality(template.personality);
    }
}

/**
 * Validates character statistics
 * 
 * @param {CharacterStats} stats - Character stats to validate
 * 
 * @returns {void}
 * 
 * @throws {Error} When stats are invalid
 * 
 * @private
 * @since 2.0.0
 */
function validateCharacterStats(stats) {
    if (!stats || typeof stats !== 'object') {
        throw new Error('Stats must be an object');
    }

    /** @type {(keyof CharacterStats)[]} */
    const requiredStats = ['health', 'energy', 'attack', 'defense', 'speed'];

    for (const stat of requiredStats) {
        if (typeof stats[stat] !== 'number' || stats[stat] < 0) {
            throw new Error(`${stat} must be a non-negative number`);
        }
    }

    // Optional stats validation
    if (stats.accuracy !== undefined) {
        if (typeof stats.accuracy !== 'number' || stats.accuracy < 0 || stats.accuracy > 100) {
            throw new Error('accuracy must be a number between 0 and 100');
        }
    }

    if (stats.evasion !== undefined) {
        if (typeof stats.evasion !== 'number' || stats.evasion < 0 || stats.evasion > 100) {
            throw new Error('evasion must be a number between 0 and 100');
        }
    }
}

/**
 * Validates AI personality configuration
 * 
 * @param {AiPersonality} personality - Personality to validate
 * 
 * @returns {void}
 * 
 * @throws {Error} When personality is invalid
 * 
 * @private
 * @since 2.0.0
 */
function validateAiPersonality(personality) {
    if (!personality || typeof personality !== 'object') {
        throw new Error('Personality must be an object');
    }

    /** @type {(keyof AiPersonality)[]} */
    const personalityTraits = ['aggression', 'caution', 'creativity', 'adaptability'];

    for (const trait of personalityTraits) {
        if (personality[trait] !== undefined) {
            if (typeof personality[trait] !== 'number' || 
                personality[trait] < 0 || 
                personality[trait] > 1) {
                throw new Error(`${trait} must be a number between 0 and 1`);
            }
        }
    }
}

/**
 * Validates character creation options
 * 
 * @param {CharacterCreationOptions} options - Options to validate
 * 
 * @returns {void}
 * 
 * @throws {TypeError} When options are invalid
 * 
 * @private
 * @since 2.0.0
 */
function validateCreationOptions(options) {
    if (options.level !== undefined) {
        if (typeof options.level !== 'number' || 
            options.level < 1 || 
            options.level > MAX_CHARACTER_LEVEL) {
            throw new TypeError(`level must be a number between 1 and ${MAX_CHARACTER_LEVEL}`);
        }
    }

    if (options.statModifiers !== undefined) {
        if (typeof options.statModifiers !== 'object' || options.statModifiers === null) {
            throw new TypeError('statModifiers must be an object');
        }

        for (const [stat, modifier] of Object.entries(options.statModifiers)) {
            if (typeof modifier !== 'number') {
                throw new TypeError(`statModifiers.${stat} must be a number`);
            }
        }
    }

    if (options.includeAllMoves !== undefined && typeof options.includeAllMoves !== 'boolean') {
        throw new TypeError('includeAllMoves must be a boolean');
    }

    if (options.enableDebug !== undefined && typeof options.enableDebug !== 'boolean') {
        throw new TypeError('enableDebug must be a boolean');
    }
}

// ============================================================================
// CHARACTER BUILDING FUNCTIONS
// ============================================================================

/**
 * Builds a character instance from a template
 * 
 * @param {CharacterTemplate} template - Character template
 * @param {CharacterCreationOptions} options - Creation options
 * 
 * @returns {Fighter} Character instance
 * 
 * @private
 * @since 2.0.0
 */
function buildCharacterFromTemplate(template, options) {
    /** @type {number} */
    const level = options.level || DEFAULT_CHARACTER_LEVEL;

    // Calculate scaled stats
    /** @type {CharacterStats} */
    const scaledStats = calculateScaledStats(template.baseStats, level);

    // Apply stat modifiers
    /** @type {CharacterStats} */
    const finalStats = applyStatModifiers(scaledStats, options.statModifiers || {});

    // Build move list
    /** @type {Move[]} */
    const moves = buildCharacterMoves(template.moveIds, options);

    // Generate unique instance ID
    /** @type {string} */
    const instanceId = `${template.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    /** @type {Fighter} */
    const character = {
        id: instanceId,
        templateId: template.id,
        name: template.name,
        title: template.title || '',
        element: template.element,
        
        // Core battle stats
        health: finalStats.health,
        maxHealth: finalStats.health,
        energy: finalStats.energy,
        maxEnergy: finalStats.energy,
        
        // Combat stats
        attack: finalStats.attack,
        defense: finalStats.defense,
        speed: finalStats.speed,
        accuracy: finalStats.accuracy || DEFAULT_BASE_STATS.accuracy,
        evasion: finalStats.evasion || DEFAULT_BASE_STATS.evasion,
        
        // Battle state
        incapacitationScore: 0,
        statusEffects: [],
        moves,
        moveCooldowns: {},
        
        // Personality and AI
        personality: template.personality || createDefaultPersonality(),
        
        // Metadata
        level,
        image: CHARACTER_IMAGE_PATHS[template.id] || null,
        description: template.description || '',
        
        // Initialize dynamic battle properties
        momentum: 0,
        escalationState: 'Normal',
        energyRegenBonus: 0,
        speedBonus: 0
    };

    return character;
}

/**
 * Calculates scaled stats based on character level
 * 
 * @param {CharacterStats} baseStats - Base character stats
 * @param {number} level - Character level
 * 
 * @returns {CharacterStats} Scaled stats
 * 
 * @private
 * @since 2.0.0
 */
function calculateScaledStats(baseStats, level) {
    /** @type {number} */
    const scalingFactor = 1 + ((level - 1) * 0.05); // 5% per level

    /** @type {CharacterStats} */
    const scaledStats = {};

    for (const [stat, value] of Object.entries(baseStats)) {
        if (typeof value === 'number') {
            scaledStats[stat] = Math.floor(value * scalingFactor);
        } else {
            scaledStats[stat] = value;
        }
    }

    return scaledStats;
}

/**
 * Applies stat modifiers to character stats
 * 
 * @param {CharacterStats} baseStats - Base stats
 * @param {Object<string, number>} modifiers - Stat modifiers
 * 
 * @returns {CharacterStats} Modified stats
 * 
 * @private
 * @since 2.0.0
 */
function applyStatModifiers(baseStats, modifiers) {
    /** @type {CharacterStats} */
    const modifiedStats = { ...baseStats };

    for (const [stat, modifier] of Object.entries(modifiers)) {
        if (modifiedStats[stat] !== undefined && typeof modifiedStats[stat] === 'number') {
            modifiedStats[stat] = Math.max(0, modifiedStats[stat] + modifier);
        }
    }

    return modifiedStats;
}

/**
 * Builds character move list from move IDs
 * 
 * @param {string[]} moveIds - Move identifiers
 * @param {CharacterCreationOptions} options - Creation options
 * 
 * @returns {Move[]} Character moves
 * 
 * @private
 * @since 2.0.0
 */
function buildCharacterMoves(moveIds, options) {
    /** @type {Move[]} */
    const moves = [];

    // This would integrate with a move registry system
    // For now, return placeholder moves
    for (const moveId of moveIds) {
        /** @type {Move} */
        const move = createPlaceholderMove(moveId);
        moves.push(move);
    }

    return moves;
}

/**
 * Creates a placeholder move for development
 * 
 * @param {string} moveId - Move identifier
 * 
 * @returns {Move} Placeholder move
 * 
 * @private
 * @since 2.0.0
 */
function createPlaceholderMove(moveId) {
    /** @type {Move} */
    const move = {
        id: moveId,
        name: moveId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        type: 'offensive',
        element: 'physical',
        damage: 25,
        energyCost: 15,
        accuracy: 0.85,
        criticalChance: 0.1,
        description: `Placeholder move: ${moveId}`
    };

    return move;
}

/**
 * Creates default AI personality
 * 
 * @returns {AiPersonality} Default personality
 * 
 * @private
 * @since 2.0.0
 */
function createDefaultPersonality() {
    /** @type {AiPersonality} */
    const personality = {
        aggression: 0.5,
        caution: 0.5,
        creativity: 0.5,
        adaptability: 0.5
    };

    return personality;
}

/**
 * Applies post-creation processing to character
 * 
 * @param {Fighter} character - Character instance
 * @param {CharacterTemplate} template - Original template
 * @param {CharacterCreationOptions} options - Creation options
 * 
 * @returns {void}
 * 
 * @private
 * @since 2.0.0
 */
function applyCharacterPostProcessing(character, template, options) {
    // Apply any special abilities from template
    if (template.abilities) {
        applyCharacterAbilities(character, template.abilities);
    }

    // Initialize any debug features if enabled
    if (options.enableDebug) {
        character.debug = {
            created: new Date().toISOString(),
            template: template.id,
            options: { ...options }
        };
    }
}

/**
 * Applies special abilities to character
 * 
 * @param {Fighter} character - Character instance
 * @param {Object<string, any>} abilities - Abilities to apply
 * 
 * @returns {void}
 * 
 * @private
 * @since 2.0.0
 */
function applyCharacterAbilities(character, abilities) {
    // Placeholder for ability system integration
    character.abilities = { ...abilities };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Groups characters by element type
 * 
 * @param {Object<string, CharacterTemplate>} characters - Character templates
 * 
 * @returns {Object<string, string[]>} Characters grouped by element
 * 
 * @private
 * @since 2.0.0
 */
function groupCharactersByElement(characters) {
    /** @type {Object<string, string[]>} */
    const grouped = {};

    for (const element of VALID_ELEMENTS) {
        grouped[element] = [];
    }

    for (const [id, character] of Object.entries(characters)) {
        if (character.element && grouped[character.element]) {
            grouped[character.element].push(id);
        }
    }

    return grouped;
}

/**
 * Groups characters by nation
 * 
 * @param {Object<string, CharacterTemplate>} characters - Character templates
 * 
 * @returns {Object<string, string[]>} Characters grouped by nation
 * 
 * @private
 * @since 2.0.0
 */
function groupCharactersByNation(characters) {
    /** @type {Object<string, string[]>} */
    const grouped = {};

    for (const nation of VALID_NATIONS) {
        grouped[nation] = [];
    }

    for (const [id, character] of Object.entries(characters)) {
        // Infer nation from character ID or other properties
        /** @type {string | null} */
        const inferredNation = inferCharacterNation(character);
        
        if (inferredNation && grouped[inferredNation]) {
            grouped[inferredNation].push(id);
        }
    }

    return grouped;
}

/**
 * Infers a character's nation from their properties
 * 
 * @param {CharacterTemplate} character - Character template
 * 
 * @returns {string | null} Inferred nation or null
 * 
 * @private
 * @since 2.0.0
 */
function inferCharacterNation(character) {
    // Simple inference based on element and name patterns
    switch (character.element) {
        case 'fire':
            return 'fire_nation';
        case 'water':
            return 'water_tribe';
        case 'earth':
            return 'earth_kingdom';
        case 'air':
            return 'air_nomads';
        case 'spirit':
            return 'spirit_world';
        default:
            return null;
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
    initializeCharacterRegistry,
    getCharacterRegistry,
    getCharacterTemplate,
    createCharacter,
    getAllCharacterIds,
    getCharactersByElement,
    getCharactersByNation,
    isValidCharacter
};
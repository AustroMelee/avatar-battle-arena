"use strict";

/**
 * @fileoverview Character-related Type Definitions
 * @description Defines data structures for characters, stats, and personalities.
 */

/**
 * @typedef {'fire' | 'water' | 'earth' | 'air' | 'spirit' | 'physical'} ElementType
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
 * @property {import('./ai.js').AiPersonality} personality - AI personality configuration
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

export {}; 
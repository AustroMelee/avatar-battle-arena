/**
 * @fileoverview Type definitions for the character selection component.
 */

"use strict";

/**
 * @typedef {import('../../types/character.js').CharacterTemplate} CharacterTemplate
 */

/**
 * @typedef {Object} CharacterSelectionState
 * @property {string | null} fighter1Id
 * @property {string | null} fighter2Id
 * @property {boolean} isReady
 */

/**
 * @typedef {Object} SelectionElements
 * @property {HTMLElement | null} fighter1Grid
 * @property {HTMLElement | null} fighter2Grid
 * @property {HTMLElement | null} fighter1NameDisplay
 * @property {HTMLElement | null} fighter2NameDisplay
 * @property {HTMLInputElement | null} fighter1Select
 * @property {HTMLInputElement | null} fighter2Select
 */

/**
 * @typedef {Object} CharacterCardConfig
 * @property {CharacterTemplate} character
 * @property {string} fighterKey
 * @property {boolean} [enableAccessibility]
 * @property {boolean} [enableLazyLoading]
 */

/**
 * @typedef {'card-fire' | 'card-water' | 'card-earth' | 'card-air' | 'card-chi' | 'card-nonbender'} ElementClass
 */

/**
 * @callback SelectionChangeCallback
 * @param {CharacterSelectionState} state
 */

export {}; 
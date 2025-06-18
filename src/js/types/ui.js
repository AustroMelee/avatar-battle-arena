"use strict";

/**
 * @fileoverview UI Type Definitions
 * @description Defines the data structures for the user interface, including state, rendering, and animation.
 */

// ============================================================================
// UI AND RENDERING TYPES
// ============================================================================

/**
 * @typedef {Object} UIState
 * @description Complete UI state
 * @property {string} currentScreen - Current screen identifier
 * @property {SelectionState} selection - Current selections
 * @property {boolean} needsUpdate - Whether UI needs re-render
 */

/**
 * @typedef {Object} SelectionState
 * @description User selection state
 * @property {string} [fighter1Id] - Selected first fighter
 * @property {string} [fighter2Id] - Selected second fighter
 * @property {string} [locationId] - Selected location
 */

/**
 * @typedef {Object} AnimationState
 * @description Animation system state
 * @property {AnimationQueueItem[]} queue - Animation queue
 * @property {boolean} isPlaying - Whether animations are playing
 */

/**
 * @typedef {Object} AnimationQueueItem
 * @description Single animation queue item
 * @property {string} type - Animation type
 * @property {string} text - Animation text
 * @property {number} duration - Animation duration in ms
 */

/**
 * @typedef {Object} InteractionState
 * @description User interaction state
 * @property {boolean} isInteracting - Whether user is currently interacting
 * @property {string} [activeElement] - Currently active UI element
 */

/**
 * @typedef {Object} UIConfig
 * @description UI configuration options
 * @property {boolean} enableAnimations - Whether to enable animations
 * @property {string} theme - UI theme ('light', 'dark', 'avatar')
 */

/**
 * @typedef {Object} ComponentState
 * @description Individual UI component state
 * @property {boolean} visible - Whether component is visible
 * @property {boolean} enabled - Whether component is enabled for interaction
 * @property {boolean} loading - Whether component is in loading state
 */

export {}; 
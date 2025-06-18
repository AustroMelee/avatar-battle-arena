/**
 * @fileoverview Manages the state for the replay UI.
 */

"use strict";

const state = {
    overlayVisible: false,
    /** @type {string | null} */
    currentReplayId: null,
    replayProgress: 0,
    totalSteps: 0,
};

export function getReplayState() {
    return state;
}

/**
 * @param {Partial<typeof state>} newState
 */
export function setReplayState(newState) {
    Object.assign(state, newState);
} 
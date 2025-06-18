/**
 * @fileoverview Main entry point for the Replay System UI.
 * @description Initializes and orchestrates the different components of the replay UI.
 */

"use strict";

import { createReplayOverlay, showOverlay as showReplayOverlay } from "./ui/replay/dom.js";
import { attachAllEventListeners } from "./ui/replay/events.js";
import { updateSnapshotList } from "./ui/replay/snapshots.js";

/**
 * Initializes the entire replay control system.
 */
export function initializeReplayControls() {
    createReplayOverlay();
    attachAllEventListeners();
    console.log("[Replay UI] Replay controls initialized");
}

/**
 * Shows the replay system overlay.
 */
export function showReplaySystem() {
    updateSnapshotList();
    showReplayOverlay();
}

//# sourceURL=ui_replay_controls.js 
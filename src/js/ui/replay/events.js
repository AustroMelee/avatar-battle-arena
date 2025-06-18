/**
 * @fileoverview Manages event listeners for the replay UI.
 */

"use strict";

import { hideOverlay, switchTab } from "./dom.js";
import { createCurrentSnapshot, importSnapshotFile } from "./snapshots.js";
import { startReplay, pauseReplay, stopReplay } from "./playback.js"; // Assuming playback is modularized
import { analyzeSelectedSnapshot } from "./analysis.js";
import { getReplayState } from "./state.js";

/**
 * Attaches all event listeners for the replay UI.
 */
export function attachAllEventListeners() {
    const overlay = document.getElementById("replay-system-overlay");
    if (!overlay) return;

    // Main controls
    overlay.querySelector(".replay-close-btn")?.addEventListener("click", hideOverlay);
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && getReplayState().overlayVisible) {
            hideOverlay();
        }
    });

    // Tabs
    overlay.querySelectorAll(".replay-tab").forEach(tab => {
        tab.addEventListener("click", (e) => switchTab(/** @type {HTMLElement} */ (e.currentTarget).dataset.tab));
    });

    // Snapshot controls
    document.getElementById("create-snapshot-btn")?.addEventListener("click", createCurrentSnapshot);
    document.getElementById("import-snapshot-btn")?.addEventListener("click", () => /** @type {HTMLInputElement} */ (document.getElementById("snapshot-file-input"))?.click());
    document.getElementById("snapshot-file-input")?.addEventListener("change", (e) => {
        const input = /** @type {HTMLInputElement} */ (e.target);
        if (input.files && input.files.length > 0) {
            importSnapshotFile(input.files[0]);
        }
    });

    // Replay controls
    document.getElementById("start-replay-btn")?.addEventListener("click", startReplay);
    document.getElementById("pause-replay-btn")?.addEventListener("click", pauseReplay);
    document.getElementById("stop-replay-btn")?.addEventListener("click", stopReplay);

    // Analysis controls
    document.getElementById("analyze-snapshot-btn")?.addEventListener("click", analyzeSelectedSnapshot);
} 
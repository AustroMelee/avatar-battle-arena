/**
 * @fileoverview Manages the DOM for the replay UI.
 */

"use strict";

import { setReplayState } from "./state.js";

/** @type {HTMLElement | null} */
let overlay = null;

/**
 * Creates the replay overlay HTML structure.
 */
export function createReplayOverlay() {
    if (document.getElementById("replay-system-overlay")) {
        overlay = document.getElementById("replay-system-overlay");
        return;
    }

    overlay = document.createElement("div");
    overlay.id = "replay-system-overlay";
    overlay.className = "replay-overlay hidden";
    
    overlay.innerHTML = `
        <div class="replay-overlay-content">
            <header class="replay-overlay-header">
                <h2>🛰️ Battle Replay System</h2>
                <button class="replay-close-btn" aria-label="Close replay system">✕</button>
            </header>
            <div class="replay-tabs">
                <button class="replay-tab active" data-tab="snapshots">📷 Snapshots</button>
                <button class="replay-tab" data-tab="replay">▶️ Replay</button>
                <button class="replay-tab" data-tab="analysis">📊 Analysis</button>
            </div>
            <div class="replay-tab-content active" data-tab="snapshots">
                <div class="snapshot-controls">
                    <button class="btn btn-primary" id="create-snapshot-btn">📷 Create Snapshot</button>
                    <button class="btn btn-secondary" id="import-snapshot-btn">📁 Import Snapshot</button>
                    <input type="file" id="snapshot-file-input" accept=".json" style="display: none;">
                </div>
                <div class="snapshot-list-container">
                    <h3>Available Snapshots</h3>
                    <div class="snapshot-list" id="snapshot-list"></div>
                </div>
            </div>
            <div class="replay-tab-content" data-tab="replay">
                <div class="replay-controls">
                    <div class="replay-status"><span id="replay-status-text">No replay active</span></div>
                    <div class="replay-progress">
                        <div class="progress-bar"><div class="progress-fill" id="replay-progress-fill"></div></div>
                        <span class="progress-text" id="replay-progress-text">0 / 0</span>
                    </div>
                    <div class="replay-buttons">
                        <button class="btn btn-success" id="start-replay-btn" disabled>▶️ Start</button>
                        <button class="btn btn-warning" id="pause-replay-btn" disabled>⏸️ Pause</button>
                        <button class="btn btn-danger" id="stop-replay-btn" disabled>⏹️ Stop</button>
                    </div>
                </div>
                <div class="replay-visualization">
                    <h3>Replay Log</h3>
                    <div class="replay-log" id="replay-log"></div>
                </div>
            </div>
            <div class="replay-tab-content" data-tab="analysis">
                <div class="analysis-controls"><button class="btn btn-info" id="analyze-snapshot-btn">🔍 Analyze</button></div>
                <div class="analysis-results" id="analysis-results"><p>Select a snapshot and click "Analyze".</p></div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
}

/**
 * @returns {HTMLElement} The overlay element.
 */
export function getOverlay() {
    return overlay;
}

/**
 * Shows the replay overlay.
 */
export function showOverlay() {
    if (!overlay) createReplayOverlay();
    overlay.classList.remove("hidden");
    setReplayState({ overlayVisible: true });
    document.body.style.overflow = "hidden";
}

/**
 * Hides the replay overlay.
 */
export function hideOverlay() {
    if (overlay) {
        overlay.classList.add("hidden");
        setReplayState({ overlayVisible: false });
        document.body.style.overflow = "";
    }
}

/**
 * Switches between tabs in the overlay.
 * @param {string} tabName - Name of tab to switch to.
 */
export function switchTab(tabName) {
    if (!overlay) return;
    overlay.querySelectorAll(".replay-tab").forEach(/** @param {Element} tab */ tab => {
        tab.classList.toggle("active", tab.getAttribute("data-tab") === tabName);
    });
    overlay.querySelectorAll(".replay-tab-content").forEach(/** @param {Element} content */ content => {
        content.classList.toggle("active", content.getAttribute("data-tab") === tabName);
    });
} 
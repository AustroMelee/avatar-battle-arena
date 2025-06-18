/**
 * @fileoverview Manages snapshot functionality for the replay UI.
 */

"use strict";

import { replaySystem } from "../../utils_deterministic_replay.js";
import { showNotification } from "./notifications.js"; // Assuming notifications are also modularized
import { selectSnapshotForReplay } from "./playback.js";

/**
 * @typedef {import('../../utils_deterministic_replay.js').BattleSnapshot} BattleSnapshot
 */

/**
 * Updates the list of available snapshots in the UI.
 */
export function updateSnapshotList() {
    const snapshots = /** @type {BattleSnapshot[]} */ (replaySystem.getAllSnapshots());
    const listContainer = document.getElementById("snapshot-list");
    
    if (!listContainer) return;

    if (snapshots.length === 0) {
        listContainer.innerHTML = "<p class=\"empty-state\">No snapshots available.</p>";
        return;
    }

    listContainer.innerHTML = snapshots.map(snapshot => `
        <div class="snapshot-item" data-snapshot-id="${snapshot.id}">
            <div class="snapshot-header">
                <h4>${snapshot.id}</h4>
                <div class="snapshot-actions">
                    <button class="btn btn-sm btn-primary replay-snapshot-btn" data-snapshot-id="${snapshot.id}">▶️ Replay</button>
                    <button class="btn btn-sm btn-secondary export-snapshot-btn" data-snapshot-id="${snapshot.id}">💾 Export</button>
                    <button class="btn btn-sm btn-danger delete-snapshot-btn" data-snapshot-id="${snapshot.id}">🗑️ Delete</button>
                </div>
            </div>
            <div class="snapshot-metadata">
                <span>Turn: ${snapshot.turn}</span>
                <span>Created: ${new Date(snapshot.timestamp).toLocaleString()}</span>
                <span>Location: ${snapshot.metadata.location || "Unknown"}</span>
            </div>
        </div>
    `).join("");

    attachSnapshotActionListeners();
}

/**
 * Attaches event listeners to snapshot action buttons.
 */
function attachSnapshotActionListeners() {
    const listContainer = document.getElementById("snapshot-list");
    if (!listContainer) return;

    listContainer.querySelectorAll(".replay-snapshot-btn").forEach(btn => 
        btn.addEventListener("click", (e) => selectSnapshotForReplay(/** @type {HTMLElement} */ (e.currentTarget).dataset.snapshotId))
    );
    listContainer.querySelectorAll(".export-snapshot-btn").forEach(btn =>
        btn.addEventListener("click", (e) => exportSnapshot(/** @type {HTMLElement} */ (e.currentTarget).dataset.snapshotId))
    );
    listContainer.querySelectorAll(".delete-snapshot-btn").forEach(btn =>
        btn.addEventListener("click", (e) => deleteSnapshot(/** @type {HTMLElement} */ (e.currentTarget).dataset.snapshotId))
    );
}

/**
 * Creates a snapshot of the current battle state.
 */
export function createCurrentSnapshot() {
    try {
        // This needs integration with the main battle state
        const dummyBattleState = { turn: 0, phaseState: {}, fighters: {} };
        const snapshot = replaySystem.snapshotBattleState(dummyBattleState, 0, { location: "Test" });
        updateSnapshotList();
        showNotification(`Snapshot created: ${snapshot.id}`, "success");
    } catch (error) {
        showNotification(`Failed to create snapshot: ${error.message}`, "error");
    }
}

/**
 * Imports a snapshot from a file.
 * @param {File} file - The snapshot file.
 */
export async function importSnapshotFile(file) {
    try {
        const text = await file.text();
        const snapshotId = replaySystem.importSnapshot(text);
        updateSnapshotList();
        showNotification(`Snapshot imported: ${snapshotId}`, "success");
    } catch (error) {
        showNotification(`Failed to import snapshot: ${error.message}`, "error");
    }
}

/**
 * Exports a snapshot as a JSON file.
 * @param {string} snapshotId - The ID of the snapshot to export.
 */
export function exportSnapshot(snapshotId) {
    try {
        const jsonData = replaySystem.exportSnapshot(snapshotId);
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement("a");
        a.href = url;
        a.download = `${snapshotId}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        showNotification(`Snapshot exported: ${snapshotId}`, "success");
    } catch (error) {
        showNotification(`Failed to export snapshot: ${error.message}`, "error");
    }
}

/**
 * Deletes a snapshot.
 * @param {string} snapshotId - The ID of the snapshot to delete.
 */
export function deleteSnapshot(snapshotId) {
    if (confirm(`Are you sure you want to delete snapshot ${snapshotId}?`)) {
        replaySystem.deleteSnapshot(snapshotId);
        updateSnapshotList();
        showNotification(`Snapshot deleted: ${snapshotId}`, "info");
    }
} 
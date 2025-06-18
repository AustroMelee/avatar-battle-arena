/**
 * @fileoverview Replay System UI Controls
 * @description User interface for managing battle snapshots and replay visualization.
 * Provides an overlay for replay-from-snapshot functionality.
 * @version 1.0
 */

'use strict';

//# sourceURL=ui_replay_controls.js

// Import replay system
import { replaySystem, replayFromSnapshot, createBattleSnapshot } from './utils_deterministic_replay.js';

/**
 * Replay Controls UI Manager
 */
class ReplayControlsUI {
    constructor() {
        this.overlayVisible = false;
        this.currentReplayId = null;
        this.replayProgress = 0;
        this.totalSteps = 0;
    }

    /**
     * Initialize replay controls in the UI
     */
    initialize() {
        this.createReplayOverlay();
        this.attachEventListeners();
        this.updateSnapshotList();
        console.log('[Replay UI] Replay controls initialized');
    }

    /**
     * Create the replay overlay HTML structure
     */
    createReplayOverlay() {
        // Create overlay container
        const overlay = document.createElement('div');
        overlay.id = 'replay-system-overlay';
        overlay.className = 'replay-overlay hidden';
        
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
                
                <!-- Snapshots Tab -->
                <div class="replay-tab-content active" data-tab="snapshots">
                    <div class="snapshot-controls">
                        <button class="btn btn-primary" id="create-snapshot-btn">
                            📷 Create Snapshot
                        </button>
                        <button class="btn btn-secondary" id="import-snapshot-btn">
                            📁 Import Snapshot
                        </button>
                        <input type="file" id="snapshot-file-input" accept=".json" style="display: none;">
                    </div>
                    
                    <div class="snapshot-list-container">
                        <h3>Available Snapshots</h3>
                        <div class="snapshot-list" id="snapshot-list">
                            <!-- Dynamically populated -->
                        </div>
                    </div>
                </div>
                
                <!-- Replay Tab -->
                <div class="replay-tab-content" data-tab="replay">
                    <div class="replay-controls">
                        <div class="replay-status">
                            <span id="replay-status-text">No replay active</span>
                        </div>
                        
                        <div class="replay-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" id="replay-progress-fill"></div>
                            </div>
                            <span class="progress-text" id="replay-progress-text">0 / 0</span>
                        </div>
                        
                        <div class="replay-buttons">
                            <button class="btn btn-success" id="start-replay-btn" disabled>
                                ▶️ Start Replay
                            </button>
                            <button class="btn btn-warning" id="pause-replay-btn" disabled>
                                ⏸️ Pause
                            </button>
                            <button class="btn btn-danger" id="stop-replay-btn" disabled>
                                ⏹️ Stop
                            </button>
                        </div>
                    </div>
                    
                    <div class="replay-visualization">
                        <h3>Replay Log</h3>
                        <div class="replay-log" id="replay-log">
                            <!-- Replay steps appear here -->
                        </div>
                    </div>
                </div>
                
                <!-- Analysis Tab -->
                <div class="replay-tab-content" data-tab="analysis">
                    <div class="analysis-controls">
                        <button class="btn btn-info" id="analyze-snapshot-btn">
                            🔍 Analyze Selected Snapshot
                        </button>
                    </div>
                    
                    <div class="analysis-results" id="analysis-results">
                        <p>Select a snapshot and click "Analyze" to see detailed statistics.</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        this.overlay = overlay;
    }

    /**
     * Attach event listeners to replay controls
     */
    attachEventListeners() {
        // Close overlay
        this.overlay.querySelector('.replay-close-btn').addEventListener('click', () => {
            this.hideOverlay();
        });

        // Tab switching
        this.overlay.querySelectorAll('.replay-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Snapshot controls
        document.getElementById('create-snapshot-btn').addEventListener('click', () => {
            this.createCurrentSnapshot();
        });

        document.getElementById('import-snapshot-btn').addEventListener('click', () => {
            document.getElementById('snapshot-file-input').click();
        });

        document.getElementById('snapshot-file-input').addEventListener('change', (e) => {
            this.importSnapshotFile(e.target.files[0]);
        });

        // Replay controls
        document.getElementById('start-replay-btn').addEventListener('click', () => {
            this.startReplay();
        });

        document.getElementById('pause-replay-btn').addEventListener('click', () => {
            this.pauseReplay();
        });

        document.getElementById('stop-replay-btn').addEventListener('click', () => {
            this.stopReplay();
        });

        // Analysis controls
        document.getElementById('analyze-snapshot-btn').addEventListener('click', () => {
            this.analyzeSelectedSnapshot();
        });

        // Escape key to close overlay
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlayVisible) {
                this.hideOverlay();
            }
        });
    }

    /**
     * Show the replay overlay
     */
    showOverlay() {
        this.overlay.classList.remove('hidden');
        this.overlayVisible = true;
        this.updateSnapshotList();
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    /**
     * Hide the replay overlay
     */
    hideOverlay() {
        this.overlay.classList.add('hidden');
        this.overlayVisible = false;
        document.body.style.overflow = ''; // Restore scrolling
    }

    /**
     * Switch between tabs in the overlay
     * @param {string} tabName - Name of tab to switch to
     */
    switchTab(tabName) {
        // Update tab buttons
        this.overlay.querySelectorAll('.replay-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update tab content
        this.overlay.querySelectorAll('.replay-tab-content').forEach(content => {
            content.classList.toggle('active', content.dataset.tab === tabName);
        });
    }

    /**
     * Update the list of available snapshots
     */
    updateSnapshotList() {
        const snapshots = replaySystem.getAllSnapshots();
        const listContainer = document.getElementById('snapshot-list');
        
        if (snapshots.length === 0) {
            listContainer.innerHTML = '<p class="empty-state">No snapshots available. Create one during a battle!</p>';
            return;
        }

        listContainer.innerHTML = snapshots.map(snapshot => `
            <div class="snapshot-item" data-snapshot-id="${snapshot.id}">
                <div class="snapshot-header">
                    <h4>${snapshot.id}</h4>
                    <div class="snapshot-actions">
                        <button class="btn btn-sm btn-primary replay-snapshot-btn" 
                                data-snapshot-id="${snapshot.id}">
                            ▶️ Replay
                        </button>
                        <button class="btn btn-sm btn-secondary export-snapshot-btn" 
                                data-snapshot-id="${snapshot.id}">
                            💾 Export
                        </button>
                        <button class="btn btn-sm btn-danger delete-snapshot-btn" 
                                data-snapshot-id="${snapshot.id}">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
                <div class="snapshot-metadata">
                    <span>Turn: ${snapshot.turn}</span>
                    <span>Created: ${new Date(snapshot.timestamp).toLocaleString()}</span>
                    <span>Location: ${snapshot.metadata.location || 'Unknown'}</span>
                </div>
            </div>
        `).join('');

        // Attach listeners to snapshot actions
        listContainer.querySelectorAll('.replay-snapshot-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectSnapshotForReplay(e.target.dataset.snapshotId);
            });
        });

        listContainer.querySelectorAll('.export-snapshot-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.exportSnapshot(e.target.dataset.snapshotId);
            });
        });

        listContainer.querySelectorAll('.delete-snapshot-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.deleteSnapshot(e.target.dataset.snapshotId);
            });
        });
    }

    /**
     * Create a snapshot of the current battle state
     */
    createCurrentSnapshot() {
        try {
            // This would need to be integrated with the battle system
            // For now, we'll create a dummy snapshot
            const dummyBattleState = {
                fighter1: { hp: 80, energy: 60, name: 'Aang' },
                fighter2: { hp: 70, energy: 55, name: 'Azula' },
                turn: 5,
                phaseState: { currentPhase: 'Escalation' }
            };

            const snapshot = replaySystem.snapshotBattleState(dummyBattleState, 5, {
                location: 'Fire Nation Capital',
                fighters: ['Aang', 'Azula']
            });

            this.updateSnapshotList();
            this.showNotification(`Snapshot created: ${snapshot.id}`, 'success');
        } catch (error) {
            this.showNotification(`Failed to create snapshot: ${error.message}`, 'error');
        }
    }

    /**
     * Import a snapshot from a file
     * @param {File} file - Snapshot file
     */
    async importSnapshotFile(file) {
        try {
            const text = await file.text();
            const snapshotId = replaySystem.importSnapshot(text);
            this.updateSnapshotList();
            this.showNotification(`Snapshot imported: ${snapshotId}`, 'success');
        } catch (error) {
            this.showNotification(`Failed to import snapshot: ${error.message}`, 'error');
        }
    }

    /**
     * Export a snapshot as JSON file
     * @param {string} snapshotId - ID of snapshot to export
     */
    exportSnapshot(snapshotId) {
        try {
            const jsonData = replaySystem.exportSnapshot(snapshotId);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${snapshotId}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            this.showNotification(`Snapshot exported: ${snapshotId}`, 'success');
        } catch (error) {
            this.showNotification(`Failed to export snapshot: ${error.message}`, 'error');
        }
    }

    /**
     * Delete a snapshot
     * @param {string} snapshotId - ID of snapshot to delete
     */
    deleteSnapshot(snapshotId) {
        if (confirm(`Are you sure you want to delete snapshot ${snapshotId}?`)) {
            replaySystem.deleteSnapshot(snapshotId);
            this.updateSnapshotList();
            this.showNotification(`Snapshot deleted: ${snapshotId}`, 'info');
        }
    }

    /**
     * Select a snapshot for replay
     * @param {string} snapshotId - ID of snapshot to replay
     */
    selectSnapshotForReplay(snapshotId) {
        this.currentReplayId = snapshotId;
        this.switchTab('replay');
        
        // Enable replay controls
        document.getElementById('start-replay-btn').disabled = false;
        document.getElementById('replay-status-text').textContent = `Ready to replay: ${snapshotId}`;
    }

    /**
     * Start replaying the selected snapshot
     */
    async startReplay() {
        if (!this.currentReplayId) return;

        try {
            // Update UI state
            document.getElementById('start-replay-btn').disabled = true;
            document.getElementById('pause-replay-btn').disabled = false;
            document.getElementById('stop-replay-btn').disabled = false;
            document.getElementById('replay-status-text').textContent = 'Replaying...';

            // Clear previous replay log
            document.getElementById('replay-log').innerHTML = '';

            // Start replay with step callback
            await replayFromSnapshot(this.currentReplayId, (step) => {
                this.updateReplayProgress(step);
            });

            this.showNotification('Replay completed successfully', 'success');
        } catch (error) {
            this.showNotification(`Replay failed: ${error.message}`, 'error');
        } finally {
            // Reset UI state
            document.getElementById('start-replay-btn').disabled = false;
            document.getElementById('pause-replay-btn').disabled = true;
            document.getElementById('stop-replay-btn').disabled = true;
            document.getElementById('replay-status-text').textContent = 'Replay completed';
        }
    }

    /**
     * Update replay progress visualization
     * @param {Object} step - Replay step information
     */
    updateReplayProgress(step) {
        const { step: currentStep, totalSteps, input, state } = step;
        
        // Update progress bar
        const progressPercent = (currentStep / totalSteps) * 100;
        document.getElementById('replay-progress-fill').style.width = `${progressPercent}%`;
        document.getElementById('replay-progress-text').textContent = `${currentStep} / ${totalSteps}`;

        // Add step to replay log
        const logEntry = document.createElement('div');
        logEntry.className = 'replay-log-entry';
        logEntry.innerHTML = `
            <div class="replay-step-header">
                <span class="step-number">Step ${currentStep}</span>
                <span class="step-type">${input.type}</span>
                <span class="step-actor">${input.actorId}</span>
            </div>
            <div class="replay-step-data">
                ${JSON.stringify(input.data, null, 2)}
            </div>
        `;

        document.getElementById('replay-log').appendChild(logEntry);
        logEntry.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Pause the current replay
     */
    pauseReplay() {
        // Implementation would depend on replay system capabilities
        this.showNotification('Replay paused', 'info');
    }

    /**
     * Stop the current replay
     */
    stopReplay() {
        // Implementation would depend on replay system capabilities
        document.getElementById('start-replay-btn').disabled = false;
        document.getElementById('pause-replay-btn').disabled = true;
        document.getElementById('stop-replay-btn').disabled = true;
        document.getElementById('replay-status-text').textContent = 'Replay stopped';
        this.showNotification('Replay stopped', 'info');
    }

    /**
     * Analyze the selected snapshot
     */
    analyzeSelectedSnapshot() {
        if (!this.currentReplayId) {
            this.showNotification('Please select a snapshot first', 'warning');
            return;
        }

        // Get snapshot data
        const snapshots = replaySystem.getAllSnapshots();
        const snapshot = snapshots.find(s => s.id === this.currentReplayId);
        
        if (!snapshot) {
            this.showNotification('Snapshot not found', 'error');
            return;
        }

        // Generate analysis
        const analysis = this.generateSnapshotAnalysis(snapshot);
        
        // Display analysis
        document.getElementById('analysis-results').innerHTML = `
            <div class="analysis-report">
                <h3>Snapshot Analysis: ${snapshot.id}</h3>
                ${analysis}
            </div>
        `;
    }

    /**
     * Generate analysis HTML for a snapshot
     * @param {Object} snapshot - Snapshot to analyze
     * @returns {string} HTML analysis
     */
    generateSnapshotAnalysis(snapshot) {
        // This would contain sophisticated analysis logic
        return `
            <div class="analysis-section">
                <h4>Battle State</h4>
                <ul>
                    <li>Turn: ${snapshot.turn}</li>
                    <li>Fighter 1 HP: ${snapshot.battleState.fighter1?.hp || 'N/A'}</li>
                    <li>Fighter 2 HP: ${snapshot.battleState.fighter2?.hp || 'N/A'}</li>
                    <li>Current Phase: ${snapshot.battleState.phaseState?.currentPhase || 'N/A'}</li>
                </ul>
            </div>
            <div class="analysis-section">
                <h4>Input History</h4>
                <p>Total inputs logged: ${snapshot.inputLog?.length || 0}</p>
            </div>
        `;
    }

    /**
     * Show a notification to the user
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, warning, info)
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after delay
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Create global instance
export const replayUI = new ReplayControlsUI();

// Convenience function to show replay overlay
export function showReplaySystem() {
    replayUI.showOverlay();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        replayUI.initialize();
    });
} else {
    replayUI.initialize();
} 
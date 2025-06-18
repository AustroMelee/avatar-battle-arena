/**
 * @fileoverview Centralized State Manager for State-Driven UI
 * @description Implements centralized state object, unified rendering, and RAF batching with efficient rendering
 * @version 2.0
 */

'use strict';

//# sourceURL=state_manager.js

import { 
    deepEqual, 
    shallowEqual, 
    renderIfChanged,
    batchDOMOperations,
    batchAppendElements,
    batchReplaceContent,
    createDebouncedStateUpdater,
    createDebouncedResizeHandler,
    performanceMonitor
} from './utils_efficient_rendering.js';

// === CENTRALIZED GAME STATE ===
let gameState = {
    battle: {
        isActive: false,
        currentTurn: 0,
        phase: 'PRE_BATTLE',
        winnerId: null,
        loserId: null,
        isDraw: false,
        battleLog: []
    },
    fighters: {
        fighter1: null,
        fighter2: null
    },
    ui: {
        mode: 'instant', // 'animated' or 'instant'
        loading: false,
        resultsVisible: false,
        simulationRunning: false,
        momentum: {
            fighter1: 0,
            fighter2: 0
        },
        escalation: {
            fighter1: { score: 0, state: 'Normal' },
            fighter2: { score: 0, state: 'Normal' }
        }
    },
    environment: {
        locationId: null,
        damageLevel: 0,
        impacts: []
    },
    simulation: {
        animationQueue: [],
        currentAnimation: null,
        isRunning: false
    }
};

// === RENDER BATCHING WITH RAF AND STATE COMPARISON ===
let pendingRender = false;
let renderScheduled = false;
let previousStateSnapshot = null;

/**
 * Schedules a render using requestAnimationFrame with state comparison
 */
function scheduleRender() {
    if (renderScheduled) return;
    
    renderScheduled = true;
    requestAnimationFrame(() => {
        const startTime = performanceMonitor.startTiming();
        
        // Only render if state has actually changed
        if (previousStateSnapshot === null || !deepEqual(previousStateSnapshot, gameState)) {
            render();
            previousStateSnapshot = JSON.parse(JSON.stringify(gameState)); // Deep clone for comparison
            performanceMonitor.endTiming(startTime, false);
        } else {
            performanceMonitor.endTiming(startTime, true); // Render was skipped
        }
        
        renderScheduled = false;
    });
}

/**
 * Central render function that updates DOM based on state
 */
function render() {
    renderBattleStatus();
    renderFighterStats();
    renderUIControls();
    renderSimulationState();
    renderEnvironment();
}

/**
 * Renders battle status components
 */
function renderBattleStatus() {
    const { battle } = gameState;
    
    // Winner display
    const winnerNameEl = document.getElementById('winner-name');
    const winProbabilityEl = document.getElementById('win-probability'); 
    
    if (winnerNameEl) {
        if (battle.isDraw) {
            winnerNameEl.textContent = 'A Stalemate!';
        } else if (battle.winnerId) {
            const winnerName = gameState.fighters[`fighter${battle.winnerId === gameState.fighters.fighter1?.id ? '1' : '2'}`]?.name || 'Unknown';
            winnerNameEl.textContent = `${winnerName} Wins!`;
        } else {
            winnerNameEl.textContent = 'Battle in Progress...';
        }
    }
    
    if (winProbabilityEl) {
        if (battle.isDraw) {
            winProbabilityEl.textContent = 'The battle ends in a draw.';
        } else if (battle.winnerId) {
            winProbabilityEl.textContent = 'A decisive victory.';
        } else {
            winProbabilityEl.textContent = '';
        }
    }
}

/**
 * Renders fighter statistics
 */
function renderFighterStats() {
    const { fighters, ui } = gameState;
    
    // Momentum displays with CSS classes
    const f1MomentumEl = document.getElementById('fighter1-momentum-value');
    const f2MomentumEl = document.getElementById('fighter2-momentum-value');
    
    if (f1MomentumEl) {
        const f1Momentum = ui.momentum.fighter1;
        const displayValue = typeof f1Momentum === 'number' && !isNaN(f1Momentum) ? f1Momentum : 'N/A';
        f1MomentumEl.textContent = String(displayValue);
        
        // Apply momentum CSS classes
        f1MomentumEl.classList.remove('momentum-positive', 'momentum-negative', 'momentum-neutral');
        if (typeof f1Momentum === 'number' && !isNaN(f1Momentum)) {
            if (f1Momentum > 0) f1MomentumEl.classList.add('momentum-positive');
            else if (f1Momentum < 0) f1MomentumEl.classList.add('momentum-negative');
            else f1MomentumEl.classList.add('momentum-neutral');
        }
    }
    
    if (f2MomentumEl) {
        const f2Momentum = ui.momentum.fighter2;
        const displayValue = typeof f2Momentum === 'number' && !isNaN(f2Momentum) ? f2Momentum : 'N/A';
        f2MomentumEl.textContent = String(displayValue);
        
        // Apply momentum CSS classes
        f2MomentumEl.classList.remove('momentum-positive', 'momentum-negative', 'momentum-neutral');
        if (typeof f2Momentum === 'number' && !isNaN(f2Momentum)) {
            if (f2Momentum > 0) f2MomentumEl.classList.add('momentum-positive');
            else if (f2Momentum < 0) f2MomentumEl.classList.add('momentum-negative');
            else f2MomentumEl.classList.add('momentum-neutral');
        }
    }
    
    // Escalation displays
    const f1EscalationEl = document.getElementById('fighter1-escalation-state');
    const f2EscalationEl = document.getElementById('fighter2-escalation-state');
    const f1ScoreEl = document.getElementById('fighter1-incapacitation-score');
    const f2ScoreEl = document.getElementById('fighter2-incapacitation-score');
    
    if (f1EscalationEl) {
        f1EscalationEl.textContent = `Escalation: ${ui.escalation.fighter1.state}`;
        f1EscalationEl.className = 'escalation-status'; // Reset classes
        
        // Apply escalation state classes
        const state = ui.escalation.fighter1.state;
        if (state === 'Pressured') {
            f1EscalationEl.classList.add('escalation-pressured');
        } else if (state === 'Severely Incapacitated') {
            f1EscalationEl.classList.add('escalation-severe');
        } else if (state === 'Terminal Collapse') {
            f1EscalationEl.classList.add('escalation-terminal');
        } else {
            f1EscalationEl.classList.add('escalation-normal');
        }
    }
    
    if (f2EscalationEl) {
        f2EscalationEl.textContent = `Escalation: ${ui.escalation.fighter2.state}`;
        f2EscalationEl.className = 'escalation-status'; // Reset classes
        
        // Apply escalation state classes
        const state = ui.escalation.fighter2.state;
        if (state === 'Pressured') {
            f2EscalationEl.classList.add('escalation-pressured');
        } else if (state === 'Severely Incapacitated') {
            f2EscalationEl.classList.add('escalation-severe');
        } else if (state === 'Terminal Collapse') {
            f2EscalationEl.classList.add('escalation-terminal');
        } else {
            f2EscalationEl.classList.add('escalation-normal');
        }
    }
    
    if (f1ScoreEl) f1ScoreEl.textContent = `Incap. Score: ${ui.escalation.fighter1.score !== undefined ? ui.escalation.fighter1.score.toFixed(1) : 'N/A'}`;
    if (f2ScoreEl) f2ScoreEl.textContent = `Incap. Score: ${ui.escalation.fighter2.score !== undefined ? ui.escalation.fighter2.score.toFixed(1) : 'N/A'}`;
}

/**
 * Renders UI control states
 */
function renderUIControls() {
    const { ui } = gameState;
    
    // Battle button state
    const battleBtn = document.getElementById('battleBtn');
    if (battleBtn) {
        battleBtn.disabled = ui.loading || ui.simulationRunning;
    }
    
    // Results section visibility
    const resultsSection = document.getElementById('results');
    if (resultsSection) {
        if (ui.resultsVisible) {
            console.log('[STATE] Showing results dialog...');
            // Handle dialog element properly
            if (resultsSection.tagName.toLowerCase() === 'dialog') {
                try {
                    resultsSection.showModal();
                    console.log('[STATE] Dialog showModal() called successfully');
                } catch (err) {
                    console.error('[STATE] Error calling showModal():', err);
                    resultsSection.style.display = 'block';
                }
            } else {
                resultsSection.style.display = 'block';
                void resultsSection.offsetWidth; // Force reflow
                resultsSection.classList.add('show');
            }
        } else {
            if (resultsSection.tagName.toLowerCase() === 'dialog') {
                resultsSection.close();
            } else {
                resultsSection.style.display = 'none';
                resultsSection.classList.remove('show');
            }
        }
    }
    
    // Loading spinner
    const loadingSpinner = document.getElementById('loading');
    if (loadingSpinner) {
        if (ui.loading) {
            loadingSpinner.classList.remove('hidden');
        } else {
            loadingSpinner.classList.add('hidden');
        }
    }
    
    // Battle results container
    const battleResultsContainer = document.getElementById('battle-results');
    if (battleResultsContainer) {
        if (ui.resultsVisible) {
            battleResultsContainer.classList.remove('hidden');
        } else {
            battleResultsContainer.classList.add('hidden');
        }
    }
    
    // VS divider clash animation
    const vsDivider = document.getElementById('vsDivider');
    if (vsDivider) {
        if (ui.loading) {
            vsDivider.classList.add('clash');
        } else {
            vsDivider.classList.remove('clash');
        }
    }
    
    // Animated log output for loading
    if (ui.mode === 'animated' && ui.loading) {
        const animatedLogOutput = document.getElementById('animated-log-output');
        if (animatedLogOutput) {
            animatedLogOutput.innerHTML = `<div class="loading"><div class="spinner"></div><p>Preparing animated simulation...</p></div>`;
            const simContainer = animatedLogOutput.closest('.simulation-mode-container');
            if (simContainer) simContainer.classList.remove('hidden');
        }
    }
}

/**
 * Renders simulation state
 */
function renderSimulationState() {
    const { simulation, ui, battle } = gameState;
    
    const simulationContainer = document.getElementById('simulation-mode-container');
    if (simulationContainer) {
        // Show container for animated mode when running OR when results are available,
        // AND for instant mode when results are available
        const shouldShow = (ui.mode === 'animated' && (simulation.isRunning || (ui.resultsVisible && battle.battleLog && battle.battleLog.length > 0))) || 
                          (ui.mode === 'instant' && ui.resultsVisible && battle.battleLog && battle.battleLog.length > 0);
        
        if (shouldShow) {
            simulationContainer.classList.remove('hidden');
            console.log('[STATE] Simulation container shown for mode:', ui.mode);
            
            // For both modes, populate the log output with the battle results when available
            if (ui.resultsVisible && battle.battleLog && battle.battleLog.length > 0) {
                const animatedLogOutput = document.getElementById('animated-log-output');
                if (animatedLogOutput) {
                    // Transform battle log to HTML for display
                    import('./log_to_html.js').then(({ transformEventsToHtmlLog }) => {
                        const htmlLog = transformEventsToHtmlLog(battle.battleLog);
                        animatedLogOutput.innerHTML = htmlLog || '<p>No battle log available.</p>';
                        console.log(`[STATE] ${ui.mode} mode battle log populated in simulation container`);
                    }).catch(err => {
                        console.warn(`[STATE] Could not load log_to_html for ${ui.mode} mode:`, err);
                        animatedLogOutput.innerHTML = '<p>Battle completed. Check the results dialog for details.</p>';
                    });
                }
            }
        } else {
            simulationContainer.classList.add('hidden');
        }
    }
    
    const cancelBtn = document.getElementById('cancel-simulation');
    if (cancelBtn) {
        if (simulation.isRunning) {
            cancelBtn.style.display = 'block';
        } else {
            cancelBtn.style.display = 'none';
        }
    }
}

/**
 * Renders environment state
 */
function renderEnvironment() {
    const { environment } = gameState;
    
    // Environment damage display would go here
    // This is a placeholder for environmental state rendering
}

// === STATE MUTATION FUNCTIONS ===

// === DEBOUNCED STATE UPDATES ===
const debouncedScheduleRender = createDebouncedStateUpdater(scheduleRender, 100);

/**
 * Updates game state and triggers render
 * @param {Object} updates - State updates to apply
 * @param {boolean} immediate - Skip debouncing for immediate render
 */
export function updateGameState(updates, immediate = false) {
    // Deep merge updates into gameState
    Object.keys(updates).forEach(key => {
        if (typeof updates[key] === 'object' && updates[key] !== null && !Array.isArray(updates[key])) {
            gameState[key] = { ...gameState[key], ...updates[key] };
        } else {
            gameState[key] = updates[key];
        }
    });
    
    // Use debounced render for rapid state changes, immediate for critical updates
    if (immediate) {
        scheduleRender();
    } else {
        debouncedScheduleRender();
    }
}

/**
 * Gets current game state (read-only)
 * @returns {Object} Current game state
 */
export function getGameState() {
    return { ...gameState };
}

/**
 * Resets game state to initial values
 */
export function resetGameState() {
    gameState = {
        battle: {
            isActive: false,
            currentTurn: 0,
            phase: 'PRE_BATTLE',
            winnerId: null,
            loserId: null,
            isDraw: false,
            battleLog: []
        },
        fighters: {
            fighter1: null,
            fighter2: null
        },
        ui: {
            mode: 'instant',
            loading: false,
            resultsVisible: false,
            simulationRunning: false,
            momentum: {
                fighter1: 0,
                fighter2: 0
            },
            escalation: {
                fighter1: { score: 0, state: 'Normal' },
                fighter2: { score: 0, state: 'Normal' }
            }
        },
        environment: {
            locationId: null,
            damageLevel: 0,
            impacts: []
        },
        simulation: {
            animationQueue: [],
            currentAnimation: null,
            isRunning: false
        }
    };
    
    scheduleRender();
}

/**
 * Forces an immediate render (for initialization)
 */
export function forceRender() {
    render();
}

// === LEGACY COMPATIBILITY FUNCTIONS ===

/**
 * Updates momentum display (compatibility function)
 * @param {string} fighterKey - 'fighter1' or 'fighter2'
 * @param {number} momentum - Momentum value
 */
export function updateMomentumDisplay(fighterKey, momentum) {
    updateGameState({
        ui: {
            momentum: {
                [fighterKey]: momentum
            }
        }
    });
}

/**
 * Updates escalation display (compatibility function)
 * @param {string} fighterKey - 'fighter1' or 'fighter2' 
 * @param {number} score - Incapacitation score
 * @param {string} state - Escalation state
 */
export function updateEscalationDisplay(fighterKey, score, state) {
    updateGameState({
        ui: {
            escalation: {
                [fighterKey]: { score, state }
            }
        }
    });
}

/**
 * Shows loading state (compatibility function)
 * @param {string} mode - Simulation mode
 */
export function showLoadingState(mode) {
    updateGameState({
        ui: {
            mode,
            loading: true,
            resultsVisible: false
        }
    });
}

/**
 * Shows results state (compatibility function)
 * @param {Object} battleResult - Battle result data
 * @param {string} mode - Simulation mode
 */
export function showResultsState(battleResult, mode) {
    if (!battleResult || !battleResult.finalState) {
        console.error("Invalid battleResult passed to showResultsState", battleResult);
        updateGameState({
            ui: {
                loading: false,
                simulationRunning: false,
                resultsVisible: false
            },
            battle: {
                winnerId: null,
                isDraw: false
            }
        });
        return;
    }

    // Update fighter momentum and escalation from battle results
    const momentum1 = battleResult.finalState?.fighter1?.momentum || 0;
    const momentum2 = battleResult.finalState?.fighter2?.momentum || 0;
    const escalation1Score = battleResult.finalState?.fighter1?.incapacitationScore || 0;
    const escalation1State = battleResult.finalState?.fighter1?.escalationState || 'Normal';
    const escalation2Score = battleResult.finalState?.fighter2?.incapacitationScore || 0;
    const escalation2State = battleResult.finalState?.fighter2?.escalationState || 'Normal';

    updateGameState({
        battle: {
            isActive: false,
            winnerId: battleResult.winnerId,
            loserId: battleResult.loserId,
            isDraw: battleResult.isDraw,
            battleLog: battleResult.log
        },
        fighters: {
            fighter1: battleResult.finalState?.fighter1,
            fighter2: battleResult.finalState?.fighter2
        },
        ui: {
            mode,
            loading: false,
            resultsVisible: true,
            simulationRunning: false,
            momentum: {
                fighter1: momentum1,
                fighter2: momentum2
            },
            escalation: {
                fighter1: { score: escalation1Score, state: escalation1State },
                fighter2: { score: escalation2Score, state: escalation2State }
            }
        },
        environment: {
            locationId: battleResult.locationId,
            damageLevel: battleResult.environmentState?.damageLevel || 0
        }
    });

    // Handle additional UI elements that need special handling
    handleBattleLogDisplay(battleResult, mode);
    
    // Populate winner information
    const winnerNameEl = document.getElementById('winner-name');
    const winProbabilityEl = document.getElementById('win-probability');
    if (winnerNameEl && winProbabilityEl) {
        if (battleResult.isDraw) {
            winnerNameEl.textContent = 'Draw';
            winProbabilityEl.textContent = 'The battle ended in a stalemate';
        } else {
            // Get character data for winner display
            import('./data_characters.js').then(({ characters }) => {
                const winnerName = characters[battleResult.winnerId]?.name || battleResult.winnerId;
                winnerNameEl.textContent = `${winnerName} Wins!`;
                winProbabilityEl.textContent = `Victory achieved through superior strategy`;
                console.log('[STATE] Winner information populated:', winnerName);
            }).catch(err => {
                console.warn('[STATE] Could not load character data:', err);
                winnerNameEl.textContent = `${battleResult.winnerId} Wins!`;
                winProbabilityEl.textContent = `Victory achieved`;
            });
        }
    } else {
        console.warn('[STATE] Winner display elements not found');
    }
}

/**
 * Handles battle log display (special handling for HTML content)
 * @param {Object} battleResult - Battle result data
 * @param {string} mode - Simulation mode
 */
function handleBattleLogDisplay(battleResult, mode) {
    console.log('[STATE] handleBattleLogDisplay called with mode:', mode);
    console.log('[STATE] Battle result log length:', battleResult.log?.length || 0);

    // Import transformEventsToHtmlLog for battle story
    import('./log_to_html.js').then(({ transformEventsToHtmlLog }) => {
        const battleStoryEl = document.getElementById('battle-story');
        if (battleStoryEl && battleResult.log) {
            const htmlLog = transformEventsToHtmlLog(battleResult.log);
            battleStoryEl.innerHTML = htmlLog;
            console.log('[STATE] Battle story populated successfully');
        } else {
            console.warn('[STATE] Battle story element or log missing');
        }
    }).catch(err => {
        console.warn('Could not load battle log transformer:', err);
    });

    // Handle detailed logs content - populate with the full log data
    const detailedLogsEl = document.getElementById('detailed-battle-logs-content');
    const toggleBtn = document.getElementById('toggle-detailed-logs-btn');
    
    if (detailedLogsEl && battleResult.log) {
        console.log('[STATE] Populating detailed battle logs...');
        
        // Import the battle log transformer
        import('./battle_log_transformer.js').then(({ transformEventsToHtmlLog }) => {
            const detailedHtmlLog = transformEventsToHtmlLog(battleResult.log, {
                fighter1: battleResult.finalState?.fighter1,
                fighter2: battleResult.finalState?.fighter2,
                location: battleResult.locationId
            });
            detailedLogsEl.innerHTML = detailedHtmlLog || '<p>No detailed battle log available.</p>';
            console.log('[STATE] Detailed battle logs populated successfully');
            
            // Set up the toggle controls
            import('./ui/battle_log_controls.js').then(({ setupBattleLogControls }) => {
                const copyBtn = document.getElementById('copy-detailed-logs-btn');
                setupBattleLogControls(toggleBtn, copyBtn, detailedLogsEl);
                console.log('[STATE] Battle log controls set up successfully');
            }).catch(err => {
                console.warn('[STATE] Could not set up battle log controls:', err);
            });
            
        }).catch(err => {
            console.warn('[STATE] Could not load battle_log_transformer:', err);
            // Fallback to basic HTML transformation
            import('./log_to_html.js').then(({ transformEventsToHtmlLog }) => {
                const fallbackHtml = transformEventsToHtmlLog(battleResult.log);
                detailedLogsEl.innerHTML = fallbackHtml || '<p>No detailed battle log available.</p>';
                console.log('[STATE] Detailed battle logs populated with fallback');
            }).catch(fallbackErr => {
                console.error('[STATE] Both battle log transformers failed:', fallbackErr);
                detailedLogsEl.innerHTML = '<p>Error loading battle logs.</p>';
            });
        });
        
        // Handle detailed logs visibility for instant mode
        if (mode === 'instant') {
            detailedLogsEl.classList.remove('hidden', 'collapsed');
            if (toggleBtn) {
                toggleBtn.textContent = 'Hide Detailed Battle Logs ▼';
                toggleBtn.setAttribute('aria-expanded', 'true');
            }
        } else {
            // For animated mode, keep collapsed by default
            detailedLogsEl.classList.add('collapsed');
            if (toggleBtn) {
                toggleBtn.textContent = 'Show Detailed Battle Logs ►';
                toggleBtn.setAttribute('aria-expanded', 'false');
            }
        }
    } else {
        console.warn('[STATE] Detailed logs element or battle log missing');
    }

    // Handle analysis display
    import('./ui_battle-results.js').then(({ displayFinalAnalysis }) => {
        if (typeof displayFinalAnalysis === 'function') {
            displayFinalAnalysis(battleResult);
            console.log('[STATE] Final analysis display completed');
        }
    }).catch(err => {
        console.warn('Could not load battle results module:', err);
    });
}

// Initialize state on module load
resetGameState(); 
// FILE: ui_battle-results.js
'use strict';

// Manages the display of battle results, analysis, and detailed logs.

import { characters } from './data_characters.js';
// --- UPDATED IMPORT ---
import { phaseTemplates } from './data_narrative_phases.js'; // Corrected import path
// --- END UPDATED IMPORT ---
import { transformEventsToHtmlLog } from './battle_log_transformer.js';
import { startSimulation } from './simulation_mode_manager.js';
import { updateMomentumDisplay, updateEscalationDisplay } from './ui_momentum-escalation-display.js'; // New import for centralized display updates
import { ESCALATION_STATES } from './engine_escalation.js'; // For escalation state classes

let resultsSection = null;
let environmentDamageDisplay = null;
let environmentImpactsList = null;
let battleStory = null;
let analysisList = null;
let winnerName = null;
let winProbability = null;
let detailedBattleLogsContent = null;
let toggleDetailedLogsBtn = null;
let copyDetailedLogsBtn = null;

// Initialize DOM elements if they haven't been stored yet.
function initializeDOMElements() {
    if (!resultsSection) {
        resultsSection = document.getElementById('results');
        environmentDamageDisplay = document.getElementById('environment-damage-display');
        environmentImpactsList = document.getElementById('environment-impacts-list');
        battleStory = document.getElementById('battle-story');
        analysisList = document.getElementById('analysis-list');
        winnerName = document.getElementById('winner-name');
        winProbability = document.getElementById('win-probability');
        detailedBattleLogsContent = document.getElementById('detailed-battle-logs-content');
        toggleDetailedLogsBtn = document.getElementById('toggle-detailed-logs-btn');
        copyDetailedLogsBtn = document.getElementById('copy-detailed-logs-btn');
    }
}

/**
 * Displays the final battle analysis, including fighter stats and environmental impact.
 * @param {object} finalState - Object containing fighter1 and fighter2's final states.
 * @param {string} winnerId - The ID of the winning fighter.
 * @param {boolean} isDraw - True if the battle was a draw.
 * @param {object} environmentState - Final state of the environment.
 * @param {string} locationId - The ID of the battle location.
 */
export function displayFinalAnalysis(finalState, winnerId, isDraw = false, environmentState, locationId) {
    initializeDOMElements(); // Ensure elements are initialized

    if (!analysisList) {
        console.error("Analysis list DOM element not found for displayFinalAnalysis.");
        return;
    }
    analysisList.innerHTML = '';
    if (!finalState || !finalState.fighter1 || !finalState.fighter2) {
        console.error("Final state for analysis is incomplete.");
        analysisList.innerHTML = "<li>Error: Analysis data incomplete.</li>";
        return;
    }
    const { fighter1, fighter2 } = finalState;

    const createListItem = (text, value, valueClass = 'modifier-neutral') => {
        const li = document.createElement('li');
        li.className = 'analysis-item';
        const spanReason = document.createElement('span');
        spanReason.innerHTML = text;
        const spanValue = document.createElement('span');
        spanValue.textContent = String(value);
        spanValue.className = valueClass;
        li.appendChild(spanReason);
        li.appendChild(spanValue);
        analysisList.appendChild(li);
    };

    const createSummaryItem = (text) => {
        if (!text || typeof text !== 'string') return;
        const li = document.createElement('li');
        li.className = 'analysis-summary';
        li.innerHTML = `<em>${text.trim()}</em>`;
        analysisList.appendChild(li);
    };

    if (!isDraw && winnerId) {
        const winner = winnerId === fighter1.id ? fighter1 : fighter2;
        createSummaryItem(winner.summary || `${winner.name} demonstrated superior skill.`);
    } else {
        createSummaryItem("The fighters were too evenly matched for a decisive outcome.");
    }

    const spacer = document.createElement('li');
    spacer.className = 'analysis-item-spacer';
    analysisList.appendChild(spacer.cloneNode()); // Add a spacer

    const f1_status = isDraw ? 'DRAW' : (fighter1.id === winnerId ? 'VICTORIOUS' : 'DEFEATED');
    const f1_class = isDraw ? 'modifier-neutral' : (fighter1.id === winnerId ? 'modifier-plus' : 'modifier-minus');
    createListItem(`<b>${fighter1.name}'s Final Status:</b>`, f1_status, f1_class);
    createListItem(`  • Health:`, `${Math.round(fighter1.hp)} / 100 HP`);
    createListItem(`  • Energy:`, `${Math.round(fighter1.energy)} / 100`);
    createListItem(`  • Mental State:`, fighter1.mentalState.level.toUpperCase());
    createListItem(`  • Momentum:`, fighter1.momentum);
    createListItem(`  • Incapacitation Score:`, fighter1.incapacitationScore !== undefined ? fighter1.incapacitationScore.toFixed(1) : 'N/A');
    let f1EscalationClass = 'escalation-normal';
    if (fighter1.escalationState) {
        switch (fighter1.escalationState) {
            case ESCALATION_STATES.PRESSURED: f1EscalationClass = 'escalation-pressured'; break;
            case ESCALATION_STATES.SEVERELY_INCAPACITATED: f1EscalationClass = 'escalation-severe'; break;
            case ESCALATION_STATES.TERMINAL_COLLAPSE: f1EscalationClass = 'escalation-terminal'; break;
        }
    }
    createListItem(`  • Escalation State:`, fighter1.escalationState || 'N/A', f1EscalationClass);

    const f2_status = isDraw ? 'DRAW' : (fighter2.id === winnerId ? 'VICTORIOUS' : 'DEFEATED');
    const f2_class = isDraw ? 'modifier-neutral' : (fighter2.id === winnerId ? 'modifier-plus' : 'modifier-minus');
    createListItem(`<b>${fighter2.name}'s Final Status:</b>`, f2_status, f2_class);
    createListItem(`  • Health:`, `${Math.round(fighter2.hp)} / 100 HP`);
    createListItem(`  • Energy:`, `${Math.round(fighter2.energy)} / 100`);
    createListItem(`  • Mental State:`, fighter2.mentalState.level.toUpperCase());
    createListItem(`  • Momentum:`, fighter2.momentum);
    createListItem(`  • Incapacitation Score:`, fighter2.incapacitationScore !== undefined ? fighter2.incapacitationScore.toFixed(1) : 'N/A');
    let f2EscalationClass = 'escalation-normal';
    if (fighter2.escalationState) {
        switch (fighter2.escalationState) {
            case ESCALATION_STATES.PRESSURED: f2EscalationClass = 'escalation-pressured'; break;
            case ESCALATION_STATES.SEVERELY_INCAPACITATED: f2EscalationClass = 'escalation-severe'; break;
            case ESCALATION_STATES.TERMINAL_COLLAPSE: f2EscalationClass = 'escalation-terminal'; break;
        }
    }
    createListItem(`  • Escalation State:`, fighter2.escalationState || 'N/A', f2EscalationClass);

    analysisList.appendChild(spacer.cloneNode());

    const currentLocData = locationConditions[locationId];
    if (environmentState && environmentDamageDisplay && environmentImpactsList && currentLocData && currentLocData.damageThresholds) {
        environmentDamageDisplay.textContent = `Environmental Damage: ${environmentState.damageLevel.toFixed(0)}%`;
        let damageClass = '';
        if (environmentState.damageLevel >= currentLocData.damageThresholds.catastrophic) damageClass = 'catastrophic-damage';
        else if (environmentState.damageLevel >= currentLocData.damageThresholds.severe) damageClass = 'high-damage';
        else if (environmentState.damageLevel >= currentLocData.damageThresholds.moderate) damageClass = 'medium-damage';
        else if (environmentState.damageLevel >= currentLocData.damageThresholds.minor) damageClass = 'low-damage';
        environmentDamageDisplay.className = `environmental-damage-level ${damageClass}`;
        environmentImpactsList.innerHTML = '';
        if (environmentState.specificImpacts && environmentState.specificImpacts.size > 0) {
            environmentState.specificImpacts.forEach(impact => {
                if (typeof impact === 'string') {
                    const li = document.createElement('li');
                    li.textContent = impact;
                    environmentImpactsList.appendChild(li);
                }
            });
        } else {
            environmentImpactsList.innerHTML = '<li>The environment sustained minimal noticeable damage.</li>';
        }
    } else {
        if (environmentDamageDisplay) environmentDamageDisplay.textContent = 'Environmental Damage: N/A';
        if (environmentImpactsList) environmentImpactsList.innerHTML = '<li>No specific impact data.</li>';
    }

    if (detailedBattleLogsContent) {
        detailedBattleLogsContent.innerHTML = '';

        let allLogsHtml = "";

        const formatAiLogEntries = (logEntries) => {
            return logEntries.map(entry => {
                if (typeof entry === 'object' && entry !== null) {
                    let parts = [];
                    if (entry.turn !== undefined) parts.push(`T${entry.turn}`);
                    if (entry.phase) parts.push(`Phase:${entry.phase}`);
                    if (entry.intent) parts.push(`Intent:${entry.intent}`);
                    if (entry.chosenMove) parts.push(`Move:${entry.chosenMove}`);
                    if (entry.finalProb) parts.push(`Prob:${entry.finalProb}`);
                    if (entry.actorState) {
                        const as = entry.actorState;
                        parts.push(`HP:${as.hp?.toFixed(0)} E:${as.energy?.toFixed(0)} M:${as.momentum} MS:${as.mental}`);
                        if (as.escalation) parts.push(`ES:${as.escalation}`);
                    }
                    if (entry.opponentEscalation) {
                        parts.push(`OppES:${entry.opponentEscalation}`);
                    }
                    if (entry.consideredMoves && Array.isArray(entry.consideredMoves) && entry.consideredMoves.length > 0) {
                        const topConsiderations = entry.consideredMoves.slice(0, 3).map(m => `${m.name || 'UnknownMove'}(${m.prob || 'N/A'})`).join(', ');
                        parts.push(`Considered:[${topConsiderations}]`);
                    }
                    if (parts.length === 0) return JSON.stringify(entry);
                    return parts.join(' | ');
                }
                return String(entry).replace(/</g, "<").replace(/>/g, ">");
            }).join('<br>');
        };

        if (fighter1.aiLog && fighter1.aiLog.length > 0) {
            const logTitleF1 = `<strong>${fighter1.name}'s AI Decision Log:</strong><br>`;
            const logPreF1 = `<pre><code>${formatAiLogEntries(fighter1.aiLog)}</code></pre>`;
            allLogsHtml += `<div class="ai-log-fighter">${logTitleF1}${logPreF1}</div>`;
        }

        if (fighter2.aiLog && fighter2.aiLog.length > 0) {
            const logTitleF2 = `<strong>${fighter2.name}'s AI Decision Log:</strong><br>`;
            const logPreF2 = `<pre><code>${formatAiLogEntries(fighter2.aiLog)}</code></pre>`;
            allLogsHtml += `<div class="ai-log-fighter">${logTitleF2}${logPreF2}</div>`;
        }

        if (allLogsHtml) {
            detailedBattleLogsContent.innerHTML = allLogsHtml;
        } else {
            detailedBattleLogsContent.innerHTML = '<p><em>No detailed AI logs available for this battle.</em></p>';
        }
    }
}

/**
 * Sets up event listeners for the detailed battle logs toggle and copy buttons.
 */
export function setupDetailedLogControls() {
    initializeDOMElements(); // Ensure elements are initialized
    
    if (toggleDetailedLogsBtn && detailedBattleLogsContent) {
        // Ensure initial state is collapsed and button text is correct
        if (!detailedBattleLogsContent.classList.contains('collapsed')) {
            detailedBattleLogsContent.classList.add('collapsed');
            toggleDetailedLogsBtn.setAttribute('aria-expanded', 'false');
            toggleDetailedLogsBtn.textContent = 'Show Detailed Battle Logs ►';
        }

        toggleDetailedLogsBtn.onclick = () => {
            const isCollapsed = detailedBattleLogsContent.classList.toggle('collapsed');
            toggleDetailedLogsBtn.setAttribute('aria-expanded', String(!isCollapsed));
            toggleDetailedLogsBtn.textContent = isCollapsed ? 'Show Detailed Battle Logs ►' : 'Hide Detailed Battle Logs ▼';
        };
    } else {
        if (!toggleDetailedLogsBtn) console.warn("Toggle detailed logs button not found.");
        if (!detailedBattleLogsContent) console.warn("Detailed battle logs content div not found.");
    }

    if (copyDetailedLogsBtn && detailedBattleLogsContent) {
        copyDetailedLogsBtn.onclick = async () => {
            try {
                // Dynamically import copyToClipboard to avoid circular dependency with main.js
                const { copyToClipboard } = await import('./utils_clipboard.js');
                await copyToClipboard(detailedBattleLogsContent.textContent || '');
                copyDetailedLogsBtn.textContent = '📋 Copied!';
                setTimeout(() => {
                    copyDetailedLogsBtn.textContent = '📋 Copy Battle Logs';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy detailed logs: ', err);
                copyDetailedLogsBtn.textContent = 'Error Copying';
                setTimeout(() => {
                    copyDetailedLogsBtn.textContent = '📋 Copy Battle Logs';
                }, 2000);
            }
        };
    } else {
        if (!copyDetailedLogsBtn) console.warn("Copy detailed logs button not found.");
    }
}

/**
 * Resets the display elements related to battle results.
 * This function is used by ui_loading-states.js before starting a new battle.
 */
// --- ADDED EXPORT AND CENTRALIZED HERE ---
export function resetBattleResultsUI() {
    initializeDOMElements(); // Ensure elements are initialized

    if (resultsSection) resultsSection.classList.remove('show');
    if (environmentDamageDisplay) {
        environmentDamageDisplay.textContent = '';
        environmentDamageDisplay.className = 'environmental-damage-level'; // Reset class
    }
    if (environmentImpactsList) environmentImpactsList.innerHTML = '';
    if (battleStory) battleStory.innerHTML = '';
    if (analysisList) analysisList.innerHTML = '';
    if (winnerName) winnerName.textContent = '';
    if (winProbability) winProbability.textContent = '';
    
    // Ensure detailed logs are collapsed and cleared
    if (detailedBattleLogsContent) {
        detailedBattleLogsContent.innerHTML = '';
        if (!detailedBattleLogsContent.classList.contains('collapsed')) {
            detailedBattleLogsContent.classList.add('collapsed');
            if (toggleDetailedLogsBtn) {
                toggleDetailedLogsBtn.setAttribute('aria-expanded', 'false');
                toggleDetailedLogsBtn.textContent = 'Show Detailed Battle Logs ►';
            }
        }
    }

    // Hide the results section visually after a slight delay for transition
    setTimeout(() => {
        if (resultsSection && !resultsSection.classList.contains('show')) {
            resultsSection.style.display = 'none';
        }
    }, 500);
}
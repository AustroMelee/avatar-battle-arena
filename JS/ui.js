// FILE: js/ui.js
// FILE: ui.js
'use strict';

import { characters } from './data_characters.js';
import { locations } from './locations.js';
import { locationConditions } from './location-battle-conditions.js'; 
import { resolveArchetypeLabel } from './engine_archetype-engine.js'; 
import { renderArchetypeDisplay } from './ui_archetype-display.js'; 

const DOM = {
    fighter1Grid: document.getElementById('fighter1-grid'),
    fighter2Grid: document.getElementById('fighter2-grid'),
    locationGrid: document.getElementById('location-grid'),
    emotionalModeCheckbox: document.getElementById('emotional-mode'),
    fighter1NameDisplay: document.getElementById('fighter1-name-display'),
    fighter2NameDisplay: document.getElementById('fighter2-name-display'),
    locationNameDisplay: document.getElementById('location-name-display'),
    battleBtn: document.getElementById('battleBtn'),
    resultsSection: document.getElementById('results'),
    loadingSpinner: document.getElementById('loading'),
    battleResultsContainer: document.getElementById('battle-results'),
    vsDivider: document.getElementById('vsDivider'),
    winnerName: document.getElementById('winner-name'),
    winProbability: document.getElementById('win-probability'), // This element's text will be updated based on battle outcome
    battleStory: document.getElementById('battle-story'),
    analysisList: document.getElementById('analysis-list'),
    timeToggleContainer: document.getElementById('time-toggle-container'),
    timeOfDayValue: document.getElementById('time-of-day-value'),
    timeFeedbackDisplay: document.getElementById('time-feedback'),
    fighter1Select: document.createElement('input'),
    fighter2Select: document.createElement('input'),
    locationSelect: document.createElement('input'),
    environmentDamageDisplay: document.getElementById('environment-damage-display'),
    environmentImpactsList: document.getElementById('environment-impacts-list'),
    locationEnvironmentSummary: document.getElementById('location-environment-summary'), 
    fighter1MomentumValue: document.getElementById('fighter1-momentum-value'),
    fighter2MomentumValue: document.getElementById('fighter2-momentum-value'),
    archetypeContainer: document.getElementById('archetype-info-container'),
    archetypeHeadline: document.getElementById('archetype-headline'),
    archetypeIntroA: document.getElementById('archetype-intro-a'),
    archetypeIntroB: document.getElementById('archetype-intro-b'),
    archetypeError: document.getElementById('archetype-error'),
};

DOM.fighter1Select.type = 'hidden';
DOM.fighter1Select.id = 'fighter1-value';
DOM.fighter2Select.type = 'hidden';
DOM.fighter2Select.id = 'fighter2-value';
DOM.locationSelect.type = 'hidden';
DOM.locationSelect.id = 'location-value';
document.body.appendChild(DOM.fighter1Select);
document.body.appendChild(DOM.fighter2Select);
document.body.appendChild(DOM.locationSelect);


function getElementClass(character) {
    // Ensure techniques array exists and is not empty
    if (!character.techniques || character.techniques.length === 0) {
        return 'card-nonbender'; // Default or error class
    }
    const mainElement = character.techniques.find(t => t.element)?.element || 'nonbender';
    switch (mainElement) {
        case 'fire': case 'lightning': return 'card-fire';
        case 'water': case 'ice': return 'card-water';
        case 'earth': case 'metal': return 'card-earth';
        case 'air': return 'card-air';
        case 'special': return 'card-chi'; // For chi blockers like Ty Lee
        default: return 'card-nonbender';
    }
}

function updateArchetypeInfo() {
    const fighter1Id = DOM.fighter1Select.value || null; 
    const fighter2Id = DOM.fighter2Select.value || null; 
    const locationId = DOM.locationSelect.value || null; 

    const archetypeData = resolveArchetypeLabel(fighter1Id, fighter2Id, locationId);
    renderArchetypeDisplay(archetypeData, {
        container: DOM.archetypeContainer,
        headline: DOM.archetypeHeadline,
        introA: DOM.archetypeIntroA,
        introB: DOM.archetypeIntroB,
        error: DOM.archetypeError
    });
}


function createCharacterCard(character, fighterKey) {
    const card = document.createElement('div');
    card.className = 'character-card';
    card.classList.add(getElementClass(character));
    card.dataset.id = character.id;
    
    const image = document.createElement('img');
    image.src = character.imageUrl;
    image.alt = character.name;
    image.loading = 'lazy';
    card.appendChild(image);

    const name = document.createElement('h3');
    name.textContent = character.name;
    card.appendChild(name);

    card.addEventListener('click', () => {
        handleCardSelection(character, fighterKey, card);
    });

    return card;
}

function handleCardSelection(character, fighterKey, selectedCard) {
    const grid = fighterKey === 'fighter1' ? DOM.fighter1Grid : DOM.fighter2Grid;
    const nameDisplay = fighterKey === 'fighter1' ? DOM.fighter1NameDisplay : DOM.fighter2NameDisplay;
    const hiddenInput = fighterKey === 'fighter1' ? DOM.fighter1Select : DOM.fighter2Select;

    const otherFighterKey = fighterKey === 'fighter1' ? 'fighter2' : 'fighter1';
    const otherFighterInput = fighterKey === 'fighter1' ? DOM.fighter2Select : DOM.fighter1Select;
    if (otherFighterInput.value === character.id) {
        alert("A fighter cannot battle themselves. Please choose a different opponent.");
        return; 
    }

    grid.querySelectorAll('.character-card').forEach(card => card.classList.remove('selected'));
    selectedCard.classList.add('selected');
    nameDisplay.textContent = character.name;
    hiddenInput.value = character.id;
    updateArchetypeInfo(); 
}

function populateCharacterGrids() {
    const availableCharacters = Object.values(characters).filter(c => c.techniques && c.techniques.length > 0);
    const sortedCharacters = availableCharacters.sort((a, b) => a.name.localeCompare(b.name));

    sortedCharacters.forEach(character => {
        const card1 = createCharacterCard(character, 'fighter1');
        const card2 = createCharacterCard(character, 'fighter2');
        DOM.fighter1Grid.appendChild(card1);
        DOM.fighter2Grid.appendChild(card2);
    });
}

function createLocationCard(locationData, locationId) {
    const card = document.createElement('div');
    card.className = 'location-card';
    card.dataset.id = locationId;

    const image = document.createElement('img');
    image.src = locationData.imageUrl;
    image.alt = locationData.name;
    image.loading = 'lazy';
    card.appendChild(image);
    
    const name = document.createElement('h3');
    name.textContent = locationData.name;
    card.appendChild(name);

    card.addEventListener('click', () => {
        handleLocationCardSelection(locationData, locationId, card);
    });

    return card;
}

function updateEnvironmentalSummary(locationId) {
    if (!DOM.locationEnvironmentSummary) return; 
    const locConditions = locationConditions[locationId];
    if (!locConditions) {
        DOM.locationEnvironmentSummary.innerHTML = 'Environmental details not available for this location.';
        return;
    }

    let summaryHtml = `This location is characterized by: `;
    const traits = [];

    if (locConditions.isUrban) traits.push(`<span>urban</span> setting`);
    if (locConditions.isDense) traits.push(`<span>dense</span> environment`);
    if (locConditions.isVertical) traits.push(`<span>vertical</span> terrain`);
    if (locConditions.isExposed) traits.push(`<span>exposed</span> areas`);
    if (locConditions.isSlippery) traits.push(`<span>slippery</span> surfaces`);
    if (locConditions.isHot) traits.push(`<span>intense heat</span>`);
    if (locConditions.isCold) traits.push(`<span>cold</span> temperatures`);
    if (locConditions.hasShiftingGround) traits.push(`<span>shifting ground</span>`);
    if (locConditions.lowVisibility) traits.push(`<span>low visibility</span>`);
    if (locConditions.isIndustrial) traits.push(`<span>industrial</span> elements`);
    if (locConditions.isPrecarious) traits.push(`<span>precarious</span> footing`);
    if (locConditions.isRocky) traits.push(`<span>rocky</span> terrain`);
    if (locConditions.isCoastal) traits.push(`<span>coastal</span> features`);
    if (locConditions.isSandy) traits.push(`<span>sandy</span> terrain`);
    if (locConditions.hasCover) traits.push(`ample <span>cover</span>`);
    if (locConditions.plantsRich) traits.push(`abundant <span>plant life</span>`);

    if (locConditions.airRich) traits.push(`rich in <span>air</span>`);
    if (locConditions.waterRich) traits.push(`rich in <span>water</span>`);
    if (locConditions.iceRich) traits.push(`rich in <span>ice</span>`);
    if (locConditions.earthRich) traits.push(`rich in <span>earth</span>`);
    if (locConditions.metalRich) traits.push(`rich in <span>metal</span>`);
    
    summaryHtml += traits.join(', ') || 'a unique atmosphere';

    if (locConditions.environmentalModifiers) {
        summaryHtml += `<br>Elemental Impact: `;
        const elementalImpacts = [];
        for (const element in locConditions.environmentalModifiers) {
            const mod = locConditions.environmentalModifiers[element];
            let impactDesc = `<span>${element}</span>: `;
            let effects = []
            if (mod.damageMultiplier !== undefined && mod.damageMultiplier !== 1.0) {
                const impactClass = mod.damageMultiplier > 1.0 ? 'positive-impact' : 'negative-impact';
                effects.push(`<span class="${impactClass}">Dmg ${mod.damageMultiplier > 1.0 ? '+' : ''}${(mod.damageMultiplier * 100 - 100).toFixed(0)}%</span>`);
            }
            if (mod.energyCostModifier !== undefined && mod.energyCostModifier !== 1.0) {
                const impactClass = mod.energyCostModifier < 1.0 ? 'positive-impact' : 'negative-impact';
                effects.push(`<span class="${impactClass}">Energy ${mod.energyCostModifier < 1.0 ? '-' : '+'}${(mod.energyCostModifier * 100 - 100).toFixed(0)}%</span>`);
            }
            if (effects.length > 0) {
                 impactDesc += effects.join(', ');
            } else {
                impactDesc += `neutral`;
            }
            if (mod.description) {
                 impactDesc += ` <em style="font-size:0.9em; opacity:0.8">(${mod.description})</em>`;
            }
            elementalImpacts.push(impactDesc);
        }
        summaryHtml += elementalImpacts.join('; ') || 'None notable.';
    }
    
    if (locConditions.fragility !== undefined) {
      summaryHtml += `<br>Fragility: <span>${(locConditions.fragility * 100).toFixed(0)}%</span>.`;
    }

    DOM.locationEnvironmentSummary.innerHTML = summaryHtml;
}

function handleLocationCardSelection(locationData, locationId, selectedCard) {
    DOM.locationGrid.querySelectorAll('.location-card').forEach(card => card.classList.remove('selected'));
    selectedCard.classList.add('selected');
    DOM.locationNameDisplay.textContent = locationData.name;
    DOM.locationSelect.value = locationId;
    updateEnvironmentalSummary(locationId); 
    updateArchetypeInfo(); 
}

function populateLocationGrid() {
    const sortedLocations = Object.entries(locations).sort(([, a], [, b]) => a.name.localeCompare(b.name));
    for (const [id, locationData] of sortedLocations) {
        const card = createLocationCard(locationData, id);
        DOM.locationGrid.appendChild(card);
    }
    if (DOM.locationEnvironmentSummary) {
        DOM.locationEnvironmentSummary.innerHTML = 'Select a battlefield to see its environmental characteristics.';
    }
}

function initializeTimeToggle() {
    const buttons = DOM.timeToggleContainer.querySelectorAll('.time-toggle-btn');
    
    DOM.timeFeedbackDisplay.innerHTML = "It is currently <b>Day</b>. Firebenders are empowered."; // Default

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            const time = button.dataset.value;
            DOM.timeOfDayValue.value = time; // Update hidden input

            // Update feedback display
            if (time === 'day') {
                DOM.timeFeedbackDisplay.innerHTML = "It is now <b>Day</b>. Firebenders are empowered.";
            } else {
                DOM.timeFeedbackDisplay.innerHTML = "It is now <b>Night</b>. Waterbenders are empowered.";
            }
        });
    });
}

function updateMomentumDisplay(fighterKey, momentumValue) {
    const momentumElement = fighterKey === 'fighter1' ? DOM.fighter1MomentumValue : DOM.fighter2MomentumValue;
    if (!momentumElement) return; // Guard against missing element

    momentumElement.textContent = momentumValue;
    momentumElement.classList.remove('momentum-positive', 'momentum-negative', 'momentum-neutral');

    if (momentumValue > 0) {
        momentumElement.classList.add('momentum-positive');
    } else if (momentumValue < 0) {
        momentumElement.classList.add('momentum-negative');
    } else {
        momentumElement.classList.add('momentum-neutral');
    }
}

export function populateUI() {
    populateCharacterGrids();
    populateLocationGrid();
    initializeTimeToggle();
    updateMomentumDisplay('fighter1', 0); // Initialize display
    updateMomentumDisplay('fighter2', 0); // Initialize display
    updateArchetypeInfo(); 
}

export function showLoadingState() {
    DOM.resultsSection.classList.remove('show'); // Remove show immediately to reset animation
    DOM.resultsSection.style.display = 'block'; // Ensure it's block for layout calculations
    DOM.loadingSpinner.classList.remove('hidden');
    DOM.battleResultsContainer.classList.add('hidden');
    DOM.battleBtn.disabled = true;
    DOM.vsDivider.classList.add('clash'); // Add clash animation
    // Force reflow for animation restart
    void DOM.resultsSection.offsetWidth; 
    // Add show class to trigger transition
    setTimeout(() => {
        DOM.resultsSection.classList.add('show');
        DOM.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }, 10); // Small delay ensures transition occurs
}

export function showResultsState(battleResult) {
    DOM.vsDivider.classList.remove('clash'); // Remove clash animation
    if (battleResult.isDraw) {
        DOM.winnerName.textContent = `A Stalemate!`;
        DOM.winProbability.textContent = `The battle ends in a draw, with neither fighter able to gain the upper hand.`;
    } else {
        DOM.winnerName.textContent = `${characters[battleResult.winnerId].name} Wins!`;
        DOM.winProbability.textContent = `A decisive victory after a fierce battle.`; // Generic win text for now
    }
    DOM.battleStory.innerHTML = battleResult.log;
    displayFinalAnalysis(battleResult.finalState, battleResult.winnerId, battleResult.isDraw, battleResult.environmentState, document.getElementById('location-value').value);
    DOM.loadingSpinner.classList.add('hidden');
    DOM.battleResultsContainer.classList.remove('hidden');
    DOM.battleBtn.disabled = false;

    // NEW: Update momentum display for both fighters from finalState
    if (battleResult.finalState.fighter1) {
        updateMomentumDisplay('fighter1', battleResult.finalState.fighter1.momentum);
    }
    if (battleResult.finalState.fighter2) {
        updateMomentumDisplay('fighter2', battleResult.finalState.fighter2.momentum);
    }
}

export function resetBattleUI() {
    DOM.resultsSection.classList.remove('show');
    // Reset environmental damage display
    DOM.environmentDamageDisplay.textContent = '';
    DOM.environmentImpactsList.innerHTML = '';
    DOM.environmentDamageDisplay.className = 'environmental-damage-level'; // Reset classes

    // Reset momentum display to neutral for next battle
    updateMomentumDisplay('fighter1', 0);
    updateMomentumDisplay('fighter2', 0);
    
    // Delay hiding to allow 'show' class removal animation to complete
    setTimeout(() => {
        if (!DOM.resultsSection.classList.contains('show')) {
            DOM.resultsSection.style.display = 'none';
        }
    }, 500); // Match transition duration
}

function displayFinalAnalysis(finalState, winnerId, isDraw = false, environmentState, locationId) {
    DOM.analysisList.innerHTML = ''; // Clear previous analysis
    const { fighter1, fighter2 } = finalState;

    const createListItem = (text, value, valueClass = 'modifier-neutral') => {
        const li = document.createElement('li');
        li.className = 'analysis-item';
        const spanReason = document.createElement('span');
        spanReason.innerHTML = text; // Use innerHTML to allow bold tags
        const spanValue = document.createElement('span');
        spanValue.textContent = value;
        spanValue.className = valueClass; // Apply class for styling
        li.appendChild(spanReason);
        li.appendChild(spanValue);
        DOM.analysisList.appendChild(li);
    };

    const createSummaryItem = (text, className = 'analysis-summary') => {
        if (!text) return; // Don't create if text is empty
        const li = document.createElement('li');
        li.className = className;
        li.innerHTML = `<em>${text}</em>`; // Use innerHTML for italics
        DOM.analysisList.appendChild(li);
    };
    
    const createLog = (log, title, className) => {
        if (!log || log.length === 0) return;
        const li = document.createElement('li');
        li.className = className;
        // Filter out any entries that are not strings or are empty strings after trimming
        const validLogEntries = log.filter(entry => {
            if (typeof entry === 'object' && entry !== null) { // Handle structured log entries
                return true; // Assume structured entries are always valid for now
            }
            return typeof entry === 'string' && entry.trim() !== '';
        });
        if (validLogEntries.length === 0 && (title.includes("AI Log") || title.includes("Interaction Log"))) {
            return;
        }
        const formattedLog = validLogEntries.map(entry => {
            if (typeof entry === 'object' && entry !== null) {
                // Basic formatting for structured AI log entries
                let parts = [];
                if(entry.turn) parts.push(`T${entry.turn}`);
                if(entry.phase) parts.push(`Phase:${entry.phase}`);
                if(entry.intent) parts.push(`Intent:${entry.intent}`);
                if(entry.prediction) parts.push(`Pred:${entry.prediction}`);
                if(entry.chosenMove) parts.push(`Move:${entry.chosenMove}`);
                if(entry.finalProb) parts.push(`Prob:${entry.finalProb}`);
                if(entry.actorState) parts.push(`HP:${entry.actorState.hp.toFixed(0)} E:${entry.actorState.energy.toFixed(0)} M:${entry.actorState.momentum} MS:${entry.actorState.mental}`);

                // Detailed considerations if available
                if (entry.consideredMoves && entry.consideredMoves.length > 0) {
                    const topConsiderations = entry.consideredMoves.slice(0, 3).map(m => `${m.name}(${m.prob})`).join(', ');
                    parts.push(`TopConsiderations:[${topConsiderations}]`);
                }

                return parts.join(' | ');
            }
            return JSON.stringify(entry, null, 2).replace(/^"|"$/g, '');
        }).join('<br>');
        li.innerHTML = `<strong>${title}:</strong><br><pre style="white-space: pre-wrap; word-break: break-all; font-size: 0.8em;"><code>${formattedLog || "No relevant log entries."}</code></pre>`;
        DOM.analysisList.appendChild(li);
    };
    
    // Display winner summary or draw summary
    if (!isDraw) {
        const winner = winnerId === fighter1.id ? fighter1 : fighter2;
        createSummaryItem(winner.summary); // Assuming summary is populated in battle engine
    } else {
        createSummaryItem("The fighters were too evenly matched for a decisive outcome.");
    }
    
    const spacer = document.createElement('li');
    spacer.className = 'analysis-item-spacer'; // For visual separation if needed
    DOM.analysisList.appendChild(spacer);
    
    // Fighter 1 Final Status
    const f1_status = isDraw ? 'DRAW' : (fighter1.id === winnerId ? 'VICTORIOUS' : 'DEFEATED');
    const f1_class = isDraw ? 'modifier-neutral' : (fighter1.id === winnerId ? 'modifier-plus' : 'modifier-minus');
    createListItem(`<b>${fighter1.name}'s Final Status:</b>`, f1_status, f1_class);
    createListItem(`  • Health:`, `${Math.round(fighter1.hp)} / 100 HP`);
    createListItem(`  • Mental State:`, fighter1.mentalState.level.toUpperCase());
    createListItem(`  • Momentum:`, fighter1.momentum);

    // Fighter 2 Final Status
    const f2_status = isDraw ? 'DRAW' : (fighter2.id === winnerId ? 'VICTORIOUS' : 'DEFEATED');
    const f2_class = isDraw ? 'modifier-neutral' : (fighter2.id === winnerId ? 'modifier-plus' : 'modifier-minus');
    createListItem(`<b>${fighter2.name}'s Final Status:</b>`, f2_status, f2_class);
    createListItem(`  • Health:`, `${Math.round(fighter2.hp)} / 100 HP`);
    createListItem(`  • Mental State:`, fighter2.mentalState.level.toUpperCase());
    createListItem(`  • Momentum:`, fighter2.momentum);
    
    DOM.analysisList.appendChild(spacer.cloneNode()); // Another spacer

    // Environmental Damage Analysis
    const currentLocData = locationConditions[locationId];
    if (environmentState && currentLocData && currentLocData.damageThresholds) {
        DOM.environmentDamageDisplay.textContent = `Environmental Damage: ${environmentState.damageLevel.toFixed(0)}%`;
        let damageClass = '';
        if (environmentState.damageLevel >= currentLocData.damageThresholds.catastrophic) {
            damageClass = 'catastrophic-damage';
        } else if (environmentState.damageLevel >= currentLocData.damageThresholds.severe) {
            damageClass = 'high-damage';
        } else if (environmentState.damageLevel >= currentLocData.damageThresholds.moderate) {
            damageClass = 'medium-damage';
        } else if (environmentState.damageLevel >= currentLocData.damageThresholds.minor) {
            damageClass = 'low-damage';
        }
        DOM.environmentDamageDisplay.className = `environmental-damage-level ${damageClass}`;

        DOM.environmentImpactsList.innerHTML = ''; // Clear previous impacts
        if (environmentState.specificImpacts && environmentState.specificImpacts.size > 0) {
            environmentState.specificImpacts.forEach(impact => {
                const li = document.createElement('li');
                li.textContent = impact;
                DOM.environmentImpactsList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = "The environment sustained minimal noticeable damage.";
            DOM.environmentImpactsList.appendChild(li);
        }
    } else {
        DOM.environmentDamageDisplay.textContent = 'Environmental Damage: N/A';
        DOM.environmentImpactsList.innerHTML = '<li>No specific impact data.</li>';
    }

    DOM.analysisList.appendChild(spacer.cloneNode());
    // AI Logs
    if (fighter1.aiLog && fighter1.aiLog.filter(e => (typeof e === 'string' && e.trim() !== '') || (typeof e === 'object' && e !== null)).length > 0) {
        createLog(fighter1.aiLog, `${fighter1.name}'s Battle Log`, 'ai-log');
    }
    if (fighter2.aiLog && fighter2.aiLog.filter(e => (typeof e === 'string' && e.trim() !== '') || (typeof e === 'object' && e !== null)).length > 0) {
        createLog(fighter2.aiLog, `${fighter2.name}'s Battle Log`, 'ai-log');
    }
     // Phase Log (appended to one of the AI logs or separately)
    if (fighter1.phaseLog && fighter1.phaseLog.length > 0) { // Assuming phaseLog is stored in fighter1
        createLog(fighter1.phaseLog, `Battle Phase Progression`, 'phase-log');
    }
}
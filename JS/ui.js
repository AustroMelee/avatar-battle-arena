// FILE: js/ui.js
'use strict';

import { characters } from './data_characters.js';
import { locations } from './locations.js';
import { locationConditions } from './location-battle-conditions.js'; 
import { resolveArchetypeLabel } from './engine_archetype-engine.js'; 
import { renderArchetypeDisplay } from './ui_archetype-display.js'; 
import { startSimulation, resetSimulationManager } from './simulation_mode_manager.js';
import { transformEventsToAnimationQueue, transformEventsToHtmlLog } from './battle_log_transformer.js';
import { initializeCameraControls } from './camera_control.js';


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
    winProbability: document.getElementById('win-probability'),
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
    simulationModeContainer: document.getElementById('simulation-mode-container'),
    animatedLogOutput: document.getElementById('animated-log-output'), 
    cancelSimulationBtn: document.getElementById('cancel-simulation'),
    zoomInBtn: document.getElementById('zoom-in'),
    zoomOutBtn: document.getElementById('zoom-out'),
    modeAnimatedRadio: document.getElementById('mode-animated'),
    modeInstantRadio: document.getElementById('mode-instant'),
    // ADDED for AI Log population
    detailedBattleLogsContent: document.getElementById('detailed-battle-logs-content'),
};

export const DOM_simulation_references = {
    simulationContainer: DOM.simulationModeContainer, 
    cancelButton: DOM.cancelSimulationBtn,
    battleResultsContainer: DOM.battleResultsContainer,
    winnerNameDisplay: DOM.winnerName,
    analysisListDisplay: DOM.analysisList,
    battleStoryDisplay: DOM.battleStory 
};

DOM.fighter1Select.type = 'hidden';
DOM.fighter1Select.id = 'fighter1-value';
DOM.fighter2Select.type = 'hidden';
DOM.fighter2Select.id = 'fighter2-value';
DOM.locationSelect.type = 'hidden';
DOM.locationSelect.id = 'location-value';

if (!document.getElementById('fighter1-value')) document.body.appendChild(DOM.fighter1Select);
if (!document.getElementById('fighter2-value')) document.body.appendChild(DOM.fighter2Select);
if (!document.getElementById('location-value')) document.body.appendChild(DOM.locationSelect);

export function getCharacterImage(characterId) {
    const character = characters[characterId];
    return character ? character.imageUrl : null;
}

function getElementClass(character) {
    if (!character || !character.techniques || character.techniques.length === 0) {
        return 'card-nonbender'; 
    }
    const mainElementTechnique = character.techniques.find(t => t.element);
    const mainElement = mainElementTechnique ? mainElementTechnique.element : 'nonbender';

    switch (mainElement) {
        case 'fire': case 'lightning': return 'card-fire';
        case 'water': case 'ice': return 'card-water';
        case 'earth': case 'metal': return 'card-earth';
        case 'air': return 'card-air';
        case 'special': return 'card-chi'; 
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
    if (character) { 
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
    } else {
        card.textContent = "Error: Char Undefined"; 
    }
    return card;
}

function handleCardSelection(character, fighterKey, selectedCard) {
    if (!character) return; 

    const grid = fighterKey === 'fighter1' ? DOM.fighter1Grid : DOM.fighter2Grid;
    const nameDisplay = fighterKey === 'fighter1' ? DOM.fighter1NameDisplay : DOM.fighter2NameDisplay;
    const hiddenInput = fighterKey === 'fighter1' ? DOM.fighter1Select : DOM.fighter2Select;

    const otherFighterInput = fighterKey === 'fighter1' ? DOM.fighter2Select : DOM.fighter1Select;
    if (otherFighterInput.value === character.id) {
        alert("A fighter cannot battle themselves. Please choose a different opponent.");
        return; 
    }

    if(grid) grid.querySelectorAll('.character-card').forEach(card => card.classList.remove('selected'));
    selectedCard.classList.add('selected');
    if(nameDisplay) nameDisplay.textContent = character.name;
    if(hiddenInput) hiddenInput.value = character.id;
    updateArchetypeInfo(); 
}

function populateCharacterGrids() {
    if (!DOM.fighter1Grid || !DOM.fighter2Grid) {
        console.error("Character grids not found in DOM for population.");
        return;
    }
    DOM.fighter1Grid.innerHTML = ''; 
    DOM.fighter2Grid.innerHTML = '';

    if (typeof characters !== 'object' || characters === null) {
        console.error("`characters` data is not a valid object.");
        DOM.fighter1Grid.textContent = "Character data error.";
        DOM.fighter2Grid.textContent = "Character data error.";
        return;
    }
    const characterList = Object.values(characters);

    const availableCharacters = characterList.filter(c => c && c.id && c.name && c.techniques && c.techniques.length > 0);
    const sortedCharacters = availableCharacters.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    if (sortedCharacters.length === 0) {
        console.warn("No available characters with techniques to populate grids.");
        DOM.fighter1Grid.textContent = "No characters available.";
        DOM.fighter2Grid.textContent = "No characters available.";
        return;
    }
    
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
    if (locationData) { 
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
    } else {
        card.textContent = "Error: Location Undefined"; 
    }
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
                effects.push(`<span class="${mod.damageMultiplier > 1.0 ? 'positive-impact' : 'negative-impact'}">Dmg ${mod.damageMultiplier > 1.0 ? '+' : ''}${(mod.damageMultiplier * 100 - 100).toFixed(0)}%</span>`);
            }
            if (mod.energyCostModifier !== undefined && mod.energyCostModifier !== 1.0) {
                effects.push(`<span class="${mod.energyCostModifier < 1.0 ? 'positive-impact' : 'negative-impact'}">Energy ${mod.energyCostModifier < 1.0 ? '-' : '+'}${(mod.energyCostModifier * 100 - 100).toFixed(0)}%</span>`);
            }
            impactDesc += effects.length > 0 ? effects.join(', ') : `neutral`;
            if (mod.description) impactDesc += ` <em style="font-size:0.9em; opacity:0.8">(${mod.description})</em>`;
            elementalImpacts.push(impactDesc);
        }
        summaryHtml += elementalImpacts.join('; ') || 'None notable.';
    }
    if (locConditions.fragility !== undefined) summaryHtml += `<br>Fragility: <span>${(locConditions.fragility * 100).toFixed(0)}%</span>.`;
    DOM.locationEnvironmentSummary.innerHTML = summaryHtml;
}

function handleLocationCardSelection(locationData, locationId, selectedCard) {
    if (!DOM.locationGrid || !DOM.locationNameDisplay || !DOM.locationSelect) return;
    DOM.locationGrid.querySelectorAll('.location-card').forEach(card => card.classList.remove('selected'));
    selectedCard.classList.add('selected');
    DOM.locationNameDisplay.textContent = locationData ? locationData.name : "Unknown Location";
    DOM.locationSelect.value = locationId;
    updateEnvironmentalSummary(locationId); 
    updateArchetypeInfo(); 
}

function populateLocationGrid() {
    if (!DOM.locationGrid) {
        console.error("Location grid not found in DOM for population.");
        return;
    }
    DOM.locationGrid.innerHTML = ''; 

    if (typeof locations !== 'object' || locations === null) {
        console.error("`locations` data is not a valid object.");
        DOM.locationGrid.textContent = "Location data error.";
        return;
    }
    const sortedLocations = Object.entries(locations).sort(([, a], [, b]) => (a.name || "").localeCompare(b.name || ""));
    
    if (sortedLocations.length === 0) {
        DOM.locationGrid.textContent = "No locations available.";
        return;
    }

    for (const [id, locationData] of sortedLocations) {
        if (locationData && locationData.name && locationData.imageUrl) { 
            const card = createLocationCard(locationData, id);
            DOM.locationGrid.appendChild(card);
        } else {
            console.warn(`Skipping invalid location data for ID: ${id}`);
        }
    }
    if (DOM.locationEnvironmentSummary) {
        DOM.locationEnvironmentSummary.innerHTML = 'Select a battlefield to see its environmental characteristics.';
    }
}

function initializeTimeToggle() {
    if (!DOM.timeToggleContainer || !DOM.timeFeedbackDisplay || !DOM.timeOfDayValue) {
        console.error("Time toggle elements not found in DOM.");
        return;
    }
    const buttons = DOM.timeToggleContainer.querySelectorAll('.time-toggle-btn');
    if (buttons.length === 0) {
        console.warn("No time toggle buttons found.");
        DOM.timeFeedbackDisplay.innerHTML = "Time toggle unavailable.";
        return;
    }
    DOM.timeFeedbackDisplay.innerHTML = "It is currently <b>Day</b>. Firebenders are empowered.";
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            const time = button.dataset.value;
            DOM.timeOfDayValue.value = time;
            DOM.timeFeedbackDisplay.innerHTML = `It is now <b>${time.charAt(0).toUpperCase() + time.slice(1)}</b>. ${time === 'day' ? 'Firebenders are empowered.' : 'Waterbenders are empowered.'}`;
        });
    });
}

function updateMomentumDisplay(fighterKey, momentumValue) {
    const momentumElement = fighterKey === 'fighter1' ? DOM.fighter1MomentumValue : DOM.fighter2MomentumValue;
    if (!momentumElement) return;
    momentumElement.textContent = String(momentumValue);
    momentumElement.classList.remove('momentum-positive', 'momentum-negative', 'momentum-neutral');
    if (momentumValue > 0) momentumElement.classList.add('momentum-positive');
    else if (momentumValue < 0) momentumElement.classList.add('momentum-negative');
    else momentumElement.classList.add('momentum-neutral');
}

export function populateUI() {
    populateCharacterGrids();
    populateLocationGrid();
    initializeTimeToggle();
    updateMomentumDisplay('fighter1', 0);
    updateMomentumDisplay('fighter2', 0);
    updateArchetypeInfo();
    if (DOM.animatedLogOutput && DOM.zoomInBtn && DOM.zoomOutBtn) {
        initializeCameraControls(DOM.animatedLogOutput, DOM.zoomInBtn, DOM.zoomOutBtn);
    } else {
        console.warn("Animated log output or zoom buttons not found for camera control initialization.");
    }
}

export function showLoadingState(simulationMode) {
    if (simulationMode === "animated") {
        if(DOM.resultsSection) DOM.resultsSection.style.display = 'none'; 
        if(DOM.simulationModeContainer) DOM.simulationModeContainer.classList.remove('hidden');
        if(DOM.animatedLogOutput) DOM.animatedLogOutput.innerHTML = `<div class="loading"><div class="spinner"></div><p>Preparing animated simulation...</p></div>`;
    } else { 
        if(DOM.simulationModeContainer) DOM.simulationModeContainer.classList.add('hidden'); 
        if(DOM.resultsSection) {
            DOM.resultsSection.classList.remove('show');
            DOM.resultsSection.style.display = 'block';
        }
        if(DOM.loadingSpinner) DOM.loadingSpinner.classList.remove('hidden');
        if(DOM.battleResultsContainer) DOM.battleResultsContainer.classList.add('hidden');
    }
    if(DOM.battleBtn) DOM.battleBtn.disabled = true;
    if(DOM.vsDivider) DOM.vsDivider.classList.add('clash');
    
    const targetScrollElement = simulationMode === "animated" ? DOM.simulationModeContainer : DOM.resultsSection;
    if (targetScrollElement) {
        targetScrollElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

export function showResultsState(battleResult, simulationMode) {
    if (!battleResult || !battleResult.finalState) {
        console.error("Invalid battleResult passed to showResultsState", battleResult);
        if (DOM.winnerName) DOM.winnerName.textContent = "Error processing results.";
        if (DOM.battleStory) DOM.battleStory.innerHTML = "<p>An error occurred, and results cannot be displayed.</p>";
        if (DOM.loadingSpinner) DOM.loadingSpinner.classList.add('hidden');
        if (DOM.battleBtn) DOM.battleBtn.disabled = false;
        return;
    }

    if(DOM.vsDivider) DOM.vsDivider.classList.remove('clash');
    if(DOM.loadingSpinner) DOM.loadingSpinner.classList.add('hidden'); 

    const displayFinalResultsPanel = (result) => {
        if (!DOM.winnerName || !DOM.winProbability || !DOM.battleResultsContainer || !DOM.resultsSection || !DOM.battleBtn) {
            console.error("One or more critical DOM elements for displaying final results are missing.");
            return;
        }

        if (result.isDraw) {
            DOM.winnerName.textContent = `A Stalemate!`;
            DOM.winProbability.textContent = `The battle ends in a draw.`;
        } else if (result.winnerId && characters[result.winnerId]) {
            DOM.winnerName.textContent = `${characters[result.winnerId].name} Wins!`;
            DOM.winProbability.textContent = `A decisive victory.`;
        } else { 
            DOM.winnerName.textContent = `Battle Concluded`;
            DOM.winProbability.textContent = `Outcome details below.`;
        }
        
        const locationId = document.getElementById('location-value')?.value;
        if (locationId) { 
            displayFinalAnalysis(result.finalState, result.winnerId, result.isDraw, result.environmentState, locationId);
        } else {
            console.error("Location ID not found for final analysis.");
            if(DOM.analysisList) DOM.analysisList.innerHTML = "<li>Error: Location data missing for analysis.</li>";
        }
        
        if (result.finalState?.fighter1) updateMomentumDisplay('fighter1', result.finalState.fighter1.momentum);
        if (result.finalState?.fighter2) updateMomentumDisplay('fighter2', result.finalState.fighter2.momentum);
        
        DOM.battleResultsContainer.classList.remove('hidden');
        DOM.resultsSection.style.display = 'block'; 
        void DOM.resultsSection.offsetWidth;
        DOM.resultsSection.classList.add('show');
        
        if (simulationMode === "instant" || (simulationMode === "animated" && DOM.simulationModeContainer?.classList.contains('hidden'))) {
           DOM.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        DOM.battleBtn.disabled = false;
    };
    
    if (simulationMode === "animated") {
        if(DOM.animatedLogOutput) DOM.animatedLogOutput.innerHTML = ''; 
        
        const animationQueue = transformEventsToAnimationQueue(battleResult.log);
        startSimulation(animationQueue, battleResult, (finalBattleResult, wasCancelledOrError) => {
            if (wasCancelledOrError && DOM.battleStory && finalBattleResult.log) {
                DOM.battleStory.innerHTML = transformEventsToHtmlLog(finalBattleResult.log);
            }
            displayFinalResultsPanel(finalBattleResult); 
            if(DOM.simulationModeContainer) DOM.simulationModeContainer.classList.add('hidden');
        });
    } else { 
        if(DOM.simulationModeContainer) DOM.simulationModeContainer.classList.add('hidden'); 
        if(DOM.battleStory && battleResult.log) DOM.battleStory.innerHTML = transformEventsToHtmlLog(battleResult.log);
        displayFinalResultsPanel(battleResult);
    }
}

export function resetBattleUI() {
    if(DOM.resultsSection) DOM.resultsSection.classList.remove('show');
    if(DOM.environmentDamageDisplay) {
        DOM.environmentDamageDisplay.textContent = '';
        DOM.environmentDamageDisplay.className = 'environmental-damage-level';
    }
    if(DOM.environmentImpactsList) DOM.environmentImpactsList.innerHTML = '';
    if(DOM.battleStory) DOM.battleStory.innerHTML = ''; 
    if(DOM.analysisList) DOM.analysisList.innerHTML = '';
    if(DOM.winnerName) DOM.winnerName.textContent = '';
    if(DOM.winProbability) DOM.winProbability.textContent = '';
    
    // Reset AI log content specifically
    if(DOM.detailedBattleLogsContent) {
        DOM.detailedBattleLogsContent.innerHTML = '';
        // Ensure it's collapsed
        const toggleBtn = document.getElementById('toggle-detailed-logs-btn');
        if (toggleBtn && !DOM.detailedBattleLogsContent.classList.contains('collapsed')) {
            DOM.detailedBattleLogsContent.classList.add('collapsed');
            toggleBtn.setAttribute('aria-expanded', 'false');
            toggleBtn.textContent = 'Show Detailed Battle Logs ►';
        }
    }
    
    resetSimulationManager();

    updateMomentumDisplay('fighter1', 0);
    updateMomentumDisplay('fighter2', 0);
    
    setTimeout(() => {
        if (DOM.resultsSection && !DOM.resultsSection.classList.contains('show')) {
            DOM.resultsSection.style.display = 'none';
        }
    }, 500);
}

function displayFinalAnalysis(finalState, winnerId, isDraw = false, environmentState, locationId) {
    if (!DOM.analysisList) {
        console.error("Analysis list DOM element not found.");
        return;
    }
    DOM.analysisList.innerHTML = ''; 
    if (!finalState || !finalState.fighter1 || !finalState.fighter2) {
        console.error("Final state for analysis is incomplete.");
        DOM.analysisList.innerHTML = "<li>Error: Analysis data incomplete.</li>";
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
        DOM.analysisList.appendChild(li);
    };
    
    const createSummaryItem = (text) => {
        if (!text || typeof text !== 'string') return; 
        const li = document.createElement('li');
        li.className = 'analysis-summary'; 
        li.innerHTML = `<em>${text.trim()}</em>`; 
        DOM.analysisList.appendChild(li);
    };
    
    if (!isDraw && winnerId) {
        const winner = winnerId === fighter1.id ? fighter1 : fighter2;
        createSummaryItem(winner.summary || `${winner.name} demonstrated superior skill.`);
    } else {
        createSummaryItem("The fighters were too evenly matched for a decisive outcome.");
    }
    
    const spacer = document.createElement('li');
    spacer.className = 'analysis-item-spacer';
    DOM.analysisList.appendChild(spacer);
    
    const f1_status = isDraw ? 'DRAW' : (fighter1.id === winnerId ? 'VICTORIOUS' : 'DEFEATED');
    const f1_class = isDraw ? 'modifier-neutral' : (fighter1.id === winnerId ? 'modifier-plus' : 'modifier-minus');
    createListItem(`<b>${fighter1.name}'s Final Status:</b>`, f1_status, f1_class);
    createListItem(`  • Health:`, `${Math.round(fighter1.hp)} / 100 HP`);
    createListItem(`  • Energy:`, `${Math.round(fighter1.energy)} / 100`);
    createListItem(`  • Mental State:`, fighter1.mentalState.level.toUpperCase());
    createListItem(`  • Momentum:`, fighter1.momentum);

    const f2_status = isDraw ? 'DRAW' : (fighter2.id === winnerId ? 'VICTORIOUS' : 'DEFEATED');
    const f2_class = isDraw ? 'modifier-neutral' : (fighter2.id === winnerId ? 'modifier-plus' : 'modifier-minus');
    createListItem(`<b>${fighter2.name}'s Final Status:</b>`, f2_status, f2_class);
    createListItem(`  • Health:`, `${Math.round(fighter2.hp)} / 100 HP`);
    createListItem(`  • Energy:`, `${Math.round(fighter2.energy)} / 100`);
    createListItem(`  • Mental State:`, fighter2.mentalState.level.toUpperCase());
    createListItem(`  • Momentum:`, fighter2.momentum);
    
    DOM.analysisList.appendChild(spacer.cloneNode()); 

    const currentLocData = locationConditions[locationId];
    if (environmentState && DOM.environmentDamageDisplay && DOM.environmentImpactsList && currentLocData && currentLocData.damageThresholds) {
        DOM.environmentDamageDisplay.textContent = `Environmental Damage: ${environmentState.damageLevel.toFixed(0)}%`;
        let damageClass = '';
        if (environmentState.damageLevel >= currentLocData.damageThresholds.catastrophic) damageClass = 'catastrophic-damage';
        else if (environmentState.damageLevel >= currentLocData.damageThresholds.severe) damageClass = 'high-damage';
        else if (environmentState.damageLevel >= currentLocData.damageThresholds.moderate) damageClass = 'medium-damage';
        else if (environmentState.damageLevel >= currentLocData.damageThresholds.minor) damageClass = 'low-damage';
        DOM.environmentDamageDisplay.className = `environmental-damage-level ${damageClass}`;
        DOM.environmentImpactsList.innerHTML = '';
        if (environmentState.specificImpacts && environmentState.specificImpacts.size > 0) {
            environmentState.specificImpacts.forEach(impact => {
                if (typeof impact === 'string') { 
                    const li = document.createElement('li');
                    li.textContent = impact;
                    DOM.environmentImpactsList.appendChild(li);
                }
            });
        } else {
            DOM.environmentImpactsList.innerHTML = '<li>The environment sustained minimal noticeable damage.</li>';
        }
    } else {
        if(DOM.environmentDamageDisplay) DOM.environmentDamageDisplay.textContent = 'Environmental Damage: N/A';
        if(DOM.environmentImpactsList) DOM.environmentImpactsList.innerHTML = '<li>No specific impact data.</li>';
    }

    // --- Populate Detailed Battle Logs (AI Logs) ---
    if (DOM.detailedBattleLogsContent) {
        DOM.detailedBattleLogsContent.innerHTML = ''; // Clear previous logs

        let allLogsHtml = "";

        const formatAiLogEntries = (logEntries) => {
            return logEntries.map(entry => {
                if (typeof entry === 'object' && entry !== null) {
                    let parts = [];
                    if(entry.turn !== undefined) parts.push(`T${entry.turn}`);
                    if(entry.phase) parts.push(`Phase:${entry.phase}`);
                    if(entry.intent) parts.push(`Intent:${entry.intent}`);
                    if(entry.prediction) parts.push(`Pred:${entry.prediction}`);
                    if(entry.chosenMove) parts.push(`Move:${entry.chosenMove}`);
                    if(entry.finalProb) parts.push(`Prob:${entry.finalProb}`);
                    if(entry.actorState) {
                        const as = entry.actorState;
                        parts.push(`HP:${as.hp?.toFixed(0)} E:${as.energy?.toFixed(0)} M:${as.momentum} MS:${as.mental}`);
                    }
                    if (entry.consideredMoves && Array.isArray(entry.consideredMoves) && entry.consideredMoves.length > 0) {
                        const topConsiderations = entry.consideredMoves.slice(0, 3).map(m => `${m.name || 'UnknownMove'}(${m.prob || 'N/A'})`).join(', ');
                        parts.push(`Considered:[${topConsiderations}]`);
                    }
                    if (parts.length === 0) return JSON.stringify(entry);
                    return parts.join(' | ');
                }
                return String(entry).replace(/</g, "<").replace(/>/g, ">"); // Basic HTML escaping
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
            DOM.detailedBattleLogsContent.innerHTML = allLogsHtml;
        } else {
            DOM.detailedBattleLogsContent.innerHTML = '<p><em>No detailed AI logs available for this battle.</em></p>';
        }
    }
}
// FILE: js/ui.js
'use strict';

// This module manages all direct DOM manipulations.
// MODIFIED: The import for 'characters' now points to the new data directory.

import { characters } from '../data/characters.js';
import { locations } from './locations.js';

export const DOM = {
    fighter1Select: document.getElementById('fighter1'),
    fighter2Select: document.getElementById('fighter2'),
    locationSelect: document.getElementById('location'),
    timeOfDaySelect: document.getElementById('time-of-day'),
    emotionalModeCheckbox: document.getElementById('emotional-mode'), 
    fighter1NameDisplay: document.getElementById('fighter1-name-display'),
    fighter2NameDisplay: document.getElementById('fighter2-name-display'),
    fighter1Label: document.getElementById('fighter1-label'),
    fighter2Label: document.getElementById('fighter2-label'),
    fighter1Section: document.getElementById('fighter1-section'),
    fighter2Section: document.getElementById('fighter2-section'),
    battleBtn: document.getElementById('battleBtn'),
    resultsSection: document.getElementById('results'),
    loadingSpinner: document.getElementById('loading'),
    battleResultsContainer: document.getElementById('battle-results'),
    vsDivider: document.getElementById('vsDivider'),
    winnerName: document.getElementById('winner-name'),
    winProbability: document.getElementById('win-probability'),
    battleStory: document.getElementById('battle-story'),
    analysisList: document.getElementById('analysis-list'),
};

export function updateFighterDisplay(fighterKey) {
    const selectElement = fighterKey === 'fighter1' ? DOM.fighter1Select : DOM.fighter2Select;
    const nameDisplayElement = fighterKey === 'fighter1' ? DOM.fighter1NameDisplay : DOM.fighter2NameDisplay;
    const labelElement = fighterKey === 'fighter1' ? DOM.fighter1Label : DOM.fighter2Label;
    const selectedFighterId = selectElement.value;
    if (selectedFighterId && characters[selectedFighterId]) {
        nameDisplayElement.textContent = characters[selectedFighterId].name;
        labelElement.classList.add('hidden');
    } else {
        nameDisplayElement.textContent = fighterKey === 'fighter1' ? 'Fighter 1' : 'Fighter 2';
        labelElement.classList.remove('hidden');
    }
}

export function populateDropdowns() {
    const availableCharacters = Object.keys(characters).filter(id => characters[id].techniques && characters[id].techniques.length > 0);
    const sortedCharacterKeys = availableCharacters.sort((a, b) => characters[a].name.localeCompare(characters[b].name));
    
    sortedCharacterKeys.forEach(id => {
        DOM.fighter1Select.add(new Option(characters[id].name, id));
        DOM.fighter2Select.add(new Option(characters[id].name, id));
    });

    for (const id in locations) {
        if (locations.hasOwnProperty(id)) {
            DOM.locationSelect.add(new Option(locations[id].name, id));
        }
    }
}

function displayFinalAnalysis(finalState, winnerId, isDraw = false) {
    DOM.analysisList.innerHTML = '';
    const { fighter1, fighter2 } = finalState;

    const createListItem = (text, value, valueClass = 'modifier-neutral') => {
        const li = document.createElement('li');
        li.className = 'analysis-item';
        const spanReason = document.createElement('span');
        spanReason.innerHTML = text;
        const spanValue = document.createElement('span');
        spanValue.textContent = value;
        spanValue.className = valueClass;
        li.appendChild(spanReason);
        li.appendChild(spanValue);
        DOM.analysisList.appendChild(li);
    };

    const createSummaryItem = (text, className = 'analysis-summary') => {
        if (!text) return;
        const li = document.createElement('li');
        li.className = className;
        li.innerHTML = `<em>${text}</em>`;
        DOM.analysisList.appendChild(li);
    }
    
    const createLog = (log, title, className) => {
        if (!log || log.length === 0) return;
        const li = document.createElement('li');
        li.className = className;
        li.innerHTML = `<strong>${title}:</strong><br>` + log.join('<br>'); // Use <br> for readability
        DOM.analysisList.appendChild(li);
    }
    
    if (!isDraw) {
        const winner = winnerId === fighter1.id ? fighter1 : fighter2;
        createSummaryItem(winner.summary);
        createLog(winner.interactionLog, 'Interaction Log', 'interaction-log');
    } else {
        createSummaryItem("The fighters were too evenly matched for a decisive outcome.");
        const combinedLog = [...new Set([...fighter1.interactionLog, ...fighter2.interactionLog])];
        createLog(combinedLog, 'Interaction Log', 'interaction-log');
    }
    
    const spacer = document.createElement('li');
    spacer.className = 'analysis-item-spacer';
    DOM.analysisList.appendChild(spacer);
    
    const f1_status = isDraw ? 'DRAW' : (fighter1.id === winnerId ? 'VICTORIOUS' : 'DEFEATED');
    const f1_class = isDraw ? 'modifier-neutral' : (fighter1.id === winnerId ? 'modifier-plus' : 'modifier-minus');
    createListItem(`<b>${fighter1.name}'s Final Status:</b>`, f1_status, f1_class);
    createListItem(`  • Health:`, `${Math.round(fighter1.hp)} / 100 HP`);
    createListItem(`  • Mental State:`, fighter1.mentalState.level.toUpperCase());

    const f2_status = isDraw ? 'DRAW' : (fighter2.id === winnerId ? 'VICTORIOUS' : 'DEFEATED');
    const f2_class = isDraw ? 'modifier-neutral' : (fighter2.id === winnerId ? 'modifier-plus' : 'modifier-minus');
    createListItem(`<b>${fighter2.name}'s Final Status:</b>`, f2_status, f2_class);
    createListItem(`  • Health:`, `${Math.round(fighter2.hp)} / 100 HP`);
    createListItem(`  • Mental State:`, fighter2.mentalState.level.toUpperCase());
    
    DOM.analysisList.appendChild(spacer.cloneNode());
    createLog(fighter1.aiLog, `${fighter1.name}'s AI Log`, 'ai-log');
    createLog(fighter2.aiLog, `${fighter2.name}'s AI Log`, 'ai-log');
}

export function showLoadingState() {
    DOM.resultsSection.classList.remove('show');
    DOM.resultsSection.style.display = 'block';
    DOM.loadingSpinner.classList.remove('hidden');
    DOM.battleResultsContainer.classList.add('hidden');
    DOM.battleBtn.disabled = true;
    DOM.vsDivider.classList.add('clash');

    setTimeout(() => {
        DOM.resultsSection.classList.add('show');
        DOM.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }, 10);
}

export function showResultsState(battleResult) {
    DOM.vsDivider.classList.remove('clash');
    
    if (battleResult.isDraw) {
        DOM.winnerName.textContent = `A Stalemate!`;
        DOM.winProbability.textContent = `The battle ends in a draw, with neither fighter able to gain the upper hand.`;
    } else {
        const winner = characters[battleResult.winnerId];
        DOM.winnerName.textContent = `${winner.name} Wins!`;
        DOM.winProbability.textContent = `A decisive victory after a fierce battle.`;
        const winnerSection = battleResult.winnerId === DOM.fighter1Select.value ? DOM.fighter1Section : DOM.fighter2Section;
        winnerSection.classList.add('winner-highlight');
    }

    DOM.battleStory.innerHTML = battleResult.log;
    displayFinalAnalysis(battleResult.finalState, battleResult.winnerId, battleResult.isDraw);

    DOM.loadingSpinner.classList.add('hidden');
    DOM.battleResultsContainer.classList.remove('hidden');
    DOM.battleBtn.disabled = false;
}

export function resetBattleUI() {
    DOM.fighter1Section.classList.remove('winner-highlight');
    DOM.fighter2Section.classList.remove('winner-highlight');
    DOM.resultsSection.classList.remove('show');
    setTimeout(() => {
        if (!DOM.resultsSection.classList.contains('show')) {
            DOM.resultsSection.style.display = 'none';
        }
    }, 500);
}
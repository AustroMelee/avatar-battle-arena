// FILE: ui.js
'use strict';

import { characters } from './characters.js';
import { locations } from './locations.js';

export const DOM = {
    fighter1Select: document.getElementById('fighter1'),
    fighter2Select: document.getElementById('fighter2'),
    locationSelect: document.getElementById('location'),
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

function displayFinalAnalysis(finalState, winnerId) {
    DOM.analysisList.innerHTML = '';
    const { fighter1, fighter2 } = finalState;
    const winner = winnerId === fighter1.id ? fighter1 : fighter2;
    const loser = winnerId === fighter1.id ? fighter2 : fighter1;

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

    const createSummaryItem = (text) => {
        if (!text) return;
        const li = document.createElement('li');
        li.className = 'analysis-summary';
        li.innerHTML = `<em>${text}</em>`;
        DOM.analysisList.appendChild(li);
    }

    createSummaryItem(winner.summary || loser.summary);

    createListItem(`<b>${winner.name}'s Final Status:</b>`, 'VICTORIOUS', 'modifier-plus');
    createListItem(`  • Health:`, `${Math.round(winner.hp)} / 100 HP`);
    createListItem(`  • Energy:`, `${Math.round(winner.energy)} / 100`);
    createListItem(`  • Momentum:`, `${Math.round(winner.momentum)}`);

    const spacer = document.createElement('li');
    spacer.className = 'analysis-item-spacer';
    DOM.analysisList.appendChild(spacer);

    createListItem(`<b>${loser.name}'s Final Status:</b>`, 'DEFEATED', 'modifier-minus');
    createListItem(`  • Health:`, `${Math.round(loser.hp)} / 100 HP`);
    createListItem(`  • Energy:`, `${Math.round(loser.energy)} / 100`);
    createListItem(`  • Momentum:`, `${Math.round(loser.momentum)}`);
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
    
    DOM.winnerName.textContent = `${characters[battleResult.winnerId].name} Wins!`;
    DOM.winProbability.textContent = `A decisive victory after a fierce battle.`;
    const winnerSection = battleResult.winnerId === DOM.fighter1Select.value ? DOM.fighter1Section : DOM.fighter2Section;
    winnerSection.classList.add('winner-highlight');

    DOM.battleStory.innerHTML = battleResult.log;
    displayFinalAnalysis(battleResult.finalState, battleResult.winnerId);

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
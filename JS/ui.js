// FILE: js/ui.js
'use strict';

// V2: Implements the "Mortal Kombat" style card-based UI.

import { characters } from './data/characters.js';
import { locations } from './locations.js';

// Add the new grid containers to the DOM object
export const DOM = {
    fighter1Grid: document.getElementById('fighter1-grid'),
    fighter2Grid: document.getElementById('fighter2-grid'),
    locationSelect: document.getElementById('location'),
    timeOfDaySelect: document.getElementById('time-of-day'),
    emotionalModeCheckbox: document.getElementById('emotional-mode'),
    fighter1NameDisplay: document.getElementById('fighter1-name-display'),
    fighter2NameDisplay: document.getElementById('fighter2-name-display'),
    battleBtn: document.getElementById('battleBtn'),
    resultsSection: document.getElementById('results'),
    loadingSpinner: document.getElementById('loading'),
    battleResultsContainer: document.getElementById('battle-results'),
    vsDivider: document.getElementById('vsDivider'),
    winnerName: document.getElementById('winner-name'),
    winProbability: document.getElementById('win-probability'),
    battleStory: document.getElementById('battle-story'),
    analysisList: document.getElementById('analysis-list'),
    // Hidden inputs to store the selected fighter IDs
    fighter1Select: document.createElement('input'),
    fighter2Select: document.createElement('input'),
};

// Hide the new inputs
DOM.fighter1Select.type = 'hidden';
DOM.fighter2Select.type = 'hidden';
document.body.appendChild(DOM.fighter1Select);
document.body.appendChild(DOM.fighter2Select);


function getElementClass(character) {
    const mainElement = character.techniques.find(t => t.element)?.element || 'nonbender';
    switch (mainElement) {
        case 'fire':
        case 'lightning':
            return 'card-fire';
        case 'water':
        case 'ice':
            return 'card-water';
        case 'earth':
        case 'metal':
            return 'card-earth';
        case 'air':
            return 'card-air';
        case 'special': // chi-blocking
            return 'card-chi';
        default:
            return 'card-nonbender';
    }
}

function createCharacterCard(character, fighterKey) {
    const card = document.createElement('div');
    card.className = 'character-card';
    card.classList.add(getElementClass(character));
    card.dataset.id = character.id;
    
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

    // Remove 'selected' class from all cards in the same grid
    grid.querySelectorAll('.character-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Add 'selected' class to the clicked card
    selectedCard.classList.add('selected');

    // Update the display and hidden input
    nameDisplay.textContent = character.name;
    hiddenInput.value = character.id;
}


function populateCharacterGrids() {
    const availableCharacters = Object.values(characters).filter(c => c.techniques && c.techniques.length > 0);
    const sortedCharacters = availableCharacters.sort((a, b) => a.name.localeCompare(b.name));

    sortedCharacters.forEach(character => {
        // Create a card for each grid
        const card1 = createCharacterCard(character, 'fighter1');
        const card2 = createCharacterCard(character, 'fighter2');
        
        DOM.fighter1Grid.appendChild(card1);
        DOM.fighter2Grid.appendChild(card2);
    });
}

export function populateDropdowns() {
    // This function now populates both character grids and location dropdown
    populateCharacterGrids();

    for (const id in locations) {
        if (locations.hasOwnProperty(id)) {
            DOM.locationSelect.add(new Option(locations[id].name, id));
        }
    }
}

// All other functions from ui.js remain largely the same, but we can remove updateFighterDisplay
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
        DOM.winnerName.textContent = `${characters[battleResult.winnerId].name} Wins!`;
        DOM.winProbability.textContent = `A decisive victory after a fierce battle.`;
    }

    DOM.battleStory.innerHTML = battleResult.log;
    displayFinalAnalysis(battleResult.finalState, battleResult.winnerId, battleResult.isDraw);

    DOM.loadingSpinner.classList.add('hidden');
    DOM.battleResultsContainer.classList.remove('hidden');
    DOM.battleBtn.disabled = false;
}

export function resetBattleUI() {
    DOM.resultsSection.classList.remove('show');
    setTimeout(() => {
        if (!DOM.resultsSection.classList.contains('show')) {
            DOM.resultsSection.style.display = 'none';
        }
    }, 500);
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
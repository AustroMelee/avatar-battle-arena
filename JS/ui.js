'use strict';

import { characters, locations } from './data/index.js';

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
    const sortedCharacterKeys = Object.keys(characters).sort((a, b) => characters[a].name.localeCompare(characters[b].name));
    sortedCharacterKeys.forEach(id => {
        if (characters.hasOwnProperty(id)) {
            DOM.fighter1Select.add(new Option(characters[id].name, id));
            DOM.fighter2Select.add(new Option(characters[id].name, id));
        }
    });
    for (const id in locations) {
        if (locations.hasOwnProperty(id)) {
            DOM.locationSelect.add(new Option(locations[id].name, id));
        }
    }
}

export function displayOutcomeAnalysis(outcomeReasons, winnerId, loserId, f1FinalScore, f2FinalScore) {
    DOM.analysisList.innerHTML = '';
    const f1Id = DOM.fighter1Select.value;
    const f2Id = DOM.fighter2Select.value;
    
    const createListItem = (reasonText, modifier, fighterId = null) => {
        const li = document.createElement('li');
        li.className = 'analysis-item';
        
        const spanReason = document.createElement('span');
        spanReason.innerHTML = reasonText; // Use the raw reason text which already contains HTML
        
        const spanModifier = document.createElement('span');
        if (typeof modifier === 'number') {
            spanModifier.textContent = (modifier > 0 ? '+' : '') + Math.round(modifier);
            if (modifier > 0) spanModifier.className = 'modifier-plus';
            else if (modifier < 0) spanModifier.className = 'modifier-minus';
            else spanModifier.className = 'modifier-neutral';
        } else {
            spanModifier.textContent = modifier;
            spanModifier.className = 'modifier-neutral';
        }
        
        li.appendChild(spanReason);
        li.appendChild(spanModifier);
        DOM.analysisList.appendChild(li);
    };

    // Fighter 1 Breakdown - Corrected to use backticks ``
    createListItem(`<b>${characters[f1Id]?.name || 'Fighter 1'}'s Score Breakdown</b>`, '', f1Id);
    outcomeReasons.filter(r => r.fighterId === f1Id).forEach(reason => {
        createListItem(`  • <span class="char-${f1Id}">${reason.reason}</span>`, reason.modifier);
    });
    createListItem(`  • <b>Total Score</b>`, Math.round(f1FinalScore), f1Id);

    // Fighter 2 Breakdown - Corrected to use backticks ``
    createListItem(`<b>${characters[f2Id]?.name || 'Fighter 2'}'s Score Breakdown</b>`, '', f2Id);
    outcomeReasons.filter(r => r.fighterId === f2Id).forEach(reason => {
        createListItem(`  • <span class="char-${f2Id}">${reason.reason}</span>`, reason.modifier);
    });
    createListItem(`  • <b>Total Score</b>`, Math.round(f2FinalScore), f2Id);

    // Summary - Corrected to use backticks ``
    if (winnerId && loserId) {
        createListItem(`<b>${characters[winnerId].name} vs. ${characters[loserId].name} Summary</b>`, '');
        createListItem(`  • <span class="char-${winnerId}">${characters[winnerId].name}'s Overall Advantage</span>`, 'WIN');
    } else {
        createListItem('<b>The Battle Concluded in a Draw</b>', '');
    }
}

export function showLoadingState() {
    DOM.resultsSection.classList.add('show');
    DOM.loadingSpinner.classList.remove('hidden');
    DOM.battleResultsContainer.classList.add('hidden');
    DOM.battleBtn.disabled = true;
    DOM.vsDivider.classList.add('clash');
    DOM.resultsSection.scrollIntoView({ behavior: 'smooth' });
}

export function showResultsState(battleOutcome) {
    DOM.vsDivider.classList.remove('clash');
    if (battleOutcome.victoryType === 'draw') {
        DOM.winnerName.textContent = `It's a Draw!`;
        DOM.winProbability.textContent = `Both fighters proved equally formidable.`;
    } else {
        DOM.winnerName.textContent = `${characters[battleOutcome.winnerId].name} Wins!`;
        DOM.winProbability.textContent = `Calculated Victory Probability: ${battleOutcome.winProb}%`;
        const winnerSection = battleOutcome.winnerId === DOM.fighter1Select.value ? DOM.fighter1Section : DOM.fighter2Section;
        winnerSection.classList.add('winner-highlight');
    }

    DOM.battleStory.innerHTML = battleOutcome.story;
    displayOutcomeAnalysis(
        battleOutcome.outcomeReasons,
        battleOutcome.winnerId,
        battleOutcome.loserId,
        battleOutcome.f1FinalScore,
        battleOutcome.f2FinalScore
    );

    DOM.loadingSpinner.classList.add('hidden');
    DOM.battleResultsContainer.classList.remove('hidden');
    DOM.battleBtn.disabled = false;
}

export function resetBattleUI() {
    DOM.fighter1Section.classList.remove('winner-highlight');
    DOM.fighter2Section.classList.remove('winner-highlight');
}
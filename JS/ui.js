'use strict';
import { characters, locations } from './data/index.js';
/**
A centralized object to hold all DOM element references for easy access and maintenance.
*/
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
/**
Updates the fighter's name display when a character is selected from the dropdown.
@param {string} fighterKey - 'fighter1' or 'fighter2'.
*/
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
/**
Populates the character and location select dropdowns with data.
*/
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
/**
Renders the detailed breakdown of the battle outcome.
@param {Array} outcomeReasons - The list of reasons for score modifications.
@param {string} winnerId - The ID of the winning character.
@param {string} loserId - The ID of the losing character.
@param {number} f1FinalScore - The final calculated score for fighter 1.
@param {number} f2FinalScore - The final calculated score for fighter 2.
*/
export function displayOutcomeAnalysis(outcomeReasons, winnerId, loserId, f1FinalScore, f2FinalScore) {
DOM.analysisList.innerHTML = '';
const f1Id = DOM.fighter1Select.value;
const f2Id = DOM.fighter2Select.value;
const createListItem = (reasonText, modifier, fighterId = null) => {
const li = document.createElement('li');
li.className = 'analysis-item';
const spanReason = document.createElement('span');
 spanReason.innerHTML = fighterId ? `<span class="char-${fighterId}">${reasonText}</span>` : reasonText;

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
Use code with caution.
};
// Fighter 1 Breakdown
createListItem(<b>${characters[f1Id]?.name || 'Fighter 1'}'s Score Breakdown</b>, '', f1Id);
outcomeReasons.filter(r => r.fighterId === f1Id).forEach(reason => {
createListItem(&nbsp;&nbsp;• ${reason.reason}, reason.modifier, f1Id);
});
createListItem(&nbsp;&nbsp;• <b>Total Score</b>, Math.round(f1FinalScore), f1Id);
// Fighter 2 Breakdown
createListItem(<b>${characters[f2Id]?.name || 'Fighter 2'}'s Score Breakdown</b>, '', f2Id);
outcomeReasons.filter(r => r.fighterId === f2Id).forEach(reason => {
createListItem(&nbsp;&nbsp;• ${reason.reason}, reason.modifier, f2Id);
});
createListItem(&nbsp;&nbsp;• <b>Total Score</b>, Math.round(f2FinalScore), f2Id);
// Summary
if (winnerId && loserId) {
createListItem(<b>${characters[winnerId].name} vs. ${characters[loserId].name} Summary</b>, '');
createListItem(&nbsp;&nbsp;• ${characters[winnerId].name}'s Overall Advantage, 'WIN', winnerId);
} else {
createListItem('<b>The Battle Concluded in a Draw</b>', '');
}
}
/**
Transitions the UI into a loading state.
*/
export function showLoadingState() {
DOM.resultsSection.classList.add('show');
DOM.loadingSpinner.classList.remove('hidden');
DOM.battleResultsContainer.classList.add('hidden');
DOM.battleBtn.disabled = true;
DOM.vsDivider.classList.add('clash');
DOM.resultsSection.scrollIntoView({ behavior: 'smooth' });
}
/**
Transitions the UI to show the battle results.
@param {object} battleOutcome - The complete outcome object from the battle engine.
*/
export function showResultsState(battleOutcome) {
DOM.vsDivider.classList.remove('clash');
// Update winner announcement
if (battleOutcome.victoryType === 'draw') {
DOM.winnerName.textContent = It's a Draw!;
DOM.winProbability.textContent = Both fighters proved equally formidable.;
} else {
DOM.winnerName.textContent = ${characters[battleOutcome.winnerId].name} Wins!;
DOM.winProbability.textContent = Calculated Victory Probability: ${battleOutcome.winProb}%;
// Apply winner highlight
const winnerSection = battleOutcome.winnerId === DOM.fighter1Select.value ? DOM.fighter1Section : DOM.fighter2Section;
winnerSection.classList.add('winner-highlight');
}
// Update story and analysis
DOM.battleStory.innerHTML = battleOutcome.story;
displayOutcomeAnalysis(
battleOutcome.outcomeReasons,
battleOutcome.winnerId,
battleOutcome.loserId,
battleOutcome.f1FinalScore,
battleOutcome.f2FinalScore
);
// Toggle visibility
DOM.loadingSpinner.classList.add('hidden');
DOM.battleResultsContainer.classList.remove('hidden');
DOM.battleBtn.disabled = false;
}
/**
Resets UI elements for a new battle.
*/
export function resetBattleUI() {
DOM.fighter1Section.classList.remove('winner-highlight');
DOM.fighter2Section.classList.remove('winner-highlight');
}
//--- FILE: js/main.js ---//
'use strict';
import { calculateWinProbability, generateBattleStory } from './battle-engine.js';
import { DOM, populateDropdowns, updateFighterDisplay, showLoadingState, showResultsState, resetBattleUI } from './ui.js';
/**
Handles the main logic for starting a battle simulation.
*/
function handleBattleStart() {
const f1Id = DOM.fighter1Select.value;
const f2Id = DOM.fighter2Select.value;
const locId = DOM.locationSelect.value;
if (!f1Id || !f2Id || !locId) {
alert("Please select both fighters and a location.");
return;
}
if (f1Id === f2Id) {
alert('Please select two different fighters!');
return;
}
resetBattleUI();
showLoadingState();
// Simulate calculation time
setTimeout(() => {
try {
const battleOutcome = calculateWinProbability(f1Id, f2Id, locId);
const story = generateBattleStory(
battleOutcome.winnerId,
battleOutcome.loserId,
locId,
battleOutcome.outcomeReasons,
battleOutcome.victoryType,
battleOutcome.winProb,
battleOutcome.f1FinalScore,
battleOutcome.f2FinalScore,
battleOutcome.resolutionTone
);
// Attach the generated story to the outcome object
     battleOutcome.story = story;

     showResultsState(battleOutcome);

 } catch (error) {
     console.error("An error occurred during battle simulation:", error);
     alert("A critical error occurred. Please check the console and refresh.");
     // Reset UI state on error
     DOM.loadingSpinner.classList.add('hidden');
     DOM.battleBtn.disabled = false;
 }
Use code with caution.
}, 1500);
}
/**
Initializes the application by setting up the UI and event listeners.
*/
function init() {
// UI Setup
populateDropdowns();
updateFighterDisplay('fighter1');
updateFighterDisplay('fighter2');
// Event Listeners
DOM.battleBtn.addEventListener('click', handleBattleStart);
DOM.fighter1Select.addEventListener('change', () => updateFighterDisplay('fighter1'));
DOM.fighter2Select.addEventListener('change', () => updateFighterDisplay('fighter2'));
}
// Start the application once the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', init);
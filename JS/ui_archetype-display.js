// FILE: js/ui_archetype-display.js
'use strict';

export function renderArchetypeDisplay(data, domElements) {
    if (!domElements || !domElements.headline || !domElements.introA || !domElements.introB || !domElements.error) {
        console.error("Archetype Display: Required DOM elements are missing.");
        return;
    }

    if (data.error && data.error !== "Specific matchup title not found, using default.") { // Don't show soft error to user
        domElements.headline.textContent = '';
        domElements.introA.textContent = '';
        domElements.introB.textContent = '';
        domElements.error.textContent = data.error;
        domElements.container.classList.add('error-active');
        domElements.container.classList.remove('no-selection');

    } else {
        domElements.headline.textContent = data.label || '';
        domElements.introA.textContent = data.introA || '';
        domElements.introB.textContent = data.introB || '';
        domElements.error.textContent = ''; // Clear previous errors
        domElements.container.classList.remove('error-active');
        if (data.label === "Choose Your Destiny") {
             domElements.container.classList.add('no-selection');
        } else {
            domElements.container.classList.remove('no-selection');
        }
    }
}
// FILE: js/ui_archetype-display.js
"use strict";

import { characters } from "./data_characters.js";
import { allLocations } from "./data_locations_index.js";

export function renderArchetypeDisplay(data, domElements) {
    if (!domElements || !domElements.headline || !domElements.introA || !domElements.introB || !domElements.error) {
        console.error("Archetype Display: Required DOM elements are missing.");
        return;
    }

    if (data.error && data.error !== "Specific matchup title not found, using default.") { // Don't show soft error to user
        domElements.headline.textContent = "";
        domElements.introA.textContent = "";
        domElements.introB.textContent = "";
        domElements.error.textContent = data.error;
        domElements.container.classList.add("error-active");
        domElements.container.classList.remove("no-selection");

    } else {
        domElements.headline.textContent = data.label || "";
        domElements.introA.textContent = data.introA || "";
        domElements.introB.textContent = data.introB || "";
        domElements.error.textContent = ""; // Clear previous errors
        domElements.container.classList.remove("error-active");
        if (data.label === "Choose Your Destiny") {
             domElements.container.classList.add("no-selection");
        } else {
            domElements.container.classList.remove("no-selection");
        }

        // Update character and location images
        const aangImageElement = document.getElementById("aang-image");
        const azulaImageElement = document.getElementById("azula-image");
        const locationImageElement = document.getElementById("location-image");

        if (aangImageElement) {
            aangImageElement.src = characters["aang-airbending-only"]?.imageUrl || "";
        }
        if (azulaImageElement) {
            azulaImageElement.src = characters["azula"]?.imageUrl || "";
        }
        if (locationImageElement) {
            locationImageElement.src = allLocations["fire-nation-capital"]?.background || "";
        }
    }
}
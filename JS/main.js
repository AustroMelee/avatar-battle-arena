'use strict';

import { simulateBattle } from './engine_battle-engine-core.js';
import { characters } from '../data/data_characters.js';
import { locations } from '../data/data_mechanics_locations.js';

const archetypes = {}; // Cache for storing loaded archetype data

async function loadArchetypeData(characterId) {
    if (!characterId || archetypes[characterId]) {
        return; // Don't load if no ID or already loaded
    }
    try {
        const module = await import(`../data/data_archetype_${characterId}.js`);
        archetypes[characterId] = module[`${characterId}ArchetypeData`];
        console.log(`Loaded archetype data for: ${characterId}`);
    } catch (error) {
        console.error(`Failed to load archetype data for ${characterId}:`, error);
        archetypes[characterId] = null; // Mark as failed to avoid re-fetching
    }
}

function populateGrid(gridId, items, type, onSelect) {
    const grid = document.getElementById(gridId);
    grid.innerHTML = '';
    for (const key in items) {
        const item = items[key];
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.id = item.id;
        cell.innerHTML = `<img src="${item.imageUrl}" alt="${item.name}"><p>${item.name}</p>`;
        cell.addEventListener('click', () => onSelect(item.id, type));
        grid.appendChild(cell);
    }
}

async function updateArchetypeInfo(fighter1Id, fighter2Id) {
    await Promise.all([
        loadArchetypeData(fighter1Id),
        loadArchetypeData(fighter2Id)
    ]);

    const headline = document.getElementById('archetype-headline');
    const introA = document.getElementById('archetype-intro-a');
    const introB = document.getElementById('archetype-intro-b');
    const error = document.getElementById('archetype-error');
    
    headline.textContent = '';
    introA.textContent = '';
    introB.textContent = '';
    error.textContent = '';

    const archetype1 = archetypes[fighter1Id];
    const archetype2 = archetypes[fighter2Id];

    let data;
    // Prioritize checking fighter1's archetype for fighter2, then vice-versa
    if (archetype1 && archetype1[fighter2Id]) {
        const locationId = document.getElementById('location-value').value || '_DEFAULT_LOCATION_';
        data = archetype1[fighter2Id][locationId] || archetype1[fighter2Id]['_DEFAULT_LOCATION_'];
    } else if (archetype2 && archetype2[fighter1Id]) {
        const locationId = document.getElementById('location-value').value || '_DEFAULT_LOCATION_';
        data = archetype2[fighter1Id][locationId] || archetype2[fighter1Id]['_DEFAULT_LOCATION_'];
    }

    if (data) {
        headline.textContent = data.label;
        introA.textContent = data.introA;
        introB.textContent = data.introB;
    } else {
        error.textContent = 'No specific narrative data available for this matchup.';
    }
}

async function handleSelection(id, type) {
    document.getElementById(`${type}-value`).value = id;
    const name = type === 'location' ? locations[id].name : characters[id].name;
    document.getElementById(`${type}-name-display`).textContent = name;

    const f1 = document.getElementById('fighter1-value').value;
    const f2 = document.getElementById('fighter2-value').value;
    if (f1 && f2) {
        await updateArchetypeInfo(f1, f2);
    }
}

function handleBattle() {
    const f1 = document.getElementById('fighter1-value').value;
    const f2 = document.getElementById('fighter2-value').value;
    const loc = document.getElementById('location-value').value;
    const time = document.getElementById('time-of-day-value').value;
    const emotional = document.getElementById('emotional-mode').checked;

    if (!f1 || !f2 || !loc) {
        alert('Please select both fighters and a location.');
        return;
    }

    const resultsSection = document.getElementById('results');
    const loading = document.getElementById('loading');
    const battleResults = document.getElementById('battle-results');
    
    resultsSection.style.display = 'block';
    loading.classList.remove('hidden');
    battleResults.classList.add('hidden');

    setTimeout(() => {
        const result = simulateBattle(f1, f2, loc, time, emotional);
        
        loading.classList.add('hidden');
        battleResults.classList.remove('hidden');
        
        document.getElementById('winner-name').textContent = result.winner ? `${result.winner} is victorious!` : 'The battle is a draw!';
        document.getElementById('battle-story').textContent = result.victoryLine;
    }, 500);
}

function init() {
    populateGrid('fighter1-grid', characters, 'fighter1', handleSelection);
    populateGrid('fighter2-grid', characters, 'fighter2', handleSelection);
    populateGrid('location-grid', locations, 'location', handleSelection);

    document.getElementById('battleBtn').addEventListener('click', handleBattle);
    
    document.querySelectorAll('.time-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.time-toggle-btn.selected').classList.remove('selected');
            btn.classList.add('selected');
            document.getElementById('time-of-day-value').value = btn.dataset.value;
        });
    });
}

document.addEventListener('DOMContentLoaded', init); 
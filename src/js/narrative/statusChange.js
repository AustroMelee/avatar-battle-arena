/**
 * @fileoverview Status Change Narrative Generator
 * @description Handles narrative for character status changes (HP, energy, momentum, stun, etc.).
 * @version 1.0
 */

'use strict';

import { generateLogEvent } from '../utils_log_event.js';

/**
 * Generates narrative for status changes like HP, Energy, etc.
 * @param {object} battleState - The current battle state.
 * @param {object} character - The character affected.
 * @param {string} type - The type of change (e.g., 'hp_change', 'energy_change').
 * @param {*} oldValue - The value before the change.
 * @param {*} newValue - The value after the change.
 * @returns {object|null} A log event for the status change or null if no change.
 */
export function generateStatusChangeEvent(battleState, character, type, oldValue, newValue) {
    let text = '';
    let html_content = '';
    let isSignificant = false;

    switch (type) {
        case 'hp_change':
            const hpChange = newValue - oldValue;
            if (hpChange !== 0) {
                text = `${character.name} ${hpChange > 0 ? 'recovers' : 'loses'} ${Math.abs(hpChange)} HP. (Now: ${newValue})`;
                html_content = `<p class="status-change ${hpChange > 0 ? 'hp-heal' : 'hp-damage'} char-${character.id}">${character.name} <span class="hp-change-value">${hpChange > 0 ? '+' : ''}${hpChange} HP</span></p>`;
                if (Math.abs(hpChange) >= 20 || newValue <= character.maxHp * 0.25) isSignificant = true;
            }
            break;

        case 'energy_change':
            const energyChange = newValue - oldValue;
            if (energyChange !== 0) {
                text = `${character.name} ${energyChange > 0 ? 'gains' : 'loses'} ${Math.abs(energyChange)} Energy. (Now: ${newValue})`;
                html_content = `<p class="status-change ${energyChange > 0 ? 'energy-gain' : 'energy-loss'} char-${character.id}">${character.name} <span class="energy-change-value">${energyChange > 0 ? '+' : ''}${energyChange} Energy</span></p>`;
                if (Math.abs(energyChange) >= 15) isSignificant = true;
            }
            break;

        case 'momentum_change':
            const momentumChange = newValue - oldValue;
            if (momentumChange !== 0) {
                text = `${character.name} ${momentumChange > 0 ? 'gains' : 'loses'} ${Math.abs(momentumChange)} Momentum. (Now: ${newValue})`;
                html_content = `<p class="status-change ${momentumChange > 0 ? 'momentum-gain' : 'momentum-loss'} char-${character.id}">${character.name} <span class="momentum-change-value">${momentumChange > 0 ? '+' : ''}${momentumChange} Momentum</span></p>`;
                if (Math.abs(momentumChange) >= 10) isSignificant = true;
            }
            break;

        case 'stun_status_change':
            if (newValue > 0 && oldValue === 0) {
                text = `${character.name} is stunned for ${newValue} turn${newValue > 1 ? 's' : ''}!`;
                html_content = `<p class="status-change stun-applied char-${character.id}">${character.name} is <span class="stun-duration">stunned for ${newValue} turn${newValue > 1 ? 's' : ''}</span>!</p>`;
                isSignificant = true;
            } else if (newValue === 0 && oldValue > 0) {
                text = `${character.name} recovers from being stunned.`;
                html_content = `<p class="status-change stun-removed char-${character.id}">${character.name} <span class="stun-recovery">recovers from being stunned</span>.</p>`;
                isSignificant = false;
            }
            break;

        case 'mental_state_change':
            if (oldValue !== newValue) {
                text = `${character.name}'s mental state changes from ${oldValue} to ${newValue}.`;
                html_content = `<p class="status-change mental-state-change char-${character.id}">${character.name} becomes <span class="mental-state-${newValue.toLowerCase()}">${newValue}</span></p>`;
                isSignificant = newValue === 'Broken' || newValue === 'Shaken';
            }
            break;
        
        default:
            console.warn(`generateStatusChangeEvent: Unknown type "${type}"`);
            return null;
    }

    if (!text) return null; // No change occurred.

    return generateLogEvent(battleState, {
        type: 'status_change_event',
        actorId: character.id,
        characterName: character.name,
        text: text,
        html_content: html_content,
        isSignificant: isSignificant,
        statusType: type,
        oldValue: oldValue,
        newValue: newValue,
    });
} 
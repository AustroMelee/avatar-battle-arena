/**
 * @fileoverview Battle Results Renderer Module
 * @description Functions that accept analyzed data and create DOM nodes or HTML strings.
 * No direct DOM manipulation - returns elements or HTML for insertion.
 * @version 1.0
 */

'use strict';

/**
 * Creates a list item element for analysis display
 * @param {string} text - The label text (can contain HTML)
 * @param {string|number} value - The value to display
 * @param {string} valueClass - CSS class for the value span
 * @returns {HTMLElement} The created list item element
 */
export function createAnalysisListItem(text, value, valueClass = 'modifier-neutral') {
    const li = document.createElement('li');
    li.className = 'analysis-item';
    
    const spanReason = document.createElement('span');
    spanReason.innerHTML = text;
    
    const spanValue = document.createElement('span');
    spanValue.textContent = String(value);
    spanValue.className = valueClass;
    
    li.appendChild(spanReason);
    li.appendChild(spanValue);
    
    return li;
}

/**
 * Creates a summary item element for battle analysis
 * @param {string} text - The summary text
 * @returns {HTMLElement|null} The created list item element or null if invalid text
 */
export function createAnalysisSummaryItem(text) {
    if (!text || typeof text !== 'string') return null;
    
    const li = document.createElement('li');
    li.className = 'analysis-summary';
    li.innerHTML = `<em>${text.trim()}</em>`;
    
    return li;
}

/**
 * Creates a spacer element for analysis lists
 * @returns {HTMLElement} The created spacer element
 */
export function createAnalysisSpacerItem() {
    const li = document.createElement('li');
    li.className = 'analysis-item-spacer';
    return li;
}

/**
 * Renders fighter status analysis to DOM elements
 * @param {Object} fighterAnalysis - Analyzed fighter data
 * @returns {HTMLElement[]} Array of DOM elements for the fighter
 */
export function renderFighterAnalysis(fighterAnalysis) {
    const elements = [];
    const { name, status, statusClass, stats } = fighterAnalysis;
    
    // Fighter status header
    elements.push(createAnalysisListItem(
        `<b>${name}'s Final Status:</b>`, 
        status, 
        statusClass
    ));
    
    // Fighter stats
    elements.push(createAnalysisListItem('  • Health:', stats.health.display));
    elements.push(createAnalysisListItem('  • Energy:', stats.energy.display));
    elements.push(createAnalysisListItem('  • Mental State:', stats.mentalState.display));
    elements.push(createAnalysisListItem('  • Momentum:', stats.momentum.display));
    elements.push(createAnalysisListItem('  • Incapacitation Score:', stats.incapacitationScore.display));
    elements.push(createAnalysisListItem(
        '  • Escalation State:', 
        stats.escalationState.display, 
        stats.escalationState.class
    ));
    
    return elements;
}

/**
 * Renders environmental impact analysis
 * @param {Object} environmentAnalysis - Analyzed environment data
 * @param {HTMLElement} damageDisplay - Element to update with damage info
 * @param {HTMLElement} impactsList - Element to populate with impacts
 */
export function renderEnvironmentImpact(environmentAnalysis, damageDisplay, impactsList) {
    if (!damageDisplay || !impactsList) return;
    
    // Update damage display
    damageDisplay.textContent = environmentAnalysis.damage;
    damageDisplay.className = `environmental-damage-level ${environmentAnalysis.damageClass}`;
    
    // Clear and populate impacts list
    impactsList.innerHTML = '';
    environmentAnalysis.impacts.forEach(impact => {
        const li = document.createElement('li');
        li.textContent = impact;
        impactsList.appendChild(li);
    });
}

/**
 * Renders complete battle analysis to a target element
 * @param {Object} battleAnalysis - Complete analyzed battle data
 * @param {HTMLElement} targetElement - Element to populate with analysis
 */
export function renderBattleAnalysis(battleAnalysis, targetElement) {
    if (!targetElement || !battleAnalysis.isValid) {
        if (targetElement) {
            targetElement.innerHTML = battleAnalysis.error 
                ? `<li>Error: ${battleAnalysis.error}</li>`
                : '<li>Error: Invalid battle analysis data.</li>';
        }
        return;
    }
    
    // Clear target element
    targetElement.innerHTML = '';
    
    // Add winner summary
    if (battleAnalysis.winner.message) {
        const summaryItem = createAnalysisSummaryItem(battleAnalysis.winner.message);
        if (summaryItem) targetElement.appendChild(summaryItem);
    }
    
    // Add spacer
    targetElement.appendChild(createAnalysisSpacerItem());
    
    // Add fighter 1 analysis
    const fighter1Elements = renderFighterAnalysis(battleAnalysis.fighters.fighter1);
    fighter1Elements.forEach(element => targetElement.appendChild(element));
    
    // Add fighter 2 analysis
    const fighter2Elements = renderFighterAnalysis(battleAnalysis.fighters.fighter2);
    fighter2Elements.forEach(element => targetElement.appendChild(element));
    
    // Add final spacer
    targetElement.appendChild(createAnalysisSpacerItem());
}

/**
 * Creates HTML string for battle log content
 * @param {string} htmlLog - Pre-processed HTML log content
 * @returns {string} HTML string ready for innerHTML
 */
export function renderBattleLogContent(htmlLog) {
    return htmlLog || '<p>No battle log available.</p>';
} 
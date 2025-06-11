'use strict';

import { characters } from './characters.js';
import { locations, terrainTags } from './locations.js';
import { battlePhases, effectivenessLevels, phaseTemplates } from './narrative-v2.js';
import { getToneAlignedVictoryEnding } from './battle-engine.js'; // Re-using for the final paragraph

// --- Helper Functions ---
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

// --- Battle State Initialization ---
function initializeFighterState(charId) {
    const character = characters[charId];
    return {
        id: charId,
        name: character.name,
        ...JSON.parse(JSON.stringify(character)), // Deep copy to avoid mutation
        hp: 100,
        energy: 100,
        status: [],
        lastMove: null,
    };
}

// --- Core Simulation Logic ---
export function simulateBattle(f1Id, f2Id, locId) {
    let fighter1 = initializeFighterState(f1Id);
    let fighter2 = initializeFighterState(f2Id);
    const location = locations[locId];
    const locTags = terrainTags[locId] || [];

    let battleLog = [];
    let turn = 0;
    const maxTurns = 6;

    // Determine who goes first based on a mix of powerTier and agility/speed traits
    let initiator = (fighter1.powerTier > fighter2.powerTier) ? fighter1 : fighter2;
    let responder = (initiator.id === fighter1.id) ? fighter2 : fighter1;

    while (fighter1.hp > 0 && fighter2.hp > 0 && turn < maxTurns) {
        const phase = battlePhases[turn];
        
        // Narrate Phase Header
        battleLog.push(phaseTemplates.header.replace('{phaseName}', phase.name).replace('{phaseEmoji}', phase.emoji));

        // Each fighter makes a move
        const initiatorMove = selectMove(initiator, phase.name, responder);
        const responderMove = selectMove(responder, phase.name, initiator);

        // Calculate and apply effects
        const initiatorResult = calculateMove(initiatorMove, initiator, responder, locTags);
        const responderResult = calculateMove(responderMove, responder, initiator, locTags);

        // Apply damage and energy costs
        responder.hp -= initiatorResult.damage;
        initiator.energy -= initiatorMove.power * 0.5; // Energy cost
        initiator.hp -= responderResult.damage;
        responder.energy -= responderMove.power * 0.5; // Energy cost
        
        // Clamp HP/Energy
        fighter1.hp = clamp(fighter1.hp, 0, 100);
        fighter2.hp = clamp(fighter2.hp, 0, 100);
        fighter1.energy = clamp(fighter1.energy, 0, 100);
        fighter2.energy = clamp(fighter2.energy, 0, 100);


        // Narrate moves
        battleLog.push(narrateMove(initiator, initiatorMove, initiatorResult));
        battleLog.push(narrateMove(responder, responderMove, responderResult));

        // Swap roles for next turn
        [initiator, responder] = [responder, initiator];
        turn++;
    }

    // --- Determine Winner & Generate Conclusion ---
    const winner = (fighter1.hp > fighter2.hp) ? fighter1 : fighter2;
    const loser = (winner.id === fighter1.id) ? fighter2 : fighter1;
    
    // Add final blow narration
    battleLog.push(phaseTemplates.finalBlow.replace('{winnerName}', winner.name).replace('{loserName}', loser.name));
    
    // Use a slimmed-down version of the old engine's outcome for the final paragraph
    const battleOutcome = {
        winnerId: winner.id,
        loserId: loser.id,
        winProb: (winner.hp / 100) * 80 + 20, // Approximate
        victoryType: 'overwhelm', // Simplified for now
        resolutionTone: { type: 'technical_win' }
    };
    const finalEnding = getToneAlignedVictoryEnding(winner.id, loser.id, battleOutcome.winProb, battleOutcome.victoryType, battleOutcome.resolutionTone);
    battleLog.push(phaseTemplates.conclusion.replace('{endingNarration}', finalEnding));

    return {
        log: battleLog.join(''),
        winnerId: winner.id,
        loserId: loser.id,
        finalState: { fighter1, fighter2 }
    };
}


// --- Move AI & Calculation ---
function selectMove(actor, phaseName, target) {
    let suitableMoves = actor.techniques;

    // Simple AI based on phase and current state
    if (phaseName === "Finishing Move" && actor.hp > target.hp) {
        const finishers = suitableMoves.filter(m => m.type === 'Finisher');
        if (finishers.length > 0) return getRandomElement(finishers);
    }
    if (actor.hp < 40) {
        const defenses = suitableMoves.filter(m => m.type === 'Defense' || m.type === 'Utility');
        if (defenses.length > 0) return getRandomElement(defenses);
    }
    const offenses = suitableMoves.filter(m => m.type === 'Offense');
    if (offenses.length > 0) return getRandomElement(offenses);

    return getRandomElement(suitableMoves); // Fallback
}

function calculateMove(move, attacker, defender, locTags) {
    let basePower = move.power || 30;
    let multiplier = 1.0;

    // Environmental bonus/penalty
    if (attacker.strengths?.some(s => locTags.includes(s))) multiplier += 0.25;
    if (attacker.weaknesses?.some(w => locTags.includes(w))) multiplier -= 0.25;

    // Simple type advantage (Offense > Utility > Defense > Offense)
    const defenderMoveType = defender.lastMove?.type;
    if (move.type === 'Offense' && defenderMoveType === 'Utility') multiplier += 0.15;
    if (move.type === 'Utility' && defenderMoveType === 'Defense') multiplier += 0.15;
    if (move.type === 'Defense' && defenderMoveType === 'Offense') {
        basePower *= 0.5; // Defensive moves reduce damage
    }
    
    // Random variance
    multiplier += (Math.random() - 0.5) * 0.2; // +/- 10%

    const totalEffectiveness = basePower * multiplier;
    
    // Determine effectiveness level
    let level;
    if (totalEffectiveness < basePower * 0.7) level = effectivenessLevels.WEAK;
    else if (totalEffectiveness > basePower * 1.3) level = effectivenessLevels.CRITICAL;
    else if (totalEffectiveness > basePower * 1.1) level = effectivenessLevels.STRONG;
    else level = effectivenessLevels.NORMAL;

    // In this simple model, damage is a fraction of effectiveness. Defense moves deal no damage.
    const damage = move.type.includes('Offense') ? Math.round(totalEffectiveness / 4) : 0;

    return {
        effectiveness: level,
        damage: clamp(damage, 0, 50)
    };
}

// --- Narrative Generation ---
function narrateMove(actor, move, result) {
    const requiresArticle = move.requiresArticle;
    const firstLetter = move.object?.charAt(0).toLowerCase();
    const article = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter) ? 'an' : 'a';
    const objectPhrase = requiresArticle ? `${article} ${move.object}` : move.object;

    // Construct a simple sentence from verb and object
    let description = `${actor.pronouns.s.charAt(0).toUpperCase() + actor.pronouns.s.slice(1)} ${move.verb} ${objectPhrase}.`;
    if (!move.object) {
        description = `${actor.pronouns.s.charAt(0).toUpperCase() + actor.pronouns.s.slice(1)} performed the ${move.name}.`;
    }

    return phaseTemplates.move
        .replace(/{actorId}/g, actor.id)
        .replace(/{actorName}/g, actor.name)
        .replace(/{moveName}/g, move.name)
        .replace(/{moveEmoji}/g, move.emoji)
        .replace(/{effectivenessLabel}/g, result.effectiveness.label)
        .replace(/{effectivenessEmoji}/g, result.effectiveness.emoji)
        .replace(/{moveDescription}/g, description);
}
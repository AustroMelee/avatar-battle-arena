// CONTEXT: AI Ability Selection
// RESPONSIBILITY: Choose abilities with comprehensive logging
import { BattleCharacter, AILogEntry, BattleLogEntry } from '../../types';
import { shouldAvoidMove, getAntiPatternMoves, generatePatternNarrative } from './patternRecognition';
import type { Move } from '../../types/move.types';



/**
 * @description Represents the result of AI ability selection with logging.
 */
export interface AIAbilityResult {
  ability: Move | null;
  aiLog: AILogEntry;
}

/**
 * @description Chooses the best ability for the AI character with comprehensive logging.
 * @param {BattleCharacter} character - The AI character.
 * @param {BattleCharacter} enemy - The enemy character.
 * @param {number} turn - The current turn number.
 * @param {BattleLogEntry[]} battleLog - The battle log for context.
 * @param {AdvancedAIState | null} previousState - The previous AI state.
 * @returns {AIAbilityResult} The chosen ability and AI log entry.
 */
export function chooseAbilityWithLogging(
  character: BattleCharacter,
  enemy: BattleCharacter,
  turn: number,
  battleLog: BattleLogEntry[]
): AIAbilityResult {
  // Get available abilities (not on cooldown, have chi, not overused)
  const availableAbilities = character.abilities.filter(ability => {
    // Check if we have enough chi
    if ((character.resources.chi || 0) < (ability.chiCost || 0)) {
      return false;
    }
    
    // Check if ability is on cooldown
    if (ability.cooldown && character.cooldowns[ability.name] && character.cooldowns[ability.name] > 0) {
      return false;
    }
    
    // Check if ability has uses left
    if (ability.maxUses && (character.usesLeft[ability.name] || 0) <= 0) {
      return false;
    }
    
    // Check if we should avoid this move due to recent overuse
    if (shouldAvoidMove(ability.name, character, battleLog)) {
      return false;
    }
    
    // Check finisher conditions
    if (ability.isFinisher) {
      // Check if already used this battle
      if (ability.oncePerBattle && character.flags?.usedFinisher) {
        return false;
      }
      
      // Check finisher conditions
      if (ability.finisherCondition) {
        if (ability.finisherCondition.type === 'hp_below' && ability.finisherCondition.percent) {
          const healthPercent = (character.currentHealth / 100) * 100; // TODO: Get max HP from character
          if (healthPercent > ability.finisherCondition.percent) {
            return false;
          }
        }
        // TODO: Add other finisher condition checks
      }
    }
    
    // Check desperation move conditions
    if (ability.desperationBuff) {
      const healthPercent = (character.currentHealth / 100) * 100; // TODO: Get max HP from character
      if (healthPercent > ability.desperationBuff.hpThreshold) {
        return false;
      }
    }
    
    return true;
  });

  if (availableAbilities.length === 0) {
    // No abilities available - use fallback
    const fallbackAbility = character.abilities.find(ability => 
      ability.tags?.includes('fallback') && (character.resources.chi || 0) >= (ability.chiCost || 0)
    );
    
    return {
      ability: fallbackAbility || null,
      aiLog: {
        turn,
        agent: character.name,
        perceivedState: {
          self: {
            health: character.currentHealth,
            defense: character.currentDefense,
            personality: character.base.personality,
            abilities: character.abilities.map(ability => ({
              id: ability.name.toLowerCase().replace(/\s+/g, '_'),
              name: ability.name,
              type: ability.type,
              power: ability.baseDamage,
              cooldown: ability.cooldown
            })),
            cooldowns: character.cooldowns,
            lastMove: character.lastMove,
            moveHistory: character.moveHistory,
            activeEffects: character.activeEffects,
            resources: character.resources,
            position: character.position ?? { x: 0, y: 0 },
            isCharging: character.isCharging ?? false,
            chargeProgress: character.chargeProgress ?? 0,
            repositionAttempts: character.repositionAttempts ?? 0
          },
          enemy: {
            health: enemy.currentHealth,
            defense: enemy.currentDefense,
            personality: enemy.base.personality,
            name: enemy.name,
            lastMove: enemy.lastMove,
            moveHistory: enemy.moveHistory,
            activeEffects: enemy.activeEffects,
            position: enemy.position ?? { x: 0, y: 0 },
            isCharging: enemy.isCharging ?? false,
            chargeProgress: enemy.chargeProgress ?? 0,
            repositionAttempts: enemy.repositionAttempts ?? 0
          },
          round: turn,
          cooldowns: {},
          location: 'Fire Nation Throne Hall',
          locationType: 'interior' as any
        },
        consideredActions: [],
        chosenAction: fallbackAbility?.name || 'No moves available',
        reasoning: 'No abilities available - using fallback move',
        narrative: `${character.name} has no viable moves and resorts to a basic action.`,
        timestamp: Date.now()
      }
    };
  }

  // Get anti-pattern moves based on opponent's recent behavior
  const antiPatternMoves = getAntiPatternMoves(character, enemy, battleLog);
  
  // Score each available ability
  const scoredAbilities = availableAbilities.map(ability => {
    let score = 0;
    const reasons: string[] = [];
    
    // Base score from ability damage
    score += ability.baseDamage * 2;
    reasons.push(`Base damage: ${ability.baseDamage}`);
    
    // Bonus for anti-pattern moves
    if (antiPatternMoves.includes(ability.name)) {
      score += 50;
      reasons.push('Anti-pattern counter');
    }
    
    // Health-based scoring
    if (character.currentHealth < 30) {
      // Low health - prioritize defense and healing
      if (ability.type === 'defense_buff' || ability.type === 'evade') {
        score += 40;
        reasons.push('Low health - defensive priority');
      }
      if (ability.type === 'parry_retaliate') {
        score += 35;
        reasons.push('Low health - defensive counter-attack');
      }
      if (ability.tags?.includes('healing')) {
        score += 60;
        reasons.push('Low health - healing priority');
      }
      if (ability.tags?.includes('desperation')) {
        score += 80;
        reasons.push('Low health - desperation move');
      }
    } else if (character.currentHealth < 60) {
      // Medium health - balanced approach
      if (ability.type === 'attack' || ability.type === 'parry_retaliate') {
        score += 20;
        reasons.push('Medium health - offensive option');
      }
      if (ability.type === 'defense_buff' || ability.type === 'evade') {
        score += 15;
        reasons.push('Medium health - defensive option');
      }
    } else {
      // High health - aggressive approach
      if (ability.type === 'attack' || ability.type === 'parry_retaliate') {
        score += 30;
        reasons.push('High health - aggressive approach');
      }
    }
    
    // Enemy health-based scoring
    if (enemy.currentHealth < 20) {
      // Enemy is low - finish them off
      if ((ability.type === 'attack' || ability.type === 'parry_retaliate') && ability.baseDamage > 15) {
        score += 40;
        reasons.push('Enemy low health - finishing move');
      }
    } else if (enemy.currentHealth < 50) {
      // Enemy is wounded - apply pressure
      if (ability.type === 'attack' || ability.type === 'parry_retaliate') {
        score += 20;
        reasons.push('Enemy wounded - applying pressure');
      }
    }
    
    // Chi management
    if ((character.resources.chi || 0) < 5) {
      // Low chi - prefer low-cost moves
      if ((ability.chiCost || 0) <= 2) {
        score += 30;
        reasons.push('Low chi - conserving energy');
      }
    } else if ((character.resources.chi || 0) > 8) {
      // High chi - can afford expensive moves
      if (ability.baseDamage > 20) {
        score += 25;
        reasons.push('High chi - using powerful moves');
      }
    }
    
    // Special move bonuses
    if (ability.tags?.includes('piercing')) {
      score += 15;
      reasons.push('Piercing attack');
    }
    if (ability.tags?.includes('high-damage')) {
      score += 20;
      reasons.push('High damage potential');
    }
    if (ability.tags?.includes('rest')) {
      score += 10;
      reasons.push('Rest/recovery move');
    }
    
    // Desperation move bonuses (when health is very low)
    if (ability.desperationBuff && character.currentHealth < 25) {
      score += 100;
      reasons.push('Critical health - desperation move');
    }
    
    // Finisher move bonuses (when conditions are met)
    if (ability.isFinisher && !character.flags?.usedFinisher) {
      if (ability.finisherCondition?.type === 'hp_below' && ability.finisherCondition.percent) {
        const healthPercent = (character.currentHealth / 100) * 100;
        if (healthPercent <= ability.finisherCondition.percent) {
          score += 120;
          reasons.push('Finisher conditions met - devastating move');
        }
      }
    }
    
    // Critical hit potential
    if (ability.critChance && ability.critMultiplier) {
      const expectedDamage = ability.baseDamage * (1 + (ability.critChance * (ability.critMultiplier - 1)));
      score += expectedDamage * 0.5;
      reasons.push(`Critical potential: ${(ability.critChance * 100).toFixed(0)}% chance for ${ability.critMultiplier}x damage`);
    }
    
    return {
      move: ability.name,
      score,
      reason: reasons.join(', ')
    };
  });

  // Sort by score and choose the best
  scoredAbilities.sort((a, b) => b.score - a.score);
  const bestAbility = availableAbilities.find(ability => ability.name === scoredAbilities[0].move)!;
  
  // Generate narrative based on pattern recognition
  const patternNarrative = generatePatternNarrative(character, {
    detectedPatterns: [],
    recommendedCounters: antiPatternMoves,
    antiSpamMoves: antiPatternMoves,
    patternStrength: antiPatternMoves.length > 0 ? 'medium' : 'weak'
  });

  return {
    ability: bestAbility,
          aiLog: {
        turn,
        agent: character.name,
        perceivedState: {
          self: {
            health: character.currentHealth,
            defense: character.currentDefense,
            personality: character.base.personality,
            abilities: character.abilities.map(ability => ({
              id: ability.name.toLowerCase().replace(/\s+/g, '_'),
              name: ability.name,
              type: ability.type,
              power: ability.baseDamage,
              cooldown: ability.cooldown
            })),
            cooldowns: character.cooldowns,
            lastMove: character.lastMove,
            moveHistory: character.moveHistory,
            activeEffects: character.activeEffects,
            resources: character.resources,
            position: character.position ?? { x: 0, y: 0 },
            isCharging: character.isCharging ?? false,
            chargeProgress: character.chargeProgress ?? 0,
            repositionAttempts: character.repositionAttempts ?? 0
          },
          enemy: {
            health: enemy.currentHealth,
            defense: enemy.currentDefense,
            personality: enemy.base.personality,
            name: enemy.name,
            lastMove: enemy.lastMove,
            moveHistory: enemy.moveHistory,
            activeEffects: enemy.activeEffects,
            position: enemy.position ?? { x: 0, y: 0 },
            isCharging: enemy.isCharging ?? false,
            chargeProgress: enemy.chargeProgress ?? 0,
            repositionAttempts: enemy.repositionAttempts ?? 0
          },
          round: turn,
          cooldowns: {},
          location: 'Fire Nation Throne Hall',
          locationType: 'interior' as any
        },
        consideredActions: scoredAbilities.slice(0, 3).map(action => ({
          abilityId: action.move.toLowerCase().replace(/\s+/g, '_'),
          move: action.move,
          score: action.score,
          reason: action.reason
        })),
        chosenAction: bestAbility.name,
        reasoning: scoredAbilities[0].reason,
        narrative: patternNarrative,
        timestamp: Date.now()
      }
  };
}

 
// CONTEXT: Status Effect Management
// RESPONSIBILITY: Apply, process, and manage status effects on characters
import { BattleCharacter, ActiveStatusEffect, BattleLogEntry, EffectType, ArcStateModifier } from '../../types';
import { createEventId, generateUniqueLogId } from '../ai/logQueries';

/**
 * @description Types for status effects
 */

/**
 * Applies a new status effect to a character with arc state duration modification.
 * @param {BattleCharacter} character - The character to apply the effect to
 * @param {ActiveStatusEffect} effect - The effect to apply
 * @param {number} turn - Current turn number
 * @param {ArcStateModifier} arcModifiers - Current arc state modifiers
 * @returns {object} Object with updated character and log entry
 */
export function applyEffect(
  character: BattleCharacter,
  effect: ActiveStatusEffect,
  turn: number,
  arcModifiers?: ArcStateModifier
): { updatedCharacter: BattleCharacter; logEntry: BattleLogEntry } {
  let modifiedEffect = { ...effect };
  
  // Apply arc state duration modifier if provided
  if (arcModifiers) {
    const modifiedDuration = Math.round(effect.duration * arcModifiers.statusEffectDurationModifier);
    modifiedEffect = { ...modifiedEffect, duration: Math.max(1, modifiedDuration) }; // Minimum 1 turn
  }
  
  const newEffects = [...character.activeEffects, modifiedEffect];
  const updatedCharacter = { ...character, activeEffects: newEffects };

  // Log entry for status effect application
  const logEntry: BattleLogEntry = {
    id: generateUniqueLogId('status'),
    turn,
    actor: character.name,
    type: 'STATUS',
    action: 'Effect Applied',
    target: character.name,
    result: `${character.name} is affected by ${modifiedEffect.type}${modifiedEffect.name ? ` (${modifiedEffect.name})` : ''} from ${modifiedEffect.sourceAbility}`,
    narrative: `${character.name} is now under the effect of ${modifiedEffect.type}${modifiedEffect.name ? ` (${modifiedEffect.name})` : ''} from ${modifiedEffect.sourceAbility}!`,
    timestamp: Date.now(),
    meta: {
      effectType: modifiedEffect.type,
      sourceEffect: modifiedEffect.name,
      sourceAbility: modifiedEffect.sourceAbility
    }
  };

  return { updatedCharacter, logEntry };
}

/**
 * Processes all active effects for a character at the start of their turn.
 * This function will apply damage/healing and tick down durations.
 * @param {BattleCharacter} character - The character whose effects to process
 * @param {number} turn - Current turn number
 * @returns {object} Object with updated character and log entries
 */
export function processTurnEffects(
  character: BattleCharacter, 
  turn: number
): { updatedCharacter: BattleCharacter; logEntries: BattleLogEntry[] } {
  const updatedCharacter = { ...character };
  const logEntries: BattleLogEntry[] = [];

  console.log(`🔄🔄🔄 PROCESSING TURN EFFECTS - ${character.name} on turn ${turn} 🔄🔄🔄`);
  console.log(`🔄🔄🔄 ACTIVE EFFECTS - ${character.name} has ${updatedCharacter.activeEffects.length} active effects:`, updatedCharacter.activeEffects);

  const stillActiveEffects: ActiveStatusEffect[] = [];

  for (const effect of updatedCharacter.activeEffects) {
    console.log(`🔄🔄🔄 PROCESSING EFFECT - ${character.name} processing ${effect.name} (${effect.type}) with ${effect.duration} turns remaining`);
    
    // Apply effect logic based on type
    switch (effect.type) {
      case 'BURN': {
        const burnDamage = Math.round(effect.potency);
        updatedCharacter.currentHealth = Math.max(0, updatedCharacter.currentHealth - burnDamage);
        console.log(`🔥🔥🔥 BURN DAMAGE - ${character.name} takes ${burnDamage} burn damage from ${effect.name} (${updatedCharacter.currentHealth} HP remaining) 🔥🔥🔥`);
        
        logEntries.push({
          id: generateUniqueLogId('status'),
          turn,
          actor: character.name,
          type: 'STATUS',
          action: 'Burn Damage',
          target: character.name,
          result: `Takes ${burnDamage} burn damage`,
          narrative: `${character.name} continues to burn from ${effect.sourceAbility}!`,
          timestamp: Date.now(),
          meta: {
            effectType: 'BURN',
            damage: burnDamage,
            sourceEffect: effect.name
          }
        });
        break;
      }
      case 'HEAL_OVER_TIME': {
        const healAmount = Math.round(effect.potency);
        updatedCharacter.currentHealth = Math.min(100, updatedCharacter.currentHealth + healAmount);
        console.log(`DEBUG: HEAL OVER TIME - ${character.name} recovers ${healAmount} health from ${effect.name} (${updatedCharacter.currentHealth} HP now)`);
        
        logEntries.push({
          id: generateUniqueLogId('status'),
          turn,
          actor: character.name,
          type: 'STATUS',
          action: 'Heal Over Time',
          target: character.name,
          result: `Recovers ${healAmount} health`,
          narrative: `${character.name} continues to recover from ${effect.sourceAbility}!`,
          timestamp: Date.now(),
          meta: {
            effectType: 'HEAL_OVER_TIME',
            healing: healAmount,
            sourceEffect: effect.name
          }
        });
        break;
      }
      case 'STUN': {
        console.log(`DEBUG: STUN EFFECT - ${character.name} is stunned by ${effect.name}`);
        logEntries.push({
          id: generateUniqueLogId('status'),
          turn,
          actor: character.name,
          type: 'STATUS',
          action: 'Stunned',
          target: character.name,
          result: 'Cannot act this turn',
          narrative: `${character.name} is still stunned from ${effect.sourceAbility}!`,
          timestamp: Date.now(),
          meta: {
            effectType: 'STUN',
            sourceEffect: effect.name
          }
        });
        break;
      }
      default:
        console.log(`DEBUG: UNKNOWN EFFECT TYPE - ${character.name} has unknown effect type: ${effect.type}`);
        break;
    }
    
    // Decrease duration
    effect.duration--;
    console.log(`DEBUG: EFFECT DURATION - ${character.name}'s ${effect.name} now has ${effect.duration} turns remaining`);
    
    // Check if effect has expired
    if (effect.duration <= 0) {
      console.log(`DEBUG: EFFECT EXPIRED - ${character.name}'s ${effect.name} has expired`);
      logEntries.push({
        id: generateUniqueLogId('status'),
        turn,
        actor: character.name,
        type: 'STATUS',
        action: 'Effect Expired',
        target: character.name,
        result: `${effect.name} has worn off`,
        narrative: `${character.name} is no longer affected by ${effect.name}!`,
        timestamp: Date.now(),
        meta: {
          effectType: 'EXPIRED',
          sourceEffect: effect.name
        }
      });
    } else {
      stillActiveEffects.push(effect);
    }
  }
  
  updatedCharacter.activeEffects = stillActiveEffects;
  console.log(`DEBUG: EFFECTS AFTER PROCESSING - ${character.name} now has ${updatedCharacter.activeEffects.length} active effects remaining`);
  
  return { updatedCharacter, logEntries };
}

/**
 * Modifies move damage based on active buffs/debuffs.
 * @param {number} damage - Base damage value
 * @param {BattleCharacter} attacker - The attacking character
 * @param {BattleCharacter} target - The target character
 * @returns {number} The modified damage value
 */
export function modifyDamageWithEffects(
  damage: number, 
  attacker: BattleCharacter, 
  target: BattleCharacter
): number {
  let modifiedDamage = damage;
  
  // Check for ATTACK_UP on attacker
  const attackUpEffect = attacker.activeEffects.find(e => e.type === 'ATTACK_UP');
  if (attackUpEffect) {
    modifiedDamage *= (1 + attackUpEffect.potency / 100); // potency as percentage
  }
  
  // Check for DEFENSE_DOWN on target
  const defenseDownEffect = target.activeEffects.find(e => e.type === 'DEFENSE_DOWN');
  if (defenseDownEffect) {
    // This makes the target take more damage, effectively a damage multiplier
    modifiedDamage *= (1 + defenseDownEffect.potency / 100);
  }
  
  return Math.round(modifiedDamage);
}

/**
 * Creates a status effect from an ability's appliesEffect property.
 * @param {string} abilityName - Name of the ability applying the effect
 * @param {object} effectConfig - The effect configuration from the ability
 * @param {string} targetName - Name of the target character
 * @returns {ActiveStatusEffect} The created status effect
 */
export function createStatusEffect(
  abilityName: string,
  effectConfig: { type: EffectType; duration: number; potency: number },
  targetName: string
): ActiveStatusEffect {
  const effectNames: Record<EffectType, string> = {
    'DEFENSE_UP': 'Defense Boost',
    'ATTACK_UP': 'Attack Boost',
    'CRIT_CHANCE_UP': 'Critical Boost',
    'HEAL_OVER_TIME': 'Regeneration',
    'BURN': 'Searing Burn',
    'STUN': 'Stunned',
    'DEFENSE_DOWN': 'Defense Weakened',
    'SLOW': 'Slowed'
  };

  const effectCategories: Record<EffectType, 'buff' | 'debuff'> = {
    'DEFENSE_UP': 'buff',
    'ATTACK_UP': 'buff',
    'CRIT_CHANCE_UP': 'buff',
    'HEAL_OVER_TIME': 'buff',
    'BURN': 'debuff',
    'STUN': 'debuff',
    'DEFENSE_DOWN': 'debuff',
    'SLOW': 'debuff'
  };

  return {
    id: `${effectConfig.type.toLowerCase()}_${targetName}_${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: effectNames[effectConfig.type],
    type: effectConfig.type,
    category: effectCategories[effectConfig.type],
    duration: effectConfig.duration,
    potency: effectConfig.potency,
    sourceAbility: abilityName
  };
}

/**
 * Checks if a character is stunned and should skip their turn.
 * @param {BattleCharacter} character - The character to check
 * @returns {boolean} True if the character is stunned
 */
export function isCharacterStunned(character: BattleCharacter): boolean {
  return character.activeEffects.some(effect => effect.type === 'STUN' && effect.duration > 0);
}

/**
 * Gets the total defense modifier from active effects.
 * @param {BattleCharacter} character - The character to check
 * @returns {number} The total defense modifier (positive for buffs, negative for debuffs)
 */
export function getDefenseModifier(character: BattleCharacter): number {
  let modifier = 0;
  
  // Add defense buffs
  const defenseUpEffects = character.activeEffects.filter(e => e.type === 'DEFENSE_UP');
  defenseUpEffects.forEach(effect => {
    modifier += effect.potency;
  });
  
  // Subtract defense debuffs
  const defenseDownEffects = character.activeEffects.filter(e => e.type === 'DEFENSE_DOWN');
  defenseDownEffects.forEach(effect => {
    modifier -= effect.potency;
  });
  
  return modifier;
} 
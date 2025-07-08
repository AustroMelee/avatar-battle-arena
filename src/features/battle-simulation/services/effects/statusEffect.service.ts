// CONTEXT: Status Effect Management
// RESPONSIBILITY: Apply, process, and manage status effects on characters
import { BattleCharacter, ActiveStatusEffect, BattleLogEntry, EffectType, ArcStateModifier } from '../../types';
import { createEventId, generateUniqueLogId } from '../ai/logQueries';
import { processEffectFusions } from './effectFusion.service'; // NEW Import

/**
 * @description Types for status effects
 */

const BURNOUT_CRISIS_TURNS = 3; // Effect must persist for this many turns to trigger a crisis

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
  effect: Omit<ActiveStatusEffect, 'id' | 'turnApplied'>, // Omitting fields we will set here
  turn: number,
  arcModifiers?: ArcStateModifier
): { updatedCharacter: BattleCharacter; logEntry: BattleLogEntry } {
  let modifiedEffect: ActiveStatusEffect = {
    ...effect,
    id: generateUniqueLogId('effect'),
    turnApplied: turn, // NEW: Set the application turn
  };
  
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
    result: `${character.name} is affected by ${modifiedEffect.name} from ${modifiedEffect.sourceAbility}`,
    narrative: `${character.name} is now under the effect of ${modifiedEffect.name} from ${modifiedEffect.sourceAbility}!`,
    timestamp: Date.now(),
    details: {
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
  if (character.activeEffects.length === 0) {
    return { updatedCharacter: character, logEntries: [] };
  }
  let updatedCharacter = { ...character };
  const logEntries: BattleLogEntry[] = [];
  
  console.log(`♻️♻️♻️ PROCESSING TURN EFFECTS - ${character.name} on turn ${turn} ♻️♻️♻️`);
  console.log(`♻️♻️♻️ ACTIVE EFFECTS - ${character.name} has ${updatedCharacter.activeEffects.length} active effects:`, updatedCharacter.activeEffects);

  const stillActiveEffects: ActiveStatusEffect[] = [];

  for (const effect of updatedCharacter.activeEffects) {
    let effectProcessed = false; 
    console.log(`♻️♻️♻️ PROCESSING EFFECT - ${character.name} processing ${effect.name} (${effect.type}) with ${effect.duration} turns remaining`);
    
    // --- NEW: Burnout Crisis Logic ---
    if (effect.type === 'BURN' && (turn - effect.turnApplied) >= BURNOUT_CRISIS_TURNS) {
      const crisisDebuff: ActiveStatusEffect = {
        id: generateUniqueLogId('crisis'),
        name: 'Exhaustion from Burns',
        type: 'DEFENSE_DOWN',
        category: 'debuff',
        duration: 2,
        potency: 10, // A significant defense penalty
        sourceAbility: 'Burnout Crisis',
        turnApplied: turn,
      };
      // Apply the new debuff directly
      updatedCharacter.activeEffects.push(crisisDebuff);

      logEntries.push({
        id: createEventId(),
        turn,
        actor: character.name,
        type: 'STATUS',
        action: 'Burnout Crisis',
        target: character.name,
        result: `Sustained burns cause exhaustion! Defense lowered.`,
        narrative: `The constant pain from the searing burns is breaking ${character.name}'s focus and stance!`,
        timestamp: Date.now(),
        details: { effectType: 'CRISIS', sourceEffect: effect.name, newEffect: 'DEFENSE_DOWN' }
      });
      console.log(`🔥🔥🔥 BURNOUT CRISIS - ${character.name} is exhausted from burns! Defense lowered. 🔥🔥🔥`);
    }

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
          details: {
            effectType: 'BURN',
            sourceEffect: effect.name
          }
        });
        effectProcessed = true;
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
          details: {
            effectType: 'HEAL_OVER_TIME',
            healing: healAmount,
            sourceEffect: effect.name
          }
        });
        effectProcessed = true;
        break;
      }
      case 'DEFENSE_DOWN': {
        // Apply defense debuff for duration
        updatedCharacter.currentDefense = Math.max(0, updatedCharacter.currentDefense - effect.potency);
        logEntries.push({
          id: generateUniqueLogId('status'),
          turn,
          actor: character.name,
          type: 'STATUS',
          action: 'Defense Down',
          target: character.name,
          result: `Defense lowered by ${effect.potency}`,
          narrative: `${character.name}'s defense is weakened!`,
          timestamp: Date.now(),
          details: {
            effectType: 'DEFENSE_DOWN',
            defenseReduction: effect.potency
          }
        });
        effectProcessed = true;
        break;
      }
      case 'ATTACK_UP': {
        // Apply attack buff for duration (could be tracked for move damage elsewhere)
        logEntries.push({
          id: generateUniqueLogId('status'),
          turn,
          actor: character.name,
          type: 'STATUS',
          action: 'Attack Up',
          target: character.name,
          result: `Attack boosted by ${effect.potency}`,
          narrative: `${character.name}'s attack is strengthened!`,
          timestamp: Date.now(),
          details: {
            effectType: 'ATTACK_UP',
            attackBoost: effect.potency
          }
        });
        effectProcessed = true;
        break;
      }
      case 'STUN': {
        // Stun logic is handled in the main turn loop (skips turn). Log only.
        logEntries.push({
          id: generateUniqueLogId('status'),
          turn,
          actor: character.name,
          type: 'STATUS',
          action: 'Stunned',
          target: character.name,
          result: `Stunned and cannot act this turn`,
          narrative: `${character.name} is stunned and cannot act!`,
          timestamp: Date.now(),
          details: {
            effectType: 'STUN'
          }
        });
        effectProcessed = true;
        break;
      }
      default:
        if (!effectProcessed) {
             console.log(`DEBUG: UNHANDLED EFFECT TYPE - ${character.name} has unhandled effect type: ${effect.type}`);
        }
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
        details: {
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
  
  // --- NEW: Process effect fusions AFTER individual effects are processed ---
  const fusionResult = processEffectFusions(updatedCharacter, turn);
  if (fusionResult.logEntry) {
    logEntries.push(fusionResult.logEntry);
  }
  updatedCharacter = fusionResult.updatedCharacter;
  // --- END ---
  
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
 * @param {number} turn - Current turn number
 * @returns {ActiveStatusEffect} The created status effect
 */
export function createStatusEffect(
  abilityName: string,
  effectConfig: { type: EffectType; duration: number; potency: number },
  targetName: string,
  turn: number // NEW: Pass in the current turn
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
    sourceAbility: abilityName,
    turnApplied: turn, // NEW: Set the application turn
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
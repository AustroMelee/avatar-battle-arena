import { BattleCharacter, ActiveStatusEffect, BattleLogEntry, EffectType } from '../../types';
import { generateUniqueLogId } from '../ai/logQueries';
// import type { Move } from '../../types/move.types';

interface FusionRecipe {
  name: string;
  requiredEffects: EffectType[];
  resultantEffect: Omit<ActiveStatusEffect, 'id' | 'turnApplied' | 'sourceAbility'>;
  narrative: string;
}

const FUSION_RECIPES: FusionRecipe[] = [
  {
    name: "Armor Shatter",
    requiredEffects: ['BURN', 'DEFENSE_DOWN'],
    resultantEffect: {
      name: 'Armor Shattered',
      type: 'STUN',
      category: 'debuff',
      duration: 1,
      potency: 0,
    },
    narrative: 'The combined strain of searing heat and weakened defenses causes their armor and will to shatter, leaving them stunned!',
  },
];

export function processEffectFusions(character: BattleCharacter, turn: number): { updatedCharacter: BattleCharacter; logEntry: BattleLogEntry | null } {
  const activeEffectTypes = new Set(character.activeEffects.map(e => e.type));
  for (const recipe of FUSION_RECIPES) {
    const canFuse = recipe.requiredEffects.every(type => activeEffectTypes.has(type));
    if (canFuse) {
      const remainingEffects = character.activeEffects.filter(
        e => !recipe.requiredEffects.includes(e.type)
      );
      const newEffect: ActiveStatusEffect = {
        ...recipe.resultantEffect,
        id: generateUniqueLogId('fusion'),
        sourceAbility: 'Effect Fusion',
        turnApplied: turn,
      };
      remainingEffects.push(newEffect);
      const updatedCharacter = { ...character, activeEffects: remainingEffects };
      const logEntry: BattleLogEntry = {
        id: generateUniqueLogId('fusion_log'),
        turn,
        actor: 'System',
        type: 'STATUS',
        action: 'Status Meltdown!',
        target: character.name,
        result: `${character.name} suffers a system shock and is now ${recipe.resultantEffect.type}!`,
        narrative: recipe.narrative,
        timestamp: Date.now(),
        meta: { crisis: true, effectsConsumed: recipe.requiredEffects, mechanic: 'Effect Fusion' },
      };
      return { updatedCharacter, logEntry };
    }
  }
  return { updatedCharacter: character, logEntry: null };
} 
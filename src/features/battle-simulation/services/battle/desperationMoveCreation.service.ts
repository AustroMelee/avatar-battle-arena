// CONTEXT: Desperation Move Creation Service
// RESPONSIBILITY: Create desperation moves for escalation scenarios

import { BattleCharacter } from '../../types';
import { Move } from '../../types/move.types';

/**
 * @description Creates a desperation move for escalation scenarios
 */
export function createDesperationMove(character: BattleCharacter, escalationType: string): Move {
  const baseDamage = character.currentHealth < 30 ? 8 : 6;
  const chiCost = character.currentHealth < 30 ? 2 : 3;
  
  let moveName = '';
  let description = '';
  
  switch (escalationType) {
    case 'damage':
      moveName = 'Desperate Assault';
      description = `${character.name} channels desperation into a powerful attack!`;
      break;
    case 'repetition':
      moveName = 'Pattern Break';
      description = `${character.name} breaks free from their predictable pattern!`;
      break;
    case 'reposition':
      moveName = 'Close Combat Strike';
      description = `${character.name} engages in desperate close combat!`;
      break;
    case 'stalemate':
      moveName = 'Climax Strike';
      description = `${character.name} unleashes everything in a climactic attack!`;
      break;
    default:
      moveName = 'Desperation Move';
      description = `${character.name} makes a desperate move!`;
  }
  
  return {
    id: `desperation_${escalationType}`,
    name: moveName,
    baseDamage,
    chiCost,
    cooldown: 0,
    description,
    isChargeUp: false,
    chargeTime: 1,
    punishIfCharging: false,
    positionBonus: {},
    desperationBuff: {
      hpThreshold: 25,
      damageBonus: 2,
      defensePenalty: 5
    }
  };
} 
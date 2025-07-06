import { FlagUIData, ActiveFlag } from '../../types/behavioral.types';
import { BattleCharacter } from '../../types';

/**
 * Get UI data for behavioral flags
 */
export function getFlagUIData(flag: string): FlagUIData {
  switch (flag) {
    case 'isManipulated':
      return {
        icon: '🧠',
        tooltip: 'Manipulated - Defense penalties apply',
        color: '#ff6b6b'
      };
    
    case 'overconfidenceActive':
      return {
        icon: '👑',
        tooltip: 'Overconfident - Finisher moves disabled',
        color: '#ffd93d'
      };
    
    case 'isExposed':
      return {
        icon: '💔',
        tooltip: 'Exposed - Takes 50% more damage',
        color: '#ff6b6b'
      };
    
    case 'hasPleadedThisBattle':
      return {
        icon: '🕊️',
        tooltip: 'Has pleaded for peace this battle',
        color: '#4ecdc4'
      };
    
    default:
      return {
        icon: '❓',
        tooltip: `Unknown flag: ${flag}`,
        color: '#95a5a6'
      };
  }
}

/**
 * Get all active flags for a character with UI data
 */
export function getActiveFlagsWithUI(character: BattleCharacter): Array<{ flag: string; data: ActiveFlag; ui: FlagUIData }> {
  const flags: Array<{ flag: string; data: ActiveFlag; ui: FlagUIData }> = [];
  
  // Ensure activeFlags is a Map
  if (!(character.activeFlags instanceof Map)) {
    return flags;
  }
  
  character.activeFlags.forEach((data, flag) => {
    const ui = getFlagUIData(flag);
    flags.push({ flag, data, ui });
  });
  
  return flags;
} 
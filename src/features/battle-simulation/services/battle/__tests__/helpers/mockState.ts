import { createInitialBattleState } from '../../state';
import { getCharacterById } from '../../../../../character-selection/data/characterData';

export const createMockState = () => {
  const player1 = getCharacterById('aang');
  const player2 = getCharacterById('azula');
  if (!player1 || !player2) throw new Error('Test character not found in registry');
  return createInitialBattleState({
    player1,
    player2,
    location: { name: 'fire_nation_capital', id: 'fire_nation_capital', image: 'caldera.jpg' },
  });
};

// CONTEXT: CharacterSelection, // FOCUS: UIRendering & Logic
import { Character } from '@/common/types';
import { availableCharacters } from '../data/characterData';
import styles from './CharacterSelection.module.css';
import { PlayerCardHorizontal } from '../../battle-simulation/components/PlayerCardHorizontal/PlayerCardHorizontal';
import { CharacterPortrait } from './CharacterPortrait';

/**
 * @description Props for the CharacterSelection component.
 */
export type CharacterSelectionProps = {
  title: string;
  selectedCharacter: Character | null;
  onSelectCharacter: (character: Character | null) => void; // Allow null to un-select
  opponent: Character | null;
  playerColor: string;
};

/**
 * @description Manages the UI for a single player's character selection, switching between a chooser grid and a detailed card display.
 * @returns {JSX.Element}
 */
export function CharacterSelection({
  title,
  selectedCharacter,
  onSelectCharacter,
  opponent,
  playerColor,
}: CharacterSelectionProps) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title} style={{ color: playerColor }}>{title}</h2>

      {selectedCharacter ? (
        // STATE 2: Display the selected character's detailed card
        <div className={styles.displayCardContainer}>
          <PlayerCardHorizontal
            character={{
              ...selectedCharacter,
              currentHealth: 100,
              currentDefense: selectedCharacter.stats.defense,
              cooldowns: {},
              usesLeft: {},
              moveHistory: [],
              resources: { chi: 10 },
              activeBuffs: [],
              activeDebuffs: [],
              flags: {},
              diminishingEffects: {}
            }}
            isActive={true}
            playerColor={playerColor}
            onChange={() => onSelectCharacter(null)}
          />
        </div>
      ) : (
        // STATE 1: Show the grid of portraits to choose from
        <div className={styles.chooserGrid}>
          {availableCharacters.map((char) => (
            <CharacterPortrait
              key={char.id}
              character={char}
              isUnavailable={opponent?.id === char.id}
              onSelect={() => onSelectCharacter(char)}
            />
          ))}
        </div>
      )}
    </div>
  );
} 
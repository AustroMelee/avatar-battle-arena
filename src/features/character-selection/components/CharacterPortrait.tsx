// CONTEXT: CharacterSelection, // FOCUS: UIRendering
import { Character } from '@/common/types';
import styles from './CharacterPortrait.module.css';

/**
 * @description Props for the CharacterPortrait component.
 */
export type CharacterPortraitProps = {
  character: Character;
  onSelect: () => void;
  isUnavailable: boolean;
};

/**
 * @description Renders a small, clickable portrait for the character selection grid.
 * @returns {JSX.Element}
 */
export function CharacterPortrait({ character, onSelect, isUnavailable }: CharacterPortraitProps) {
  const cardClasses = [
    styles.portrait,
    isUnavailable ? styles.disabled : ''
  ].join(' ');

  return (
    <div className={cardClasses} onClick={!isUnavailable ? onSelect : undefined}>
      <img src={character.image} alt={character.name} className={styles.image} />
      <span className={styles.name}>{character.name}</span>
    </div>
  );
} 
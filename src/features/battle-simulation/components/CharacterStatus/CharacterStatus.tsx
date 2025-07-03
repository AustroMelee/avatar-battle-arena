// CONTEXT: BattleSimulation, // FOCUS: UIRendering
import { BattleCharacter } from '../../types';
import styles from './CharacterStatus.module.css';

/**
 * @description Props for the CharacterStatus component.
 */
export type CharacterStatusProps = {
  character: BattleCharacter;
  isActive: boolean;
  playerColor: string;
};

/**
 * @description Displays the real-time status of a character in battle with enhanced UI for abilities.
 * @returns {JSX.Element} The character status UI.
 */
export function CharacterStatus({ character, isActive, playerColor }: CharacterStatusProps) {
  const healthPercentage = (character.currentHealth / 100) * 100;

  const containerClasses = [
    styles.container,
    isActive ? styles.active : ''
  ].join(' ');

  return (
    <div className={containerClasses} style={{ borderColor: playerColor }}>
      <h3 className={styles.name}>{character.name}</h3>
      <div className={styles.healthBarContainer}>
        <div 
          className={styles.healthBarFill}
          style={{ width: `${healthPercentage}%` }}
        ></div>
        <span className={styles.healthText}>{character.currentHealth} / 100</span>
      </div>
      <div className={styles.statsGrid}>
        <span>Pwr: {character.stats.power}</span>
        <span>Agi: {character.stats.agility}</span>
        <span>Def: {character.currentDefense}</span>
      </div>
      <ul className={styles.abilityList}>
        {character.abilities.map(ability => (
          <li key={ability.name} title={ability.description}>
            <span className={ability.type === 'attack' ? styles.attack : styles.defense}>
              {ability.type === 'attack' ? '🔥' : '🛡️'} {ability.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
} 
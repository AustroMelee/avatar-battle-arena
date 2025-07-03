// CONTEXT: BattleSimulation, // FOCUS: UIRendering
import { PlayerCardHorizontalProps } from '../../types';
import { FaWind, FaFire, FaShieldAlt, FaBolt, FaBrain, FaRunning, FaStar, FaShieldVirus } from 'react-icons/fa';
import styles from './PlayerCardHorizontal.module.css';

/**
 * @description Maps bending types to their corresponding colors and icons.
 */
function getBendingTheme(bending: string) {
  switch (bending) {
    case 'air':
      return { color: '#87CEEB', icon: <FaWind />, name: 'Air' };
    case 'fire':
      return { color: '#FF6B35', icon: <FaFire />, name: 'Fire' };
    case 'water':
      return { color: '#4FC3F7', icon: <FaBolt />, name: 'Water' };
    case 'earth':
      return { color: '#8D6E63', icon: <FaShieldAlt />, name: 'Earth' };
    case 'avatar':
      return { color: '#FFD700', icon: <FaStar />, name: 'Avatar' };
    default:
      return { color: '#9E9E9E', icon: <FaShieldVirus />, name: 'Unknown' };
  }
}

/**
 * @description Maps stat names to their corresponding icons.
 */
function getStatIcon(statName: string) {
  switch (statName.toLowerCase()) {
    case 'power':
      return <FaFire />;
    case 'agility':
      return <FaRunning />;
    case 'defense':
      return <FaShieldAlt />;
    case 'intelligence':
      return <FaBrain />;
    default:
      return <FaStar />;
  }
}

/**
 * @description Renders a horizontal player card for the versus UI with comprehensive character information.
 * @returns {JSX.Element} The horizontal player card UI.
 */
export function PlayerCardHorizontal({ character, isActive, playerColor, onChange }: PlayerCardHorizontalProps) {
  const bendingTheme = getBendingTheme(character.bending);
  const healthPercentage = (character.currentHealth / 100) * 100;

  const containerClasses = [
    styles.horizontalCard,
    isActive ? styles.active : ''
  ].join(' ');

  return (
    <div 
      className={containerClasses}
      style={{ 
        '--bending-color': bendingTheme.color,
        '--player-color': playerColor
      } as React.CSSProperties}
    >
      <div className={styles.avatarSection}>
        <img src={character.image} alt={character.name} className={styles.avatarImg} />
        <div className={styles.bendingBadge}>
          {bendingTheme.icon}
          <span>{bendingTheme.name}</span>
        </div>
      </div>
      
      <div className={styles.cardDetails}>
        <div className={styles.nameRow}>
          <h3>{character.name}</h3>
          {isActive && <div className={styles.activeIndicator}>ACTIVE</div>}
        </div>
        
        <div className={styles.healthRow}>
          <div className={styles.healthBarContainer}>
            <div 
              className={styles.healthBarFill}
              style={{ width: `${healthPercentage}%` }}
            />
            <span className={styles.healthText}>{character.currentHealth} / 100</span>
          </div>
        </div>
        
        <div className={styles.statsRow}>
          {Object.entries(character.stats).map(([statName, value]) => (
            <span key={statName} className={styles.statChip}>
              {getStatIcon(statName)}
              <span className={styles.statLabel}>{statName.charAt(0).toUpperCase() + statName.slice(1)}</span>
              <span className={styles.statValue}>{value}</span>
            </span>
          ))}
          <span className={styles.statChip}>
            <FaShieldAlt />
            <span className={styles.statLabel}>Def</span>
            <span className={styles.statValue}>{character.currentDefense}</span>
          </span>
        </div>
        
        <div className={styles.abilitiesRow}>
          {character.abilities.map(ability => (
            <span key={ability.name} className={styles.abilityChip}>
              {ability.type === 'attack' ? <FaFire /> : <FaShieldAlt />}
              <span>{ability.name}</span>
            </span>
          ))}
        </div>
        
        <div className={styles.styleRow}>
          <span className={styles.styleChip}>
            <FaBrain />
            <span>{character.personality}</span>
          </span>
        </div>
        
        {onChange && (
          <button className={styles.changeButton} onClick={onChange}>
            Change
          </button>
        )}
      </div>
    </div>
  );
} 
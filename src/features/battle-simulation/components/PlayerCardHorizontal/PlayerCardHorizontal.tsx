import React from 'react';
// CONTEXT: BattleSimulation, // FOCUS: UIRendering
import { PlayerCardHorizontalProps } from '../../types';
import { FaWind, FaFire, FaShieldAlt, FaBolt, FaBrain, FaRunning, FaStar, FaShieldVirus, FaBurn, FaClock, FaArrowUp, FaArrowDown, FaHeart } from 'react-icons/fa';
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
 * @description Maps status effect types to their corresponding icons and colors.
 */
function getStatusEffectIcon(effectType: string) {
  switch (effectType) {
    case 'BURN':
      return { icon: <FaBurn />, color: '#FF4500' };
    case 'STUN':
      return { icon: <FaClock />, color: '#FFD700' };
    case 'DEFENSE_UP':
      return { icon: <FaArrowUp />, color: '#32CD32' };
    case 'ATTACK_UP':
      return { icon: <FaArrowUp />, color: '#FF6347' };
    case 'DEFENSE_DOWN':
      return { icon: <FaArrowDown />, color: '#DC143C' };
    case 'HEAL_OVER_TIME':
      return { icon: <FaHeart />, color: '#00FF7F' };
    case 'CRIT_CHANCE_UP':
      return { icon: <FaStar />, color: '#FFD700' };
    case 'SLOW':
      return { icon: <FaClock />, color: '#87CEEB' };
    default:
      return { icon: <FaStar />, color: '#9E9E9E' };
  }
}

/**
 * @description Renders a horizontal player card for the versus UI with comprehensive character information.
 * @returns {JSX.Element} The horizontal player card UI.
 */
export function PlayerCardHorizontal({ character, isActive, playerColor, onChange }: PlayerCardHorizontalProps) {
  const bendingTheme = getBendingTheme(character.bending);
  const healthPercentage = ((character.currentHealth || 0) / 100) * 100;

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
          {/* NEW MENTAL STATE INDICATOR */}
          {character.mentalState?.activeStates?.includes('unhinged') && (
            <div className={styles.mentalStateIndicator_unhinged}>UNHINGED</div>
          )}
          {character.mentalState?.activeStates?.includes('enraged') && (
            <div className={styles.mentalStateIndicator_enraged}>ENRAGED</div>
          )}
          {character.mentalState?.activeStates?.includes('fearful') && (
            <div className={styles.mentalStateIndicator_fearful}>FEARFUL</div>
          )}
        </div>
        
        <div className={styles.healthRow}>
          <div className={styles.healthBarContainer}>
            <div 
              className={styles.healthBarFill}
              style={{ width: `${healthPercentage}%` }}
            />
            <span className={styles.healthText}>{character.currentHealth || 0} / 100</span>
          </div>
        </div>
        
        <div className={styles.statsRow}>
          {character.stats && Object.entries(character.stats).map(([statName, value]) => (
            <span key={statName} className={styles.statChip}>
              {getStatIcon(statName)}
              <span className={styles.statLabel}>{statName.charAt(0).toUpperCase() + statName.slice(1)}</span>
              <span className={styles.statValue}>{value}</span>
            </span>
          ))}
          <span className={styles.statChip}>
            <FaShieldAlt />
            <span className={styles.statLabel}>Defense</span>
            <span className={styles.statValue}>{character.currentDefense || 0}</span>
          </span>
          <span className={styles.statChip}>
            <FaBolt />
            <span className={styles.statLabel}>Chi</span>
            <span className={styles.statValue}>{character.resources?.chi || 0}</span>
          </span>
        </div>
        
        {/* Status Effects Row */}
        {character.activeEffects && character.activeEffects.length > 0 && (
          <div className={styles.effectsRow}>
            {character.activeEffects.map((effect) => {
              const effectIcon = getStatusEffectIcon(effect.type);
              return (
                <div 
                  key={effect.id} 
                  className={`${styles.effectIcon} ${styles[effect.category]}`}
                  style={{ '--effect-color': effectIcon.color } as React.CSSProperties}
                  title={`${effect.name} (${effect.duration} turns remaining) - Applied by ${effect.sourceAbility}`}
                >
                  {effectIcon.icon}
                  <span className={styles.effectDuration}>{effect.duration}</span>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Abilities Row */}
        {character.abilities && character.abilities.length > 0 && (
          <div className={styles.abilitiesRow}>
            {character.abilities.slice(0, 3).map((ability) => (
              <span key={ability.name} className={styles.abilityChip}>
                <span className={styles.abilityName}>{ability.name}</span>
                <span className={styles.abilityPower}>{ability.power}</span>
              </span>
            ))}
            {character.abilities.length > 3 && (
              <span className={styles.abilityChip}>
                <span className={styles.abilityName}>+{character.abilities.length - 3} more</span>
              </span>
            )}
          </div>
        )}
        
        {/* Style Row */}
        {character.personality && (
          <div className={styles.styleRow}>
            <span className={styles.styleChip}>
              <span className={styles.styleLabel}>Style</span>
              <span className={styles.styleValue}>{character.personality}</span>
            </span>
          </div>
        )}
        
        {onChange && (
          <button className={styles.changeButton} onClick={onChange}>
            Change Character
          </button>
        )}
      </div>
    </div>
  );
} 
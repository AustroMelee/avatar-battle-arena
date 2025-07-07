import React from 'react';
// CONTEXT: CharacterSelection, // FOCUS: UIRendering
import { Character } from '@/common/types';
import styles from './CharacterCard.module.css';
import { FaWind, FaFire, FaShieldAlt, FaBolt, FaBrain, FaRunning, FaStar, FaShieldVirus } from 'react-icons/fa';

/**
 * @description Props for a single CharacterCard.
 */
export type CharacterCardProps = {
  character: Character;
  isSelected: boolean;
  isUnavailable: boolean;
  onSelect: () => void;
  playerColor: string;
};

/**
 * @description Maps a bending type to its corresponding CSS color variable.
 * @param {Character['bending']} bending - The bending type.
 * @returns {string} The CSS variable for the color.
 */
function getBendingColor(bending: Character['bending']): string {
  switch (bending) {
    case 'air': return 'var(--color-air)';
    case 'fire': return 'var(--color-fire)';
    case 'water': return 'var(--color-water)';
    case 'earth': return 'var(--color-earth)';
    default: return 'var(--border-color-inactive)';
  }
}

const STAT_ICONS: Record<string, React.JSX.Element> = {
  power: <FaBolt style={{ color: '#f87171', marginRight: 6 }} aria-label="Power" />,
  agility: <FaRunning style={{ color: '#fbbf24', marginRight: 6 }} aria-label="Agility" />,
  defense: <FaShieldAlt style={{ color: '#38bdf8', marginRight: 6 }} aria-label="Defense" />,
  intelligence: <FaBrain style={{ color: '#a78bfa', marginRight: 6 }} aria-label="Intelligence" />,
  default: <FaStar style={{ color: '#fff', marginRight: 6 }} aria-label="Stat" />,
};
const STAT_COLORS: Record<string, string> = {
  power: '#f87171',
  agility: '#fbbf24',
  defense: '#38bdf8',
  intelligence: '#a78bfa',
  default: '#fff',
};
const BENDING_ICONS: Record<string, React.JSX.Element> = {
  air: <FaWind style={{ marginRight: 6 }} aria-label="Air" />,
  fire: <FaFire style={{ marginRight: 6 }} aria-label="Fire" />,
  water: <FaShieldVirus style={{ marginRight: 6 }} aria-label="Water" />,
  earth: <FaStar style={{ marginRight: 6 }} aria-label="Earth" />,
  default: <FaStar style={{ marginRight: 6 }} aria-label="Element" />,
};
const ABILITY_TYPE_COLORS: Record<string, string> = {
  attack: '#f87171',
  buff: '#38bdf8',
  debuff: '#a78bfa',
  heal: '#fbbf24',
  'defense buff': '#38bdf8',
  default: '#fff',
};

/**
 * @description Renders a detailed, styled card for character selection.
 * @returns {JSX.Element} The character card UI.
 */
export function CharacterCard({ character, isSelected, isUnavailable, onSelect, playerColor }: CharacterCardProps) {
  const cardClasses = [
    styles.container,
    isSelected ? styles.selected : '',
    isUnavailable ? styles.disabled : '',
  ].join(' ');

  const dynamicStyle = {
    '--bending-color': getBendingColor(character.bending),
    borderColor: isSelected ? playerColor : 'transparent',
  } as React.CSSProperties;

  return (
    <div className={cardClasses} onClick={!isUnavailable ? onSelect : undefined} style={dynamicStyle} aria-label={`Character card for ${character.name}`}>
      {/* Background Sigil/Watermark */}
      <div className={styles.sigilBg} aria-hidden="true" />
      {/* Image and Bending Badge */}
      <div className={styles.imageContainer}>
        <img src={character.image} alt={character.name} className={styles.characterImage} />
        <div className={styles.bendingBadge}>
          {BENDING_ICONS[character.bending]}<span>{character.bending.charAt(0).toUpperCase() + character.bending.slice(1)}bender</span>
        </div>
      </div>
      {/* Name with Glow */}
      <h3 className={styles.characterName}>
        <span className={styles.nameGlow}>{character.name}</span>
      </h3>
      {/* Divider */}
      <div className={styles.sectionDivider} />
      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {Object.entries(character.stats).map(([statName, statValue]) => (
          <div key={statName} className={styles.stat}>
            <span className={styles.statLabel} style={{ color: STAT_COLORS[statName] || STAT_COLORS.default }}>{STAT_ICONS[statName] || STAT_ICONS.default}{statName.charAt(0).toUpperCase() + statName.slice(1)}</span>
            <span className={styles.statValue} style={{ color: STAT_COLORS[statName] || STAT_COLORS.default, fontWeight: 800 }}>{statValue}</span>
          </div>
        ))}
      </div>
      {/* Divider */}
      <div className={styles.sectionDivider} />
      {/* Abilities Section */}
      <div className={styles.abilitiesSection}>
        <h4>Abilities:</h4>
        <ul className={styles.abilitiesList}>
          {character.abilities.map(ability => (
            <li key={ability.name} className={styles.abilityItem} title={ability.description} tabIndex={0} aria-label={`${ability.name}: ${ability.description}`}> 
              <span className={styles.abilityIcon}>{BENDING_ICONS[character.bending] || BENDING_ICONS.default}</span>
              <span className={styles.abilityName}>{ability.name}</span>
              <span className={styles.abilityTag} style={{ background: ABILITY_TYPE_COLORS[ability.type.replace('_', ' ')] || ABILITY_TYPE_COLORS.default }}>{ability.type.charAt(0).toUpperCase() + ability.type.slice(1)}</span>
              <span className={styles.abilityPowerChip}>{ability.baseDamage}</span>
              <span className={styles.abilityDesc}>{ability.description}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* Divider */}
      <div className={styles.sectionDivider} />
      {/* Personality Section */}
      <div className={styles.personality}>
        <span className={styles.personalityLabel}>Personality:</span>
        <span className={styles.personalityChip}>{character.personality.charAt(0).toUpperCase() + character.personality.slice(1)}</span>
      </div>
      {/* Divider */}
      <div className={styles.sectionDivider} />
      {/* Behavioral Traits Section (if needed) */}
      {/* ... existing code ... */}
    </div>
  );
} 
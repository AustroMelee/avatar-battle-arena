// CONTEXT: BattleSimulation, // FOCUS: UI
import { BattleCharacter } from '../../types';
import styles from './CharacterStatus.module.css';

/**
 * @description Props for the CharacterStatus component.
 */
type CharacterStatusProps = {
  character: BattleCharacter;
  isActive: boolean;
  playerColor: string;
};

/**
 * @description Displays the current status of a character in battle, including health, cooldowns, and move history.
 * @param {CharacterStatusProps} props - The component props.
 * @returns {JSX.Element} The character status display.
 */
export function CharacterStatus({ character, isActive, playerColor }: CharacterStatusProps) {
  const healthPercentage = (character.currentHealth / 100) * 100;
  
  // Get abilities with cooldown information
  const abilitiesWithCooldowns = character.abilities.map(ability => ({
    ...ability,
    cooldownRemaining: character.cooldowns[ability.name] || 0
  }));

  return (
    <div className={`${styles.characterStatus} ${isActive ? styles.active : ''}`}>
      <div className={styles.header}>
        <h3 className={styles.name}>{character.name}</h3>
        <div className={styles.bending}>{character.bending}</div>
      </div>
      
      {/* Health Bar */}
      <div className={styles.healthSection}>
        <div className={styles.healthBar}>
          <div 
            className={styles.healthFill} 
            style={{ 
              width: `${healthPercentage}%`,
              backgroundColor: playerColor 
            }}
          />
        </div>
        <span className={styles.healthText}>{character.currentHealth}/100</span>
      </div>
      
      {/* Cooldowns */}
      <div className={styles.cooldownsSection}>
        <h4 className={styles.sectionTitle}>Abilities & Cooldowns</h4>
        <div className={styles.abilitiesList}>
          {abilitiesWithCooldowns.map(ability => (
            <div 
              key={ability.name} 
              className={`${styles.ability} ${ability.cooldownRemaining > 0 ? styles.onCooldown : ''}`}
            >
              <span className={styles.abilityName}>{ability.name}</span>
              {ability.cooldownRemaining > 0 && (
                <span className={styles.cooldownBadge}>
                  CD: {ability.cooldownRemaining}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Move History */}
      <div className={styles.moveHistorySection}>
        <h4 className={styles.sectionTitle}>Recent Moves</h4>
        <div className={styles.moveHistory}>
          {character.moveHistory.length > 0 ? (
            character.moveHistory.slice(-3).map((move, index) => (
              <div key={index} className={styles.moveEntry}>
                {move}
              </div>
            ))
          ) : (
            <div className={styles.noMoves}>No moves used yet</div>
          )}
        </div>
      </div>
      
      {/* Last Move Highlight */}
      {character.lastMove && (
        <div className={styles.lastMoveSection}>
          <span className={styles.lastMoveLabel}>Last Move:</span>
          <span className={styles.lastMoveName}>{character.lastMove}</span>
        </div>
      )}
      
      {/* Active Buffs */}
      {character.activeBuffs.length > 0 && (
        <div className={styles.buffsSection}>
          <h4 className={styles.sectionTitle}>Active Buffs</h4>
          <div className={styles.buffsList}>
            {character.activeBuffs.map(buff => (
              <div key={buff.id} className={styles.buff}>
                <span className={styles.buffName}>{buff.name}</span>
                <span className={styles.buffDuration}>Turns: {buff.duration}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Active Debuffs */}
      {character.activeDebuffs.length > 0 && (
        <div className={styles.debuffsSection}>
          <h4 className={styles.sectionTitle}>Active Debuffs</h4>
          <div className={styles.debuffsList}>
            {character.activeDebuffs.map(debuff => (
              <div key={debuff.id} className={styles.debuff}>
                <span className={styles.debuffName}>{debuff.name}</span>
                <span className={styles.debuffDuration}>Turns: {debuff.duration}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Resources */}
      <div className={styles.resourcesSection}>
        <h4 className={styles.sectionTitle}>Resources</h4>
        <div className={styles.resourcesList}>
          <div className={styles.resource}>
            <span className={styles.resourceName}>Chi:</span>
            <span className={styles.resourceValue}>{character.resources.chi}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 
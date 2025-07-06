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
  // Disruption model: controlState, stability, momentum
  const momentumPercentage = ((character.momentum + 100) / 2);
  
  // Get abilities with cooldown information
  const abilitiesWithCooldowns = character.abilities.map(ability => ({
    ...ability,
    cooldownRemaining: character.cooldowns[ability.name] || 0
  }));

  // Separate active effects by category
  const buffs = character.activeEffects.filter(effect => effect.category === 'buff');
  const debuffs = character.activeEffects.filter(effect => effect.category === 'debuff');

  // Disruption summary panel
  return (
    <div className={`${styles.characterStatus} ${isActive ? styles.active : ''}`}
      aria-label={`Status for ${character.name}`}
      role="region"
    >
      <div className={styles.disruptionSummary} aria-label="Disruption State Summary">
        <span className={`${styles.summaryState} ${styles[character.controlState.toLowerCase()]}`}
          aria-label={`Control State: ${character.controlState}`}
        >{character.controlState}</span>
        <span className={styles.summaryStability} aria-label={`Stability: ${character.stability}/100`}>
          Stability: <strong>{character.stability}</strong>
        </span>
        <span className={styles.summaryMomentum} aria-label={`Momentum: ${character.momentum}`}
        >Momentum: <strong>{character.momentum}</strong></span>
      </div>
      <div className={styles.header}>
        <h3 className={styles.name}>{character.name}</h3>
        <div className={styles.bending}>{character.bending}</div>
      </div>
      {/* Control State */}
      <div className={styles.controlStateSection}>
        <span className={styles.controlStateLabel}>Control State:</span>
        <span className={`${styles.controlState} ${styles[character.controlState.toLowerCase()]}`}>{character.controlState}</span>
      </div>
      {/* Stability Bar */}
      <div className={styles.stabilitySection}>
        <span className={styles.stabilityLabel}>Stability:</span>
        <progress className={styles.stabilityBar} value={character.stability} max={100} aria-valuenow={character.stability} aria-valuemax={100} aria-label="Stability" />
        <span className={styles.stabilityValue}>{character.stability}/100</span>
      </div>
      {/* Momentum Meter */}
      <div className={styles.momentumSection}>
        <span className={styles.momentumLabel}>Momentum:</span>
        <div className={styles.momentumMeterOuter} aria-label="Momentum Meter">
          <div className={styles.momentumMeterInner} style={{ width: `${momentumPercentage}%`, backgroundColor: playerColor }} />
        </div>
        <span className={styles.momentumValue}>{character.momentum}</span>
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
      {buffs.length > 0 && (
        <div className={styles.buffsSection}>
          <h4 className={styles.sectionTitle}>Active Buffs</h4>
          <div className={styles.buffsList}>
            {buffs.map(buff => (
              <div key={buff.id} className={styles.buff}>
                <span className={styles.buffName}>{buff.name}</span>
                <span className={styles.buffDuration}>Turns: {buff.duration}</span>
                <span className={styles.buffSource}>from {buff.sourceAbility}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Active Debuffs */}
      {debuffs.length > 0 && (
        <div className={styles.debuffsSection}>
          <h4 className={styles.sectionTitle}>Active Debuffs</h4>
          <div className={styles.debuffsList}>
            {debuffs.map(debuff => (
              <div key={debuff.id} className={styles.debuff}>
                <span className={styles.debuffName}>{debuff.name}</span>
                <span className={styles.debuffDuration}>Turns: {debuff.duration}</span>
                <span className={styles.debuffSource}>from {debuff.sourceAbility}</span>
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
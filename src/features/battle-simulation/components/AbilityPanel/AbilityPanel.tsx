// CONTEXT: BattleSimulation, // FOCUS: AbilityPanel
import React, { useMemo } from 'react';
import type { Move } from '../../types/move.types';
import type { BattleCharacter } from '../../types';
import { AbilityButton } from '../AbilityButton';
import { useCooldownManager } from '../../hooks/useCooldownManager.hook';
import styles from './AbilityPanel.module.css';

/**
 * @description Props for the AbilityPanel component.
 */
export type AbilityPanelProps = {
  /** @description The character whose abilities are being displayed. */
  character: BattleCharacter;
  /** @description Whether this panel is for the active player. */
  isActive: boolean;
  /** @description Callback when an ability is selected. */
  onAbilitySelect: (move: Move) => void;
  /** @description Whether to show detailed tooltips. */
  showTooltips?: boolean;
  /** @description Additional CSS class names. */
  className?: string;
};

/**
 * @description React component for displaying a character's abilities with cooldown management.
 * Integrates the cooldown system with visual feedback and accessibility features.
 * @param {AbilityPanelProps} props - Component props.
 * @returns {JSX.Element} The ability panel component.
 */
export const AbilityPanel: React.FC<AbilityPanelProps> = ({
  character,
  isActive,
  onAbilitySelect,
  showTooltips = true,
  className = ''
}) => {
  // Calculate current health percentage
  const healthPercentage = useMemo(() => {
    const maxHealth = 100; // Assuming 100 is max health
    return Math.max(0, Math.min(100, (character.currentHealth / maxHealth) * 100));
  }, [character.currentHealth]);

  // Initialize cooldown manager
  const cooldownManager = useCooldownManager({
    moves: character.abilities,
    startingTurn: 0, // This should come from battle state
    availableChi: character.resources.chi,
    currentHealthPercentage: healthPercentage
  });

  // Memoize ability display info for performance
  const moveDisplayInfos = useMemo(() => {
    return character.abilities.map(move => ({
      move,
      displayInfo: cooldownManager.getDisplayInfo(move)
    }));
  }, [character.abilities, cooldownManager]);

  /**
   * @description Handle ability selection.
   * @param {Move} move - The selected move.
   */
  const handleMoveSelect = (move: Move): void => {
    if (!isActive) {
      return; // Only allow selection for active player
    }

    const availability = cooldownManager.isMoveAvailable(move);
    
    if (availability.isAvailable) {
      cooldownManager.useMove(move);
      onAbilitySelect(move);
    }
  };

  /**
   * @description Get the panel title based on character and active state.
   * @returns {string} The panel title.
   */
  const getPanelTitle = (): string => {
    const baseTitle = `${character.name}'s Abilities`;
    return isActive ? `${baseTitle} (Your Turn)` : baseTitle;
  };

  return (
    <div className={`${styles.abilityPanel} ${className}`}>
      {/* Panel header */}
      <div className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>{getPanelTitle()}</h3>
        
        {/* Character stats */}
        <div className={styles.characterStats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Health:</span>
            <span className={styles.statValue}>
              {Math.round(character.currentHealth)}%
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Chi:</span>
            <span className={styles.statValue}>
              {character.resources.chi}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Defense:</span>
            <span className={styles.statValue}>
              {character.currentDefense}
            </span>
          </div>
        </div>
      </div>

      {/* Moves list */}
      <div className={styles.abilitiesList}>
        {moveDisplayInfos.map(({ move, displayInfo }) => (
          <AbilityButton
            key={move.name}
            ability={move}
            displayInfo={displayInfo}
            onClick={handleMoveSelect}
            showTooltips={showTooltips}
            className={styles.abilityButton}
          />
        ))}
      </div>

      {/* Cooldown summary */}
      <div className={styles.cooldownSummary}>
        <h4 className={styles.summaryTitle}>Cooldown Status</h4>
        <div className={styles.summaryGrid}>
          {moveDisplayInfos
            .filter(({ displayInfo }) => displayInfo.showCooldownIndicator)
            .map(({ move, displayInfo }) => (
              <div key={move.name} className={styles.summaryItem}>
                <span className={styles.summaryAbilityName}>{move.name}</span>
                <span className={styles.summaryCooldown}>
                  {displayInfo.cooldownText}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Turn information */}
      <div className={styles.turnInfo}>
        <span className={styles.turnLabel}>Turn:</span>
        <span className={styles.turnValue}>{cooldownManager.currentTurn}</span>
      </div>
    </div>
  );
}; 
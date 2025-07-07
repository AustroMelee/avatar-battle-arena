// CONTEXT: BattleSimulation, // FOCUS: AbilityButton
import React from 'react';
import type { Move } from '../../types/move.types';
import type { CooldownDisplayInfo } from '../../types/cooldown.types';
import styles from './AbilityButton.module.css';

/**
 * @description Props for the AbilityButton component.
 */
export type AbilityButtonProps = {
  /** @description The ability to display. */
  ability: Move;
  /** @description Display information for the ability. */
  displayInfo: CooldownDisplayInfo;
  /** @description Callback when the ability button is clicked. */
  onClick: (move: Move) => void;
  /** @description Whether to show detailed tooltips. */
  showTooltips?: boolean;
  /** @description Additional CSS class names. */
  className?: string;
};

/**
 * @description React component for displaying an ability button with cooldown information.
 * Provides visual feedback for ability availability, cooldowns, and use limits.
 * @param {AbilityButtonProps} props - Component props.
 * @returns {JSX.Element} The ability button component.
 */
export const AbilityButton: React.FC<AbilityButtonProps> = ({
  ability,
  displayInfo,
  onClick,
  showTooltips = true,
  className = ''
}) => {
  const {
    isDisabled,
    buttonClass,
    cooldownText,
    usesText,
    tooltipText,
    showCooldownIndicator,
    cooldownProgress
  } = displayInfo;

  const chiCost = ability.chiCost ?? 0;

  /**
   * @description Handle button click event.
   * @param {React.MouseEvent<HTMLButtonElement>} event - Click event.
   */
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    
    if (!isDisabled) {
      onClick(ability);
    }
  };

  /**
   * @description Handle keyboard events for accessibility.
   * @param {React.KeyboardEvent<HTMLButtonElement>} event - Keyboard event.
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      
      if (!isDisabled) {
        onClick(ability);
      }
    }
  };

  return (
    <div className={`${styles.abilityContainer} ${className}`}>
      <button
        className={`${styles.abilityButton} ${styles[buttonClass]}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        aria-label={`${ability.name} - ${tooltipText || ability.description}`}
        aria-describedby={`ability-${ability.name}-description`}
        title={showTooltips ? tooltipText : undefined}
        type="button"
      >
        {/* Ability name and chi cost */}
        <div className={styles.abilityHeader}>
          <span className={styles.abilityName}>{ability.name}</span>
          {chiCost > 0 && (
            <span className={styles.chiCost} aria-label={`${chiCost} chi cost`}>
              {chiCost} chi
            </span>
          )}
        </div>

        {/* Cooldown indicator */}
        {showCooldownIndicator && (
          <div className={styles.cooldownIndicator}>
            <div 
              className={styles.cooldownProgress}
              style={{ width: `${cooldownProgress}%` }}
              aria-label={`Cooldown progress: ${cooldownProgress}%`}
            />
            <span className={styles.cooldownText}>{cooldownText}</span>
          </div>
        )}

        {/* Uses remaining indicator */}
        {usesText && (
          <div className={styles.usesIndicator}>
            <span className={styles.usesText}>{usesText}</span>
          </div>
        )}
      </button>

      {/* Hidden description for screen readers */}
      <div 
        id={`ability-${ability.name}-description`}
        className={styles.srOnly}
        aria-hidden="true"
      >
        {ability.description}
        {isDisabled && tooltipText && ` - ${tooltipText}`}
      </div>
    </div>
  );
}; 
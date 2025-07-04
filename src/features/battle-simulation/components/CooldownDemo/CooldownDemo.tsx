// CONTEXT: BattleSimulation, // FOCUS: CooldownDemo
import React, { useState, useCallback } from 'react';
import type { Ability, Character } from '@/common/types';
import { availableCharacters } from '../../../character-selection/data/characterData';
import { AbilityPanel } from '../AbilityPanel';
import { useCooldownManager } from '../../hooks/useCooldownManager.hook';
import styles from './CooldownDemo.module.css';

/**
 * @description Props for the CooldownDemo component.
 */
export type CooldownDemoProps = {
  /** @description Whether to show detailed tooltips. */
  showTooltips?: boolean;
  /** @description Additional CSS class names. */
  className?: string;
};

/**
 * @description React component for demonstrating the cooldown system.
 * Provides an interactive interface to test ability cooldowns and restrictions.
 * @param {CooldownDemoProps} props - Component props.
 * @returns {JSX.Element} The cooldown demo component.
 */
export const CooldownDemo: React.FC<CooldownDemoProps> = ({
  showTooltips = true,
  className = ''
}) => {
  const [selectedCharacterIndex, setSelectedCharacterIndex] = useState<number>(0);
  const [currentTurn, setCurrentTurn] = useState<number>(0);
  const [selectedAbilities, setSelectedAbilities] = useState<string[]>([]);
  const [battleLog, setBattleLog] = useState<string[]>([]);

  const selectedCharacter = availableCharacters[selectedCharacterIndex];

  // Initialize cooldown manager
  const cooldownManager = useCooldownManager({
    abilities: selectedCharacter.abilities,
    startingTurn: currentTurn,
    availableChi: 10, // Demo chi amount
    currentHealthPercentage: 80 // Demo health percentage
  });

  /**
   * @description Handle character selection.
   * @param {React.ChangeEvent<HTMLSelectElement>} event - Change event.
   */
  const handleCharacterChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>): void => {
    const newIndex = parseInt(event.target.value, 10);
    setSelectedCharacterIndex(newIndex);
    setSelectedAbilities([]);
    setBattleLog([]);
  }, []);

  /**
   * @description Handle ability selection.
   * @param {Ability} ability - The selected ability.
   */
  const handleAbilitySelect = useCallback((ability: Ability): void => {
    const availability = cooldownManager.isAbilityAvailable(ability);
    
    if (availability.isAvailable) {
      cooldownManager.useAbility(ability);
      setSelectedAbilities(prev => [...prev, ability.name]);
      
      const logEntry = `Turn ${currentTurn}: Used ${ability.name} (${ability.chiCost ?? 0} chi)`;
      setBattleLog(prev => [...prev, logEntry]);
    } else {
      const reason = availability.reason || 'unknown';
      const logEntry = `Turn ${currentTurn}: Cannot use ${ability.name} - ${reason}`;
      setBattleLog(prev => [...prev, logEntry]);
    }
  }, [cooldownManager, currentTurn]);

  /**
   * @description Advance to the next turn.
   */
  const handleAdvanceTurn = useCallback((): void => {
    cooldownManager.advanceTurn();
    setCurrentTurn(prev => prev + 1);
    
    const logEntry = `--- Turn ${currentTurn + 1} begins ---`;
    setBattleLog(prev => [...prev, logEntry]);
  }, [cooldownManager, currentTurn]);

  /**
   * @description Reset the battle.
   */
  const handleResetBattle = useCallback((): void => {
    cooldownManager.resetCooldowns(0);
    setCurrentTurn(0);
    setSelectedAbilities([]);
    setBattleLog(['--- Battle Reset ---']);
  }, [cooldownManager]);

  /**
   * @description Get the current character's health percentage.
   * @returns {number} Health percentage.
   */
  const getCurrentHealthPercentage = (): number => {
    // Simulate health changes based on selected abilities
    const healthReduction = selectedAbilities.length * 2; // Each ability reduces health by 2%
    return Math.max(20, 80 - healthReduction); // Minimum 20% for desperation moves
  };

  // Create a mock battle character for the demo
  const mockBattleCharacter = {
    ...selectedCharacter,
    currentHealth: getCurrentHealthPercentage(),
    currentDefense: 50,
    cooldowns: {},
    usesLeft: {},
    lastMove: undefined,
    moveHistory: selectedAbilities,
    resources: {
      chi: 10 - selectedAbilities.reduce((total: number, abilityName: string) => {
        const ability = selectedCharacter.abilities.find((a: Ability) => a.name === abilityName);
        return total + (ability?.chiCost ?? 0);
      }, 0)
    },
    activeBuffs: [],
    activeDebuffs: [],
    flags: {},
    diminishingEffects: {}
  };

  return (
    <div className={`${styles.cooldownDemo} ${className}`}>
      {/* Demo header */}
      <div className={styles.demoHeader}>
        <h2 className={styles.demoTitle}>Cooldown System Demo</h2>
        <p className={styles.demoDescription}>
          Test the cooldown system by selecting abilities and advancing turns.
        </p>
      </div>

      {/* Character selection */}
      <div className={styles.characterSelection}>
        <label htmlFor="character-select" className={styles.characterLabel}>
          Select Character:
        </label>
        <select
          id="character-select"
          value={selectedCharacterIndex}
          onChange={handleCharacterChange}
          className={styles.characterSelect}
        >
          {availableCharacters.map((character: Character, index: number) => (
            <option key={character.id} value={index}>
              {character.name} ({character.bending})
            </option>
          ))}
        </select>
      </div>

      {/* Battle controls */}
      <div className={styles.battleControls}>
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Current Turn: {currentTurn}</span>
          <button
            onClick={handleAdvanceTurn}
            className={styles.controlButton}
            type="button"
          >
            Advance Turn
          </button>
        </div>
        
        <div className={styles.controlGroup}>
          <button
            onClick={handleResetBattle}
            className={`${styles.controlButton} ${styles.resetButton}`}
            type="button"
          >
            Reset Battle
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className={styles.demoContent}>
        {/* Ability panel */}
        <div className={styles.abilitySection}>
          <AbilityPanel
            character={mockBattleCharacter}
            isActive={true}
            onAbilitySelect={handleAbilitySelect}
            showTooltips={showTooltips}
            className={styles.abilityPanel}
          />
        </div>

        {/* Battle log */}
        <div className={styles.battleLogSection}>
          <h3 className={styles.logTitle}>Battle Log</h3>
          <div className={styles.battleLog}>
            {battleLog.length === 0 ? (
              <p className={styles.emptyLog}>No actions taken yet.</p>
            ) : (
              battleLog.map((entry, index) => (
                <div key={index} className={styles.logEntry}>
                  {entry}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Cooldown information */}
      <div className={styles.cooldownInfo}>
        <h3 className={styles.infoTitle}>Cooldown System Features</h3>
        <ul className={styles.featureList}>
          <li>Prevents ability spamming with turn-based cooldowns</li>
          <li>Visual feedback for cooldown status and remaining turns</li>
          <li>Chi cost validation and insufficient resource handling</li>
          <li>Desperation moves with health-based unlock conditions</li>
          <li>Use limits for powerful abilities</li>
          <li>Accessibility support with ARIA labels and keyboard navigation</li>
        </ul>
      </div>
    </div>
  );
}; 
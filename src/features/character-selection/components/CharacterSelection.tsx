/*
 * @file CharacterSelection.tsx
 * @description Main character selection UI: grid, card selection, and state management for Avatar Battle Arena.
 * @criticality 🎨 Character Selection UI
 * @owner AustroMelee
 * @lastUpdated 2025-07-08
 * @related CharacterCard.tsx, characterData.ts
 */
// CONTEXT: CharacterSelection, // FOCUS: UIRendering & Logic
import { Character } from '@/common/types';
import { availableCharacters } from '../data/characterData';
import styles from './CharacterSelection.module.css';
import { PlayerCardHorizontal } from '../../battle-simulation/components/PlayerCardHorizontal/PlayerCardHorizontal';
import { CharacterPortrait } from './CharacterPortrait';
import { MoveRegistry } from '../../battle-simulation/services/battle/moveRegistry.service';
import { BattleCharacter } from '../../battle-simulation/types';

/**
 * @description Props for the CharacterSelection component.
 */
export type CharacterSelectionProps = {
  title: string;
  selectedCharacter: Character | null;
  onSelectCharacter: (character: Character | null) => void; // Allow null to un-select
  opponent: Character | null;
  playerColor: string;
};

/**
 * Converts a static Character object into a display-ready BattleCharacter.
 * This is a lightweight hydrator for UI purposes only.
 * @param character The static character data.
 * @returns A BattleCharacter object suitable for display components.
 */
function hydrateCharacterForDisplay(character: Character): BattleCharacter {
  return {
    base: character,
    id: character.id,
    name: character.name,
    abilities: MoveRegistry.getMovesByIds(character.abilities),
    currentHealth: 100,
    currentDefense: character.stats.defense,
    resources: { chi: 10 },
    cooldowns: {},
    usesLeft: {},
    moveHistory: [],
    activeEffects: [],
    flags: {},
    diminishingEffects: {},
    defensiveStance: 'none',
    position: 'neutral',
    isCharging: false,
    chargeProgress: 0,
    repositionAttempts: 0,
    chargeInterruptions: 0,
    positionHistory: [],
    mentalState: { stability: 100, pride: 100, activeStates: [] },
    opponentPerception: { aggressionLevel: 0, predictability: 0, respect: 0 },
    mentalThresholdsCrossed: {},
    behavioralTraits: character.behavioralTraits || [],
    manipulationResilience: character.manipulationResilience || 50,
    activeFlags: new Map(),
    analytics: {
      totalDamage: 0,
      totalChiSpent: 0,
      turnsSinceLastDamage: 0,
      averageDamagePerTurn: 0,
      lastUpdatedTurn: 0,
      patternAdaptations: 0,
      stalematePreventions: 0,
      escalationEvents: 0,
      punishOpportunities: 0,
      criticalHits: 0,
      desperationMoves: 0,
      lastUpdated: 0,
    },
    tacticalStalemateCounter: 0,
    lastTacticalPriority: '',
    controlState: 'Neutral',
    stability: 100,
    momentum: 0,
    recoveryOptions: [],
  };
}

/**
 * @description Manages the UI for a single player's character selection, switching between a chooser grid and a detailed card display.
 * @returns {JSX.Element}
 */
export function CharacterSelection({
  title,
  selectedCharacter,
  onSelectCharacter,
  opponent,
  playerColor,
}: CharacterSelectionProps) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title} style={{ color: playerColor }}>{title}</h2>

      {selectedCharacter ? (
        // STATE 2: Display the selected character's detailed card
        <div className={styles.displayCardContainer}>
          <PlayerCardHorizontal
            character={hydrateCharacterForDisplay(selectedCharacter)}
            isActive={true}
            playerColor={playerColor}
            onChange={() => onSelectCharacter(null)}
          />
        </div>
      ) : (
        // STATE 1: Show the grid of portraits to choose from
        <div className={styles.chooserGrid}>
          {availableCharacters.map((char) => (
            <CharacterPortrait
              key={char.id}
              character={char}
              isUnavailable={opponent?.id === char.id}
              onSelect={() => onSelectCharacter(char)}
            />
          ))}
        </div>
      )}
    </div>
  );
} 
/*
 * @file App.tsx
 * @description Main React app component for Avatar Battle Arena. Sets up global providers, error boundaries, and renders the main UI tree.
 * @criticality 🎨 UI
 * @owner AustroMelee
 * @lastUpdated 2025-07-08
 * @related src/main.tsx, src/components/ErrorBoundary.tsx
 */
import React from 'react';
import { useState } from 'react';
import styles from './App.module.css';
import { Character, Location } from './common/types';
import { CharacterSelection } from './features/character-selection/components/CharacterSelection';
import { LocationSelection } from './features/location-selection/components/LocationSelection';
import { useBattleSimulator } from './features/battle-simulation/controllers/useBattleSimulator.controller';
import { Button } from './common/components/Button/Button';
import { BattleScene } from './features/battle-simulation/components/BattleScene/BattleScene';

/**
 * @description The root component that orchestrates the entire application state and renders feature modules.
 * @returns {JSX.Element} The main application UI.
 */
function App() {
  const [player1, setPlayer1] = useState<Character | null>(null);
  const [player2, setPlayer2] = useState<Character | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  
  const { 
    battleState, 
    isRunning, 
    startBattle, 
    resetBattle
  } = useBattleSimulator();

  const handleSimulate = () => {
    if (player1 && player2 && location) {
      startBattle({ player1, player2, location });
    }
  };

  const handleReset = () => {
    setPlayer1(null);
    setPlayer2(null);
    setLocation(null);
    resetBattle();
  };

  const handlePlayerChange = () => {
    // Reset to character selection when a player wants to change
    resetBattle();
  };
  
  const isSelectionComplete = player1 && player2 && location;
  const isBattleActive = battleState !== null;

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <h1>Avatar: Battle Simulator</h1>
      </header>

      <main className={styles.mainContent}>
        {!isBattleActive ? (
          <React.Fragment>
            <div className={styles.selectionGrid}>
              <div className={styles.playerColumn}>
                <CharacterSelection
                  title="Player 1"
                  selectedCharacter={player1}
                  onSelectCharacter={setPlayer1}
                  opponent={player2}
                  playerColor="var(--border-color-p1)"
                />
              </div>
              <div className={styles.separator} />
              <div className={styles.playerColumn}>
                <CharacterSelection
                  title="Player 2"
                  selectedCharacter={player2}
                  onSelectCharacter={setPlayer2}
                  opponent={player1}
                  playerColor="var(--border-color-p2)"
                />
              </div>
            </div>
            <div className={styles.locationSection}>
              <LocationSelection
                selectedLocation={location}
                onSelectLocation={setLocation}
              />
            </div>
            <div className={styles.simulateSection}>
              <Button onClick={handleSimulate} disabled={!isSelectionComplete || isRunning}>
                {isRunning ? 'Simulating...' : 'Simulate Battle'}
              </Button>
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <BattleScene 
              state={battleState} 
              onPlayerChange={handlePlayerChange}
            />
            <div className={styles.simulateSection}>
              {battleState.isFinished && (
                  <Button onClick={handleReset}>
                    Start New Battle
                  </Button>
              )}
            </div>
          </React.Fragment>
        )}
      </main>
    </div>
  );
}

export { App }; 
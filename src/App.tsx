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
import { Character, Location } from './common/types';
import { CharacterSelection } from './features/character-selection/components/CharacterSelection';
import { LocationSelection } from './features/location-selection/components/LocationSelection';
import { useBattleSimulator } from './features/battle-simulation/controllers/useBattleSimulator.controller';
import { UnifiedBattleLog } from './features/battle-simulation/components/UnifiedBattleLog/UnifiedBattleLog';

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

  const isSelectionComplete = player1 && player2 && location;
  const isBattleActive = battleState !== null;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 16, fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', fontSize: 28, margin: '16px 0' }}>Avatar: Battle Simulator</h1>
      {!isBattleActive ? (
        <>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <CharacterSelection
                title="Player 1"
                selectedCharacter={player1}
                onSelectCharacter={setPlayer1}
                opponent={player2}
                playerColor="#1e90ff"
              />
            </div>
            <div style={{ flex: 1 }}>
              <CharacterSelection
                title="Player 2"
                selectedCharacter={player2}
                onSelectCharacter={setPlayer2}
                opponent={player1}
                playerColor="#ff6347"
              />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <LocationSelection
              selectedLocation={location}
              onSelectLocation={setLocation}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={handleSimulate}
              disabled={!isSelectionComplete || isRunning}
              style={{ padding: '8px 16px', fontSize: 16 }}
            >
              {isRunning ? 'Simulating...' : 'Start Battle'}
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>
            <UnifiedBattleLog
              battleLog={battleState.battleLog}
              aiLog={battleState.aiLog}
              participants={battleState.participants}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            {battleState.isFinished && (
              <button
                onClick={handleReset}
                style={{ padding: '8px 16px', fontSize: 16 }}
              >
                Start New Battle
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export { App }; 
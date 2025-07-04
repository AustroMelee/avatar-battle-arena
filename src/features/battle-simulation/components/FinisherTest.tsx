import React, { useState } from 'react';
import { simulateBattle } from '../services/battleSimulator.service';
import { availableCharacters } from '../../character-selection/data/characterData';
import { availableLocations } from '../../location-selection/data/locationData';

export const FinisherTest: React.FC = () => {
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runFinisherTest = async () => {
    setIsRunning(true);
    setBattleLog([]);
    
    try {
      // Force Aang to low HP by modifying the character data
      const aang = { ...availableCharacters[0] };
      const azula = { ...availableCharacters[1] };
      const location = availableLocations[0];
      
      // Create a custom battle state where Aang starts at low HP
      const customAang = {
        ...aang,
        currentHealth: 15, // Force below 20% to trigger finisher
        currentDefense: aang.stats.defense,
        cooldowns: {},
        usesLeft: {},
        moveHistory: [],
        resources: { chi: 10 },
        activeBuffs: [],
        activeDebuffs: [],
        flags: {
          usedFinisher: false,
          usedDesperation: false
        },
        diminishingEffects: {}
      };
      
      const customAzula = {
        ...azula,
        currentHealth: 100,
        currentDefense: azula.stats.defense,
        cooldowns: {},
        usesLeft: {},
        moveHistory: [],
        resources: { chi: 10 },
        activeBuffs: [],
        activeDebuffs: [],
        flags: {
          usedFinisher: false,
          usedDesperation: false
        },
        diminishingEffects: {}
      };
      
      console.log('Starting finisher test with Aang at 15 HP...');
      
      const result = await simulateBattle({
        player1: customAang,
        player2: customAzula,
        location
      });
      
      console.log('Battle completed!');
      console.log('Battle log entries:', result.battleLog.length);
      
      // Filter for finisher and desperation entries
      const dramaticEntries = result.battleLog.filter(entry => 
        entry.meta?.isFinisher || 
        entry.meta?.isDesperation || 
        entry.meta?.crit ||
        entry.type === 'FINISHER'
      );
      
      console.log('Dramatic entries found:', dramaticEntries.length);
      dramaticEntries.forEach(entry => {
        console.log(`Turn ${entry.turn}: ${entry.actor} - ${entry.action} - ${entry.result}`);
        if (entry.meta?.isFinisher) console.log('  -> FINISHER MOVE!');
        if (entry.meta?.isDesperation) console.log('  -> DESPERATION MOVE!');
        if (entry.meta?.crit) console.log('  -> CRITICAL HIT!');
      });
      
      setBattleLog(result.battleLog.map(entry => entry.result));
      
    } catch (error) {
      console.error('Test failed:', error);
      setBattleLog(['Test failed: ' + error]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '2px solid #ff6b6b', borderRadius: '8px', margin: '20px' }}>
      <h2 style={{ color: '#ff6b6b' }}>🎯 Finisher & Desperation Test</h2>
      <p>This test forces Aang to start at 15 HP to trigger finisher and desperation mechanics.</p>
      
      <button 
        onClick={runFinisherTest}
        disabled={isRunning}
        style={{
          padding: '10px 20px',
          backgroundColor: '#ff6b6b',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isRunning ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {isRunning ? 'Running Test...' : 'Run Finisher Test'}
      </button>
      
      {battleLog.length > 0 && (
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '4px',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          <h3>Battle Log:</h3>
          {battleLog.map((entry, index) => (
            <div key={index} style={{ 
              marginBottom: '5px',
              padding: '5px',
              backgroundColor: entry.includes('FINISHER') ? '#ffeb3b' :
                              entry.includes('DESPERATION') ? '#ff9800' :
                              entry.includes('CRITICAL') ? '#e91e63' : 'transparent',
              borderRadius: '3px'
            }}>
              {entry}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 
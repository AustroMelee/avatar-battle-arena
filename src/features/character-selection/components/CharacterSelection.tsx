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

export type CharacterSelectionProps = {
  title: string;
  selectedCharacter: Character | null;
  onSelectCharacter: (character: Character | null) => void;
  opponent: Character | null;
  playerColor: string;
};

export function CharacterSelection({
  title,
  selectedCharacter,
  onSelectCharacter,
  opponent,
  playerColor,
}: CharacterSelectionProps) {
  return (
    <div style={{ margin: '8px 0' }}>
      <div style={{ fontWeight: 'bold', marginBottom: 4, color: playerColor }}>{title}</div>
      {selectedCharacter ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{selectedCharacter.name}</span>
          <button type="button" onClick={() => onSelectCharacter(null)}>
            Change
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {availableCharacters.map((char) => (
            <button
              key={char.id}
              type="button"
              onClick={() => onSelectCharacter(char)}
              disabled={opponent?.id === char.id}
              style={{ textAlign: 'left', padding: '4px 8px' }}
            >
              {char.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 
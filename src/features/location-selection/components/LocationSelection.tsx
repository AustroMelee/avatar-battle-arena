// CONTEXT: LocationSelection, // FOCUS: UIRendering
import { Location } from '@/common/types';
import { availableLocations } from '../data/locationData';

export type LocationSelectionProps = {
  selectedLocation: Location | null;
  onSelectLocation: (location: Location | null) => void;
};

export function LocationSelection({
  selectedLocation,
  onSelectLocation,
}: LocationSelectionProps) {
  return (
    <div style={{ margin: '8px 0' }}>
      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Select Location</div>
      {selectedLocation ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{selectedLocation.name}</span>
          <button type="button" onClick={() => onSelectLocation(null)}>
            Change
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {availableLocations.map((loc) => (
            <button
              key={loc.id}
              type="button"
              onClick={() => onSelectLocation(loc)}
              style={{ textAlign: 'left', padding: '4px 8px' }}
            >
              {loc.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 
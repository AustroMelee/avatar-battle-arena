// CONTEXT: LocationSelection, // FOCUS: UIRendering
import { Location } from '@/common/types';
import { availableLocations } from '../data/locationData';
import styles from './LocationSelection.module.css';

/**
 * @description Props for the LocationSelection component.
 */
export type LocationSelectionProps = {
  selectedLocation: Location | null;
  onSelectLocation: (location: Location) => void;
};

/**
 * @description Renders the UI for selecting a battle location.
 * @returns {JSX.Element} The location selection module.
 */
export function LocationSelection({
  selectedLocation,
  onSelectLocation,
}: LocationSelectionProps) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Select Location</h2>
      <div className={styles.locationGrid}>
        {availableLocations.map((loc) => {
          const isSelected = selectedLocation?.id === loc.id;
          const cardClasses = `${styles.locationCard} ${
            isSelected ? styles.selected : ''
          }`;

          return (
            <div
              key={loc.id}
              className={cardClasses}
              onClick={() => onSelectLocation(loc)}
            >
              <img src={loc.image} alt={loc.name} className={styles.image} />
              <h3 className={styles.locationName}>{loc.name}</h3>
            </div>
          );
        })}
      </div>
    </div>
  );
} 
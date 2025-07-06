// CONTEXT: LocationSelection, // FOCUS: StaticData
import { Location } from '@/common/types';

/**
 * @description A static list of available locations for the simulation.
 * @type {Location[]}
 */
export const availableLocations: Location[] = [
  {
    id: 'fire-nation-capital',
    name: 'Fire Nation Capital',
    image: '/assets/caldera.jpg',
    collateralTolerance: 1, // The pristine Royal Plaza - very low tolerance for damage
    toleranceNarrative: "The pristine Royal Plaza. Widespread destruction here would be a sign of great disrespect and instability.",
  },
]; 
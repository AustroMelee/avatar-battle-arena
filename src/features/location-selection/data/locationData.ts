// @docs
// @description: SINGLE SOURCE OF TRUTH for all location data in Avatar Battle Arena. Registry/data-driven, plug-and-play architecture. No hard-coded logic. Extensible via data only. SRP-compliant. See SYSTEM ARCHITECTURE.MD for integration points.
// @criticality: 🗂️ Data
// @owner: AustroMelee
// @tags: locations, data, registry, plug-and-play, extensibility, SRP
//
// All locations must be added here and reference assets in /public/assets/. No engine changes required for new locations.
//
// Updated for 2025 registry-driven architecture overhaul.
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
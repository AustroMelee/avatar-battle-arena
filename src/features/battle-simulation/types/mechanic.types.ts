/**
 * Describes the result of a reversal mechanic event.
 */
export interface ReversalResult {
  effect: 'Reversal';
  narrative: string;
  controlShift: number;
  stabilityGain: number;
  specialMove?: string;
  targetDebuff?: string;
  source: string; // e.g., "Low Stability in Home Territory"
} 
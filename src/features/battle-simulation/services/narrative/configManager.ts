// CONTEXT: Narrative System, // FOCUS: Configuration Management
import type { NarrativeSystemConfig } from './types';
import { characterNarratives } from './characterHooks';
import { narratorHooks } from './narratorHooks';

/**
 * @description Default narrative system configuration
 */
const DEFAULT_CONFIG: NarrativeSystemConfig = {
  characterHooks: characterNarratives,
  narratorHooks,
  globalHooks: [],
  enabled: true,
  maxHooksPerTurn: 3,
  priorityThreshold: 3,
  useTemplateSystem: true // Enable new template system
};

/**
 * @description Creates a narrative system configuration with optional overrides
 * @param overrides - Configuration overrides
 * @returns Complete configuration object
 */
export function createNarrativeConfig(
  overrides: Partial<NarrativeSystemConfig> = {}
): NarrativeSystemConfig {
  return {
    ...DEFAULT_CONFIG,
    ...overrides
  };
}

/**
 * @description Gets the default configuration
 * @returns Default configuration object
 */
export function getDefaultConfig(): NarrativeSystemConfig {
  return { ...DEFAULT_CONFIG };
} 
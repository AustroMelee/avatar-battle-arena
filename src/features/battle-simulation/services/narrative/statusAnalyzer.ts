// Used via dynamic registry in Narrative system. See SYSTEM ARCHITECTURE.MD for flow.
// CONTEXT: Narrative System, // FOCUS: Status Analysis
/**
 * @description Gets health status description for narrative context
 * @param healthPercent - Health as percentage (0-1)
 * @returns Health status description
 */
export function getHealthStatus(healthPercent: number): string {
  if (healthPercent <= 0.1) return 'critical';
  if (healthPercent <= 0.3) return 'low';
  if (healthPercent <= 0.6) return 'moderate';
  return 'healthy';
}

/**
 * @description Gets chi status description for narrative context
 * @param chiPercent - Chi as percentage (0-1)
 * @returns Chi status description
 */
export function getChiStatus(chiPercent: number): string {
  if (chiPercent <= 0.2) return 'exhausted';
  if (chiPercent <= 0.5) return 'low';
  if (chiPercent <= 0.8) return 'moderate';
  return 'strong';
} 
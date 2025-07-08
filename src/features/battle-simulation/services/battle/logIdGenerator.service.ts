// Used via dynamic registry in battle engine. See SYSTEM ARCHITECTURE.MD for flow.
/**
 * Generates a globally unique log ID for battle log entries.
 * Ensures monotonic, collision-free keys for React list rendering.
 * @param prefix Optional string to prefix the log ID (e.g., 'tactical', 'mechanic').
 * @returns A globally unique log ID string.
 */
let logCounter = 0;

export function generateUniqueLogId(prefix: string = "tactical"): string {
  logCounter += 1;
  // Use timestamp, counter, and a random string for extra safety
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${timestamp}-${logCounter}-${random}`;
} 
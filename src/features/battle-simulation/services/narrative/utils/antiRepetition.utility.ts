/**
 * @fileoverview A utility service to prevent the same narrative line from being used back-to-back.
 * @description This ensures variety in the storytelling by tracking the last used line for each context.
 */

export class AntiRepetitionUtility {
  // A map to store the last used lines (queue) for a given key (e.g., "Aang-Lightning-hit").
  private recentLines: Map<string, string[]> = new Map();
  private readonly QUEUE_SIZE = 3;

  /**
   * Selects a "fresh" line from a given pool, ensuring it's not in the recent queue for this context.
   * @param key - A unique identifier for the narrative context (e.g., `${characterName}-${mechanic}-${context}`).
   * @param linePool - The array of available narrative lines.
   * @returns A line from the pool that was not recently used for this key.
   */
  public getFreshLine(key: string, linePool: string[]): string | null {
    if (!linePool || linePool.length === 0) {
      return null;
    }

    const recent = this.recentLines.get(key) || [];
    let availableLines = linePool.filter(line => !recent.includes(line));

    // If all lines have been used recently, allow all lines (reset cycle)
    if (availableLines.length === 0) {
      availableLines = linePool;
    }

    // Select a random line from the available options.
    const chosenLine = availableLines[Math.floor(Math.random() * availableLines.length)];

    // Update the recent queue for this key
    const updatedQueue = [...recent, chosenLine];
    if (updatedQueue.length > this.QUEUE_SIZE) {
      updatedQueue.shift(); // Remove oldest
    }
    this.recentLines.set(key, updatedQueue);

    return chosenLine;
  }

  /**
   * Resets the entire history of used lines. Should be called at the start of a new battle.
   */
  public reset(): void {
    this.recentLines.clear();
  }
}

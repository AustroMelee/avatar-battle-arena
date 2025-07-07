/**
 * @fileoverview A utility service to prevent the same narrative line from being used back-to-back.
 * @description This ensures variety in the storytelling by tracking the last used line for each context.
 */

export class AntiRepetitionUtility {
  // A map to store the last used line for a given key (e.g., "Aang-Lightning-hit").
  private lastUsedLines: Map<string, string> = new Map();

  /**
   * Selects a "fresh" line from a given pool, ensuring it's not the same as the last one used for this context.
   * @param key - A unique identifier for the narrative context (e.g., `${characterName}-${mechanic}-${context}`).
   * @param linePool - The array of available narrative lines.
   * @returns A line from the pool that was not the last one returned for this key.
   */
  public getFreshLine(key: string, linePool: string[]): string | null {
    if (!linePool || linePool.length === 0) {
      return null;
    }

    const lastLine = this.lastUsedLines.get(key);
    let availableLines = linePool;

    // If a last line was recorded and there's more than one option, filter it out.
    if (lastLine && linePool.length > 1) {
      availableLines = linePool.filter(line => line !== lastLine);
    }

    // Select a random line from the available options.
    const chosenLine = availableLines[Math.floor(Math.random() * availableLines.length)];

    // Record the chosen line as the last used for this context.
    this.lastUsedLines.set(key, chosenLine);

    return chosenLine;
  }

  /**
   * Resets the entire history of used lines. Should be called at the start of a new battle.
   */
  public reset(): void {
    this.lastUsedLines.clear();
  }
}

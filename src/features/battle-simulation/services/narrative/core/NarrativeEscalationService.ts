// CONTEXT: Narrative Escalation Service
// RESPONSIBILITY: Manage escalation lines with anti-repetition logic

/**
 * @description Manages escalation lines with anti-repetition tracking
 */
export class NarrativeEscalationService {
  private escalationUsed: Set<string> = new Set();
  private lastUsedTurn: number = 0;
  private resetThreshold: number = 5; // Reset pool after 5 turns

  private escalationPool = [
    "The conflict erupts, each blow heavier than the last.",
    "The throne room shakes as the benders push past their limits.",
    "A primal storm of air and fire engulfs the battlefield.",
    "Neither combatant yields—this is their defining moment.",
    "The ancient stones themselves seem to tremble.",
    "The throne room becomes a maelstrom of elemental fury!",
    "Air and fire clash with renewed ferocity!",
    "The very air crackles with barely contained power.",
    "The battle escalates with renewed intensity!",
    "The intensity becomes almost unbearable!",
    "The battle takes on a new level of urgency!",
    "The conflict escalates with overwhelming force!",
    "Suddenly, everything hangs in the balance.",
    "A wave of fury crashes through the throne room.",
    "The battle reaches a fever pitch!",
    "The conflict takes on a desperate edge!",
    "The air itself seems to burn with their fury!",
    "The battle reaches new heights of fury!",
    "The conflict escalates to new levels of intensity!",
    "The battle takes on a new level of desperation!",
    "The conflict escalates with overwhelming ferocity!",
    "The battle reaches new heights of desperation!",
    "The intensity reaches new heights!",
    "The conflict escalates to a new level!",
    "The battle reaches a critical moment!",
    "The pressure is mounting—something has to give!",
    "The tension reaches a breaking point!",
    "The battle reaches a critical moment!",
    "The intensity reaches new heights!",
    "The conflict escalates to a new level!"
  ];

  /**
   * @description Get an escalation line with anti-repetition logic
   */
  getEscalationLine(currentTurn: number): string {
    // Reset pool if enough turns have passed
    if (currentTurn - this.lastUsedTurn >= this.resetThreshold) {
      this.escalationUsed.clear();
    }

    // Filter out recently used lines
    const unused = this.escalationPool.filter(line => !this.escalationUsed.has(line));
    
    // If all lines have been used, clear the set and use any line
    const availableLines = unused.length > 0 ? unused : this.escalationPool;
    
    // Select random line
    const choice = availableLines[Math.floor(Math.random() * availableLines.length)];
    
    // Track usage
    this.escalationUsed.add(choice);
    this.lastUsedTurn = currentTurn;
    
    return choice;
  }

  /**
   * @description Reset the escalation tracking
   */
  reset(): void {
    this.escalationUsed.clear();
    this.lastUsedTurn = 0;
  }

  /**
   * @description Get escalation line count for debugging
   */
  getPoolSize(): number {
    return this.escalationPool.length;
  }

  /**
   * @description Get used line count for debugging
   */
  getUsedCount(): number {
    return this.escalationUsed.size;
  }
} 
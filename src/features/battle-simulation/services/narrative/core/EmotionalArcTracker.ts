// EmotionalArcTracker.ts
// Handles all emotional state, phase progression, and character arc logic for narrative system

export class EmotionalArcTracker {
  private characterArcs: Map<string, {
    currentPhase: string;
    lastPhaseChange: number;
    emotionalProgression: number;
    hasSnapped: boolean;
  }> = new Map();
  private turnNumber: number = 0;

  setTurn(turn: number) {
    this.turnNumber = turn;
  }

  reset() {
    this.characterArcs.clear();
    this.turnNumber = 0;
  }

  initializeCharacter(characterName: string) {
    this.characterArcs.set(characterName, {
      currentPhase: 'confident',
      lastPhaseChange: 0,
      emotionalProgression: 0,
      hasSnapped: false
    });
  }

  updateArc(characterName: string, event: string, healthPercentage: number) {
    const arc = this.characterArcs.get(characterName);
    if (!arc) return;
    const oldPhase = arc.currentPhase;
    // Update emotional progression based on events
    if (event === 'miss') {
      arc.emotionalProgression -= 1;
    } else if (event === 'hit') {
      arc.emotionalProgression += 1;
    } else if (event === 'high_damage_taken') {
      arc.emotionalProgression -= 2;
    } else if (event === 'critical') {
      arc.emotionalProgression -= 1;
    }
    // Determine new phase based on health and emotional state
    if (healthPercentage <= 15) {
      arc.currentPhase = 'desperate';
    } else if (healthPercentage <= 30) {
      arc.currentPhase = 'pressed';
    } else if (arc.emotionalProgression <= -3) {
      arc.currentPhase = 'frustrated';
    } else if (arc.emotionalProgression >= 3) {
      arc.currentPhase = 'confident';
    } else {
      arc.currentPhase = 'focused';
    }
    // Special handling for character-specific arcs
    if (characterName.toLowerCase().includes('azula') && healthPercentage <= 20 && !arc.hasSnapped) {
      arc.currentPhase = 'snapping';
      arc.hasSnapped = true;
    }
    if (characterName.toLowerCase().includes('aang') && healthPercentage <= 25) {
      arc.currentPhase = 'determined';
    }
    // Record phase change
    if (oldPhase !== arc.currentPhase) {
      arc.lastPhaseChange = this.turnNumber;
    }
  }

  getCurrentPhase(characterName: string): string {
    const arc = this.characterArcs.get(characterName);
    return arc ? arc.currentPhase : 'confident';
  }

  hasSnapped(characterName: string): boolean {
    const arc = this.characterArcs.get(characterName);
    return arc ? arc.hasSnapped : false;
  }

  getArc(characterName: string) {
    return this.characterArcs.get(characterName) || null;
  }
} 
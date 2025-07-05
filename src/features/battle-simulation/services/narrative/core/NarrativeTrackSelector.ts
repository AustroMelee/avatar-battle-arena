export class NarrativeTrackSelector {
  static choose(context: { turnNumber: number, health: number, maxHealth: number, isCritical: boolean, isPatternBreak: boolean }): 'technical' | 'emotional' | 'environmental' {
    const { turnNumber, health, maxHealth, isCritical, isPatternBreak } = context;
    const healthPercentage = (health / maxHealth) * 100;
    if (turnNumber <= 3) return 'technical';
    if (healthPercentage <= 25) return 'emotional';
    if (isCritical) return 'emotional';
    if (isPatternBreak) return 'environmental';
    const tracks: Array<'technical' | 'emotional' | 'environmental'> = ['technical', 'emotional', 'environmental'];
    return tracks[turnNumber % tracks.length];
  }
} 
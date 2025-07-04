// CONTEXT: Narrative System, // FOCUS: State Announcement Management

/**
 * @description Tracks state announcements to prevent repetition
 */
export type StateAnnouncementTracker = {
  breakingPointAnnounced: boolean;
  escalationAnnounced: boolean;
  desperationAnnounced: boolean;
  climaxAnnounced: boolean;
  lastEscalationTurn: number;
  lastDesperationTurn: number;
  escalationCount: number;
  desperationCount: number;
};

/**
 * @description Manages state announcements with throttling and variety
 */
export class StateAnnouncementManager {
  private tracker: StateAnnouncementTracker;
  private currentTurn: number = 0;

  constructor() {
    this.tracker = {
      breakingPointAnnounced: false,
      escalationAnnounced: false,
      desperationAnnounced: false,
      climaxAnnounced: false,
      lastEscalationTurn: 0,
      lastDesperationTurn: 0,
      escalationCount: 0,
      desperationCount: 0
    };
  }

  /**
   * @description Updates the current turn
   */
  updateTurn(turnNumber: number): void {
    this.currentTurn = turnNumber;
  }

  /**
   * @description Checks if breaking point should be announced
   */
  shouldAnnounceBreakingPoint(): boolean {
    return !this.tracker.breakingPointAnnounced;
  }

  /**
   * @description Checks if escalation should be announced
   */
  shouldAnnounceEscalation(): boolean {
    // Only announce escalation if it's been at least 3 turns since last announcement
    return this.currentTurn - this.tracker.lastEscalationTurn >= 3;
  }

  /**
   * @description Checks if desperation should be announced
   */
  shouldAnnounceDesperation(): boolean {
    // Only announce desperation if it's been at least 2 turns since last announcement
    return this.currentTurn - this.tracker.lastDesperationTurn >= 2;
  }

  /**
   * @description Records a breaking point announcement
   */
  recordBreakingPoint(): void {
    this.tracker.breakingPointAnnounced = true;
  }

  /**
   * @description Records an escalation announcement
   */
  recordEscalation(): void {
    this.tracker.escalationAnnounced = true;
    this.tracker.lastEscalationTurn = this.currentTurn;
    this.tracker.escalationCount++;
  }

  /**
   * @description Records a desperation announcement
   */
  recordDesperation(): void {
    this.tracker.desperationAnnounced = true;
    this.tracker.lastDesperationTurn = this.currentTurn;
    this.tracker.desperationCount++;
  }

  /**
   * @description Gets escalation count for variety selection
   */
  getEscalationCount(): number {
    return this.tracker.escalationCount;
  }

  /**
   * @description Gets desperation count for variety selection
   */
  getDesperationCount(): number {
    return this.tracker.desperationCount;
  }

  /**
   * @description Resets the tracker for a new battle
   */
  reset(): void {
    this.tracker = {
      breakingPointAnnounced: false,
      escalationAnnounced: false,
      desperationAnnounced: false,
      climaxAnnounced: false,
      lastEscalationTurn: 0,
      lastDesperationTurn: 0,
      escalationCount: 0,
      desperationCount: 0
    };
    this.currentTurn = 0;
  }

  /**
   * @description Gets the current state for debugging
   */
  getState(): StateAnnouncementTracker {
    return { ...this.tracker };
  }
} 
// Identity-Driven Tactical Behavior (IDTB) System
// This module provides character personality and mental state management

// Core services
export { initializeMentalState, updateMentalState, resetMentalState } from './mentalState.service';
export { adjustScoresByIdentity, getMentalStateNarrative } from './tacticalPersonality.engine';

// Narrative hooks
export { 
  generateMentalStateMoveDescription, 
  generateBattleStateNarrative, 
  generateMoveOutcomeNarrative 
} from './narrativeHooks.service';

// Data and types
export { IDENTITY_PROFILES, DEFAULT_OPPONENT_PERCEPTION } from '../../data/identities';
export type { 
  IdentityProfile, 
  MentalState, 
  OpponentPerception, 
  IdentityScoreAdjustment, 
  ScoreAdjustments 
} from '../../types/identity.types'; 
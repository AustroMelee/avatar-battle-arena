// Used via dynamic registry in BattleEngine. See SYSTEM ARCHITECTURE.MD for flow.
// CONTEXT: Battle Phases Index
// RESPONSIBILITY: Export all battle phase services

export { validateBattleEndPhase } from './endPhase.service';
export { processDesperationPhase } from './desperationPhase.service';
export { finisherPhase } from './finisherPhase.service';
export { escalationPhase } from './escalationPhase.service';
export { tacticalMovePhase } from './tacticalPhase.service';
export { endOfTurnEffectsPhase } from './effectsPhase.service'; 
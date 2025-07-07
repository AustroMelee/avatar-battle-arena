import { BehavioralTrait, TraitTriggerContext, TraitEffectResult } from '../../battle-simulation/types/behavioral.types';
// import { createMechanicLogEntry } from '../../battle-simulation/services/utils/mechanicLogUtils';

export const manipulationTrait: BehavioralTrait = {
  id: "manipulation",
  name: "Psychological Manipulation",
  description: "Attempts to influence an opponent, lowering their defenses or causing tactical errors.",
  cooldown: 4,
  isActive: ({ opponent, state }: TraitTriggerContext): boolean => {
    const isOpponentVulnerable = opponent.currentHealth < 80 && opponent.mentalState.stability < 90;
    const hasNotBeenManipulated = !opponent.activeFlags.has('isManipulated');
    const isNotTooEarly = state.turn > 3; // Don't manipulate too early in the fight
    return isOpponentVulnerable && hasNotBeenManipulated && isNotTooEarly;
  },
  onTrigger: ({ self, opponent, state: _state }: TraitTriggerContext): TraitEffectResult => {
    const successChance = Math.max(10, 90 - opponent.manipulationResilience);
    const isSuccess = Math.random() * 100 < successChance;
    if (isSuccess) {
      return {
        log: `${self.name} finds a crack in ${opponent.name}'s resolve, planting a seed of doubt! Their defense falters!`,
        effects: [{
          type: 'apply_flag', 
          target: 'opponent', 
          flag: 'isManipulated', 
          duration: 2,
          uiIcon: '🧠', 
          uiTooltip: 'Manipulated: More likely to make mistakes and less effective at defense.'
        }],
      };
    }
    return { 
      log: `${opponent.name} sees through ${self.name}'s attempt at manipulation, their resolve unshaken.`, 
      effects: [] 
    };
  },
};

export const overconfidenceTrait: BehavioralTrait = {
  id: "overconfidence",
  name: "Overconfidence",
  description: "If Azula is winning decisively, she may toy with her opponent, missing finishing blows or leaving herself open.",
  cooldown: 99, // Essentially once per battle unless reset
  isActive: ({ self, opponent }: TraitTriggerContext): boolean => {
    const isWinningDecisively = self.currentHealth > opponent.currentHealth + 40;
    const hasNotBeenOverconfident = !self.activeFlags.has('overconfidenceActive');
    const isNotTooEarly = self.currentHealth > 60; // Only when she's healthy
    return isWinningDecisively && hasNotBeenOverconfident && isNotTooEarly;
  },
  onTrigger: ({ self, opponent, state: _state }: TraitTriggerContext): TraitEffectResult => {
    return {
      log: `${self.name}'s arrogance shows. She taunts ${opponent.name} instead of finishing the fight, giving them an opening!`,
      effects: [{
        type: 'apply_flag', 
        target: 'self', 
        flag: 'overconfidenceActive', 
        duration: 1,
        uiIcon: '👑', 
        uiTooltip: 'Overconfident: Will not use finisher moves and may make tactical errors.'
      }],
    };
  }
};

export const pleaForPeaceTrait: BehavioralTrait = {
  id: "plea_for_peace",
  name: "Plea for Peace",
  description: "Aang attempts to persuade the opponent to stop fighting, leaving himself exposed.",
  cooldown: 99, // Once per battle
  isActive: ({ self }: TraitTriggerContext): boolean => {
    const isInDanger = self.currentHealth < 50;
    const hasNotPleaded = !self.activeFlags.has('hasPleadedThisBattle');
    const isNotTooEarly = self.currentHealth < 40; // Only when truly desperate
    return isInDanger && hasNotPleaded && isNotTooEarly;
  },
  onTrigger: ({ self, state: _state }: TraitTriggerContext): TraitEffectResult => {
    return {
      log: `${self.name} lowers his staff. "We don't have to fight!" he calls out, leaving himself completely vulnerable.`,
      effects: [
        { 
          type: 'apply_flag', 
          target: 'self', 
          flag: 'isExposed', 
          duration: 1, 
          uiIcon: '💔', 
          uiTooltip: 'Exposed: Takes 50% more damage from the next hit.' 
        },
        { 
          type: 'apply_flag', 
          target: 'self', 
          flag: 'hasPleadedThisBattle', 
          duration: 99,
          uiIcon: '🔚',
          uiTooltip: 'Has pleaded for peace this battle.'
        },
      ],
    };
  }
};

export const ALL_BEHAVIORAL_TRAITS: Record<BehavioralTrait['id'], BehavioralTrait> = {
  manipulation: manipulationTrait,
  overconfidence: overconfidenceTrait,
  plea_for_peace: pleaForPeaceTrait,
}; 
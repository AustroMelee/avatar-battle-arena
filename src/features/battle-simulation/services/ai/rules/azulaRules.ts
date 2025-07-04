import type { AIRule } from '../types/AIBehavior';
import {
  isLowHP, isCriticalHP, isEnemyCriticalHP,
  isEnemyHeavilyDefended,
  isLowChi,
  hasMoveAvailable, hasPiercingMove, hasDesperateMove,
  didEnemyJustShield,
  getMoveByName, getMoveWithTag, getHighestDamageMove, getLowestCostMove
} from '../helpers/conditionHelpers';

/**
 * @description Azula's AI behavior rules - aggressive, tactical, and ruthless
 */
export const azulaAIRules: AIRule[] = [
  // CRITICAL: Defend when health is dangerously low
  {
    name: "Critical Defense",
    priority: 20,
    description: "Defend when critically wounded",
    when: (_state, self) => isCriticalHP(self) && hasMoveAvailable(self, 'Fire Jets'),
    then: (_state, self) => getMoveByName(self, 'Fire Jets')
  },

  // FINISH: Use Lightning when enemy is vulnerable
  {
    name: "Lightning Finish",
    priority: 18,
    description: "Use Lightning to finish vulnerable enemy",
    when: (_state, self, opp) => isEnemyCriticalHP(opp) && hasMoveAvailable(self, 'Lightning'),
    then: (_state, self) => getMoveByName(self, 'Lightning')
  },

  // PIERCE: Use piercing moves against high defense
  {
    name: "Pierce Defense",
    priority: 16,
    description: "Use piercing moves against defended enemy",
    when: (_state, self, opp) => isEnemyHeavilyDefended(opp) && hasPiercingMove(self),
    then: (_state, self) => getMoveWithTag(self, 'piercing')
  },

  // COUNTER: Use piercing after enemy shields
  {
    name: "Counter Shield",
    priority: 15,
    description: "Counter enemy shield with piercing attack",
    when: (_state, self, opp) => didEnemyJustShield(opp) && hasPiercingMove(self),
    then: (_state, self) => getMoveWithTag(self, 'piercing')
  },

  // HEAL: Use Phoenix Recovery when wounded
  {
    name: "Emergency Recovery",
    priority: 14,
    description: "Use healing when wounded",
    when: (_state, self) => isLowHP(self) && hasMoveAvailable(self, 'Phoenix Recovery'),
    then: (_state, self) => getMoveByName(self, 'Phoenix Recovery')
  },

  // DESPERATE: Use desperate moves when health is low
  {
    name: "Desperate Attack",
    priority: 12,
    description: "Use desperate moves when health is low",
    when: (_state, self) => isLowHP(self) && hasDesperateMove(self),
    then: (_state, self) => getMoveWithTag(self, 'desperate')
  },

  // LIGHTNING: Use Lightning when safe and available
  {
    name: "Lightning Strike",
    priority: 10,
    description: "Use Lightning when enemy is not heavily defended",
    when: (_state, self, opp) => hasMoveAvailable(self, 'Lightning') && !isEnemyHeavilyDefended(opp),
    then: (_state, self) => getMoveByName(self, 'Lightning')
  },

  // FIREBOMB: Use Firebomb for high damage
  {
    name: "Firebomb Assault",
    priority: 8,
    description: "Use Firebomb for high damage",
    when: (_state, self) => hasMoveAvailable(self, 'Firebomb'),
    then: (_state, self) => getMoveByName(self, 'Firebomb')
  },

  // CHI CONSERVATION: Use low-cost moves when chi is low
  {
    name: "Chi Conservation",
    priority: 6,
    description: "Use low-cost moves when chi is low",
    when: (_state, self) => isLowChi(self) && getLowestCostMove(self) !== null,
    then: (_state, self) => getLowestCostMove(self)
  },

  // DEFENSE: Use Fire Jets for defense
  {
    name: "Defensive Stance",
    priority: 4,
    description: "Use Fire Jets for defense",
    when: (_state, self) => hasMoveAvailable(self, 'Fire Jets'),
    then: (_state, self) => getMoveByName(self, 'Fire Jets')
  },

  // DEFAULT: Use Blue Fire as fallback
  {
    name: "Blue Fire Attack",
    priority: 0,
    description: "Default attack with Blue Fire",
    when: (_state, self) => hasMoveAvailable(self, 'Blue Fire'),
    then: (_state, self) => getMoveByName(self, 'Blue Fire')
  },

  // FALLBACK: Use any available move
  {
    name: "Fallback Move",
    priority: -1,
    description: "Use any available move as last resort",
    when: () => true,
    then: (_state, self) => getHighestDamageMove(self) || getLowestCostMove(self)
  }
]; 
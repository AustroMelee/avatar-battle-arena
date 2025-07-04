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
 * @description Aang's AI behavior rules - defensive, evasive, and strategic
 */
export const aangAIRules: AIRule[] = [
  // CRITICAL: Defend when health is dangerously low
  {
    name: "Critical Defense",
    priority: 20,
    description: "Defend when critically wounded",
    when: (_state, self) => isCriticalHP(self) && hasMoveAvailable(self, 'Last Stand'),
    then: (_state, self) => getMoveByName(self, 'Last Stand')
  },

  // FINISH: Use Wind Slice when enemy is vulnerable
  {
    name: "Wind Slice Finish",
    priority: 18,
    description: "Use Wind Slice to finish vulnerable enemy",
    when: (_state, self, opp) => isEnemyCriticalHP(opp) && hasMoveAvailable(self, 'Wind Slice'),
    then: (_state, self) => getMoveByName(self, 'Wind Slice')
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

  // HEAL: Use healing when wounded
  {
    name: "Emergency Recovery",
    priority: 14,
    description: "Use healing when wounded",
    when: (_state, self) => isLowHP(self) && hasMoveAvailable(self, 'Last Stand'),
    then: (_state, self) => getMoveByName(self, 'Last Stand')
  },

  // DESPERATE: Use desperate moves when health is low
  {
    name: "Desperate Defense",
    priority: 12,
    description: "Use desperate moves when health is low",
    when: (_state, self) => isLowHP(self) && hasDesperateMove(self),
    then: (_state, self) => getMoveWithTag(self, 'desperate')
  },

  // WIND SLICE: Use Wind Slice when safe and available
  {
    name: "Wind Slice Strike",
    priority: 10,
    description: "Use Wind Slice when enemy is not heavily defended",
    when: (_state, self, opp) => hasMoveAvailable(self, 'Wind Slice') && !isEnemyHeavilyDefended(opp),
    then: (_state, self) => getMoveByName(self, 'Wind Slice')
  },

  // AIR BLAST: Use Air Blast for high damage
  {
    name: "Air Blast Assault",
    priority: 8,
    description: "Use Air Blast for high damage",
    when: (_state, self) => hasMoveAvailable(self, 'Air Blast'),
    then: (_state, self) => getMoveByName(self, 'Air Blast')
  },

  // CHI CONSERVATION: Use low-cost moves when chi is low
  {
    name: "Chi Conservation",
    priority: 6,
    description: "Use low-cost moves when chi is low",
    when: (_state, self) => isLowChi(self) && getLowestCostMove(self) !== null,
    then: (_state, self) => getLowestCostMove(self)
  },

  // DEFENSE: Use Air Shield for defense
  {
    name: "Defensive Stance",
    priority: 4,
    description: "Use Air Shield for defense",
    when: (_state, self) => hasMoveAvailable(self, 'Air Shield'),
    then: (_state, self) => getMoveByName(self, 'Air Shield')
  },

  // DEFAULT: Use Wind Gust as fallback
  {
    name: "Wind Gust Attack",
    priority: 0,
    description: "Default attack with Wind Gust",
    when: (_state, self) => hasMoveAvailable(self, 'Wind Gust'),
    then: (_state, self) => getMoveByName(self, 'Wind Gust')
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
// Used via dynamic registry in AI engine. See SYSTEM ARCHITECTURE.MD for flow.
import type { BattleState, BattleCharacter } from '../../types';
import type { AIRule, AIDecision } from './types/AIBehavior';
import type { Move } from '../../types/move.types';
import type { Location } from '@/common/types';
import { azulaAIRules } from './rules/azulaRules';
import { aangAIRules } from './rules/aangRules';
import { getAvailableMovesSimple, getHighestDamageMove, getLowestCostMove } from './helpers/conditionHelpers';
import { selectWeightedMove } from './weightedChoice';
import { getAzulaWeightedMoves } from './weightFunctions/azulaWeights';
import { getAangWeightedMoves } from './weightFunctions/aangWeights';
import { AIRuleRegistry } from './rules/aiRuleRegistry.service'; // MODIFIED: Import the registry

/**
 * @description Gets the appropriate rule set for a character
 * @param character - The character to get rules for
 * @returns The character's AI rule set
 */
function getCharacterRules(character: BattleCharacter): AIRule[] {
  switch (character.name.toLowerCase()) {
    case 'azula':
      return azulaAIRules;
    case 'aang':
      return aangAIRules;
    default:
      // Fallback to Azula rules for unknown characters
      return azulaAIRules;
  }
}

/**
 * @description Gets the appropriate weighted moves for a character
 * @param character - The character to get weighted moves for
 * @returns The character's weighted moves
 */
function getCharacterWeightedMoves(character: BattleCharacter) {
  switch (character.name.toLowerCase()) {
    case 'azula':
      return getAzulaWeightedMoves(character);
    case 'aang':
      return getAangWeightedMoves(character);
    default:
      // Fallback to Azula weighted moves for unknown characters
      return getAzulaWeightedMoves(character);
  }
}

/**
 * @description Legacy tactical move selection as fallback
 * @param self - The AI character
 * @param state - The battle state
 * @returns A fallback move
 */
function legacyTacticalMove(self: BattleCharacter, location?: Location): Move | null {
  const availableMoves = getAvailableMovesSimple(self, location);
  if (availableMoves.length === 0) return null;
  
  // Simple fallback: prefer high damage moves
  return getHighestDamageMove(self) || getLowestCostMove(self) || availableMoves[0];
}

/**
 * @description Main behavior tree decision engine
 * @param state - The current battle state
 * @param self - The AI character making the decision
 * @param opp - The opponent character
 * @returns The AI decision with debug information
 */
export function decideMove(
  state: BattleState, 
  self: BattleCharacter, 
  opp: BattleCharacter
): AIDecision {
  
  // MODIFICATION: Fetch rules from the registry using the character's AI ID
  const rules = AIRuleRegistry.getRules(self.base.aiRulesetId);
  
  // Sort rules by priority (descending), then by array order
  const sortedRules = [...rules].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  
  // Evaluate only high-priority rules (must-react situations)
  const highPriorityRules = sortedRules.filter(rule => (rule.priority ?? 0) >= 15);
  
  for (const rule of highPriorityRules) {
    try {
      if (rule.when(state, self, opp)) {
        const move = rule.then(state, self, opp);
        if (move) {
          // Console logging for debugging
          console.log(`[AI DECISION] ${self.name} - High Priority Rule Fired: ${rule.name} (Priority: ${rule.priority ?? 0})`);
          console.log(`[AI DECISION] ${self.name} - Chose: ${move.name} (Power: ${move.baseDamage}, Cost: ${move.chiCost || 0})`);
          
          return {
            move,
            rule,
            isFallback: false,
            debug: {
              ruleName: rule.name,
              priority: rule.priority ?? 0,
              conditionMet: true,
              availableMoves: getAvailableMovesSimple(self).length
            }
          };
        }
      }
    } catch (error) {
      console.error(`[AI ERROR] Rule "${rule.name}" failed:`, error);
      continue; // Try next rule
    }
  }
  
  // For non-critical situations, use weighted choice
  console.log(`[AI DECISION] ${self.name} - No high-priority rules, using weighted choice`);
  
  const weightedMoves = getCharacterWeightedMoves(self);
  
  // Create location object from state for collateral damage checks
  const location: Location = {
    id: state.location || 'fire-nation-capital',
    name: state.location || 'Fire Nation Capital',
    image: '/assets/caldera.jpg',
    collateralTolerance: 1, // Default to low tolerance for Fire Nation Capital
    toleranceNarrative: "The pristine Royal Plaza. Widespread destruction here would be a sign of great disrespect and instability."
  };
  
  const weightedResult = selectWeightedMove(self, weightedMoves, state, opp, state.battleLog, location);
  
  if (weightedResult) {
    const weightedRule: AIRule = {
      name: 'Weighted Choice',
      priority: 5,
      description: 'Weighted random choice for tactical variety',
      when: () => true,
      then: () => weightedResult.move
    };
    
    return {
      move: weightedResult.move,
      rule: weightedRule,
      isFallback: false,
      debug: {
        ruleName: 'Weighted Choice',
        priority: 5,
        conditionMet: true,
        availableMoves: getAvailableMovesSimple(self).length,
        weights: weightedResult.weights
      }
    };
  }
  
  // Ultimate fallback to legacy system if weighted choice fails
  console.log(`[AI ULTIMATE FALLBACK] ${self.name} - Weighted choice failed, using legacy system`);
  
  const fallbackMove = legacyTacticalMove(self, location);
  if (!fallbackMove) {
    // If even legacy fallback fails, return null
    return {
      move: null,
      rule: {
        name: 'No Moves Available',
        priority: -100,
        description: 'No moves available at all',
        when: () => true,
        then: () => null
      },
      isFallback: true,
      debug: {
        ruleName: 'No Moves Available',
        priority: -100,
        conditionMet: false,
        availableMoves: 0
      }
    };
  }
  
  const legacyFallbackRule: AIRule = {
    name: 'Legacy Fallback',
    priority: -20,
    description: 'Ultimate fallback to legacy tactical system',
    when: () => true,
    then: () => fallbackMove
  };
  
  return {
    move: fallbackMove,
    rule: legacyFallbackRule,
    isFallback: true,
    debug: {
      ruleName: 'Legacy Fallback',
      priority: -20,
      conditionMet: false,
      availableMoves: getAvailableMovesSimple(self).length
    }
  };
}

/**
 * @description Gets debug information about all rules for a character
 * @param state - The current battle state
 * @param self - The AI character
 * @param opp - The opponent character
 * @returns Debug information about all rules
 */
export function debugRules(
  state: BattleState, 
  self: BattleCharacter, 
  opp: BattleCharacter
): Array<{
  rule: AIRule;
  conditionMet: boolean;
  moveSelected: string | null;
  priority: number;
}> {
  const rules = getCharacterRules(self);
  const sortedRules = [...rules].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  
  return sortedRules.map(rule => {
    try {
      const conditionMet = rule.when(state, self, opp);
      const move = conditionMet ? rule.then(state, self, opp) : null;
      
      return {
        rule,
        conditionMet,
        moveSelected: move?.name || null,
        priority: rule.priority ?? 0
      };
    } catch (error) {
      return {
        rule,
        conditionMet: false,
        moveSelected: null,
        priority: rule.priority ?? 0
      };
    }
  });
} 
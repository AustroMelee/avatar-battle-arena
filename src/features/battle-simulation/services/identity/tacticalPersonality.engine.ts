import { BattleCharacter } from '../../types';
import { Move } from '../../types/move.types';
import { MentalState, IdentityProfile, ScoreAdjustments } from '../../types/identity.types';
import { IDENTITY_PROFILES } from '../../data/identities';

/**
 * Adjusts AI move scores based on identity, mental state, and perception.
 * @param character The character making the decision
 * @param availableMoves The moves available to choose from
 * @returns Score adjustments for each move
 */
export function adjustScoresByIdentity(
  character: BattleCharacter,
  availableMoves: Move[]
): ScoreAdjustments {
  const profile = IDENTITY_PROFILES[character.name];
  if (!profile) {
    return {}; // No adjustments if no profile exists
  }

  const mentalState = character.mentalState;
  const adjustments: ScoreAdjustments = {};

  for (const move of availableMoves) {
    let adjustment = 0;
    const reasons: string[] = [];

    // 1. Moral Boundaries (Lethality)
    if (profile.moralBoundaries === 'non-lethal' && move.baseDamage > 10) {
      adjustment -= 50; // Aang heavily avoids his most lethal-feeling attacks
      reasons.push('Violates non-lethal boundaries');
    }
    if (profile.moralBoundaries === 'lethal' && move.baseDamage > 10) {
      adjustment += 10; // Azula favors powerful, decisive moves
      reasons.push('Favors lethal-force moves');
    }

    // 2. Mental State Effects
    if (mentalState.activeStates.includes('unhinged')) {
      if (move.baseDamage > 15) {
        adjustment += 40; // An unhinged character recklessly favors high-power attacks
        reasons.push('Unhinged state favors high-risk moves');
      }
      if (move.name.includes('Shield') || move.name.includes('Glide')) {
        adjustment -= 30; // Unhinged characters are less likely to be defensive
        reasons.push('Unhinged state penalizes defensive moves');
      }
    }

    if (mentalState.activeStates.includes('enraged')) {
      if (move.baseDamage > 10) {
        adjustment += 25; // Enraged characters favor aggressive moves
        reasons.push('Enraged state favors aggressive moves');
      }
      if (move.name.includes('Shield') || move.name.includes('Glide')) {
        adjustment -= 20; // Enraged characters avoid defensive moves
        reasons.push('Enraged state penalizes defensive moves');
      }
    }

    if (mentalState.activeStates.includes('fearful')) {
      if (move.name.includes('Shield') || move.name.includes('Glide')) {
        adjustment += 30; // Fearful characters prefer defensive moves
        reasons.push('Fearful state favors defensive moves');
      }
      if (move.baseDamage > 15) {
        adjustment -= 20; // Fearful characters avoid high-risk moves
        reasons.push('Fearful state penalizes high-risk moves');
      }
    }

    // 3. Ego & Pride
    if (mentalState.pride < 50 && profile.retreatPenalty > 0) {
      if (move.name.includes('Shield') || move.name.includes('Glide')) {
        adjustment -= profile.retreatPenalty; // Wounded pride makes Azula avoid defense
        reasons.push('Wounded pride penalizes defensive options');
      }
    }

    // 4. Core Values Influence
    if (profile.coreValues.includes('control')) {
      if (move.name.includes('Shield') || move.name.includes('Glide')) {
        adjustment += 15; // Control-oriented characters prefer defensive positioning
        reasons.push('Control value favors defensive positioning');
      }
    }

    if (profile.coreValues.includes('dominance')) {
      if (move.baseDamage > 10) {
        adjustment += 20; // Dominance-oriented characters favor powerful moves
        reasons.push('Dominance value favors powerful moves');
      }
    }

    if (profile.coreValues.includes('pacifism')) {
      if (move.baseDamage > 15) {
        adjustment -= 30; // Pacifist characters avoid high-damage moves
        reasons.push('Pacifism value penalizes high-damage moves');
      }
    }

    // 5. Tactical Tendencies
    if (profile.tacticalTendencies.includes('prefers_precision')) {
      if (move.critChance && move.critChance > 0.15) {
        adjustment += 15; // Precision-oriented characters favor high-crit moves
        reasons.push('Precision tendency favors high-crit moves');
      }
    }

    if (profile.tacticalTendencies.includes('avoids_retreat')) {
      if (move.name.includes('Shield') || move.name.includes('Glide')) {
        adjustment -= 25; // Characters who avoid retreat dislike defensive moves
        reasons.push('Avoids retreat tendency penalizes defensive moves');
      }
    }

    if (profile.tacticalTendencies.includes('prefers_evasion')) {
      if (move.name.includes('Glide') || move.name.includes('Dodge')) {
        adjustment += 20; // Evasion-oriented characters favor evasive moves
        reasons.push('Evasion tendency favors evasive moves');
      }
    }

    // Only add adjustments if there's a non-zero change
    if (adjustment !== 0) {
      adjustments[move.name] = {
        adjustment,
        reason: reasons.join(', '),
      };
    }
  }

  return adjustments;
}

/**
 * Gets a narrative description of the character's current mental state.
 * @param character The character to describe
 * @returns A narrative description of their mental state
 */
export function getMentalStateNarrative(character: BattleCharacter): string {
  const profile = IDENTITY_PROFILES[character.name];
  const mentalState = character.mentalState;

  if (!profile) {
    return `${character.name} maintains their composure.`;
  }

  if (mentalState.activeStates.includes('unhinged')) {
    return `${character.name} has lost all control, their movements becoming wild and unpredictable.`;
  }

  if (mentalState.activeStates.includes('enraged')) {
    return `${character.name} is consumed by rage, their attacks becoming more aggressive and reckless.`;
  }

  if (mentalState.activeStates.includes('fearful')) {
    return `${character.name} is clearly afraid, their movements becoming defensive and cautious.`;
  }

  if (mentalState.pride < 30) {
    return `${character.name}'s pride has been wounded, affecting their confidence in battle.`;
  }

  return `${character.name} remains focused and composed.`;
} 
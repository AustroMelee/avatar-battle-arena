// CONTEXT: Narrative System, // FOCUS: Damage Outcome Mapping
import type { DamageOutcome } from './types';
import { DAMAGE_OUTCOME_THRESHOLDS } from './types';

/**
 * @description Maps damage values to narrative outcome categories
 */
export function mapDamageToOutcome(damage: number): DamageOutcome {
  if (damage <= DAMAGE_OUTCOME_THRESHOLDS.MISS) {
    return 'miss';
  } else if (damage <= DAMAGE_OUTCOME_THRESHOLDS.GLANCE) {
    return 'glance';
  } else if (damage <= DAMAGE_OUTCOME_THRESHOLDS.HIT) {
    return 'hit';
  } else if (damage <= DAMAGE_OUTCOME_THRESHOLDS.DEVASTATING) {
    return 'devastating';
  } else {
    return 'overwhelming';
  }
}

/**
 * @description Gets character-specific narrative lines for a damage outcome
 */
export function getDamageOutcomeLines(
  characterName: string,
  outcome: DamageOutcome,
  targetName: string
): string[] {
  const baseLines = getBaseDamageOutcomeLines(outcome, targetName);
  const characterLines = getCharacterSpecificDamageLines(characterName, outcome, targetName);
  
  return [...characterLines, ...baseLines];
}

/**
 * @description Gets base narrative lines for damage outcomes
 */
function getBaseDamageOutcomeLines(outcome: DamageOutcome, targetName: string): string[] {
  switch (outcome) {
    case 'miss':
      return [
        `${targetName} barely slips aside, but the threat is real.`,
        `The attack whiffs through empty air.`,
        `${targetName} dodges with practiced ease.`,
        `The blow finds only empty space.`,
        `${targetName} sidesteps the attack gracefully.`
      ];
      
    case 'glance':
      return [
        `The attack connects, but lacks power.`,
        `A minor blow lands, barely registering.`,
        `${targetName} winces but stands tall.`,
        `The strike grazes ${targetName}, drawing only a thin line of smoke.`,
        `A glancing blow that does little damage.`
      ];
      
    case 'hit':
      return [
        `The attack lands with solid impact!`,
        `${targetName} staggers from the blow.`,
        `A clean hit that finds its mark.`,
        `The strike connects with satisfying force.`,
        `${targetName} reels from the attack.`
      ];
      
    case 'devastating':
      return [
        `A devastating hit that rocks ${targetName}!`,
        `The blow slams ${targetName} with overwhelming force!`,
        `${targetName} is sent flying from the impact!`,
        `A crushing blow that leaves ${targetName} reeling!`,
        `The attack devastates ${targetName} with brutal efficiency!`
      ];
      
    case 'overwhelming':
      return [
        `An overwhelming assault that nearly ends the battle!`,
        `${targetName} is consumed by the sheer power of the attack!`,
        `The blow is so powerful it threatens to end everything!`,
        `${targetName} is battered by the overwhelming force!`,
        `A legendary strike that will be remembered for ages!`
      ];
      
    default:
      return [`The attack lands.`];
  }
}

/**
 * @description Gets character-specific damage outcome lines
 */
function getCharacterSpecificDamageLines(
  characterName: string,
  outcome: DamageOutcome,
  targetName: string
): string[] {
  switch (characterName) {
    case 'Aang':
      return getAangDamageLines(outcome, targetName);
    case 'Azula':
      return getAzulaDamageLines(outcome, targetName);
    default:
      return [];
  }
}

/**
 * @description Gets Aang-specific damage outcome lines
 */
function getAangDamageLines(outcome: DamageOutcome, targetName: string): string[] {
  switch (outcome) {
    case 'miss':
      return [
        `Aang's airbending carries the attack wide.`,
        `The gentle airbender's strike is too soft.`,
        `Aang's attack is deflected by ${targetName}'s guard.`
      ];
      
    case 'glance':
      return [
        `Aang's airbending barely ruffles ${targetName}'s hair.`,
        `The young Avatar's attack lacks conviction.`,
        `Aang's gentle nature shows in the weak strike.`
      ];
      
    case 'hit':
      return [
        `Aang's airbending strikes with precision!`,
        `The Avatar's training pays off with a solid hit!`,
        `Aang's attack lands with controlled force.`
      ];
      
    case 'devastating':
      return [
        `Aang's airbending becomes a tempest of destruction!`,
        `The Avatar's power erupts in a devastating assault!`,
        `Aang channels his inner strength into overwhelming force!`
      ];
      
    case 'overwhelming':
      return [
        `Aang's Avatar state awakens with legendary power!`,
        `The young airbender becomes an unstoppable force of nature!`,
        `Aang's attack carries the weight of all four elements!`
      ];
      
    default:
      return [];
  }
}

/**
 * @description Gets Azula-specific damage outcome lines
 */
function getAzulaDamageLines(outcome: DamageOutcome, targetName: string): string[] {
  switch (outcome) {
    case 'miss':
      return [
        `${targetName} narrowly avoids Azula's blue fire.`,
        `Azula's precision is off this time.`,
        `The princess's attack is expertly dodged.`
      ];
      
    case 'glance':
      return [
        `Azula's fire barely singes ${targetName}.`,
        `The princess's attack lacks her usual intensity.`,
        `Azula's blue fire grazes ${targetName} harmlessly.`
      ];
      
    case 'hit':
      return [
        `Azula's blue fire strikes with deadly accuracy!`,
        `The princess's attack burns with calculated precision!`,
        `Azula's firebending finds its mark!`
      ];
      
    case 'devastating':
      return [
        `Azula's blue fire consumes ${targetName} in devastation!`,
        `The princess's attack burns with overwhelming fury!`,
        `Azula's firebending becomes a storm of destruction!`
      ];
      
    case 'overwhelming':
      return [
        `Azula's blue fire becomes an inferno of legendary power!`,
        `The princess's attack threatens to consume everything!`,
        `Azula's firebending reaches its ultimate destructive potential!`
      ];
      
    default:
      return [];
  }
} 
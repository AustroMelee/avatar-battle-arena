// CONTEXT: Desperation Moves & Finisher System
// RESPONSIBILITY: Provide dramatic, high-risk moves that unlock at critical health levels

import type { Move } from '../../types/move.types';
import { BattleCharacter } from '../../types';

const MAX_HEALTH = 100; // Convention: global virtual max health for all mechanics

export interface DesperationMove extends Omit<Move, 'unlockCondition'> {
  unlockCondition: (character: BattleCharacter) => boolean;
  isDesperation: true;
  dramaticNarrative: string;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  sideEffect?: {
    type: 'self_damage' | 'chi_drain' | 'defense_reduction' | 'stun';
    value: number;
    duration?: number;
  };
  narrative: {
    unlock: string;
    use: string;
    success: string;
    failure?: string;
  };
  tags?: string[]; // Ensure tag compliance
}

export const DESPERATION_MOVES: Record<string, DesperationMove[]> = {
  'aang': [
    {
      id: 'air-mastery',
      name: 'Air Mastery',
      type: 'attack',
      baseDamage: 40,
      cooldown: 3,
      description: 'Aang channels his deepest airbending mastery, unleashing devastating power at great personal risk.',
      chiCost: 0,
      unlockCondition: (character: BattleCharacter) => (character.currentHealth / MAX_HEALTH) < 0.2,
      riskLevel: 'extreme',
      sideEffect: { type: 'self_damage', value: 10 },
      narrative: {
        unlock: 'Aang feels the ancient power of airbending stirring within him...',
        use: 'Aang unleashes the full force of the wind, risking everything!',
        success: 'Air Mastery devastates the opponent, but the strain is immense!',
        failure: 'The power overwhelms Aang, causing severe backlash!'
      },
      isDesperation: true,
      dramaticNarrative: "Aang's spirit surges as he risks it all for one final strike!",
      tags: ['desperation']
    },
    {
      id: 'air-tornado',
      name: 'Air Tornado',
      type: 'attack',
      baseDamage: 25,
      cooldown: 2,
      description: 'Creates a massive tornado that damages both combatants.',
      chiCost: 0,
      unlockCondition: (character: BattleCharacter) => (character.currentHealth / MAX_HEALTH) < 0.3,
      riskLevel: 'high',
      sideEffect: { type: 'self_damage', value: 5 },
      narrative: {
        unlock: 'Aang channels his desperation into a massive air vortex...',
        use: 'Aang creates a devastating tornado that engulfs the battlefield!',
        success: 'The tornado wreaks havoc, but Aang is caught in its fury!',
        failure: 'The tornado spins out of control, backfiring on Aang!'
      },
      isDesperation: true,
      dramaticNarrative: "Aang's desperation fuels a storm that spares no one!",
      tags: ['desperation']
    },
    {
      id: 'avatar-state-finale',
      name: 'Avatar State Finale',
      type: 'attack',
      baseDamage: 60,
      cooldown: 0,
      description: 'Aang enters the Avatar State, unleashing a devastating, unblockable attack that cannot be restricted or penalized.',
      chiCost: 0,
      unlockCondition: () => true, // Always available in final phase
      riskLevel: 'extreme',
      sideEffect: { type: 'self_damage', value: 20 },
      narrative: {
        unlock: 'Aang feels the Avatar Spirit surge—this is the final stand.',
        use: 'Aang glows with elemental power, the Avatar State unleashed!',
        success: 'The Avatar State overwhelms all defenses—victory or ruin!',
        failure: 'The power is too much to control, but Aang refuses to yield.'
      },
      isDesperation: true,
      dramaticNarrative: 'Aang surrenders to the Avatar State, risking everything for a final, unstoppable blow!',
      tags: ['desperation', 'finisher', 'last-resort']
    },
    // Universal last resort move
    {
      id: 'last-resort-aang',
      name: 'Last Resort',
      type: 'attack',
      baseDamage: 35,
      cooldown: 0,
      description: 'Aang channels every remaining ounce of strength into a desperate final attack. Always available if all else fails.',
      chiCost: 0,
      unlockCondition: () => true, // Always available
      riskLevel: 'extreme',
      narrative: {
        unlock: 'Aang is out of options—one last chance remains.',
        use: 'Aang throws caution aside, launching a desperate final attack!',
        success: 'The last resort lands with unexpected force!',
        failure: 'Aang’s final effort is valiant, but not enough.'
      },
      isDesperation: true,
      dramaticNarrative: 'Aang’s last resort—he will not go down without a fight!',
      tags: ['desperation', 'last-resort']
    },
    // --- AANG: Escalation Moves ---
    {
      id: 'aang_whirlwind_barrage',
      name: 'Whirlwind Barrage',
      type: 'attack',
      baseDamage: 16,
      cooldown: 2,
      chiCost: 4,
      description: 'Aang unleashes a flurry of air strikes, overwhelming his foe with relentless speed.',
      unlockCondition: (character) => character.currentHealth < 100, // Always available for escalation
      riskLevel: 'medium',
      isDesperation: true,
      dramaticNarrative: 'Momentum builds—the air vibrates with Aang’s resolve.',
      narrative: {
        unlock: 'Aang’s eyes narrow, wind swirling at his fingertips.',
        use: 'A cyclone of blows surges forward, impossible to block them all.',
        success: 'The barrage lands, leaving the opponent reeling.',
        failure: 'The wind scatters, but Aang’s resolve remains.'
      },
      tags: ['escalation']
    },
    {
      id: 'aang_tempest_step',
      name: 'Tempest Step',
      type: 'evade',
      baseDamage: 0,
      cooldown: 2,
      chiCost: 3,
      description: 'Aang dodges with supernatural agility, repositioning for advantage.',
      unlockCondition: (character) => character.currentHealth < 100, // Always available for escalation
      riskLevel: 'medium',
      isDesperation: true,
      dramaticNarrative: 'The wind carries Aang out of harm’s way, poised for a counter.',
      narrative: {
        unlock: 'A breath, a shift—Aang reads the flow.',
        use: 'He blurs sideways, reappearing with a focused stance.',
        success: 'Aang repositions, ready to strike back.',
        failure: 'The attempt is read, but Aang remains undeterred.'
      },
      tags: ['escalation', 'reposition']
    },
    // --- AANG: Desperation Moves ---
    {
      id: 'aang_razor_gale',
      name: 'Razor Gale',
      type: 'attack',
      baseDamage: 22,
      cooldown: 3,
      chiCost: 5,
      description: 'A desperate burst of slicing wind. If it misses, Aang’s next defense is penalized.',
      unlockCondition: (character) => character.currentHealth < 30,
      riskLevel: 'high',
      isDesperation: true,
      dramaticNarrative: 'Each breath is a risk; survival balanced on the edge of the gale.',
      narrative: {
        unlock: 'The air shudders as Aang pushes past exhaustion.',
        use: 'He hurls a cutting wind—sharp, reckless, urgent.',
        success: 'The gale slices through, but at a cost.',
        failure: 'The wind misses—Aang’s guard falters.'
      },
      tags: ['desperation']
    },
    {
      id: 'aang_vault_of_air',
      name: 'Vault of Air',
      type: 'evade',
      baseDamage: 0,
      cooldown: 4,
      chiCost: 6,
      description: 'Aang launches himself skyward, avoiding all attacks this turn.',
      unlockCondition: (character) => character.currentHealth < 30,
      riskLevel: 'medium',
      isDesperation: true,
      dramaticNarrative: 'Desperation gives him wings; retreat is as bold as attack.',
      narrative: {
        unlock: 'Aang’s feet leave the ground—he becomes the wind.',
        use: 'He vaults high, untouchable for a single heartbeat.',
        success: 'Aang is untouched, but cannot attack next turn.',
        failure: 'The vault is mistimed, but Aang lands safely.'
      },
      tags: ['desperation', 'defense']
    },
    // --- AANG: Finisher/Last-Resort Moves ---
    {
      id: 'aang_last_breath_cyclone',
      name: 'Last Breath Cyclone',
      type: 'attack',
      baseDamage: 36,
      cooldown: 0,
      chiCost: 10,
      description: 'Aang’s ultimate technique—a colossal tornado unleashed with his final reserves.',
      unlockCondition: (character) => character.currentHealth < 20,
      riskLevel: 'extreme',
      isDesperation: true,
      dramaticNarrative: 'This is everything—Aang’s spirit, unleashed without restraint.',
      narrative: {
        unlock: 'Aang gathers the storm, every ounce of spirit in motion.',
        use: 'A cyclone roars to life, tearing at the very air.',
        success: 'The cyclone ends the battle in a single, decisive moment.',
        failure: 'The storm fades, but Aang’s courage does not.'
      },
      tags: ['finisher', 'last-resort']
    },
    {
      id: 'aang_avatars_resilience',
      name: 'Avatar’s Resilience',
      type: 'defense_buff',
      baseDamage: 0,
      cooldown: 99,
      chiCost: 0,
      description: 'In a moment of crisis, Aang channels inner peace, restoring some vitality.',
      unlockCondition: (character) => character.currentHealth < 20,
      riskLevel: 'medium',
      isDesperation: true,
      dramaticNarrative: 'The Avatar endures, hope shining through the storm.',
      narrative: {
        unlock: 'A calm settles over Aang—a center found in chaos.',
        use: 'His wounds knit; his energy returns, faint but steady.',
        success: 'Aang is restored, ready to continue.',
        failure: 'The effort is draining, but Aang stands tall.'
      },
      tags: ['last-resort', 'recovery']
    }
  ],
  'azula': [
    {
      id: 'phoenix-rage',
      name: 'Phoenix Rage',
      type: 'attack',
      baseDamage: 35,
      cooldown: 3,
      description: 'Azula channels her fury into an unstoppable firestorm.',
      chiCost: 0,
      unlockCondition: (character: BattleCharacter) => (character.currentHealth / MAX_HEALTH) < 0.25,
      riskLevel: 'extreme',
      sideEffect: { type: 'self_damage', value: 15 },
      narrative: {
        unlock: "Azula's eyes burn with uncontainable fury...",
        use: 'Azula unleashes a devastating firestorm fueled by pure rage!',
        success: 'The firestorm consumes everything in its path!',
        failure: "The firestorm consumes Azula's own energy!"
      },
      isDesperation: true,
      dramaticNarrative: "Azula's fury becomes a force of nature!",
      tags: ['desperation']
    },
    {
      id: 'lightning-storm',
      name: 'Lightning Storm',
      type: 'attack',
      baseDamage: 30,
      cooldown: 2,
      description: 'Creates a massive lightning storm that strikes randomly.',
      chiCost: 0,
      unlockCondition: (character: BattleCharacter) => (character.currentHealth / MAX_HEALTH) < 0.35,
      riskLevel: 'high',
      sideEffect: { type: 'self_damage', value: 10 },
      narrative: {
        unlock: 'Azula channels her desperation into pure lightning...',
        use: 'Azula creates a devastating lightning storm!',
        success: 'Lightning strikes with devastating force!',
        failure: 'The lightning backfires, leaving Azula vulnerable!'
      },
      isDesperation: true,
      dramaticNarrative: "Azula's desperation unleashes a storm of lightning!",
      tags: ['desperation']
    },
    {
      id: 'blue-comet-finale',
      name: 'Blue Comet Finale',
      type: 'attack',
      baseDamage: 60,
      cooldown: 0,
      description: 'Azula summons the legendary Blue Comet, channeling its energy into an unblockable, catastrophic attack.',
      chiCost: 0,
      unlockCondition: () => true, // Always available in final phase
      riskLevel: 'extreme',
      sideEffect: { type: 'self_damage', value: 20 },
      narrative: {
        unlock: 'Azula feels the power of the Blue Comet—her ultimate weapon.',
        use: 'Azula calls down the Blue Comet, her flames burning brighter than ever!',
        success: 'The Blue Comet devastates the battlefield—no defense can withstand it!',
        failure: 'The power is overwhelming, but Azula’s will is unbroken.'
      },
      isDesperation: true,
      dramaticNarrative: 'Azula unleashes the Blue Comet, determined to end the battle in a blaze of glory!',
      tags: ['desperation', 'finisher', 'last-resort']
    },
    // Universal last resort move
    {
      id: 'last-resort-azula',
      name: 'Last Resort',
      type: 'attack',
      baseDamage: 35,
      cooldown: 0,
      description: 'Azula channels every remaining spark of fury into a desperate final attack. Always available if all else fails.',
      chiCost: 0,
      unlockCondition: () => true, // Always available
      riskLevel: 'extreme',
      narrative: {
        unlock: 'Azula is out of options—her rage is all that remains.',
        use: 'Azula hurls a final, desperate blast of blue fire!',
        success: 'The last resort scorches the earth—Azula’s fury is legendary!',
        failure: 'Azula’s final attack fizzles, but her ambition endures.'
      },
      isDesperation: true,
      dramaticNarrative: 'Azula’s last resort—she will not accept defeat!',
      tags: ['desperation', 'last-resort']
    },
    // --- AZULA: Escalation Moves ---
    {
      id: 'azula_inferno_cascade',
      name: 'Inferno Cascade',
      type: 'attack',
      baseDamage: 17,
      cooldown: 2,
      chiCost: 5,
      description: 'Azula unleashes a series of controlled blue fire bursts, pressing the attack with relentless precision.',
      unlockCondition: (character) => character.currentHealth < 100,
      riskLevel: 'medium',
      isDesperation: true,
      dramaticNarrative: 'Azula’s command of fire leaves nowhere safe to hide.',
      narrative: {
        unlock: 'Blue fire crackles, gathering at Azula’s fingertips—her intent unmistakable.',
        use: 'A wave of searing flames arcs out, each shot impossibly accurate.',
        success: 'The flames scorch the field, defenses falter.',
        failure: 'The flames dissipate, but Azula’s focus sharpens.'
      },
      tags: ['escalation']
    },
    {
      id: 'azula_lightning_feint',
      name: 'Lightning Feint',
      type: 'parry_retaliate',
      baseDamage: 6,
      cooldown: 2,
      chiCost: 6,
      description: 'Azula channels lightning but uses it as a feint, leaving her foe exposed.',
      unlockCondition: (character) => character.currentHealth < 100,
      riskLevel: 'medium',
      isDesperation: true,
      dramaticNarrative: 'Her deception is its own weapon; anticipation builds.',
      narrative: {
        unlock: 'A faint glimmer of lightning in her eyes—Azula plans three moves ahead.',
        use: 'She shifts, feinting left as sparks flicker—her real strike yet to come.',
        success: 'The feint works—her next attack is guaranteed.',
        failure: 'The ruse is seen, but Azula adapts.'
      },
      tags: ['escalation', 'tactical']
    },
    // --- AZULA: Desperation Moves ---
    {
      id: 'azula_combustion_rush',
      name: 'Combustion Rush',
      type: 'attack',
      baseDamage: 23,
      cooldown: 3,
      chiCost: 7,
      description: 'Azula channels her remaining strength into a reckless, explosive charge.',
      unlockCondition: (character) => character.currentHealth < 30,
      riskLevel: 'high',
      isDesperation: true,
      dramaticNarrative: 'Her fury burns brightest at the edge of defeat.',
      narrative: {
        unlock: 'Desperation stokes Azula’s flames to new heights.',
        use: 'She explodes forward, blue fire roaring, consequences be damned.',
        success: 'The charge lands, but Azula is hurt in the process.',
        failure: 'The attack misses, but her resolve hardens.'
      },
      tags: ['desperation']
    },
    {
      id: 'azula_steel_nerve',
      name: 'Steel Nerve',
      type: 'defense_buff',
      baseDamage: 0,
      cooldown: 4,
      chiCost: 0,
      description: 'Azula enters a trance-like focus, shrugging off status effects and restoring some composure.',
      unlockCondition: (character) => character.currentHealth < 30,
      riskLevel: 'medium',
      isDesperation: true,
      dramaticNarrative: 'Fear is burned away—Azula becomes untouchable.',
      narrative: {
        unlock: 'Azula’s eyes narrow, a cold stillness settling in.',
        use: 'A single breath. Control reasserts itself, and weakness is erased.',
        success: 'Azula shrugs off all weakness, regaining composure.',
        failure: 'The trance is broken, but her will is not.'
      },
      tags: ['desperation', 'recovery']
    },
    // --- AZULA: Finisher/Last-Resort Moves ---
    {
      id: 'azula_phoenix_inferno',
      name: 'Phoenix Inferno',
      type: 'attack',
      baseDamage: 38,
      cooldown: 0,
      chiCost: 12,
      description: 'Azula unleashes her signature, all-consuming blue fire, aiming to end the battle in a single devastating display.',
      unlockCondition: (character) => character.currentHealth < 20,
      riskLevel: 'extreme',
      isDesperation: true,
      dramaticNarrative: 'The world blurs in fire and brilliance—Azula claims her legacy.',
      narrative: {
        unlock: 'All of Azula’s rage and talent condense into a single moment.',
        use: 'A storm of blue flame erupts, threatening to consume everything.',
        success: 'The inferno ends the battle in a blaze of glory.',
        failure: 'The flames subside, but Azula’s ambition endures.'
      },
      tags: ['finisher', 'last-resort']
    },
    {
      id: 'azula_cold_precision',
      name: 'Cold Precision',
      type: 'attack',
      baseDamage: 19,
      cooldown: 99,
      chiCost: 8,
      description: 'With absolute clarity, Azula executes a flawless, surgically precise attack.',
      unlockCondition: (character) => character.currentHealth < 20,
      riskLevel: 'medium',
      isDesperation: true,
      dramaticNarrative: 'Victory is an equation—Azula always finds the solution.',
      narrative: {
        unlock: 'A final calculation—no wasted effort, no hesitation.',
        use: 'Her strike is quiet, merciless, impossible to escape.',
        success: 'The attack lands, ignoring all defense.',
        failure: 'The precision falters, but Azula recalculates.'
      },
      tags: ['last-resort', 'precision']
    }
  ]
};

/**
 * Returns all available desperation moves for a character.
 */
export function getAvailableDesperationMoves(
  character: BattleCharacter
): DesperationMove[] {
  const characterMoves = DESPERATION_MOVES[character.name.toLowerCase()] || [];
  return characterMoves.filter(move => {
    const unlocked = move.unlockCondition(character);
    // (Optional) Place to add log entry when move is unlocked
    return unlocked;
  });
}

/**
 * Checks if a character has any desperation moves available.
 */
export function hasDesperationMoves(character: BattleCharacter): boolean {
  return getAvailableDesperationMoves(character).length > 0;
}

/**
 * Returns the most powerful available desperation move.
 */
export function getBestDesperationMove(character: BattleCharacter): DesperationMove | null {
  const availableMoves = getAvailableDesperationMoves(character);
  if (!availableMoves.length) return null;
  return availableMoves.reduce((best, current) =>
    current.baseDamage > best.baseDamage ? current : best
  );
}

/**
 * Applies the side effects of a desperation move, in a type-safe way.
 */
export function applyDesperationSideEffects(
  character: BattleCharacter,
  move: DesperationMove
): BattleCharacter {
  if (!move.sideEffect) return character;

  const { type, value } = move.sideEffect;

  switch (type) {
    case 'self_damage':
      return {
        ...character,
        currentHealth: Math.max(1, character.currentHealth - value)
      };
    case 'chi_drain':
      return {
        ...character,
        resources: {
          ...character.resources,
          chi: Math.max(0, (character.resources?.chi || 0) - value)
        }
      };
    case 'defense_reduction':
      return {
        ...character,
        currentDefense: Math.max(0, (character.currentDefense || 0) - value)
      };
    case 'stun':
      return {
        ...character,
        flags: {
          ...character.flags,
          stunDuration: value // or duration, as needed
        }
      };
      
    default:
      return character;
  }
}

/**
 * Gets narrative text for desperation move events.
 */
export function getDesperationNarrative(
  move: DesperationMove,
  event: keyof DesperationMove['narrative']
): string {
  return move.narrative[event] || '';
}

/**
 * True if the character is in a desperate state, using MAX_HEALTH.
 */
export function isDesperate(character: BattleCharacter): boolean {
  return (character.currentHealth / MAX_HEALTH) < 0.25;
}

/**
 * True if the character is critically wounded, using MAX_HEALTH.
 */
export function isCriticallyWounded(character: BattleCharacter): boolean {
  return (character.currentHealth / MAX_HEALTH) < 0.10;
} 
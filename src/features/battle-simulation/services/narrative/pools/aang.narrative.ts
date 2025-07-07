/**
 * @fileoverview Contains all narrative line pools specifically for Aang.
 * @description Lines reflect Aang's personality: reluctant but powerful, connected to spirits, and valuing peace.
 */

import { CharacterNarrativePool } from '../narrative.types';

export const aangNarrativePool: CharacterNarrativePool = {
  ChargedAirTornado: {
    chargeStart: [
      'The winds answer my call!',
      'I need to focus the vortex...',
      "I hope this doesn't cause too much damage.",
      'Here comes a gust!',
    ],
    hit: [
      'The storm is overwhelming!',
      "That should hold you! Are you okay?",
      'A cyclone of pure air energy, right on target.',
      'You are caught in the tempest!',
    ],
    miss: [
      'Whoa, a bit too much power!',
      'The winds are wild today. I missed.',
      'I pulled back at the last second. That was too close.',
      'The vortex spun out of my control.',
    ],
    victory: [
      'The storm has passed. It is over.',
      'I am sorry it had to end this way.',
      'Peace is restored.',
      'The wind has settled, and so has this fight.',
    ],
    trigger: ["Aang's eyes flash with wind-born resolve as the vortex begins to form."],
    attack: ["With a roar of spiraling air, Aang unleashes the tornado to tear through Azula's stance."]
  },
  ForcedEscalation: {
    trigger: [
      'I can feel the energy shifting. This is getting serious.',
      "There's no turning back now, is there?",
      "The world holds its breath... I must be ready.",
      'The spirits are restless. Something has changed.',
    ],
    attack: [
      'I have to end this, now!',
      'This is the full power of an Airbender!',
      "I won't let you win!",
      'For balance!',
    ],
    chargeStart: ["The wind around him howlsnot with peace, but with necessity."],
    hit: ["Aang lashes out, not with mercy, but with momentum."],
    miss: ["The move slips, driven by panic rather than precision."],
    victory: ["He breathes heavy, victoriousbut something in him feels compromised."]
  },
  CollateralDamage: {
    minor: [
      'Oops! I need to be more careful.',
      'The monastery stones... I must protect this place.',
      'A stray gust... I have to control it.',
      "Sorry about that!",
    ],
    major: [
      'No! The temple! What have I done?',
      'This is exactly what I was afraid of. The destruction...',
      'This power... it is too much.',
      'I have to stop before everything is destroyed!',
    ],
    chargeStart: ['Debris scatters from the blast.'],
    hit: ["A statue cracks behind Azulathe price of bending in a sacred place."],
    miss: ["The temple floor splitsnot from Azula, but from his own force gone wide."],
    victory: ["Victory rings hollow among toppled pillars and scorched walls."],
    trigger: ["His breath catches as he sees the chaos around themthe line is blurring."],
    attack: ["He spins, lands, strikesbut the echo knocks loose a stone balcony."]
  },
  DesperationTrigger: {
    trigger: [
      'I can feel my ancestors... they are giving me strength.',
      "I won't give up. Not now, not ever.",
      "For my friends... for the world... I must stand strong.",
      'The Avatar state... it is close.',
    ],
    attack: [
      'This is everything I have!',
      "I'm giving it all I've got!",
      'This is for all the people I have to protect!',
      'I channel the strength of a thousand lifetimes!',
    ],
  },
  PleaForPeace: {
    trigger: [
      "Please, let's stop this. There's been enough fighting.",
      'We can find another way, a better way.',
      "This doesn't have to end with violence.",
      "I don't want to hurt you.",
    ],
    fail: [
      'Then I have no choice.',
      'I am sorry you chose this path.',
      "You've left me with no other option.",
      'So be it. I will do what I must.',
    ],
  },
  Lightning: {
    chargeStart: ["Aang stiffens, his muscles tightening as he braces for the surge of stolen power."],
    hit: ["Lightning arcs from his fingersa reckless echo of what should never be hisand it connects."],
    miss: ["The lightning forks wild and unfocused, fading harmlessly into the sky."],
    victory: ["The stolen spark surges with regret as Aang stands victorious through imbalance."],
    trigger: ["Lightning flickers at his palms, a technique he swore he'd never use."],
    attack: ["With trembling focus, Aang thrusts forward, unleashing a strike that defies his own nature."]
  },
  BurnDamage: {
    chargeStart: ['Aang braces against the rising heat.'],
    hit: ['The burn spreads, pain tightening his breath.'],
    miss: ['He resists the pain with meditative focus.'],
    victory: ["Smoke curls from his robesvictory came at a cost."],
    trigger: ["The searing pain fuels a storm inside him."],
    attack: ["He fights through the sting, each move flaring with residual heat."],
    apply: ['The scorched skin continues to sting.'],
    tick: ['Pain pulses in rhythm with each breath.'],
    minor: ['A sharp reminder of fire\'s reach.'],
    major: ['The burns sear through his resolve.'],
    fail: ['Aang stumbles, overcome by pain.']
  },
  Stalemate: {
    trigger: [
      "We're just going in circles!",
      "This isn't achieving anything.",
      "We need a new approach.",
      "There must be a way to break this deadlock."
    ]
  },
  EnvironmentalShift: {
    trigger: [
      "Aang slams his staff to the earth; stone and sky ripple outward.",
      "The battlefield bends to his willa gust knocks loose tiles, a current reshapes the path.",
      "A shift in the breeze warns himit's time to move the world, not just himself.",
    ]
  },
  Interrupt: {
    hit: [
      "Their power broke like a wave against the rocks.",
      "I won't let you finish that!",
      "A swift gust disrupts their focus!"
    ],
    miss: [
      "Too slow. They slipped through the gap.",
      "My timing was off!",
    ]
  },
  Parry: {
    hit: [
      "Their own force... turned against them.",
      "A perfect redirection!",
      "With practiced calm, Aang turns their attack aside."
    ],
    fail: [
      "I opened up... and they didn't stop.",
      "I misread their rhythm!"
    ]
  }
};

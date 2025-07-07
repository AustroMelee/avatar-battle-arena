/**
 * @fileoverview Contains all narrative line pools specifically for Azula.
 * @description Lines reflect Azula's personality: sharp, dominant, cruel, and obsessed with perfection.
 */

import { CharacterNarrativePool } from '../narrative.types';

export const azulaNarrativePool: CharacterNarrativePool = {
  Lightning: {
    chargeStart: [
      'Observe the pinnacle of firebending.',
      'Time to end this farce.',
      'Watch closely. This is true power.',
      'Now, you will see why I am a prodigy.',
    ],
    hit: [
      'A perfect strike. As expected.',
      'That is what happens when you challenge perfection.',
      'You should have seen that coming. Pathetic.',
      "Don't worry, it only hurts... a lot.",
    ],
    miss: [
      'Impossible. My aim is flawless.',
      "A lucky dodge. It won't happen again.",
      'The environment interfered. A calculated risk.',
      'Hmph. A waste of energy.',
    ],
    victory: [
      "Was there ever any doubt?",
      'You were never a match for my power.',
      "That's what happens when you're a monster. I'm a good winner.",
      'Consider this a lesson in superiority.',
    ],
    trigger: ["Her fingertips twitchlightning sings its cruel lullaby."],
    attack: ["Azula slices her hand through the air, summoning judgment in arcs of cobalt flame."],
    apply: ['Lightning coils in her palm like a serpent.'],
    tick: ['Residual current dances along her fingers.'],
    minor: ['A spark leaps and sizzlesjust a taste.'],
    major: ['A blinding arc lashes the air with fury!'],
    fail: ['The energy misfiresher aim was off.']
  },
  ForcedEscalation: {
    trigger: [
      'Finally, a real fight!',
      'Done playing games? Good.',
      "Don't disappoint me now.",
      'Let us see what you are really made of.',
    ],
    attack: [
      'No more holding back!',
      'Feel the full might of the Fire Nation!',
      'I will burn you to the ground!',
      'This is your end!',
    ],
    chargeStart: ["Her jaw tightensenough precision. It's time for dominance."],
    hit: ["She slams fire down with both hands, abandoning form for ferocity."],
    miss: ["Too much, too fastthe fire surges wild and wide."],
    victory: ["Her chest heaves, hair loosevictory through sheer force."]
  },
  BurnDamage: {
    apply: [
      'Suffer.',
      'A gift that keeps on giving.',
      'Let the blue fire cleanse you.',
      "Remember this pain.",
    ],
    tick: [
      'The blue flames cling to your skin!',
      "You can't escape the searing heat!",
      'Your strength drains with every passing moment.',
      'The agony is just beginning.',
    ],
    hit: ['The burn fuels her furyit only sharpens her glare.'],
    miss: ["Her fire ricochets into a lanternno hit, but plenty of havoc."],
    victory: ["Smoke coils from her sleevesscorched but victorious."],
    trigger: ["Her teeth bare. Someone dared mark the dragon."],
    attack: ["She surges forward, flame-for-flame, daring the pain to make her sharper."]
  },
  CollateralDamage: {
    minor: [
      'Insignificant.',
      'Acceptable losses.',
      "This place could use some redecorating anyway.",
      'A small price to pay for victory.',
    ],
    major: [
      'Let it all burn!',
      "Destruction is a form of creation. I am creating your defeat.",
      'A demonstration of my unrestrained power.',
      'This world will be rebuilt in my image.',
    ]
  },
  DesperationTrigger: {
    trigger: [
      'No... I am the perfect bender! I cannot lose!',
      'This is not how it was supposed to end!',
      "I will NOT be defeated!",
      "You'll pay for pushing me this far!",
    ],
    attack: [
      'Everything burns!',
      'I will destroy you!',
      'This is my full power, unleashed!',
      'You will know true agony!',
    ]
  },
  Stalemate: {
    trigger: [
      "This is tiresome. End it or I will.",
      "Are you trying to bore me to death?",
      "How long do you intend to draw this out? Pathetic.",
      "A stalemate? How... disappointing."
    ]
  },
  EnvironmentalShift: {
    trigger: [
      "With a snap, lightning scars the groundsetting the terrain ablaze with intent.",
      "She twists her fingers, and the world begins to squirm.",
      "Azula exhales slowly. Even the ground should fear her."
    ]
  },
  Interrupt: {
    hit: [
      "No. You don't get to finish that.",
      "I saw that coming a mile away.",
      "Your technique is clumsy and predictable.",
    ],
    miss: [
      "*Missed?* I don't miss.",
      "A minor miscalculation. It won't be repeated."
    ]
  },
  Parry: {
    hit: [
      "Predictable.",
      "Is that all you have?",
      "A futile effort. Now, it's my turn."
    ],
    fail: [
      "How dare they get throughhow dare they touch me.",
      "My defense... failed? Impossible."
    ]
  }
};

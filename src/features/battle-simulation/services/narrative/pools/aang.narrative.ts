/**
 * @fileoverview Contains all narrative line pools specifically for Aang.
 * @description Lines reflect Aang's personality: reluctant but powerful, connected to spirits, and valuing peace.
 */

import { CharacterNarrativePool } from '../narrative.types';

export const aangNarrativePool: CharacterNarrativePool = {
  BasicStrike: {
    hit: [
      "Aang lands a swift, controlled blow.",
      "He makes contact, but holds back.",
      "Aang’s staff finds its mark with gentle force."
    ],
    miss: [
      "Aang’s strike glances harmlessly aside.",
      "He hesitates, missing the chance.",
      "The staff cuts air; Aang refuses to press."
    ]
  },
  Reversal: {
    trigger: [
      "Cornered, Aang bends his way out.",
      "He adapts in a flash, upending the flow.",
      "Aang pivots, seizing the moment."
    ],
    hit: [
      "Aang rides the wind, evading danger.",
      "Light as a feather, he slips through the attack.",
      "Wind swirls, carrying him to safety."
    ],
    miss: [
      "He stumbles mid-glide, barely regaining balance.",
      "The air falters under his feet, and he falls short."
    ]
  },
  ForcedEscalation: {
    trigger: [
      "Aang senses the tension mounting. There’s no turning back.",
      "With each exchange, the stakes rise higher.",
      "The world itself seems to demand escalation."
    ]
  },
  DesperationTrigger: {
    trigger: [
      "Aang’s breath quickens; desperation steels his resolve.",
      "With hope fading, he channels every last ounce of will.",
      "Desperation becomes his ally."
    ]
  },
  Finisher: {
    victory: [
      "Aang bows, relieved the conflict ends without lasting harm.",
      "Peace, at least for a heartbeat.",
      "He lets the winds settle, grateful for restraint."
    ],
    fail: [
      "Aang stumbles, breath ragged, vision fading.",
      "He surrenders to the storm, beaten but unbroken.",
      "The winds are still; defeat weighs heavy."
    ]
  },
  Stalemate: {
    trigger: [
      "Even Aang’s patience is tested by the stalemate.",
      "The battle lingers with no clear victor.",
      "No path forward, no ground gained."
    ]
  },
  Clash: {
    trigger: [
      "The clash continues, neither side yielding.",
      "Every move leaves its mark, but nothing is settled.",
      "Each moment brings new danger."
    ]
  }
};

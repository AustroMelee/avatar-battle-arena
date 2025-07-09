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
      "The world itself seems to demand escalation.",
      "Aang’s eyes narrow—he knows the next move could change everything.",
      "The air thickens with anticipation as Aang prepares for a turning point.",
      "He draws a deep breath, feeling the weight of destiny in the balance.",
      "Aang’s stance shifts—he’s ready to risk everything for peace.",
      "The wind howls, echoing the rising stakes in Aang’s heart.",
      "Aang’s resolve hardens; the time for restraint is over.",
      "A sudden stillness falls—Aang channels the storm within."
    ]
  },
  DesperationTrigger: {
    trigger: [
      "Aang’s breath quickens; desperation steels his resolve.",
      "With hope fading, he channels every last ounce of will.",
      "Desperation becomes his ally.",
      "Cornered, Aang’s spirit refuses to break—he bends the elements with newfound fury.",
      "The world blurs as Aang unleashes a desperate, all-or-nothing attack.",
      "He calls on the Avatar State, risking everything for one final stand.",
      "Aang’s eyes blaze with determination—he will not yield.",
      "The ground trembles as Aang’s desperation fuels a surge of power.",
      "Aang’s voice rings out, defiant even in the face of defeat.",
      "He draws on memories of his friends, fighting for more than just himself."
    ]
  },
  Finisher: {
    victory: [
      "Aang bows, relieved the conflict ends without lasting harm.",
      "Peace, at least for a heartbeat.",
      "He lets the winds settle, grateful for restraint.",
      "Aang’s final strike is a masterpiece of power and mercy—his foe is defeated, but not destroyed.",
      "The arena falls silent as Aang’s ultimate move brings the battle to a breathtaking close.",
      "Aang stands tall, the storm within him finally at peace.",
      "Aang’s victory is gentle but absolute—a lesson in true strength.",
      "The Avatar’s light shines, ending the conflict with hope.",
      "Aang’s mastery of the elements leaves the crowd in awe.",
      "He offers his opponent a hand, proving compassion is the greatest power."
    ],
    fail: [
      "Aang stumbles, breath ragged, vision fading.",
      "He surrenders to the storm, beaten but unbroken.",
      "The winds are still; defeat weighs heavy.",
      "Aang’s last effort falls short—he collapses, but his spirit endures.",
      "The Avatar’s power wanes, leaving only exhaustion and resolve.",
      "He falls, but the world will remember his courage.",
      "Aang’s defeat is met with silence—his journey is not over.",
      "The elements calm, but Aang’s will remains unbroken.",
      "He lies still, but hope lingers in the air.",
      "Aang’s loss is a lesson in humility and perseverance."
    ]
  },
  Stalemate: {
    trigger: [
      "Even Aang’s patience is tested by the stalemate.",
      "The battle lingers with no clear victor.",
      "No path forward, no ground gained.",
      "Aang shifts his stance, waiting for an opening that never comes.",
      "The air hangs heavy; Aang's movements slow as the duel grinds to a standstill.",
      "Aang's breathing steadies, searching for a sign to break the impasse.",
      "Neither side gives ground—Aang's patience and resolve are put to the test.",
      "A gentle breeze circles the arena as Aang silently contemplates his next move.",
      "Aang glances at his opponent, both locked in mutual caution.",
      "Time stretches thin; Aang feels the weight of stillness in every muscle."
    ]
  },
  Clash: {
    trigger: [
      "The clash continues, neither side yielding.",
      "Every move leaves its mark, but nothing is settled.",
      "Each moment brings new danger.",
      "Aang meets the attack head-on, air swirling as force collides with force.",
      "A shockwave rattles the ground as Aang's defense holds steady.",
      "Sparks of energy dance where Aang's strike meets resistance.",
      "Aang pivots mid-air, redirecting the assault with a precise motion.",
      "Momentum surges—Aang bends wind and willpower to counter the blow.",
      "An explosive burst of air flares as Aang parries with all his strength.",
      "Aang's staff and the enemy's power crash, sound ringing in his ears."
    ]
  }
};

/**
 * @fileoverview Contains all narrative line pools specifically for Azula.
 * @description Lines reflect Azula's personality: sharp, dominant, cruel, and obsessed with perfection.
 */

import { CharacterNarrativePool } from '../narrative.types';

export const azulaNarrativePool: CharacterNarrativePool = {
  BasicStrike: {
    hit: [
      "Azula’s fingers spark as her strike lands—precision incarnate.",
      "Blue flame erupts, searing her foe.",
      "She moves with deadly intent, landing each blow."
    ],
    miss: [
      "Azula scoffs, annoyed by the miss.",
      "A rare lapse, gone as soon as it appears.",
      "The fire whips past—Azula never misses for long."
    ]
  },
  Lightning: {
    hit: [
      "A jagged bolt leaps from Azula’s hand, cracking the air.",
      "Her eyes narrow; lightning answers her will.",
      "The heavens split—her opponent writhes."
    ],
    miss: [
      "The lightning fizzles, her focus slipping.",
      "She grits her teeth; the next will not fail.",
      "Static crackles, but nothing strikes."
    ]
  },
  Reversal: {
    trigger: [
      "Azula twists, turning weakness to strength.",
      "She lashes back, relentless.",
      "No advantage goes unclaimed."
    ]
  },
  ForcedEscalation: {
    trigger: [
      "Azula smiles—she thrives on chaos.",
      "The more desperate the fight, the sharper her edge.",
      "Escalation? She welcomes it.",
      "Azula’s eyes flash with anticipation—she lives for moments like this.",
      "The air crackles as Azula prepares to unleash her full fury.",
      "She relishes the rising stakes, eager to prove her dominance.",
      "Azula’s laughter rings out, echoing the chaos she creates.",
      "A surge of blue fire signals Azula’s intent to end it all.",
      "Her confidence grows with every escalation—she is unstoppable.",
      "Azula’s ambition burns brighter than the flames she commands."
    ]
  },
  DesperationTrigger: {
    trigger: [
      "Azula’s grin widens, eyes wild with anticipation.",
      "Cornered, her flames burn hotter.",
      "Desperation brings out her true cruelty.",
      "Azula’s laughter rings out—she’s never more dangerous than when pressed to the edge.",
      "With every setback, her resolve hardens and her attacks grow more vicious.",
      "She channels her rage into a final, devastating assault.",
      "Azula’s fury is a weapon—she will not be denied.",
      "The battlefield trembles as Azula’s desperation ignites.",
      "Her eyes blaze with a cold, unyielding fire.",
      "Azula’s pride refuses to let her fall without a fight."
    ]
  },
  Finisher: {
    victory: [
      "Azula stands victorious—untouchable, unstoppable.",
      "She basks in the ruin she wrought.",
      "Victory is her birthright.",
      "Azula’s final attack is a spectacle of power and precision—her enemy falls, utterly defeated.",
      "The arena glows with blue fire as Azula claims her triumph.",
      "She surveys the aftermath, satisfied that none can challenge her reign.",
      "Azula’s victory is absolute—her legend grows with every battle.",
      "The flames dance in celebration of Azula’s dominance.",
      "She offers no mercy, only the certainty of her rule.",
      "Azula’s name echoes through the arena, a warning to all challengers."
    ],
    fail: [
      "Azula snarls, pride wounded, fire guttering.",
      "Her confidence shatters; defeat is unthinkable.",
      "She falls, but vengeance simmers.",
      "Azula’s last gambit fails—her fury is all that remains.",
      "The flames die down, but her ambition burns on.",
      "She collapses, plotting her return even in defeat.",
      "Azula’s defeat is met with silence—her wrath is not spent.",
      "The embers of her ambition refuse to die.",
      "She lies still, but her eyes promise retribution.",
      "Azula’s loss is a lesson in the cost of hubris."
    ]
  },
  Stalemate: {
    trigger: [
      "This is tiresome. End it, or I will.",
      "Azula’s patience wears thinner than her mercy.",
      "A stalemate? How… disappointing.",
      "Azula's eyes narrow; her flames flicker in anticipation of a breakthrough.",
      "Stillness blankets the field, Azula's patience matched only by her cunning.",
      "Azula stalks her opponent in a slow circle, waiting for the smallest mistake.",
      "The heat between them intensifies as Azula weighs her next move.",
      "Azula’s breathing is silent, every muscle coiled for a sudden strike.",
      "A hint of frustration flashes in Azula’s gaze as the stalemate drags on.",
      "Azula twirls a blue flame on her finger, masking her growing impatience."
    ]
  },
  Clash: {
    trigger: [
      "The clash continues, neither side yielding.",
      "Every move leaves its mark, but nothing is settled.",
      "Each moment brings new danger.",
      "Lightning crackles as Azula hurls power into the fray, colliding mid-battle.",
      "Azula’s flames surge, clashing with her foe in a spectacular display.",
      "A burst of blue fire erupts as Azula meets the attack with ruthless precision.",
      "Azula spins, parrying with a searing arc that splits the air.",
      "The ground scorches beneath Azula’s feet as she holds her ground.",
      "Azula’s hands move in a blur, fire meeting force in a storm of energy.",
      "Azula smiles coldly, relishing the fury of the head-on collision."
    ]
  }
};

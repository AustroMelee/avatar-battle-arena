// Used via dynamic registry in Narrative engine. See SYSTEM ARCHITECTURE.MD for flow.
/**
 * @fileoverview Generates high-quality procedural narrative lines as a fallback.
 * @description This is used when a specific narrative pool is missing or empty, ensuring the engine never fails.
 */

import { CharacterName, CombatMechanic, NarrativeContext } from '../narrative.types';

// Templates for different contexts to create more natural-sounding lines.
const templates = {
  hit: [
    "{character} unleashes {mechanic}, landing a solid blow!",
    "With great force, {character}'s {mechanic} finds its mark.",
    "The {mechanic} connects, staggering the opponent!",
  ],
  miss: [
    "{character} attempts {mechanic}, but the attack goes wide.",
    "The {mechanic} fails to connect, a narrow miss!",
    "A swift dodge from the opponent makes the {mechanic} miss.",
  ],
  trigger: [
    "{character} channels their energy, preparing for {mechanic}!",
    "The tide of battle shifts as {character} triggers {mechanic}!",
    "A look of determination crosses {character}'s face as they initiate {mechanic}.",
  ],
  victory: [
    "With a final, decisive {mechanic}, {character} stands victorious!",
    "The battle concludes as {character}'s {mechanic} seals their win.",
    "And that's it! {character} wins the duel with a masterful {mechanic}."
  ],
  default: [
    "{character} uses {mechanic} in the heat of battle.",
    "The focus is on {character} as they use {mechanic}.",
  ],
};

/**
 * Creates a formatted, human-readable name for a mechanic from its ID.
 * e.g., "ChargedAirTornado" -> "a Charged Air Tornado"
 * @param mechanic - The CombatMechanic ID.
 * @returns A formatted string.
 */
function formatMechanicName(mechanic: CombatMechanic): string {
  const spaced = mechanic.replace(/([A-Z])/g, ' $1').trim();
  const article = ['A', 'E', 'I', 'O', 'U'].includes(spaced[0].toUpperCase()) ? 'an' : 'a';
  return `${article} ${spaced}`;
}

/**
 * Generates a procedural fallback narrative line.
 * @param characterName - The name of the character performing the action.
 * @param mechanic - The combat mechanic being used.
 * @param context - The context of the action.
 * @returns A high-quality, procedurally generated narrative line.
 */
export function generateFallbackLine(
  characterName: CharacterName,
  mechanic: CombatMechanic,
  context: NarrativeContext
): string {
  // Select the appropriate template pool, or use default.
  const templatePool = templates[context as keyof typeof templates] || templates.default;
  
  // Choose a random template from the pool.
  const template = templatePool[Math.floor(Math.random() * templatePool.length)];
  
  // Format the mechanic name for readability.
  const formattedMechanic = formatMechanicName(mechanic);

  // Replace placeholders and return the final line.
  return template
    .replace('{character}', characterName)
    .replace('{mechanic}', formattedMechanic);
}

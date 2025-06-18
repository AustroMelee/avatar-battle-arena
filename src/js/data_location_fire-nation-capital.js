"use strict";

/**
 * @typedef {object} LocationEnvironmentalModifiers
 * @property {object} [air] - Modifiers for airbending in this location.
 * @property {number} [air.damage] - Damage modifier.
 * @property {number} [air.energy] - Energy cost modifier.
 * @property {string} [air.reason] - Explanation for the modifier.
 * @property {object} [fire] - Modifiers for firebending.
 * @property {number} [fire.damage] - Damage modifier.
 * @property {number} [fire.energy] - Energy cost modifier.
 * @property {string} [fire.reason] - Explanation for the modifier.
 * @property {object} [earth] - Modifiers for earthbending.
 * @property {number} [earth.damage] - Damage modifier.
 * @property {number} [earth.energy] - Energy cost modifier.
 * @property {string} [earth.reason] - Explanation for the modifier.
 * @property {object} [water] - Modifiers for waterbending.
 * @property {number} [water.damage] - Damage modifier.
 * @property {number} [water.energy] - Energy cost modifier.
 * @property {string} [water.reason] - Explanation for the modifier.
 * @property {object} [ice] - Modifiers for icebending (part of waterbending, but separate for detail).
 * @property {number} [ice.damage] - Damage modifier.
 * @property {number} [ice.energy] - Energy cost modifier.
 * @property {string} [ice.reason] - Explanation for the modifier.
 * @property {object} [physical] - Modifiers for physical attacks.
 * @property {number} [physical.damage] - Damage modifier.
 * @property {number} [physical.energy] - Energy cost modifier.
 * @property {string} [physical.reason] - Explanation for the modifier.
 * @property {object} [mobility_move] - Modifiers for mobility-focused moves.
 * @property {number} [mobility_move.damage] - Damage modifier.
 * @property {number} [mobility_move.energy] - Energy cost modifier.
 * @property {string} [mobility_move.reason] - Explanation for the modifier.
 * @property {object} [evasive] - Modifiers for evasive moves.
 * @property {number} [evasive.damage] - Damage modifier.
 * @property {number} [evasive.energy] - Energy cost modifier.
 * @property {string} [evasive.reason] - Explanation for the modifier.
 * @property {object} [ranged_attack] - Modifiers for ranged attacks.
 * @property {number} [ranged_attack.damage] - Damage modifier.
 * @property {number} [ranged_attack.energy] - Energy cost modifier.
 * @property {string} [ranged_attack.reason] - Explanation for the modifier.
 */

/**
 * @typedef {object} LocationData
 * @property {string} id - Unique identifier for the location.
 * @property {string} name - Display name of the location.
 * @property {string} description - A brief description of the location.
 * @property {string} envDescription - A phrase describing the environment within the location for narrative use.
 * @property {string[]} envImpactVariants - Short phrases describing environmental impacts within this location.
 * @property {string[]} envImpactInitial - Initial phrases describing environmental impacts within this location.
 * @property {string[]} envImpactMid - Mid phrases describing environmental impacts within this location.
 * @property {string[]} envImpactLate - Late phrases describing environmental impacts within this location.
 * @property {string[]} envImpactCritical - Critical phrases describing environmental impacts within this location.
 * @property {string[]} envTags - An array of tags describing the environment (e.g., 'urban', 'fiery').
 * @property {LocationEnvironmentalModifiers} environmentalModifiers - Modifiers applied to moves based on element or move type.
 * @property {number} fragility - A numerical value representing how easily the environment takes collateral damage.
 * @property {string} background - URL to a background image for the location.
 */

/**
 * The data for the Fire Nation Capital location.
 * @type {LocationData}
 */
export const fireNationCapital = {
    id: "fire-nation-capital",
    name: "Fire Nation Capital",
    description: "The heart of the Fire Nation, a city built in a volcanic caldera, teeming with industrial might and imperial architecture.",
    envDescription: "the grand, volcanic plaza of the Fire Nation Capital",
    envImpactVariants: [
        "The plaza shudders as stone fragments fly.",
        "Red banners whip in the sudden blast.",
        "Ash falls softly, settling on the scorched tiles."
    ],
    envImpactInitial: [
        "Dust motes dance in the disturbed air.",
        "A distant clang echoes through the plaza.",
        "Minor cracks spiderweb across the nearby paving stones.",
        "A light breeze picks up, rustling the ceremonial banners."
    ],
    envImpactMid: [
        "Stone fragments scatter across the ground.",
        "The air crackles with residual energy.",
        "Deep fissures appear in the plaza's surface.",
        "Nearby structures groan under the strain.",
        "The scent of ozone and scorched earth hangs heavy."
    ],
    envImpactLate: [
        "The very ground groans, threatening to collapse.",
        "Flames lick erratically at nearby pillars, casting dancing shadows.",
        "Massive chunks of debris are hurled across the arena.",
        "The air is thick with dust and the stench of destruction.",
        "The architectural grandeur begins to crumble under the relentless assault."
    ],
    envImpactCritical: [
        "A violent tremor shakes the entire plaza, nearly unbalancing the combatants!",
        "A section of a nearby building crumbles into dust with a deafening roar!",
        "The air screams with displaced force, a vortex of elemental power!",
        "The ground ruptures, molten rock briefly visible beneath the surface before sealing!"
    ],
    envTags: ["urban", "fiery", "volcanic", "stone", "imperial"],
    environmentalModifiers: {
        air: { damage: -15, energy: 10, reason: "The oppressive, controlled environment stifles free-flowing air currents." },
        fire: { damage: 20, energy: -15, reason: "The heart of the Fire Nation empowers its benders." },
        earth: { damage: 10, energy: -5, reason: "The paved streets and stone structures are prime for earthbending." },
        water: { damage: -25, energy: 20, reason: "Water is scarce, limited to decorative fountains." },
        ice: { damage: -30, energy: 25, reason: "Icebending is difficult with limited water and warm climate." },
        physical: { damage: 5, energy: 0, reason: "The open plaza is a straightforward combat arena." },
        mobility_move: { damage: -10, energy: 5, reason: "The open space offers little for complex maneuvering." },
        evasive: { damage: -15, energy: 10, reason: "Lack of cover makes evasion challenging." },
        ranged_attack: { damage: 15, energy: -10, reason: "The wide-open plaza favors long-range attacks." }
    },
    characterMoveAdjustments: {
        "aang-airbending-only": {
            "Cyclone Vortex": { energyCostModifier: 0.5, description: "Aang's aversion to collateral damage makes large-scale airbending costly in the capital." }
        },
        "azula": {
            "Lightning Generation": { energyCostModifier: 0.5, description: "Azula's desire to preserve her capital makes powerful, destructive lightning attacks taxing." },
            "Tactical Reposition": { energyCostModifier: 0.7, description: "Azula fluidly navigates her home city, making tactical repositioning almost effortless." },
            "Feinting Ember Step": { energyCostModifier: 0.7, description: "Azula uses the urban landscape to her advantage for swift, deceptive movements." }
        }
    },
    damageThresholds: {
        minor: 10,
        moderate: 25,
        severe: 50,
        catastrophic: 75
    },
    fragility: 60,
    background: "img/img_caldera.jpg",
}; 
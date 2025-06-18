"use strict";

// ====================================================================================
//  Move Interaction Matrix (v5 - Stripped Down for Aang vs. Azula)
// ====================================================================================
//  This file defines all strategic interactions for the current matchup.
// ====================================================================================

// ============================================================
//  PUNISHABLE MOVES
// ============================================================
// Defines moves that require an "opening." If used without one, they receive a massive penalty.
export const punishableMoves = {
    "Lightning Generation": {
        penalty: 0.2, // Move operates at 20% effectiveness if punished
        openingConditions: ["defender_is_stunned", "defender_momentum_negative", "defender_last_move_weak"],
        narration: "{attacker}'s Lightning Generation was punished as {defender} presented no clear opening."
    }
};

export const effectivenessLevels = {
    WEAK:       { label: "Weak",       emoji: "🛡️", value: 0.5 },
    NORMAL:     { label: "Normal",     emoji: "⚔️", value: 1.0 },
    STRONG:     { label: "Strong",     emoji: "🔥", value: 1.5 },
    CRITICAL:   { label: "Critical",   emoji: "💥", value: 2.0 }
};


export const moveInteractionMatrix = {

    // ============================================================
    //  AANG (Airbending Only)
    // ============================================================
    "Air Scooter": {
        counters: {}, // Counters removed as they reference moves from other characters
        actionVariants: [
            { text: "${actorName} glides gracefully on ${actorPronounS} air scooter.", tags: [] },
            { text: "${actorName} zips around on an air scooter.", tags: [] },
            { text: "${actorName} maneuvers quickly with ${actorPronounS} air scooter.", tags: [] },
            { text: "${actorName} dances across the battlefield on a sphere of swirling air, light as a feather.", tags: ["metaphor"], personalityTriggers: { creativity: 0.6 } },
            { text: "${actorName} evades with effortless agility on ${actorPronounS} iconic air-ball.", tags: ["evasive", "skill"] },
            { text: "${actorName} misjudges a turn on ${actorPronounS} air scooter, stumbling for a moment!", tags: ["miss", "humor"] }
        ],
        isVerbPhrase: false,
        collateralImpact: "low"
    },
    "Air Blast": {
        counters: {
            "Fire Whip": 1.2, // Can dissipate channeled, thin fire attacks
        },
        actionVariants: [
            { text: "${actorName} launches a focused air blast.", tags: [] },
            { text: "${actorName} pushes with a strong gust of wind.", tags: [] },
            { text: "${actorName} propels a concussive wave of air, like an invisible fist!", tags: ["metaphor", "strong_hit"], personalityTriggers: { aggression: 0.6 } },
            { text: "${actorName}'s air blast goes wide, merely ruffling ${targetName}'s clothes.", tags: ["miss", "humor"] },
            { text: "A perfectly timed air blast from ${actorName} sends ${targetName} sprawling!", tags: ["crit"] }
        ],
        isVerbPhrase: false,
        collateralImpact: "medium"
    },
    "Wind Shield": {
        counters: {
            "Blue Fire Daggers": 1.2,
        },
        actionVariants: [
            { text: "${actorName} forms a protective wind shield.", tags: [] },
            { text: "${actorName} conjures a swirling barrier of air.", tags: [] },
            { text: "${actorName} creates a shimmering, transparent wall of wind, deflecting all!", tags: ["defensive", "skill"] },
            { text: "${actorName}'s wind shield flickers, almost failing against the onslaught.", tags: ["fail", "tension"] }
        ],
        isVerbPhrase: false,
        collateralImpact: "low"
    },
    "Tornado Whirl": {
        counters: {
            "Flame Whips": 1.4, "Fire Daggers": 1.3, // Snuffs out smaller fire attacks
        },
        actionVariants: [
            { text: "${actorName} creates a powerful tornado whirl.", tags: [] },
            { text: "${actorName} spins into a rapidly moving vortex.", tags: [] },
            { text: "${actorName} becomes the eye of a storm, deflecting all around ${actorPronounO} with ease.", tags: ["metaphor", "defensive", "aoe"] },
            { text: "${actorName}'s tornado whirl loses cohesion, dissipating harmlessly.", tags: ["miss", "fail"] }
        ],
        isVerbPhrase: false,
        collateralImpact: "medium"
    },

    // ============================================================
    //  AZULA
    // ============================================================
    "Blue Fire Daggers": {
        counters: {
            "Gust Push": 1.3, "Tornado Whirl": 1.2, // Pierces air currents
        },
        actionVariants: [
            { text: "${actorName} hurls blue fire daggers.", tags: [] },
            { text: "${actorName} throws precise bursts of blue flame.", tags: [] },
            { text: "${actorName} sends forth a volley of intensely hot, azure flames, like a shower of falling stars!", tags: ["metaphor", "aggressive", "crit"] },
            { text: "${actorName}'s blue fire daggers dissipate, a rare lapse in her precision.", tags: ["miss", "fail"] }
        ],
        isVerbPhrase: false,
        collateralImpact: "low"
    },
    "Lightning Generation": {
        /* Punishable Move */
        actionVariants: [
            { text: "${actorName} generates crackling lightning.", tags: [] },
            { text: "${actorName} unleashes a bolt of pure lightning.", tags: [] },
            { text: "${actorName} summons a brilliant, arcing bolt of electrical energy, a true force of nature!", tags: ["metaphor", "finisher", "aggressive"] },
            { text: "${actorName}'s lightning crackles harmlessly, failing to connect.", tags: ["miss", "fail"] }
        ],
        isVerbPhrase: false,
        collateralImpact: "high"
    },
    "Flame Burst": { // Reactive defense
        counters: {
            "Air Blast": 1.1,
        },
        actionVariants: [
            { text: "${actorName} releases a defensive flame burst.", tags: [] },
            { text: "${actorName} erupts with a sudden burst of fire.", tags: [] },
            { text: "${actorName} detonates a concussive nova of flames around ${actorPronounO}self, a fiery shield!", tags: ["metaphor", "defensive"] },
            { text: "${actorName}'s flame burst sputters, leaving ${actorPronounO} momentarily exposed.", tags: ["fail", "tension"] }
        ],
        isVerbPhrase: false,
        collateralImpact: "medium"
    },

    // ============================================================
    //  GENERIC MOVES (If any are kept)
    // ============================================================
    "Nimble Repositioning": {
        actionVariants: [
            { text: "${actorName} executes a nimble repositioning.", tags: [] },
            { text: "${actorName} repositions with agile footwork.", tags: [] },
            { text: "${actorName} moves into a more advantageous spot.", tags: [] },
            { text: "${actorName} shifts swiftly, finding a superior tactical position, like a shadow in the night!", tags: ["metaphor", "evasive", "skill"] },
            { text: "${actorName} dances around the opponent, seeking an opening.", tags: ["evasive", "opportunistic"] },
            { text: "${actorName} utilizes quick, evasive steps to gain the upper hand.", tags: ["evasive"] },
            { text: "${actorName} fluidly changes position, anticipating the next move.", tags: ["skill", "evasive", "reposition"] },
            { text: "${actorName}'s repositioning is clumsy, leaving ${actorPronounO} briefly exposed.", tags: ["fail", "tension"] },
            { text: "With unmatched agility, ${actorName} perfectly repositions, gaining a critical advantage!", tags: ["crit", "evasive"] }
        ],
        isVerbPhrase: false,
        collateralImpact: "none" // Repositioning usually doesn't cause environmental damage
    }
};
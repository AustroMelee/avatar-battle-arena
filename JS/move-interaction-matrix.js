'use strict';

// ====================================================================================
//  Move Interaction Matrix (v4 - Punishable Moves & Exhaustive Brute-Force Edition)
// ====================================================================================
//  This file defines all strategic interactions. It includes two major components:
//  1. The `punishableMoves` object: Defines high-risk, high-reward moves that are
//     heavily penalized if used without a proper opening.
//  2. The `moveInteractionMatrix` object: Defines standard move-vs-move counters.
// ====================================================================================

// Define shared counter objects first to avoid self-reference errors during object creation.
const pressurePointCounters = {
    'Rock Armor': 1.7, 'Fire Shield': 1.5, 'Water Shield': 1.5,
    'Octopus Form': 1.4, 'Defensive Stance': 2.0, // A simple block is useless
};

// ============================================================
//  PUNISHABLE MOVES
// ============================================================
// Defines moves that require an "opening." If used without one, they receive a massive penalty.
export const punishableMoves = {
    'Lightning Generation': {
        penalty: 0.2, // Move operates at 20% effectiveness if punished
        openingConditions: ['defender_is_stunned', 'defender_momentum_negative', 'defender_last_move_weak'],
        narration: "{attacker}'s Lightning Generation was punished as {defender} presented no clear opening."
    },
    'Emperor\'s Wrath': { // Ozai's finisher has a similar but less severe requirement
        penalty: 0.3,
        openingConditions: ['defender_is_stunned', 'defender_momentum_negative', 'defender_last_move_weak'],
        narration: "{attacker}'s Emperor's Wrath was predictable, allowing {defender} to mitigate the attack."
    },
    'Bloodbending': {
        penalty: 0.1, // Almost useless without the right timing
        openingConditions: ['defender_is_stunned', 'defender_last_move_weak', 'defender_is_channeled'],
        narration: "{defender}'s focused will allowed them to resist {attacker}'s Bloodbending attempt."
    },
    'Tidal Wave': {
        penalty: 0.25,
        openingConditions: ['defender_is_stunned', 'defender_momentum_negative', 'attacker_has_setup'],
        narration: "{attacker} was interrupted while trying to summon a Tidal Wave."
    },
    'Rock Avalanche': {
        penalty: 0.3,
        openingConditions: ['defender_is_stunned', 'defender_momentum_negative', 'attacker_has_setup'],
        narration: "{attacker} couldn't gather enough earth for a full Rock Avalanche, resulting in a minor tremor."
    },
    'Rock Coffin': {
        penalty: 0.4,
        openingConditions: ['defender_is_stunned', 'defender_last_move_weak', 'attacker_has_setup'],
        narration: "{defender}'s mobility prevented {attacker} from fully executing the Rock Coffin."
    },
    'Octopus Form': {
        penalty: 0.5,
        openingConditions: ['defender_is_stunned', 'attacker_has_setup'],
        narration: "{attacker} failed to establish the Octopus Form before {defender}'s next move."
    },
    'Rock Armor': {
        penalty: 0.6, // Less of a penalty as it's purely defensive
        openingConditions: ['defender_last_move_weak', 'attacker_has_setup'],
        narration: "{attacker}'s Rock Armor formed incompletely due to the lack of a proper opening."
    },
    'Reluctant Finale': {
        penalty: 0.4,
        openingConditions: ['defender_is_stunned', 'defender_momentum_negative', 'defender_last_move_weak'],
        narration: "{attacker}'s reluctance and lack of focus weakened the final attack."
    },
};


export const moveInteractionMatrix = {

    // ============================================================
    //  AANG (Airbending Only)
    // ============================================================
    'Air Scooter': {
        counters: {
            'Boulder Throw': 1.6, 'Rock Avalanche': 1.5, 'Earth Wave': 1.5, // High mobility evades slow, large-scale earth attacks
            'Seismic Slam': 1.4, 'Ground Spike': 1.3, // Evades ground-based attacks
            'Sword Strike': 1.3, 'Pressure Point Strike': 1.3, // Maintains distance from melee attackers
            'Fire Comet': 1.2, // Can dodge a telegraphed projectile
        },
    },
    'Air Blast': {
        counters: {
            'Boomerang Throw': 1.3, 'Knife Barrage': 1.2, // Can deflect projectiles
            'Fire Whip': 1.2, 'Flame Whips': 1.2, // Can dissipate channeled, thin fire attacks
            'Mist Cloud': 1.5, // Blows away the mist
        },
    },
    'Wind Shield': {
        counters: {
            'Boomerang Throw': 1.4, 'Knife Barrage': 1.4, 'Ricochet Shot': 1.2, // Excellent vs. standard projectiles
            'Fire Daggers': 1.3, 'Blue Fire Daggers': 1.2, 'Ice Spears': 1.2, // Deflects elemental projectiles
            'Water Stream': 1.5, // Disperses weak water attacks
        },
    },
    'Tornado Whirl': {
        counters: {
            'Flame Whips': 1.4, 'Fire Daggers': 1.3, // Snuffs out smaller fire attacks
            'Knife Barrage': 1.3, 'Boomerang Throw': 1.3, // Sucks in and redirects projectiles
            'Pressure Point Strike': 1.4, 'Sword Strike': 1.4, // Keeps melee attackers at bay
            'Mist Cloud': 1.8, // Sucks up and disperses the mist entirely
        },
    },

    // ============================================================
    //  KATARA
    // ============================================================
    'Water Whip': {
        counters: {
            'Fire Whip': 1.3, 'Flame Whips': 1.3, 'Fire Daggers': 1.2, // Douses fire
            'Ground Spike': 1.2, // Erodes rock
            'Sword Strike': 1.2, 'Boomerang Throw': 1.1, // Can catch/deflect physical attacks
        },
    },
    'Ice Spears': {
        counters: {
            'Water Whip': 1.4, 'Canteen Whip': 1.5, // Freezes the opposing water attack
            'Air Blast': 1.2, 'Gust Push': 1.2, // Pierces through air currents with mass
            'Earth Wave': 1.2, // Pierces through loose earth
            'Acrobatic Flips': 1.2, // Harder for a purely evasive move to dodge a volley
        },
    },
    'Water Shield': {
        counters: {
            'Fire Daggers': 1.5, 'Blue Fire Daggers': 1.4, 'Fire Comet': 1.2, // Extinguishes
            'Knife Barrage': 1.6, 'Boomerang Throw': 1.6, 'Ricochet Shot': 1.3, // Catches projectiles
            'Boulder Throw': 1.2, // A strong shield can slow or stop a boulder
            'Air Blast': 1.1, // Solid water has more mass than air
        },
    },
    'Ice Prison': {
        counters: {
            'Air Scooter': 1.5, 'Acrobatic Flips': 1.4, // Traps mobile but ground-based opponents
            'Pressure Point Strike': 1.6, 'Chi-Blocking Flurry': 1.6, // Creates distance, preventing melee strikes
            'Sword Strike': 1.5, 'Flame Sword': 1.4,
        },
    },
    'Tidal Wave': { /* Punishable Move */ },
    'Bloodbending': { /* Punishable Move */ },

    // ============================================================
    //  ZUKO
    // ============================================================
    'Fire Daggers': { counters: { 'Ice Spears': 1.2, 'Ice Prison': 1.2, 'Air Blast': 1.1, 'Gust Push': 1.1 } },
    'Flame Sword': {
        counters: {
            'Water Whip': 1.2, // Can evaporate parts of the whip on contact
            'Ice Spears': 1.3, // Smashes through ice projectiles
            'Sword Strike': 1.1, // A flaming sword has an advantage
        },
    },
    'Fire Shield': {
        counters: {
            'Ice Spears': 1.4, 'Ice Darts': 1.5, // Melts ice projectiles
            'Boomerang Throw': 1.2, 'Knife Barrage': 1.2, // Can melt/deflect physical projectiles
            'Air Blast': 1.1, // A hot shield disperses air
        },
    },
    'Dragon\'s Breath': {
        counters: { 'Ice Armor': 1.5, 'Water Shield': 1.2, 'Tornado Whirl': 1.3, 'Air Blast': 1.4 }, // Overpowers and consumes lesser elemental attacks
    },

    // ============================================================
    //  TOPH
    // ============================================================
    'Earth Wave': { counters: { 'Fire Whip': 1.2, 'Gust Push': 1.3, 'Water Stream': 1.4 } }, // Grounds fire, too heavy for wind, absorbs weak water
    'Rock Armor': { /* Punishable Move */ },
    'Seismic Slam': {
        counters: {
            'Air Scooter': 1.4, 'Acrobatic Flips': 1.4, // Knocks mobile opponents off their feet
            'Rock Coffin': 1.3, 'Ice Prison': 1.3, 'Fire Wall': 1.2, // Destroys constructs from below
            'Wind Shield': 1.5, 'Water Shield': 1.3, // Goes under shields
            'Defensive Stance': 1.8, // Bypasses a simple block
        },
    },
    'Metal Bending': {
        counters: {
            'Rock Armor': 1.3, // Exploits impurities
            'Sword Strike': 2.5, 'Boomerang Throw': 2.5, 'Knife Barrage': 2.5, 'Pinning Strike': 2.5, // Complete control over metal projectiles/weapons
            'Rock Coffin': 1.2, // Breaches rock with metal shards
            'Canteen Whip': 1.5, // Can capture/crush a metal canteen
        },
    },
    'Boulder Throw': { counters: { 'Ice Spears': 1.3, 'Wind Shield': 1.4, 'Fire Shield': 1.3, 'Air Blast': 1.2 } },
    'Rock Coffin': { /* Punishable Move */ },

    // ============================================================
    //  AZULA
    // ============================================================
    'Blue Fire Daggers': {
        counters: {
            'Ice Spears': 1.4, 'Ice Prison': 1.4, // Hotter fire, more effective
            'Dragon\'s Breath': 1.2, // Precision and heat > raw, wider flame
            'Gust Push': 1.3, 'Tornado Whirl': 1.2, // Pierces air currents
        },
    },
    'Lightning Generation': { /* Punishable Move */ },
    'Flame Burst': { // Reactive defense
        counters: {
            'Sword Strike': 1.5, 'Pressure Point Strike': 1.5, 'Chi-Blocking Flurry': 1.4, // Repels close-range attackers
            'Ice Spears': 1.3, 'Water Whip': 1.2, // Evaporates incoming attacks
            'Pinning Strike': 1.3, // Melts incoming knives
        },
    },

    // ============================================================
    //  NON-BENDERS & OTHER
    // ============================================================
    'Pressure Point Strike': {
        counters: pressurePointCounters,
    },
    'Pinning Strike': { // Mai's specialty
        counters: {
            'Water Whip': 1.6, 'Flame Whips': 1.6, 'Fire Whip': 1.6, // Pins the limb, stopping the channeled attack
            'Octopus Form': 1.5, // Can pin tentacles to a surface
            'Air Blast': 1.3, // Knife has more piercing power than a non-lethal gust
            'Tactical Positioning': 1.4, // Pins the opponent in place, preventing repositioning
        },
    },
    'Ricochet Shot': {
        counters: {
            'Water Shield': 1.4, 'Fire Wall': 1.4, 'Wind Shield': 1.4, 'Knife Wall': 1.4, // Bypasses frontal defenses
            'Rock Armor': 1.2, // Can find gaps from unexpected angles
        },
    },
    'Improvised Trap': { // Sokka
        counters: {
            'Acrobatic Flips': 1.3, 'Air Scooter': 1.3, // Anticipates movement paths
            'Tactical Positioning': 1.5, // Cuts off escape routes
        },
    },

    // ============================================================
    //  CROSS-CHARACTER FINISHERS
    // ============================================================
    'Emperor\'s Wrath': { /* Punishable Move */ },
    'Redemption\'s Fury': { // Zuko
        counters: { 'Precision Strike': 1.2 }, // Flurry overwhelms a single focused blast
    },
    'Final Pin': { // Mai
        counters: { 'Graceful Dodge': 1.4, 'Acrobatic Flips': 1.4 }, // Area denial is hard to evade
    },
    'Chi-Blocking Flurry': { // Ty Lee
        counters: {
            ...pressurePointCounters, // Inherits all benefits from its base move
            'Seismic Slam': 1.5, // Flips over the shockwave to deliver the final blows
            'Redemption\'s Fury': 1.3, // Gets inside the flurry to disable the attacker
        },
    }
};
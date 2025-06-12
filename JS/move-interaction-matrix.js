// FILE: move-interaction-matrix.js
'use strict';

// ====================================================================================
//  Move Interaction Matrix (v3.1 - Corrected Brute-Force Edition)
// ====================================================================================
//  This matrix defines weighted interactions between specific moves.
//  The system is bi-directional. The 'counters' property is the source of truth.
//  The goal of this version is to exhaustively define all logical interactions for
//  the current character roster to eliminate the need for future incremental updates.
//
//  HOW IT WORKS:
//  - If Move A has `counters: { 'Move B': 1.3 }`, then Move A gets a 1.3x bonus
//    when used immediately after an opponent uses Move B.
//  - The engine AUTOMATICALLY calculates the inverse. When Move B is used against
//    Move A, it will receive a penalty (1 / 1.3x ≈ 0.77x).
//  - This file is organized by CHARACTER for maximum clarity and exhaustive listing.
// ====================================================================================


// Define shared counter objects first to avoid self-reference errors during object creation.
const pressurePointCounters = {
    'Rock Armor': 1.7,
    'Fire Shield': 1.5,
    'Water Shield': 1.5,
    'Octopus Form': 1.4,
    'Defensive Stance': 2.0, // A simple block is useless
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
    'Tidal Wave': {
        counters: {
            'Flame Tornado': 1.6, 'Controlled Inferno': 1.5, 'Dragon\'s Roar': 1.4, 'Fire Wall': 1.5, // Overwhelming dousing power
            'Rock Avalanche': 1.3, 'Terrain Reshape': 1.3, // Washes away the debris field
            'Knife Wall': 1.8, 'Improvised Trap': 1.8, // Destroys ground-based constructs/traps
        },
    },
    'Bloodbending': {
        counters: { /* See characters.js for tag-based logic; defined here for clarity. Counters almost every physical move. */ },
    },

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
    'Rock Armor': {
        counters: {
            'Sword Strike': 1.6, 'Boomerang Throw': 1.6, 'Knife Barrage': 1.6, // Impervious to simple physical attacks
            'Fire Whip': 1.3, 'Water Whip': 1.2, // Physical armor is resistant to elemental whips
            'Air Blast': 1.4, 'Gust Push': 1.5, // Too heavy to be pushed
        },
    },
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
    'Rock Coffin': { counters: { 'Ground Spike': 1.3, 'Pressure Point Strike': 1.5, 'Flame Sword': 1.4 } },

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
    'Lightning Generation': {
        counters: {
            'Water Whip': 1.6, 'Tidal Wave': 1.4, 'Water Shield': 1.5, // Electrifies water
            'Air Scooter': 1.6, 'Gust Push': 1.5, 'Wind Shield': 1.4, // Instantaneous, bypasses air defenses
            'Metal Bending': 1.5, // Metal conducts electricity, harming the user
            'Rock Armor': 1.3, 'Rock Coffin': 1.3, // Can shatter rock constructs
            'Octopus Form': 1.5, // Zaps the entire water defense
        },
    },
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
    'Emperor\'s Wrath': { // Ozai
        counters: {
            'Tidal Wave': 1.2, // Can evaporate a significant portion of the wave
            'Rock Avalanche': 1.3, // Can shatter the incoming rocks with sheer force
            'Octopus Form': 1.5, // Overwhelms the water defense completely
            'Reluctant Finale': 1.2, // A greater fire move beats a lesser one
        },
    },
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
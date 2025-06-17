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

export const effectivenessLevels = {
    WEAK:       { label: 'Weak',       emoji: '🛡️', value: 0.5 },
    NORMAL:     { label: 'Normal',     emoji: '⚔️', value: 1.0 },
    STRONG:     { label: 'Strong',     emoji: '🔥', value: 1.5 },
    CRITICAL:   { label: 'Critical',   emoji: '💥', value: 2.0 }
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
        actionVariants: [
            "glides gracefully on his air scooter",
            "zips around on an air scooter",
            "maneuvers quickly with his air scooter",
            "dashes forward on a sphere of air"
        ],
        isVerbPhrase: true
    },
    'Air Blast': {
        counters: {
            'Boomerang Throw': 1.3, 'Knife Barrage': 1.2, // Can deflect projectiles
            'Fire Whip': 1.2, 'Flame Whips': 1.2, // Can dissipate channeled, thin fire attacks
            'Mist Cloud': 1.5, // Blows away the mist
        },
        actionVariants: [
            "launches a focused air blast",
            "sends forth a burst of air",
            "unleashes a concentrated air current",
            "pushes with a strong gust of wind"
        ],
        isVerbPhrase: true
    },
    'Wind Shield': {
        counters: {
            'Boomerang Throw': 1.4, 'Knife Barrage': 1.4, 'Ricochet Shot': 1.2, // Excellent vs. standard projectiles
            'Fire Daggers': 1.3, 'Blue Fire Daggers': 1.2, 'Ice Spears': 1.2, // Deflects elemental projectiles
            'Water Stream': 1.5, // Disperses weak water attacks
        },
        actionVariants: [
            "forms a protective wind shield",
            "conjures a swirling barrier of air",
            "erects an ethereal wind defense"
        ],
        isVerbPhrase: true
    },
    'Tornado Whirl': {
        counters: {
            'Flame Whips': 1.4, 'Fire Daggers': 1.3, // Snuffs out smaller fire attacks
            'Knife Barrage': 1.3, 'Boomerang Throw': 1.3, // Sucks in and redirects projectiles
            'Pressure Point Strike': 1.4, 'Sword Strike': 1.4, // Keeps melee attackers at bay
            'Mist Cloud': 1.8, // Sucks up and disperses the mist entirely
        },
        actionVariants: [
            "creates a powerful tornado whirl",
            "spins into a rapidly moving vortex",
            "generates a miniature cyclone"
        ],
        isVerbPhrase: true
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
        actionVariants: [
            "lashes out with a water whip",
            "snaps a whip of water",
            "strikes with a flowing water whip",
            "sends a torrent of water whipping forward"
        ],
        isVerbPhrase: true
    },
    'Ice Spears': {
        counters: {
            'Water Whip': 1.4, 'Canteen Whip': 1.5, // Freezes the opposing water attack
            'Air Blast': 1.2, 'Gust Push': 1.2, // Pierces through air currents with mass
            'Earth Wave': 1.2, // Pierces through loose earth
            'Acrobatic Flips': 1.2, // Harder for a purely evasive move to dodge a volley
        },
        actionVariants: [
            "hurls a volley of ice spears",
            "conjures and fires sharp ice shards",
            "launches a barrage of frozen projectiles"
        ],
        isVerbPhrase: true
    },
    'Water Shield': {
        counters: {
            'Fire Daggers': 1.5, 'Blue Fire Daggers': 1.4, 'Fire Comet': 1.2, // Extinguishes
            'Knife Barrage': 1.6, 'Boomerang Throw': 1.6, 'Ricochet Shot': 1.3, // Catches projectiles
            'Boulder Throw': 1.2, // A strong shield can slow or stop a boulder
            'Air Blast': 1.1, // Solid water has more mass than air
        },
        actionVariants: [
            "forms a flowing water shield",
            "erects a defensive barrier of water",
            "generates a protective water dome"
        ],
        isVerbPhrase: true
    },
    'Ice Prison': {
        counters: {
            'Air Scooter': 1.5, 'Acrobatic Flips': 1.4, // Traps mobile but ground-based opponents
            'Pressure Point Strike': 1.6, 'Chi-Blocking Flurry': 1.6, // Creates distance, preventing melee strikes
            'Sword Strike': 1.5, 'Flame Sword': 1.4,
        },
        actionVariants: [
            "creates an ice prison",
            "traps with a wall of ice",
            "encases the opponent in a cage of ice"
        ],
        isVerbPhrase: true
    },
    'Tidal Wave': { /* Punishable Move */ },
    'Bloodbending': { /* Punishable Move */ },

    // ============================================================
    //  ZUKO
    // ============================================================
    'Fire Daggers': {
        counters: { 'Ice Spears': 1.2, 'Ice Prison': 1.2, 'Air Blast': 1.1, 'Gust Push': 1.1 },
        actionVariants: [
            "hurls fire daggers",
            "throws sharp bursts of flame",
            "launches precise fire shards"
        ],
        isVerbPhrase: true
    },
    'Flame Sword': {
        counters: {
            'Water Whip': 1.2, // Can evaporate parts of the whip on contact
            'Ice Spears': 1.3, // Smashes through ice projectiles
            'Sword Strike': 1.1, // A flaming sword has an advantage
        },
        actionVariants: [
            "engages with his flaming sword",
            "attacks with a blade of fire",
            "strikes with his fiery saber"
        ],
        isVerbPhrase: true
    },
    'Fire Shield': {
        counters: {
            'Ice Spears': 1.4, 'Ice Darts': 1.5, // Melts ice projectiles
            'Boomerang Throw': 1.2, 'Knife Barrage': 1.2, // Can melt/deflect physical projectiles
            'Air Blast': 1.1, // A hot shield disperses air
        },
        actionVariants: [
            "forms a fire shield",
            "conjures a defensive flame barrier",
            "erects a wall of fire"
        ],
        isVerbPhrase: true
    },
    'Dragon\'s Breath': {
        counters: { 'Ice Armor': 1.5, 'Water Shield': 1.2, 'Tornado Whirl': 1.3, 'Air Blast': 1.4 }, // Overpowers and consumes lesser elemental attacks
        actionVariants: [
            "unleashes a torrent of dragon's breath fire",
            "breathes a stream of powerful flames",
            "incinerates with dragon fire"
        ],
        isVerbPhrase: true
    },

    // ============================================================
    //  TOPH
    // ============================================================
    'Earth Wave': {
        counters: { 'Fire Whip': 1.2, 'Gust Push': 1.3, 'Water Stream': 1.4 }, // Grounds fire, too heavy for wind, absorbs weak water
        actionVariants: [
            "sends forth an earth wave",
            "creates a surging wave of rock",
            "causes the ground to undulate forward"
        ],
        isVerbPhrase: true
    },
    'Rock Armor': {
        /* Punishable Move */
        actionVariants: [
            "dons a protective rock armor",
            "envelops herself in earthen plating",
            "forms a defensive shell of stone"
        ],
        isVerbPhrase: true
    },
    'Seismic Slam': {
        counters: {
            'Air Scooter': 1.4, 'Acrobatic Flips': 1.4, // Knocks mobile opponents off their feet
            'Rock Coffin': 1.3, 'Ice Prison': 1.3, 'Fire Wall': 1.2, // Destroys constructs from below
            'Wind Shield': 1.5, 'Water Shield': 1.3, // Goes under shields
            'Defensive Stance': 1.8, // Bypasses a simple block
        },
        actionVariants: [
            "delivers a seismic slam",
            "causes a localized earthquake",
            "pounds the ground with immense force"
        ],
        isVerbPhrase: true
    },
    'Metal Bending': {
        counters: {
            'Rock Armor': 1.3, // Exploits impurities
            'Sword Strike': 2.5, 'Boomerang Throw': 2.5, 'Knife Barrage': 2.5, 'Pinning Strike': 2.5, // Complete control over metal projectiles/weapons
            'Rock Coffin': 1.2, // Breaches rock with metal shards
            'Canteen Whip': 1.5, // Can capture/crush a metal canteen
        },
        actionVariants: [
            "performs metal bending",
            "manipulates nearby metal objects",
            "flexes her metalbending skill"
        ],
        isVerbPhrase: true
    },
    'Boulder Throw': {
        counters: { 'Ice Spears': 1.3, 'Wind Shield': 1.4, 'Fire Shield': 1.3, 'Air Blast': 1.2 },
        actionVariants: [
            "hurls a massive boulder",
            "launches a large rock projectile",
            "throws a heavy stone"
        ],
        isVerbPhrase: true
    },
    'Rock Coffin': {
        /* Punishable Move */
        actionVariants: [
            "creates a rock coffin",
            "traps the opponent in stone",
            "encases the foe in an earthen cage"
        ],
        isVerbPhrase: true
    },

    // ============================================================
    //  AZULA
    // ============================================================
    'Blue Fire Daggers': {
        counters: {
            'Ice Spears': 1.4, 'Ice Prison': 1.4, // Hotter fire, more effective
            'Dragon\'s Breath': 1.2, // Precision and heat > raw, wider flame
            'Gust Push': 1.3, 'Tornado Whirl': 1.2, // Pierces air currents
        },
        actionVariants: [
            "hurls blue fire daggers",
            "throws precise bursts of blue flame",
            "launches razor-sharp blue fire shards"
        ],
        isVerbPhrase: true
    },
    'Lightning Generation': {
        /* Punishable Move */
        actionVariants: [
            "generates crackling lightning",
            "unleashes a bolt of pure lightning",
            "strikes with controlled electricity"
        ],
        isVerbPhrase: true
    },
    'Flame Burst': { // Reactive defense
        counters: {
            'Sword Strike': 1.5, 'Pressure Point Strike': 1.5, 'Chi-Blocking Flurry': 1.4, // Repels close-range attackers
            'Ice Spears': 1.3, 'Water Whip': 1.2, // Evaporates incoming attacks
            'Pinning Strike': 1.3, // Melts incoming knives
        },
        actionVariants: [
            "releases a defensive flame burst",
            "erupts with a sudden burst of fire",
            "creates a reactive flame explosion"
        ],
        isVerbPhrase: true
    },

    // ============================================================
    //  NON-BENDERS & OTHER
    // ============================================================
    'Pressure Point Strike': {
        counters: pressurePointCounters,
        actionVariants: [
            "delivers a precise pressure point strike",
            "attempts to block chi with a swift jab",
            "targets a vital pressure point"
        ],
        isVerbPhrase: true
    },
    'Pinning Strike': { // Mai's specialty
        counters: {
            'Water Whip': 1.6, 'Flame Whips': 1.6, 'Fire Whip': 1.6, // Pins the limb, stopping the channeled attack
            'Octopus Form': 1.5, // Can pin tentacles to a surface
            'Air Blast': 1.3, // Knife has more piercing power than a non-lethal gust
            'Tactical Positioning': 1.4, // Pins the opponent in place, preventing repositioning
        },
        actionVariants: [
            "executes a pinning strike",
            "throws a knife to pin the opponent",
            "immobilizes with a precise throw"
        ],
        isVerbPhrase: true
    },
    'Ricochet Shot': {
        counters: {
            'Water Shield': 1.4, 'Fire Wall': 1.4, 'Wind Shield': 1.4, 'Knife Wall': 1.4, // Bypasses frontal defenses
            'Rock Armor': 1.2, // Can find gaps from unexpected angles
        },
        actionVariants: [
            "fires a ricochet shot",
            "bounces a projectile off a surface",
            "sends a shot deflecting off an obstacle"
        ],
        isVerbPhrase: true
    },
    'Improvised Trap': { // Sokka
        counters: {
            'Acrobatic Flips': 1.3, 'Air Scooter': 1.3, // Anticipates movement paths
            'Tactical Positioning': 1.5, // Cuts off escape routes
        },
        actionVariants: [
            "devises a clever trap",
            "sets an improvised snare",
            "lays a cunning booby trap"
        ],
        isVerbPhrase: true
    },
    'Acrobatic Flips': {
        actionVariants: [
            "executes a series of acrobatic flips",
            "performs dazzling aerial maneuvers",
            "flips and tumbles with astounding agility"
        ],
        isVerbPhrase: true
    },
    'Nimble Repositioning': {
        actionVariants: [
            "executes a nimble repositioning",
            "repositions with agile footwork",
            "moves into a more advantageous spot"
        ],
        isVerbPhrase: true
    },

    // ============================================================
    //  CROSS-CHARACTER FINISHERS
    // ============================================================
    'Emperor\'s Wrath': { /* Punishable Move */ },
    'Redemption\'s Fury': {
        counters: { 'Precision Strike': 1.2 }, // Flurry overwhelms a single focused blast
        actionVariants: [
            "unleashes Redemption's Fury",
            "erupts with a powerful surge of flame",
            "delivers a furious, redeeming attack"
        ],
        isVerbPhrase: true
    },
    'Final Pin': {
        counters: { 'Graceful Dodge': 1.4, 'Acrobatic Flips': 1.4 }, // Area denial is hard to evade
        actionVariants: [
            "executes a final pinning maneuver",
            "immobilizes the foe with a decisive throw",
            "lands the ultimate pinning strike"
        ],
        isVerbPhrase: true
    },
    'Chi-Blocking Flurry': {
        actionVariants: [
            "delivers a flurry of chi-blocking strikes",
            "unleashes a rapid sequence of chi blocks",
            "assaults with blindingly fast pressure point jabs"
        ],
        isVerbPhrase: true
    },
    'Strikes Vital Pressure Point': {
        actionVariants: [
            "strikes a vital pressure point",
            "lands a precise hit to a critical chi node",
            "targets a crucial pressure point"
        ],
        isVerbPhrase: true
    },
    'Springs Masterfully Constructed Snare Trap': {
        actionVariants: [
            "springs a masterfully constructed snare trap",
            "activates a cleverly hidden ensnaring device",
            "triggers a concealed snare"
        ],
        isVerbPhrase: true
    },
    'Devises Clever Trap': {
        actionVariants: [
            "devises a clever trap",
            "sets an improvised snare",
            "lays a cunning booby trap"
        ],
        isVerbPhrase: true
    },
    'Series of Acrobatic Flips': {
        actionVariants: [
            "executes a series of acrobatic flips",
            "performs dazzling aerial maneuvers",
            "flips and tumbles with astounding agility"
        ],
        isVerbPhrase: true
    }
};
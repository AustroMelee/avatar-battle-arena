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
            { text: "${actorName} glides gracefully on ${actorPronounS} air scooter.", tags: [] },
            { text: "${actorName} zips around on an air scooter.", tags: [] },
            { text: "${actorName} maneuvers quickly with ${actorPronounS} air scooter.", tags: [] },
            { text: "${actorName} dashes forward on a sphere of air.", tags: [] },
            { text: "${actorName} dances across the battlefield on a sphere of swirling air, light as a feather.", tags: ['metaphor'], personalityTriggers: { creativity: 0.6 } },
            { text: "${actorName} becomes a blur of motion, riding ${actorPronounS} air current.", tags: ['evasive'] },
            { text: "${actorName} evades with effortless agility on ${actorPronounS} iconic air-ball.", tags: ['evasive', 'skill'] },
            { text: "${actorName} misjudges a turn on ${actorPronounS} air scooter, stumbling for a moment!", tags: ['miss', 'humor'] },
            { text: "A gust of wind, courtesy of ${actorName}'s air scooter, nearly topples ${targetName}!", tags: ['crit'] }
        ],
        isVerbPhrase: false
    },
    'Air Blast': {
        counters: {
            'Boomerang Throw': 1.3, 'Knife Barrage': 1.2, // Can deflect projectiles
            'Fire Whip': 1.2, 'Flame Whips': 1.2, // Can dissipate channeled, thin fire attacks
            'Mist Cloud': 1.5, // Blows away the mist
        },
        actionVariants: [
            { text: "${actorName} launches a focused air blast.", tags: [] },
            { text: "${actorName} sends forth a burst of air.", tags: [] },
            { text: "${actorName} unleashes a concentrated air current.", tags: [] },
            { text: "${actorName} pushes with a strong gust of wind.", tags: [] },
            { text: "${actorName} propels a concussive wave of air, like an invisible fist!", tags: ['metaphor', 'strong_hit'], personalityTriggers: { aggression: 0.6 } },
            { text: "${actorName} expels a precise burst, like a focused sigh of the wind, unsettling ${targetName}.", tags: ['metaphor', 'skill'] },
            { text: "${actorName} commands a sudden gale to strike forth, disrupting ${targetName}'s stance.", tags: ['control', 'skill'] },
            { text: "${actorName}'s air blast goes wide, merely ruffling ${targetName}'s clothes.", tags: ['miss', 'humor'] },
            { text: "A perfectly timed air blast from ${actorName} sends ${targetName} sprawling!", tags: ['crit'] }
        ],
        isVerbPhrase: false
    },
    'Wind Shield': {
        counters: {
            'Boomerang Throw': 1.4, 'Knife Barrage': 1.4, 'Ricochet Shot': 1.2, // Excellent vs. standard projectiles
            'Fire Daggers': 1.3, 'Blue Fire Daggers': 1.2, 'Ice Spears': 1.2, // Deflects elemental projectiles
            'Water Stream': 1.5, // Disperses weak water attacks
        },
        actionVariants: [
            { text: "${actorName} forms a protective wind shield.", tags: [] },
            { text: "${actorName} conjures a swirling barrier of air.", tags: [] },
            { text: "${actorName} erects an ethereal wind defense.", tags: [] },
            { text: "${actorName} envelops ${actorPronounO} in a dynamic sphere of rushing air.", tags: [] },
            { text: "${actorName} creates a shimmering, transparent wall of wind, deflecting all!", tags: ['defensive', 'skill'] },
            { text: "${actorName} redirects incoming attacks with a seamless air current barrier, like water off a duck's back.", tags: ['metaphor', 'defensive', 'skill'] },
            { text: "${actorName} spins up a miniature cyclone of protection, a testament to ${actorPronounS} bending.", tags: ['defensive', 'skill'] },
            { text: "${actorName}'s wind shield flickers, almost failing against the onslaught.", tags: ['fail', 'tension'] },
            { text: "The wind shield solidifies instantly under ${actorName}'s command, nullifying the attack entirely!", tags: ['crit', 'defensive'] }
        ],
        isVerbPhrase: false
    },
    'Tornado Whirl': {
        counters: {
            'Flame Whips': 1.4, 'Fire Daggers': 1.3, // Snuffs out smaller fire attacks
            'Knife Barrage': 1.3, 'Boomerang Throw': 1.3, // Sucks in and redirects projectiles
            'Pressure Point Strike': 1.4, 'Sword Strike': 1.4, // Keeps melee attackers at bay
            'Mist Cloud': 1.8, // Sucks up and disperses the mist entirely
        },
        actionVariants: [
            { text: "${actorName} creates a powerful tornado whirl.", tags: [] },
            { text: "${actorName} spins into a rapidly moving vortex.", tags: [] },
            { text: "${actorName} generates a miniature cyclone.", tags: [] },
            { text: "${actorName} summons a vertical column of spiraling air, a miniature tempest!", tags: ['metaphor', 'aoe'] },
            { text: "${actorName} becomes the eye of a storm, deflecting all around ${actorPronounO} with ease.", tags: ['metaphor', 'defensive', 'aoe'] },
            { text: "${actorName} unleashes a funnel of compressed air, disrupting the field and tossing ${targetName} aside!", tags: ['control', 'aoe', 'crit'] },
            { text: "${actorName} twists the very atmosphere into a defensive and offensive tool.", tags: ['skill', 'aoe'] },
            { text: "${actorName}'s tornado whirl loses cohesion, dissipating harmlessly.", tags: ['miss', 'fail'] },
            { text: "Caught in ${actorName}'s perfect tornado whirl, ${targetName} is helpless!", tags: ['crit', 'control'] }
        ],
        isVerbPhrase: false
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
            { text: "${actorName} lashes out with a water whip.", tags: [] },
            { text: "${actorName} snaps a whip of water.", tags: [] },
            { text: "${actorName} strikes with a flowing water whip.", tags: [] },
            { text: "${actorName} sends a torrent of water whipping forward.", tags: [] },
            { text: "${actorName} cracks a whip of liquid force, sharp as a winter's bite!", tags: ['metaphor', 'aggressive'] },
            { text: "${actorName} extends a serpentine lash of water, coiling around ${targetName}.", tags: ['control'] },
            { text: "${actorName} weaves a stream of water into a formidable weapon.", tags: ['skill'] },
            { text: "${actorName}'s water whip splashes harmlessly, missing ${targetName}.", tags: ['miss', 'humor'] },
            { text: "The water whip wraps around ${targetName} with crushing force, delivered by ${actorName}!", tags: ['crit', 'control'] }
        ],
        isVerbPhrase: false
    },
    'Ice Spears': {
        counters: {
            'Water Whip': 1.4, 'Canteen Whip': 1.5, // Freezes the opposing water attack
            'Air Blast': 1.2, 'Gust Push': 1.2, // Pierces through air currents with mass
            'Earth Wave': 1.2, // Pierces through loose earth
            'Acrobatic Flips': 1.2, // Harder for a purely evasive move to dodge a volley
        },
        actionVariants: [
            { text: "${actorName} hurls a volley of ice spears.", tags: [] },
            { text: "${actorName} conjures and fires sharp ice shards.", tags: [] },
            { text: "${actorName} launches a barrage of frozen projectiles.", tags: [] },
            { text: "${actorName} sends crystalline projectiles slicing through the air like lethal snowflakes!", tags: ['metaphor', 'aggressive'] },
            { text: "${actorName} manifests jagged icicles, unleashing them with precision.", tags: ['skill'] },
            { text: "${actorName} transforms water into a deadly array of frozen spikes.", tags: ['aggressive', 'bending_flourish'] },
            { text: "${actorName} unleashes a chilling salvo of concentrated ice.", tags: ['aoe'] },
            { text: "${actorName}'s ice spears shatter prematurely, creating a harmless mist.", tags: ['miss', 'fail'] },
            { text: "A shard of ice from ${actorName} pierces ${targetName}'s defense with chilling accuracy!", tags: ['crit'] }
        ],
        isVerbPhrase: false
    },
    'Water Shield': {
        counters: {
            'Fire Daggers': 1.5, 'Blue Fire Daggers': 1.4, 'Fire Comet': 1.2, // Extinguishes
            'Knife Barrage': 1.6, 'Boomerang Throw': 1.6, 'Ricochet Shot': 1.3, // Catches projectiles
            'Boulder Throw': 1.2, // A strong shield can slow or stop a boulder
            'Air Blast': 1.1, // Solid water has more mass than air
        },
        actionVariants: [
            { text: "${actorName} forms a flowing water shield.", tags: [] },
            { text: "${actorName} erects a defensive barrier of water.", tags: [] },
            { text: "${actorName} generates a protective water dome.", tags: [] },
            { text: "${actorName} weaves a shimmering curtain of liquid defense.", tags: ['defensive', 'skill'] },
            { text: "${actorName} creates a resilient, translucent wall of water, firm as ice!", tags: ['metaphor', 'defensive'] },
            { text: "${actorName} bends a fluid barrier that ripples with incoming force.", tags: ['defensive'] },
            { text: "${actorName} summons a dynamic shield, deflecting all that strikes it like a living tide.", tags: ['metaphor', 'defensive', 'skill'] },
            { text: "${actorName}'s water shield wavers, almost breaking under the pressure.", tags: ['fail', 'tension'] },
            { text: "The water shield coalesces into an impenetrable bastion under ${actorName}'s will!", tags: ['crit', 'defensive'] }
        ],
        isVerbPhrase: false
    },
    'Ice Prison': {
        counters: {
            'Air Scooter': 1.5, 'Acrobatic Flips': 1.4, // Traps mobile but ground-based opponents
            'Pressure Point Strike': 1.6, 'Chi-Blocking Flurry': 1.6, // Creates distance, preventing melee strikes
            'Sword Strike': 1.5, 'Flame Sword': 1.4,
        },
        actionVariants: [
            { text: "${actorName} creates an ice prison.", tags: [] },
            { text: "${actorName} traps ${targetName} with a wall of ice.", tags: [] },
            { text: "${actorName} encases ${targetName} in a cage of ice.", tags: [] },
            { text: "${actorName} crystallizes the air, ensnaring ${targetName} in a frigid enclosure!", tags: ['control', 'bending_flourish'] },
            { text: "${actorName} raises formidable pillars of ice, forming an inescapable cell.", tags: ['control'] },
            { text: "${actorName} freezes the ground, restricting ${targetName}'s movement and solidifying an icy trap.", tags: ['control', 'environment_interaction'], environmentTags: ['icy', 'watery'] },
            { text: "${actorName} manipulates the very moisture in the air to construct a frozen confinement.", tags: ['skill', 'bending_flourish'] },
            { text: "${actorName}'s ice prison cracks, allowing ${targetName} to slip free!", tags: ['miss', 'fail', 'tension'] },
            { text: "The ice prison snaps shut around ${targetName} under ${actorName}'s absolute command!", tags: ['crit', 'control', 'finisher'] }
        ],
        isVerbPhrase: false
    },
    'Tidal Wave': {
        /* Punishable Move */
        actionVariants: [
            { text: "${actorName} summons a towering tidal wave!", tags: ['finisher', 'aoe'] },
            { text: "A massive surge of water rises at ${actorName}'s command, crashing down on ${targetName}!", tags: ['finisher', 'aoe', 'crit'] },
            { text: "${actorName} pulls the very ocean, a colossal wave threatening to engulf all.", tags: ['finisher', 'bending_flourish'] },
            { text: "The ground trembles as ${actorName} unleashes a devastating wall of water, like a moving mountain!", tags: ['finisher', 'metaphor', 'aoe'] },
            { text: "${actorName}'s attempt to summon a tidal wave falters, the water merely rippling.", tags: ['miss', 'fail', 'tension'] },
            { text: "A monstrous wave erupts from ${actorName}, sweeping ${targetName} away!", tags: ['finisher', 'crit'] }
        ],
        isVerbPhrase: false
    },
    'Bloodbending': {
        /* Punishable Move */
        actionVariants: [
            { text: "${actorName} focuses, attempting the forbidden art of bloodbending on ${targetName}.", tags: ['finisher', 'dark'] },
            { text: "${actorName}'s eyes glow, and ${targetName} suddenly freezes, limbs twisting unnaturally!", tags: ['finisher', 'dark', 'crit'] },
            { text: "A grim resolve on ${actorName}'s face as ${actorPronounS} initiates bloodbending, pulling at ${targetName}'s very essence.", tags: ['finisher', 'dark', 'tension'] },
            { text: "${actorName} exerts a chilling control over ${targetName}'s body, like a puppeteer pulling strings of flesh and bone.", tags: ['finisher', 'dark', 'metaphor'] },
            { text: "${actorName}'s bloodbending attempt is resisted, ${targetName} fighting back with sheer will!", tags: ['miss', 'fail', 'tension'] },
            { text: "With a terrifying focus, ${actorName} seizes control of ${targetName}'s body, rendering ${targetPronounO} helpless!", tags: ['finisher', 'crit', 'dark'] }
        ],
        isVerbPhrase: false
    },

    // ============================================================
    //  ZUKO
    // ============================================================
    'Fire Daggers': {
        counters: { 'Ice Spears': 1.2, 'Ice Prison': 1.2, 'Air Blast': 1.1, 'Gust Push': 1.1 },
        actionVariants: [
            { text: "${actorName} hurls fire daggers.", tags: [] },
            { text: "${actorName} throws sharp bursts of flame.", tags: [] },
            { text: "${actorName} launches precise fire shards.", tags: [] },
            { text: "${actorName} sends a volley of shimmering, blade-like flames, hot as dragon's breath!", tags: ['metaphor', 'aggressive'] },
            { text: "${actorName} flings concentrated bursts of fire with lethal intent.", tags: ['aggressive', 'skill'] },
            { text: "${actorName} unleashes a cascade of searing, miniature infernos.", tags: ['aoe'] },
            { text: "${actorName} casts forth razor-edged projectiles of pure heat.", tags: ['aggressive', 'bending_flourish'] },
            { text: "${actorName}'s fire daggers fizzle out mid-air, a rare misfire.", tags: ['miss', 'fail'] },
            { text: "A dagger of blue fire from ${actorName} finds its mark with searing precision!", tags: ['crit'] }
        ],
        isVerbPhrase: false
    },
    'Flame Sword': {
        counters: {
            'Water Whip': 1.2, // Can evaporate parts of the whip on contact
            'Ice Spears': 1.3, // Smashes through ice projectiles
            'Sword Strike': 1.1, // A flaming sword has an advantage
        },
        actionVariants: [
            { text: "${actorName} engages with ${actorPronounS} flaming sword.", tags: [] },
            { text: "${actorName} attacks with a blade of fire.", tags: [] },
            { text: "${actorName} strikes with ${actorPronounS} fiery saber.", tags: [] },
            { text: "${actorName} ignites ${actorPronounS} dao, wreathed in flickering flames, a dance of controlled fury.", tags: ['metaphor', 'skill', 'aggressive'] },
            { text: "${actorName} dances with a sword alive with burning energy.", tags: ['skill', 'aggressive'] },
            { text: "${actorName} slashes with a weapon forged of both steel and fire.", tags: ['bending_flourish'] },
            { text: "${actorName} carves through the air with a blazing, extended blade.", tags: ['aggressive'] },
            { text: "${actorName}'s flame sword sputters, losing its fiery edge momentarily.", tags: ['fail', 'tension'] },
            { text: "The flame sword from ${actorName} cuts deep, leaving a scorching wound!", tags: ['crit'] }
        ],
        isVerbPhrase: false
    },
    'Fire Shield': {
        counters: {
            'Ice Spears': 1.4, 'Ice Darts': 1.5, // Melts ice projectiles
            'Boomerang Throw': 1.2, 'Knife Barrage': 1.2, // Can melt/deflect physical projectiles
            'Air Blast': 1.1, // A hot shield disperses air
        },
        actionVariants: [
            { text: "${actorName} forms a fire shield.", tags: [] },
            { text: "${actorName} conjures a defensive flame barrier.", tags: [] },
            { text: "${actorName} erects a wall of fire.", tags: [] },
            { text: "${actorName} raises a shimmering barrier of intense heat.", tags: ['defensive'] },
            { text: "${actorName} shapes a bulwark of swirling, protective flames.", tags: ['defensive', 'skill'] },
            { text: "${actorName} creates a solid, radiant disc of defensive fire, bright as the sun!", tags: ['metaphor', 'defensive'] },
            { text: "${actorName} manifests a formidable barrier, absorbing kinetic force with heat.", tags: ['defensive', 'skill'] },
            { text: "${actorName}'s fire shield collapses, leaving ${actorPronounO} vulnerable!", tags: ['fail', 'tension'] },
            { text: "The fire shield flares with intense heat under ${actorName}'s command, melting incoming attacks!", tags: ['crit', 'defensive'] }
        ],
        isVerbPhrase: false
    },
    'Dragon\'s Breath': {
        counters: { 'Ice Armor': 1.5, 'Water Shield': 1.2, 'Tornado Whirl': 1.3, 'Air Blast': 1.4 }, // Overpowers and consumes lesser elemental attacks
        actionVariants: [
            { text: "${actorName} unleashes a torrent of dragon's breath fire.", tags: ['finisher', 'aoe'] },
            { text: "${actorName} breathes a stream of powerful flames.", tags: ['finisher', 'aoe'] },
            { text: "${actorName} incinerates with dragon fire.", tags: ['finisher', 'aoe'] },
            { text: "${actorName} exhales a searing, continuous blast of infernal heat, like a true dragon!", tags: ['metaphor', 'finisher', 'bending_flourish'] },
            { text: "${actorName} lets loose a concentrated, destructive stream of fire, consuming all in its path.", tags: ['finisher', 'aggressive'] },
            { text: "${actorName} spews forth a devastating, wide-arc burst of flame.", tags: ['finisher', 'aoe'] },
            { text: "${actorName} channels the ferocity of a dragon into a blazing torrent, overwhelming ${targetName}.", tags: ['finisher', 'aggressive', 'bending_flourish'] },
            { text: "${actorName}'s dragon's breath sputters, a weak flame escaping.", tags: ['miss', 'fail', 'tension'] },
            { text: "A roar from ${actorName} precedes a colossal blast of dragon's breath, engulfing ${targetName}!", tags: ['crit', 'finisher', 'aoe'] }
        ],
        isVerbPhrase: false
    },

    // ============================================================
    //  TOPH
    // ============================================================
    'Earth Wave': {
        counters: { 'Fire Whip': 1.2, 'Gust Push': 1.3, 'Water Stream': 1.4 }, // Grounds fire, too heavy for wind, absorbs weak water
        actionVariants: [
            { text: "${actorName} sends forth an earth wave.", tags: [] },
            { text: "${actorName} creates a surging wave of rock.", tags: [] },
            { text: "${actorName} causes the ground to undulate forward.", tags: [] },
            { text: "${actorName} unleashes a rippling tremor across the battlefield, like a restless ocean!", tags: ['metaphor', 'aoe'] },
            { text: "${actorName} commands a rolling tide of displaced earth.", tags: ['bending_flourish'] },
            { text: "${actorName} surfs a powerful, advancing wall of stone and soil.", tags: ['aggressive', 'aoe'] },
            { text: "${actorName} sends a seismic undulation to disrupt the opponent.", tags: ['control'] },
            { text: "${actorName}'s earth wave crumbles, failing to reach ${targetName}.", tags: ['miss', 'fail'] },
            { text: "A massive earth wave from ${actorName} slams into ${targetName}, burying ${targetPronounO}!", tags: ['crit', 'aoe'] }
        ],
        isVerbPhrase: false
    },
    'Rock Armor': {
        /* Punishable Move */
        actionVariants: [
            { text: "${actorName} dons a protective rock armor.", tags: [] },
            { text: "${actorName} envelops ${actorPronounO}self in earthen plating.", tags: [] },
            { text: "${actorName} forms a defensive shell of stone.", tags: [] },
            { text: "${actorName} shrouds ${actorPronounO}self in a hardened, craggy hide of rock, like a mountain tortoise!", tags: ['metaphor', 'defensive'] },
            { text: "${actorName} manifests a formidable, layered defense of raw earth.", tags: ['defensive', 'bending_flourish'] },
            { text: "${actorName} becomes a living fortress, clad in unyielding stone.", tags: ['defensive'] },
            { text: "${actorName} crystallizes the surrounding earth into a personal bulwark.", tags: ['defensive', 'skill'] },
            { text: "${actorName}'s rock armor forms incompletely, leaving a weak spot.", tags: ['fail', 'tension'] },
            { text: "The rock armor solidifies instantly around ${actorName}, becoming an impenetrable bastion!", tags: ['crit', 'defensive'] }
        ],
        isVerbPhrase: false
    },
    'Seismic Slam': {
        counters: {
            'Air Scooter': 1.4, 'Acrobatic Flips': 1.4, // Knocks mobile opponents off their feet
            'Rock Coffin': 1.3, 'Ice Prison': 1.3, 'Fire Wall': 1.2, // Destroys constructs from below
            'Wind Shield': 1.5, 'Water Shield': 1.3, // Goes under shields
            'Defensive Stance': 1.8, // Bypasses a simple block
        },
        actionVariants: [
            { text: "${actorName} delivers a seismic slam.", tags: [] },
            { text: "${actorName} causes a localized earthquake.", tags: [] },
            { text: "${actorName} pounds the ground with immense force.", tags: [] },
            { text: "${actorName} strikes the earth, sending a shockwave through the terrain, like a drum of war!", tags: ['metaphor', 'aoe'] },
            { text: "${actorName} unleashes a concussive stomp that ripples through the very ground.", tags: ['aggressive', 'aoe'] },
            { text: "${actorName} generates a devastating impact, rupturing the earth beneath ${targetName}.", tags: ['aggressive', 'aoe', 'crit'] },
            { text: "${actorName} channels ${actorPronounS} force into the earth, creating a disruptive tremor.", tags: ['skill', 'control'] },
            { text: "${actorName}'s seismic slam barely rumbles, a weak tremor.", tags: ['miss', 'fail'] },
            { text: "The ground itself explodes under ${actorName}'s seismic slam, sending ${targetName} flying!", tags: ['crit', 'aoe'] }
        ],
        isVerbPhrase: false
    },
    'Metal Bending': {
        counters: {
            'Rock Armor': 1.3, // Exploits impurities
            'Sword Strike': 2.5, 'Boomerang Throw': 2.5, 'Knife Barrage': 2.5, 'Pinning Strike': 2.5, // Complete control over metal projectiles/weapons
            'Rock Coffin': 1.2, // Breaches rock with metal shards
            'Canteen Whip': 1.5, // Can capture/crush a metal canteen
        },
        actionVariants: [
            { text: "${actorName} performs metal bending.", tags: [] },
            { text: "${actorName} manipulates nearby metal objects.", tags: [] },
            { text: "${actorName} flexes ${actorPronounS} metalbending skill.", tags: [] },
            { text: "${actorName} twists and reshapes metal with incredible precision, as if it were clay!", tags: ['metaphor', 'skill', 'bending_flourish'] },
            { text: "${actorName} commands the metallic elements in the vicinity, turning weapons against their wielders.", tags: ['control', 'skill'] },
            { text: "${actorName} wrenches control of any metal, turning it against the foe.", tags: ['aggressive', 'control'] },
            { text: "${actorName} demonstrates unparalleled mastery over the earth's refined core.", tags: ['skill', 'bending_flourish'] },
            { text: "${actorName}'s metalbending grasp slips, the metal resisting ${actorPronounS} will.", tags: ['miss', 'fail', 'tension'] },
            { text: "Metal itself buckles and obeys ${actorName}'s will, crushing ${targetName}'s defenses!", tags: ['crit', 'control'] }
        ],
        isVerbPhrase: false
    },
    'Boulder Throw': {
        counters: { 'Ice Spears': 1.3, 'Wind Shield': 1.4, 'Fire Shield': 1.3, 'Air Blast': 1.2 },
        actionVariants: [
            { text: "${actorName} hurls a massive boulder.", tags: [] },
            { text: "${actorName} launches a large rock projectile.", tags: [] },
            { text: "${actorName} throws a heavy stone.", tags: [] },
            { text: "${actorName} propels a colossal chunk of earth with surprising speed, like a catapulted mountain!", tags: ['metaphor', 'aggressive'] },
            { text: "${actorName} lifts and flings a formidable rock, a true force of nature.", tags: ['aggressive', 'bending_flourish'] },
            { text: "${actorName} unleashes a devastating stone projectile, dense and unyielding.", tags: ['aggressive'] },
            { text: "${actorName} sends a heavy, earthen sphere hurtling towards the target.", tags: ['aggressive'] },
            { text: "${actorName}'s boulder throw veers off course, missing by a wide margin.", tags: ['miss', 'humor'] },
            { text: "A colossal boulder from ${actorName} crushes ${targetName} with undeniable force!", tags: ['crit', 'finisher'] }
        ],
        isVerbPhrase: false
    },
    'Rock Coffin': {
        /* Punishable Move */
        actionVariants: [
            { text: "${actorName} creates a rock coffin.", tags: [] },
            { text: "${actorName} traps ${targetName} in stone.", tags: [] },
            { text: "${actorName} encases ${targetName} in an earthen cage.", tags: [] },
            { text: "${actorName} raises solid rock around the enemy, sealing them in an unbreakable tomb!", tags: ['metaphor', 'control', 'finisher'] },
            { text: "${actorName} constructs a confining shell of unyielding stone.", tags: ['control', 'bending_flourish'] },
            { text: "${actorName} imprisons the foe within a hastily formed earthen tomb.", tags: ['control'] },
            { text: "${actorName} binds the opponent with layers of impenetrable rock.", tags: ['control'] },
            { text: "${actorName}'s rock coffin fails to fully close, leaving an escape route.", tags: ['miss', 'fail', 'tension'] },
            { text: "The rock coffin clamps shut around ${targetName} with a resounding thud, courtesy of ${actorName}!", tags: ['crit', 'control', 'finisher'] }
        ],
        isVerbPhrase: false
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
            { text: "${actorName} hurls blue fire daggers.", tags: [] },
            { text: "${actorName} throws precise bursts of blue flame.", tags: [] },
            { text: "${actorName} launches razor-sharp blue fire shards.", tags: [] },
            { text: "${actorName} sends forth a volley of intensely hot, azure flames, like a shower of falling stars!", tags: ['metaphor', 'aggressive', 'crit'] },
            { text: "${actorName} conjures and flings scintillating daggers of pure blue fire.", tags: ['skill', 'aggressive'] },
            { text: "${actorName} unleashes a fan of piercing, cerulean flame projectiles.", tags: ['aoe'] },
            { text: "${actorName} casts forth incandescent, blade-like bursts of fire.", tags: ['aggressive', 'bending_flourish'] },
            { text: "${actorName}'s blue fire daggers dissipate, a rare lapse in her precision.", tags: ['miss', 'fail'] },
            { text: "A blue fire dagger from ${actorName} finds its mark with devastating accuracy!", tags: ['crit'] }
        ],
        isVerbPhrase: false
    },
    'Lightning Generation': {
        /* Punishable Move */
        actionVariants: [
            { text: "${actorName} generates crackling lightning.", tags: [] },
            { text: "${actorName} unleashes a bolt of pure lightning.", tags: [] },
            { text: "${actorName} strikes with controlled electricity.", tags: [] },
            { text: "${actorName} summons a brilliant, arcing bolt of electrical energy, a true force of nature!", tags: ['metaphor', 'finisher', 'aggressive'] },
            { text: "${actorName} channels raw electricity, launching a devastating jolt.", tags: ['finisher', 'bending_flourish'] },
            { text: "${actorName} harnesses the power of the storm, unleashing a focused beam.", tags: ['finisher', 'skill'] },
            { text: "${actorName} conducts pure energy, striking with shocking precision.", tags: ['finisher', 'aggressive'] },
            { text: "${actorName}'s lightning crackles harmlessly, failing to connect.", tags: ['miss', 'fail'] },
            { text: "A searing bolt of lightning from ${actorName} strikes true, electrifying ${targetName}!", tags: ['crit', 'finisher'] }
        ],
        isVerbPhrase: false
    },
    'Flame Burst': { // Reactive defense
        counters: {
            'Sword Strike': 1.5, 'Pressure Point Strike': 1.5, 'Chi-Blocking Flurry': 1.4, // Repels close-range attackers
            'Ice Spears': 1.3, 'Water Whip': 1.2, // Evaporates incoming attacks
            'Pinning Strike': 1.3, // Melts incoming knives
        },
        actionVariants: [
            { text: "${actorName} releases a defensive flame burst.", tags: [] },
            { text: "${actorName} erupts with a sudden burst of fire.", tags: [] },
            { text: "${actorName} creates a reactive flame explosion.", tags: [] },
            { text: "${actorName} detonates a concussive nova of flames around ${actorPronounO}self, a fiery shield!", tags: ['metaphor', 'defensive'] },
            { text: "${actorName} radiates an immediate, scorching aura of defensive fire.", tags: ['defensive', 'bending_flourish'] },
            { text: "${actorName} unleashes a blinding, explosive shield of pure heat.", tags: ['defensive', 'aoe'] },
            { text: "${actorName} ignites the air, repelling all immediate threats with a fiery shockwave.", tags: ['defensive', 'skill'] },
            { text: "${actorName}'s flame burst sputters, leaving ${actorPronounO} momentarily exposed.", tags: ['fail', 'tension'] },
            { text: "A sudden, violent flame burst from ${actorName} drives ${targetName} back with scorching force!", tags: ['crit', 'defensive'] }
        ],
        isVerbPhrase: false
    },

    // ============================================================
    //  NON-BENDERS & OTHER
    // ============================================================
    'Pressure Point Strike': {
        counters: pressurePointCounters,
        actionVariants: [
            { text: "${actorName} delivers a precise pressure point strike.", tags: [] },
            { text: "${actorName} attempts to block chi with a swift jab.", tags: [] },
            { text: "${actorName} targets a vital pressure point.", tags: [] },
            { text: "${actorName} strikes with surgical accuracy, aiming for vital chi pathways, like a master sculptor.", tags: ['metaphor', 'skill'] },
            { text: "${actorName} executes a rapid, focused jab to disrupt internal energy.", tags: ['skill'] },
            { text: "${actorName} finds a critical weakness, striking with disabling force.", tags: ['aggressive', 'control'] },
            { text: "A calculated, open-palm strike from ${actorName} designed to incapacitate.", tags: ['skill'] },
            { text: "${actorName}'s pressure point strike glances off, a minor miscalculation.", tags: ['miss', 'fail'] },
            { text: "With unerring precision, ${actorName} strikes a vital pressure point, leaving ${targetName} paralyzed!", tags: ['crit', 'control'] }
        ],
        isVerbPhrase: false
    },
    'Pinning Strike': { // Mai's specialty
        counters: {
            'Water Whip': 1.6, 'Flame Whips': 1.6, 'Fire Whip': 1.6, // Pins the limb, stopping the channeled attack
            'Octopus Form': 1.5, // Can pin tentacles to a surface
            'Air Blast': 1.3, // Knife has more piercing power than a non-lethal gust
            'Tactical Positioning': 1.4, // Pins the opponent in place, preventing repositioning
        },
        actionVariants: [
            { text: "${actorName} executes a pinning strike.", tags: [] },
            { text: "${actorName} throws a knife to pin ${targetName}.", tags: [] },
            { text: "${actorName} immobilizes ${targetName} with a precise throw.", tags: [] },
            { text: "${actorName} hurls a razor-sharp blade, fixing the foe in place like a dart to a board!", tags: ['metaphor', 'aggressive', 'control'] },
            { text: "${actorName} launches a shuriken with pinpoint accuracy, anchoring the target.", tags: ['skill', 'control'] },
            { text: "A well-aimed projectile from ${actorName} restricts ${targetName}'s movement.", tags: ['control'] },
            { text: "${actorName} embeds a swift knife, limiting the enemy's options.", tags: ['aggressive'] },
            { text: "${actorName}'s pinning strike misses, the knife clattering harmlessly.", tags: ['miss', 'fail', 'humor'] },
            { text: "A perfectly aimed pinning strike from ${actorName} nails ${targetName} to the ground!", tags: ['crit', 'control'] }
        ],
        isVerbPhrase: false
    },
    'Ricochet Shot': {
        counters: {
            'Water Shield': 1.4, 'Fire Wall': 1.4, 'Wind Shield': 1.4, 'Knife Wall': 1.4, // Bypasses frontal defenses
            'Rock Armor': 1.2, // Can find gaps from unexpected angles
        },
        actionVariants: [
            { text: "${actorName} fires a ricochet shot.", tags: [] },
            { text: "${actorName} bounces a projectile off a surface.", tags: [] },
            { text: "${actorName} sends a shot deflecting off an obstacle.", tags: [] },
            { text: "${actorName} angles a throw to carom off the ${envKeyword}, striking from an unexpected direction, like a trick shot master!", tags: ['metaphor', 'skill', 'environment_interaction'] },
            { text: "A cunning projectile from ${actorName} veers mid-air, bypassing direct defenses.", tags: ['skill'] },
            { text: "${actorName} utilizes the surroundings to launch an unpredictable attack.", tags: ['skill', 'environment_interaction'] },
            { text: "${actorName} sends a projectile on an indirect, evasive trajectory.", tags: ['skill', 'evasive'] },
            { text: "${actorName}'s ricochet shot goes awry, bouncing off-target.", tags: ['miss', 'fail'] },
            { text: "The ricochet shot from ${actorName} finds its unexpected target with uncanny precision!", tags: ['crit', 'skill'] }
        ],
        isVerbPhrase: false
    },
    'Improvised Trap': { // Sokka
        counters: {
            'Acrobatic Flips': 1.3, 'Air Scooter': 1.3, // Anticipates movement paths
            'Tactical Positioning': 1.5, // Cuts off escape routes
        },
        actionVariants: [
            { text: "${actorName} devises a clever trap.", tags: [] },
            { text: "${actorName} sets an improvised snare.", tags: [] },
            { text: "${actorName} lays a cunning booby trap.", tags: [] },
            { text: "${actorName} ingeniously constructs a makeshift snare, anticipating ${targetName}'s movement like a master hunter!", tags: ['metaphor', 'skill', 'control'] },
            { text: "${actorName} quickly deploys a deceptive obstacle to hinder the foe.", tags: ['control'] },
            { text: "${actorName} employs quick thinking, creating a hidden impediment.", tags: ['skill', 'control'] },
            { text: "${actorName} lures ${targetName} into a cleverly concealed device.", tags: ['control', 'deceptive'] },
            { text: "${actorName}'s improvised trap is easily spotted, a comical failure.", tags: ['miss', 'fail', 'humor'] },
            { text: "${actorName}'s cunning trap springs shut, catching ${targetName} completely off guard!", tags: ['crit', 'control'] }
        ],
        isVerbPhrase: false
    },
    'Acrobatic Flips': {
        actionVariants: [
            { text: "${actorName} executes a series of acrobatic flips.", tags: [] },
            { text: "${actorName} performs dazzling aerial maneuvers.", tags: [] },
            { text: "${actorName} flips and tumbles with astounding agility.", tags: [] },
            { text: "${actorName} evades with a flurry of gravity-defying twists, like a leaf in the wind!", tags: ['metaphor', 'evasive', 'skill'] },
            { text: "A whirlwind of agile movement from ${actorName}, making ${actorPronounO} impossible to pin down.", tags: ['evasive'] },
            { text: "${actorName} bends and twists through the air with dancer-like grace.", tags: ['skill', 'evasive'] },
            { text: "${actorName} uses swift, unpredictable aerial movements to reposition.", tags: ['evasive', 'reposition'] },
            { text: "${actorName} stumbles mid-flip, barely recovering ${actorPronounS} balance.", tags: ['fail', 'humor'] },
            { text: "${actorName}'s acrobatic flips are flawless, effortlessly dodging the attack!", tags: ['crit', 'evasive'] }
        ],
        isVerbPhrase: false
    },
    'Nimble Repositioning': {
        actionVariants: [
            { text: "${actorName} executes a nimble repositioning.", tags: [] },
            { text: "${actorName} repositions with agile footwork.", tags: [] },
            { text: "${actorName} moves into a more advantageous spot.", tags: [] },
            { text: "${actorName} shifts swiftly, finding a superior tactical position, like a shadow in the night!", tags: ['metaphor', 'evasive', 'skill'] },
            { text: "${actorName} dances around the opponent, seeking an opening.", tags: ['evasive', 'opportunistic'] },
            { text: "${actorName} utilizes quick, evasive steps to gain the upper hand.", tags: ['evasive'] },
            { text: "${actorName} fluidly changes position, anticipating the next move.", tags: ['skill', 'evasive', 'reposition'] },
            { text: "${actorName}'s repositioning is clumsy, leaving ${actorPronounO} briefly exposed.", tags: ['fail', 'tension'] },
            { text: "With unmatched agility, ${actorName} perfectly repositions, gaining a critical advantage!", tags: ['crit', 'evasive'] }
        ],
        isVerbPhrase: false
    },

    // ============================================================
    //  CROSS-CHARACTER FINISHERS
    // ============================================================
    'Emperor\'s Wrath': {
        /* Punishable Move */
        actionVariants: [
            { text: "${actorName} unleashes the Emperor's Wrath!", tags: ['finisher', 'dark', 'aggressive'] },
            { text: "A fearsome surge of power erupts from ${actorName}, the Emperor's Wrath!", tags: ['finisher', 'dark', 'crit'] },
            { text: "${actorName} channels pure, destructive fury, unleashing the Emperor's Wrath!", tags: ['finisher', 'aggressive', 'bending_flourish'] },
            { text: "The very air crackles as ${actorName} unleashes the Emperor's Wrath, like a furious god!", tags: ['metaphor', 'finisher', 'dark'] },
            { text: "${actorName}'s Emperor's Wrath flickers, a moment of hesitation costing ${actorPronounO} dearly.", tags: ['miss', 'fail', 'tension'] },
            { text: "With a roar, ${actorName} unleashes the full, terrifying might of the Emperor's Wrath, utterly consuming ${targetName}!", tags: ['crit', 'finisher', 'dark'] }
        ],
        isVerbPhrase: false
    },
    'Redemption\'s Fury': {
        counters: { 'Precision Strike': 1.2 }, // Flurry overwhelms a single focused blast
        actionVariants: [
            { text: "${actorName} unleashes Redemption's Fury!", tags: ['finisher'] },
            { text: "${actorName} erupts with a powerful surge of flame, Redemption's Fury!", tags: ['finisher'] },
            { text: "${actorName} delivers a furious, redeeming attack!", tags: ['finisher'] },
            { text: "${actorName} ignites with a cathartic explosion of raw power, a phoenix reborn!", tags: ['metaphor', 'finisher', 'comeback'] },
            { text: "${actorName} channels inner turmoil into a devastating, focused assault.", tags: ['finisher', 'tension'] },
            { text: "A blazing manifestation of hard-won peace and potent fire from ${actorName}!", tags: ['finisher', 'bending_flourish'] },
            { text: "${actorName} strikes with a final, overwhelming burst of purified flame.", tags: ['finisher', 'aggressive'] },
            { text: "${actorName}'s Redemption's Fury is extinguished, a spark of doubt in ${actorPronounS} eyes.", tags: ['miss', 'fail', 'tension'] },
            { text: "With a roar of defiance, ${actorName} unleashes a perfect Redemption's Fury, burning away ${targetName}'s defenses!", tags: ['crit', 'finisher'] }
        ],
        isVerbPhrase: false
    },
    'Final Pin': {
        counters: { 'Graceful Dodge': 1.4, 'Acrobatic Flips': 1.4 }, // Area denial is hard to evade
        actionVariants: [
            { text: "${actorName} executes a final pinning maneuver!", tags: ['finisher', 'control'] },
            { text: "${actorName} immobilizes ${targetName} with a decisive throw!", tags: ['finisher', 'control'] },
            { text: "${actorName} lands the ultimate pinning strike!", tags: ['finisher', 'control'] },
            { text: "${actorName} locks the opponent into an inescapable hold, ending the skirmish like a spider's web!", tags: ['metaphor', 'finisher', 'control'] },
            { text: "A masterfully applied technique by ${actorName}, rendering ${targetName} helpless.", tags: ['finisher', 'skill', 'control'] },
            { text: "${actorName} employs a series of precise movements to secure an irreversible bind.", tags: ['finisher', 'skill'] },
            { text: "${actorName} concludes the engagement with an absolute and inescapable pin.", tags: ['finisher'] },
            { text: "${actorName}'s final pin slips, ${targetName} narrowly escaping the bind.", tags: ['miss', 'fail', 'tension'] },
            { text: "With a swift, undeniable movement, ${actorName} executes a perfect Final Pin, securing victory!", tags: ['crit', 'finisher', 'control'] }
        ],
        isVerbPhrase: false
    },
    'Chi-Blocking Flurry': {
        actionVariants: [
            { text: "${actorName} delivers a flurry of chi-blocking strikes!", tags: ['finisher', 'control'] },
            { text: "${actorName} unleashes a rapid sequence of chi blocks!", tags: ['finisher', 'control'] },
            { text: "${actorName} assaults with blindingly fast pressure point jabs!", tags: ['finisher', 'control'] },
            { text: "A whirlwind of precise hand strikes from ${actorName}, sealing off chi pathways like a living key!", tags: ['metaphor', 'finisher', 'skill'] },
            { text: "${actorName} renders ${targetName} powerless with a barrage of focused blows.", tags: ['finisher', 'control'] },
            { text: "${actorName} dances through defenses, severing the flow of inner energy.", tags: ['finisher', 'skill'] },
            { text: "${actorName} targets vital energy nodes, culminating in a cascade of disabling hits.", tags: ['finisher', 'aggressive'] },
            { text: "${actorName}'s chi-blocking flurry is evaded, ${targetName} proving surprisingly nimble.", tags: ['miss', 'fail'] },
            { text: "A lightning-fast chi-blocking flurry from ${actorName} leaves ${targetName} utterly defenseless!", tags: ['crit', 'finisher', 'control'] }
        ],
        isVerbPhrase: false
    },
    'Strikes Vital Pressure Point': {
        actionVariants: [
            { text: "${actorName} strikes a vital pressure point!", tags: ['finisher', 'control'] },
            { text: "${actorName} lands a precise hit to a critical chi node!", tags: ['finisher', 'control'] },
            { text: "${actorName} targets a crucial pressure point!", tags: ['finisher', 'control'] },
            { text: "${actorName} finds the singular, most vulnerable point, delivering a knockout blow, like a master surgeon!", tags: ['metaphor', 'finisher', 'skill'] },
            { text: "With pinpoint accuracy, ${actorName} disables ${targetName} with a single, decisive strike.", tags: ['finisher', 'skill', 'aggressive'] },
            { text: "${actorName} explores the enemy's defenses, then exploits a glaring energetic weakness.", tags: ['finisher', 'skill'] },
            { text: "A focused, almost surgical strike from ${actorName} that incapacitates instantly.", tags: ['finisher', 'aggressive'] },
            { text: "${actorName}'s strike misses the vital point, a near-miss that still stings.", tags: ['miss', 'fail', 'tension'] },
            { text: "${actorName} delivers a perfectly aimed strike to a vital pressure point, ending the fight decisively!", tags: ['crit', 'finisher', 'control'] }
        ],
        isVerbPhrase: false
    },
    'Springs Masterfully Constructed Snare Trap': {
        actionVariants: [
            { text: "${actorName} springs a masterfully constructed snare trap!", tags: ['finisher', 'control'] },
            { text: "${actorName} activates a cleverly hidden ensnaring device!", tags: ['finisher', 'control'] },
            { text: "${actorName} triggers a concealed snare!", tags: ['finisher', 'control'] },
            { text: "The ground opens, revealing a cunningly laid trap that secures the foe like a hunter's net!", tags: ['metaphor', 'finisher', 'control', 'environment_interaction'] },
            { text: "A hidden mechanism activates, binding ${targetName} in a surprising manner.", tags: ['finisher', 'control', 'deceptive'] },
            { text: "The ${environmentName} itself becomes a weapon, ensnaring the unwary combatant at ${actorName}'s command.", tags: ['finisher', 'control', 'environment_interaction'] },
            { text: "${actorName} reveals a perfectly timed, intricate trap that halts all movement.", tags: ['finisher', 'skill', 'control'] },
            { text: "${actorName}'s snare trap malfunctions, springing open harmlessly.", tags: ['miss', 'fail', 'humor'] },
            { text: "The masterfully constructed snare trap from ${actorName} snaps shut, trapping ${targetName} completely!", tags: ['crit', 'finisher', 'control'] }
        ],
        isVerbPhrase: false
    },
    'Devises Clever Trap': {
        actionVariants: [
            { text: "${actorName} devises a clever trap.", tags: ['control'] },
            { text: "${actorName} sets an improvised snare.", tags: ['control'] },
            { text: "${actorName} lays a cunning booby trap.", tags: ['control'] },
            { text: "With quick wit, ${actorName} crafts an unexpected impediment, like a seasoned strategist!", tags: ['metaphor', 'skill', 'control'] },
            { text: "A flash of insight leads to the creation of a tactical snare by ${actorName}.", tags: ['skill', 'control'] },
            { text: "${actorName} employs the environment to construct a deceptive and effective trap.", tags: ['skill', 'control', 'environment_interaction'] },
            { text: "${actorName} outsmarts ${targetName} with a well-placed, concealed device.", tags: ['skill', 'control', 'deceptive'] },
            { text: "${actorName}'s trap is easily sidestepped, a transparent ruse.", tags: ['miss', 'fail', 'humor'] },
            { text: "${actorName}'s clever trap activates perfectly, catching ${targetName} unawares!", tags: ['crit', 'control'] }
        ],
        isVerbPhrase: false
    },
    'Series of Acrobatic Flips': {
        actionVariants: [
            { text: "${actorName} executes a series of acrobatic flips.", tags: ['evasive', 'reposition'] },
            { text: "${actorName} performs dazzling aerial maneuvers.", tags: ['evasive', 'reposition'] },
            { text: "${actorName} flips and tumbles with astounding agility.", tags: ['evasive', 'reposition'] },
            { text: "A flurry of gravity-defying twists from ${actorName}, making ${actorPronounO} impossible to pin down, like a hummingbird!", tags: ['metaphor', 'evasive', 'skill'] },
            { text: "${actorName} becomes a whirlwind of agile movement, evading with impossible grace.", tags: ['evasive', 'skill'] },
            { text: "${actorName} bends and twists through the air with dancer-like precision.", tags: ['skill', 'evasive'] },
            { text: "${actorName} uses swift, unpredictable aerial movements to gain tactical advantage.", tags: ['evasive', 'reposition'] },
            { text: "${actorName} stumbles mid-series, landing awkwardly but recovering.", tags: ['fail', 'humor'] },
            { text: "${actorName}'s acrobatic display is flawless, completely sidestepping ${targetName}'s attack!", tags: ['crit', 'evasive'] }
        ],
        isVerbPhrase: false
    }
};
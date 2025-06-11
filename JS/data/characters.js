'use strict';

export const characters = {
    'sokka': { 
        id: 'sokka', name: "Sokka", type: "Nonbender", bendingTypes: ["Non-Bending"], pronouns: { s: 'he', p: 'his', o: 'him' }, 
        style: "strategic non-bending", role: "tactician", tone: "improvisational_ironic", victoryStyle: "Madcap", powerTier: 3,
        techniques: [
            {verb: "hurl", object: "a smoke pellet", method: "ducking behind a sandstone outcrop"},
            {verb: "launch", object: "his trusty boomerang", method: "in a perfect arc"},
            {verb: "devise", object: "a clever trap", method: "using the shifting terrain"},
            {verb: "lunge", object: "forward", method: "with his meteorite sword"},
            {verb: "attempt", object: "a tactical feint", method: "to create an opening"},
            {verb: "set", object: "a complex tripwire trap", method: "hidden in the undergrowth", finisher: true, finalFlavor: ["With a triumphant yelp, Sokka pulled a rope, and his opponent was suddenly hoisted into the air, caught in a masterfully constructed snare.", "Sokka's planning paid off as his foe stumbled into a cleverly disguised pitfall trap, ending the confrontation with a thud and a groan."]},
        ], 
        strengths: ["Master Strategist", "Innovative Tactician", "Resourceful", "Adaptable", "open", "cover_rich", "urban"], 
        weaknesses: ["Vulnerable to Direct Bending Attacks", "Reliance on Equipment", "Physically Average", "exposed", "slippery"], 
        quotes: {
            preBattle: "Alright, let's see what kind of mess we can get into!",
            postWin: "Boomerang! You *do* always come back!",
            postWin_dominant: ["'See? Brains over brawn... and a little bit of improvisation!', Sokka chirped, retrieving his boomerang."],
            postWin_stomp: ["'BOOMERANG! And that's all she wrote, folks! You totally didn't see that coming, did you?!'"],
            postWin_specific: {
                'pakku': ["'See, Pakku? Brains over brawn... and a little bit of improvisation!'"],
                'katara': ["'Who's the master strategist now, Katara? Boomerang one, bending zero!'"]
            },
            postWin_clever: ["'My genius is sometimes... it's almost frightening!'", "'Plan G was a success! Now, who's hungry?'"],
            postWin_reflective: ["'Whew. Okay. That was a little too close. But a win's a win!'"],
            postWin_overwhelming: ["'Nailed it! I am the greatest warrior-inventor of our time!'"],
            postLose: "Well, that's just unfair. Who designed this arena?",
        },
        relationships: {
            'katara': {type: "sibling", bond: "strong_familial", dynamic: "friendly_rivalry"},
            'pakku': {type: "opposed_philosophy", dynamic: "philosophical_clash"}
        }
    },
    'zuko': { 
        id: 'zuko', name: "Zuko", type: "Bender", bendingTypes: ["Fire"], pronouns: { s: 'he', p: 'his', o: 'him' }, 
        style: "adaptive firebending", role: "brawler_redemption", tone: "determined_brooding", victoryStyle: "Determined", powerTier: 6,
        techniques: [
            {verb: "unleash", object: "a flurry of fire-enhanced kicks", method: "with brutal efficiency"}, 
            {verb: "create", object: "an explosive fireball", method: "with a focused blast"}, 
            {verb: "wield", object: "his dual dao swords", method: "to block and parry"}, 
            {verb: "propel", object: "himself forward", method: "with short bursts of flame"}, 
            {verb: "overwhelm", object: "his opponent", method: "with a continuous stream of fire", finisher: true, finalFlavor: ["Zuko drove his opponent back with a relentless, two-handed stream of furious fire, giving them no room to breathe and forcing their surrender.", "In a final, desperate lunge, Zuko broke through his foe's defense, delivering a precise, non-lethal strike with the hilt of his sword."]}
        ], 
        strengths: ["Unwavering Determination", "Exceptional Swordsman", "Resilient", "hot", "metal_rich", "cramped"], 
        weaknesses: ["Emotional Instability", "Impulsiveness", "Vulnerable to Water", "water_rich", "ice_rich", "slippery", "open", "exposed", "precarious"], 
        quotes: {
            preBattle: "I've struggled for my honor. I'm not losing this.",
            postWin: "I fought for my own path. And I won.",
            postWin_dominant: ["'My honor is my own. And I will not be defeated.'", "'That was a mistake. Challenging me.'"],
            postWin_stomp: ["'Pathetic. That was hardly a challenge.'"],
            postWin_specific: {
                'azula': ["'No lightning today, Azula? I've changed. I'm stronger.'"]
            },
            postWin_reflective: ["'I'm... stronger now. This proves it.'", "(Zuko says nothing, only breathing heavily, the internal battle more difficult than the external one.)"],
            postWin_overwhelming: ["'My fire burns hotter because I fight for something real!'"],
            postLose: "Agh! Why can't I ever win?!",
        },
        relationships: {
            'iroh': { type: "uncle_nephew", bond: "strong_familial", dynamic: "emotional_conflict" },
            'azula': { type: "sibling_rivalry", bond: "power_struggle", dynamic: "long_standing_conflict" }
        }
    },
    'ty-lee': { 
        id: 'ty-lee', name: "Ty Lee", type: "Chi Blocker", bendingTypes: ["Chi-Blocking"], pronouns: { s: 'she', p: 'her', o: 'her' }, 
        style: "agile chi-blocking", role: "disabler", tone: "playful_acrobatic", victoryStyle: "Playful", powerTier: 4,
        techniques: [
            {verb: "execute", object: "a series of acrobatic flips", method: "to close the distance"}, 
            {verb: "strike", object: "a vital pressure point", method: "to disable an arm"}, 
            {verb: "gracefully dodge", object: "an attack", method: "and counter with a jab"}, 
            {verb: "use", object: "her unparalleled agility", method: "to move like a blur"},
            {verb: "deliver", object: "a flurry of chi-blocking strikes", method: "rendering her foe's bending utterly useless", finisher: true, finalFlavor: ["In a flash of pink, Ty Lee cartwheeled past her opponent's defenses, landing a series of quick, precise jabs to their pressure points. Their bending sputtered and died, leaving them helpless.", "Ty Lee landed gracefully behind her foe, a single, silent finger-strike to the base of the neck ending the fight instantly. 'Your aura is... all blocked up!' she chirped."]}
        ], 
        strengths: ["Exceptional Agility", "Disables Benders", "Precise Strikes", "Unpredictable Movements", "cramped", "dense", "vertical", "precarious", "cover_rich"], 
        weaknesses: ["Vulnerable if Immobilized", "Limited Offensive Power", "Fragile", "exposed", "slippery", "hot"], 
        quotes: {
            preBattle: "Ooh! This is going to be fun!",
            postWin: "Looks like your chi's... on vacation!",
            postWin_dominant: ["'Ooh! That was fun! Looks like someone's chi needed a little vacation!'", "'Ta-da! My chi-blocking powers are unstoppable!'"],
            postWin_stomp: ["'Barely even had to try! Looks like your chi is *definitely* on vacation!'"],
            postWin_specific: {
                'mai': ["'You're fast, Mai, but I'm faster! And sparklier!'"]
            },
            postWin_clever: ["'Boing! You can't catch me!'", "'Looks like someone's aura is all murky now!'"],
            postWin_reflective: ["'That was a good stretch! Time for some fruit tarts!'"],
            postWin_overwhelming: ["'Ta-da! That's how it's done!'"],
            postLose: "Aw, man! And I didn't even get to do my special handstand!",
        },
        relationships: {
            'mai': {type: "friend", bond: "strong_familial", dynamic: "contrasting_personalities"},
            'zuko': {type: "ally", dynamic: "former_teammate"}
        }
    },
    // (Other character entries would be similarly updated here...)
    'aang-airbending-only': { 
        id: 'aang-airbending-only', name: "Aang (Airbending only)", type: "Bender", bendingTypes: ["Air"], pronouns: { s: 'he', p: 'his', o: 'him' }, 
        style: "evasive airbending", role: "evader", tone: "pacifistic_agile", victoryStyle: "Pacifist", powerTier: 9,
        techniques: [
            {verb: "create", object: "a powerful air scooter", method: "to gain speed"}, 
            {verb: "form", object: "a massive tornado", method: "to disorient his foe"}, 
            {verb: "unleash", object: "a focused blast of air", method: "with surprising force"}, 
            {verb: "ride", object: "high on the powerful winds", method: "evading attacks"}, 
            {verb: "weave", object: "through the air", method: "with effortless grace"},
            {verb: "launch", object: "his opponent", method: "spiraling out of the arena", finisher: true, finalFlavor: ["With a focused gust of wind, Aang swept his foe off their feet, depositing them safely but firmly outside the ring.", "Aang created a swirling vortex of air, lifting his opponent and gently setting them down, disarmed and defeated."]}
        ], 
        strengths: ["Unrivaled Evasiveness", "Exceptional Mobility", "Pacifistic", "open", "vertical", "air_rich"], 
        weaknesses: ["Aversion to Lethal Force", "Direct Confrontation", "Vulnerable to Ground Traps", "cramped", "dense", "sandy"], 
        quotes: {
            preBattle: "Let's keep this light, okay?",
            postWin: "Phew! Nobody got hurt, right? Mostly.",
            postWin_clever: ["'Sometimes the best way to win is to just not get hit!'"],
            postWin_reflective: ["'That was intense, but I'm glad it's over peacefully.'"],
            postWin_overwhelming: ["'Whoa, that was a lot of air! Are you okay?'"],
            postLose: "Guess I need a bit more practice at... not getting defeated.",
        },
        relationships: {
            'toph-beifong': {type: "friend_teacher", dynamic: "clash_of_elements"},
            'bumi': {type: "mentor_student", dynamic: "friendly_rivalry"}
        }
    },
    'katara': { 
        id: 'katara', name: "Katara", type: "Bender", bendingTypes: ["Water", "Healing"], pronouns: { s: 'she', p: 'her', o: 'her' }, 
        style: "masterful waterbending", role: "versatile_control", tone: "fierce_compassionate", victoryStyle: "Fierce", powerTier: 7,
        techniques: [
            {verb: "launch", object: "a barrage of ice daggers"}, 
            {verb: "create", object: "a massive wave"}, 
            {verb: "envelop", object: "her foe", method: "in a watery sphere"}, 
            {verb: "manipulate", object: "nearby vines", method: "with plantbending"}, 
            {verb: "pull", object: "moisture from the air", method: ""},
            {verb: "freeze", object: "her opponent's limbs", method: "in solid ice", finisher: true, finalFlavor: ["Katara sent a powerful wave crashing down, and as the water receded, her opponent was left encased in a prison of solid, unyielding ice.", "With a sharp, determined gesture, Katara froze the ground around her opponent's feet, then sent tendrils of ice snaking up their body, immobilizing them completely."]}
        ], 
        strengths: ["Prodigious Bending Talent", "Exceptional Healing", "Fierce Determination", "water_rich", "ice_rich", "plants_rich", "cover_rich"], 
        weaknesses: ["Emotional Volatility", "Limited Hand-to-Hand Combat", "Reliance on Water Source", "hot", "exposed", "sandy"], 
        quotes: {
            preBattle: "I won't hold back. Not if you won't.",
            postWin: "That's how you do it, for my family, for my tribe!",
            postWin_reflective: ["'Winning is sometimes hard, but I'll always fight for what's right.'"],
            postWin_overwhelming: ["'That's what happens when you underestimate a waterbender!'"],
            postLose: "I won't let this happen again!",
        },
        relationships: {
            'pakku': { type: "master_student", history: "initial_denial_due_to_gender" },
            'sokka': {type: "sibling", bond: "strong_familial", dynamic: "friendly_rivalry"}
        }
    },
    'toph-beifong': { 
        id: 'toph-beifong', name: "Toph", type: "Bender", bendingTypes: ["Earth", "Metal", "Sand"], pronouns: { s: 'she', p: 'her', o: 'her' }, 
        style: "unrelenting earthbending", role: "tank_disabler", tone: "cocky_theatrical", victoryStyle: "Cocky", powerTier: 7,
        techniques: [ 
            {verb: "launch", object: "a pillar of rock"}, 
            {verb: "encase", object: "her opponent's feet in stone"}, 
            {verb: "bend", object: "a suit of metal armor around herself"}, 
            {verb: "create", object: "a powerful sand spout"}, 
            {verb: "sense", object: "an attack through the earth"},
            {verb: "entomb", object: "her foe in a cocoon of solid rock", finisher: true, finalFlavor: ["With a mighty stomp, Toph sent a wave of earth surging upwards, completely encasing her foe in a tight-fitting prison of solid rock. 'Sounds like you're stuck between a rock and a hard place!' she yelled.", "Toph slammed her fists together, and the ground beneath her opponent turned to quicksand, dragging them down until only their bewildered head remained above the surface."]}
        ], 
        strengths: ["Unconventional Fighting Style", "Seismic Perception", "Immovable", "Terrain Control", "earth_rich", "metal_rich", "dense", "cover_rich", "sandy"], 
        weaknesses: ["Vulnerable to Airborne Opponents", "Reliance on Bare Feet", "air_rich", "water_rich", "slippery", "vertical"], 
        quotes: {
            preBattle: "Let's see what you're made of, twinkletoes.",
            postWin: "Told you I was the best. The greatest earthbender in the world!",
            postWin_clever: ["'Who needs eyes when you can see with your feet?'", "'Ground game strong, always.'"],
            postWin_overwhelming: ["'HA! That's what happens when you fight the greatest earthbender in the world!'"],
            postLose: "Whatever. That doesn’t count. You cheated!",
        },
        relationships: {
            'aang-airbending-only': {type: "friend_teacher", dynamic: "clash_of_elements"},
            'bumi': {type: "peer", dynamic: "friendly_rivalry"}
        }
    },
    'azula': { 
        id: 'azula', name: "Azula", type: "Bender", bendingTypes: ["Fire", "Lightning"], pronouns: { s: 'she', p: 'her', o: 'her' }, 
        style: "lethal firebending", role: "dominant_offense", tone: "calculated_ruthless", victoryStyle: "Ruthless", powerTier: 8,
        techniques: [
            {verb: "generate", object: "a precise bolt of lightning"}, 
            {verb: "propel", object: "herself with jets of blue fire"}, 
            {verb: "launch", object: "razor-sharp fire daggers"}, 
            {verb: "use", object: "rapid-fire blue flames"},
            {verb: "incinerate", object: "her opponent", finisher: true, finalFlavor: ["Azula calmly raised two fingers, an arc of lightning crackling between them before lancing out to strike her foe down in a single, perfect motion. The fight was over before the thunderclap.", "With chilling precision, Azula unleashed a concentrated, piercing torrent of blue flame, overwhelming her opponent's defenses and leaving them defeated in a cloud of steam."]}
        ], 
        strengths: ["Firebending Prodigy", "Master Tactician", "Ruthless", "Agile", "Intimidating", "hot", "open"], 
        weaknesses: ["Deep-seated Mental Instability", "Arrogant", "Overconfident", "water_rich", "ice_rich", "slippery", "cold", "cramped"], 
        quotes: {
            preBattle: "Don't bother. You're outmatched.",
            postWin: "Flawless. As expected.",
            postWin_clever: ["'Did you truly think you could outwit me?'"],
            postWin_overwhelming: ["'My power is absolute. You are beneath me.'"],
            postLose: "Impossible! This is insubordination!",
        },
        relationships: {
            'ozai-not-comet-enhanced': { type: "father_daughter", bond: "power_struggle" },
            'zuko': { type: "sibling_rivalry", bond: "power_struggle" }
        }
    },
    // The rest of the characters would follow this updated, more detailed format.
    'ozai-not-comet-enhanced': { id: 'ozai-not-comet-enhanced', name: "Ozai (No Comet)", powerTier: 9, /*...*/ },
    'bumi': { id: 'bumi', name: "Bumi", powerTier: 8, /*...*/ },
    'mai': { id: 'mai', name: "Mai", powerTier: 4, /*...*/ },
    'iroh': { id: 'iroh', name: "Iroh", powerTier: 8, /*...*/ },
    'pakku': { id: 'pakku', name: "Pakku", powerTier: 7, /*...*/ },
    'jeong-jeong': { id: 'jeong-jeong', name: "Jeong Jeong", powerTier: 6, /*...*/ },
};
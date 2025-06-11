'use strict';

export const characters = {
    'sokka': { 
        id: 'sokka', name: "Sokka", type: "Nonbender", bendingTypes: ["Non-Bending"], pronouns: { s: 'he', p: 'his', o: 'him' }, 
        style: "strategic non-bending", role: "tactician", tone: "improvisational_ironic", victoryStyle: "Madcap", powerTier: 3,
        techniques: [
            {verb: "hurl", object: "a smoke pellet"},
            {verb: "launch", object: "his trusty boomerang"},
            {verb: "devise", object: "a clever trap"},
            {verb: "lunge", object: "forward with his meteorite sword"},
            {verb: "attempt", object: "a tactical feint"},
            {verb: "set", object: "a complex tripwire trap", finisher: true, finalFlavor: ["With a triumphant yelp, Sokka pulled a rope, and his opponent was suddenly hoisted into the air, caught in a masterfully constructed snare.", "Sokka's planning paid off as his foe stumbled into a cleverly disguised pitfall trap, ending the confrontation with a thud and a groan."]},
        ], 
        strengths: ["Master Strategist", "Innovative Tactician", "Resourceful", "Adaptable", "open", "cover_rich", "urban", "dense"], 
        weaknesses: ["Vulnerable to Direct Bending Attacks", "Reliance on Equipment", "Physically Average", "exposed", "slippery", "hot", "cold"], 
        quotes: {
            preBattle: "Alright, let's see what kind of mess we can get into!",
            postWin: "Boomerang! You *do* always come back!",
            postWin_dominant: ["'See? Brains over brawn... and a little bit of improvisation!', Sokka chirped, retrieving his boomerang."],
            postWin_stomp: ["'BOOMERANG! And that's all she wrote, folks! You totally didn't see that coming, did you?!'"],
            postWin_specific: { 'pakku': ["'See, Pakku? Brains over brawn... and a little bit of improvisation!'"], 'katara': ["'Who's the master strategist now, Katara? Boomerang one, bending zero!'"] },
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
    'aang-airbending-only': { 
        id: 'aang-airbending-only', name: "Aang (Airbending only)", type: "Bender", bendingTypes: ["Air"], pronouns: { s: 'he', p: 'his', o: 'him' }, 
        style: "evasive airbending", role: "evader", tone: "pacifistic_agile", victoryStyle: "Pacifist", powerTier: 9,
        techniques: [
            {verb: "create", object: "a powerful air scooter"}, 
            {verb: "form", object: "a massive tornado"}, 
            {verb: "unleash", object: "a focused blast of air"}, 
            {verb: "ride", object: "the winds"}, 
            {verb: "weave", object: "through the air"},
            {verb: "launch", object: "his opponent", finisher: true, finalFlavor: ["With a focused gust of wind, Aang swept his foe off their feet, depositing them safely but firmly outside the ring.", "Aang created a swirling vortex of air, lifting his opponent and gently setting them down, disarmed and defeated."]}
        ], 
        strengths: ["Unrivaled Evasiveness", "Exceptional Mobility", "Pacifistic", "open", "vertical", "air_rich", "high_altitude"], 
        weaknesses: ["Aversion to Lethal Force", "Direct Confrontation", "Vulnerable to Ground Traps", "cramped", "dense", "sandy", "low_visibility"], 
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
            {verb: "envelop", object: "her foe in a watery sphere"}, 
            {verb: "manipulate", object: "nearby vines with plantbending"}, 
            {verb: "pull", object: "moisture from the air"},
            {verb: "freeze", object: "her opponent's limbs", finisher: true, finalFlavor: ["Katara sent a powerful wave crashing down, and as the water receded, her opponent was left encased in a prison of solid, unyielding ice.", "With a sharp, determined gesture, Katara froze the ground around her opponent's feet, then sent tendrils of ice snaking up their body, immobilizing them completely."]}
        ], 
        strengths: ["Prodigious Bending Talent", "Exceptional Healing", "Fierce Determination", "water_rich", "ice_rich", "plants_rich", "cover_rich", "slippery"], 
        weaknesses: ["Emotional Volatility", "Limited Hand-to-Hand Combat", "Reliance on Water Source", "hot", "exposed", "sandy", "dry"], 
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
        strengths: ["Unconventional Fighting Style", "Seismic Perception", "Immovable", "Terrain Control", "earth_rich", "metal_rich", "dense", "cover_rich", "sandy", "rocky"], 
        weaknesses: ["Vulnerable to Airborne Opponents", "Reliance on Bare Feet", "air_rich", "water_rich", "slippery", "vertical", "exposed"], 
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
    'zuko': { 
        id: 'zuko', name: "Zuko", type: "Bender", bendingTypes: ["Fire"], pronouns: { s: 'he', p: 'his', o: 'him' }, 
        style: "adaptive firebending", role: "brawler_redemption", tone: "determined_brooding", victoryStyle: "Determined", powerTier: 6,
        techniques: [
            {verb: "unleash", object: "a flurry of fire-enhanced kicks"}, 
            {verb: "create", object: "an explosive fireball"}, 
            {verb: "wield", object: "his dual dao swords"}, 
            {verb: "propel", object: "himself forward"}, 
            {verb: "overwhelm", object: "his opponent with a stream of fire", finisher: true, finalFlavor: ["Zuko drove his opponent back with a relentless, two-handed stream of furious fire, giving them no room to breathe and forcing their surrender.", "In a final, desperate lunge, Zuko broke through his foe's defense, delivering a precise, non-lethal strike with the hilt of his sword."]}
        ], 
        strengths: ["Unwavering Determination", "Exceptional Swordsman", "Resilient", "hot", "metal_rich", "cramped", "dense"], 
        weaknesses: ["Emotional Instability", "Impulsiveness", "Vulnerable to Water", "water_rich", "ice_rich", "slippery", "open", "exposed", "precarious", "cold"], 
        quotes: {
            preBattle: "I've struggled for my honor. I'm not losing this.",
            postWin: "I fought for my own path. And I won.",
            postWin_dominant: ["'My honor is my own. And I will not be defeated.'", "'That was a mistake. Challenging me.'"],
            postWin_stomp: ["'Pathetic. That was hardly a challenge.'"],
            postWin_specific: { 'azula': ["'No lightning today, Azula? I've changed. I'm stronger.'"] },
            postWin_reflective: ["'I'm... stronger now. This proves it.'", "(Zuko says nothing, only breathing heavily, the internal battle more difficult than the external one.)"],
            postWin_overwhelming: ["'My fire burns hotter because I fight for something real!'"],
            postLose: "Agh! Why can't I ever win?!",
        },
        relationships: {
            'iroh': { type: "uncle_nephew", bond: "strong_familial", dynamic: "emotional_conflict" },
            'azula': { type: "sibling_rivalry", bond: "power_struggle", dynamic: "long_standing_conflict" }
        }
    },
    'azula': { 
        id: 'azula', name: "Azula", type: "Bender", bendingTypes: ["Fire", "Lightning"], pronouns: { s: 'she', p: 'her', o: 'her' }, 
        style: "lethal firebending", role: "dominant_offense", tone: "calculated_ruthless", victoryStyle: "Ruthless", powerTier: 8,
        techniques: [
            {verb: "generate", object: "a precise bolt of lightning"}, 
            {verb: "propel", object: "herself with jets of blue fire"}, 
            {verb: "launch", object: "razor-sharp fire daggers"}, 
            {verb: "unleash", object: "rapid-fire blue flames"},
            {verb: "incinerate", object: "her opponent", finisher: true, finalFlavor: ["Azula calmly raised two fingers, an arc of lightning crackling between them before lancing out to strike her foe down in a single, perfect motion. The fight was over before the thunderclap.", "With chilling precision, Azula unleashed a concentrated, piercing torrent of blue flame, overwhelming her opponent's defenses and leaving them defeated in a cloud of steam."]}
        ], 
        strengths: ["Firebending Prodigy", "Master Tactician", "Ruthless", "Agile", "Intimidating", "hot", "open", "exposed"], 
        weaknesses: ["Deep-seated Mental Instability", "Arrogant", "Overconfident", "water_rich", "ice_rich", "slippery", "cold", "cramped", "low_visibility"], 
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
    'ozai-not-comet-enhanced': { 
        id: 'ozai-not-comet-enhanced', name: "Ozai (No Comet)", type: "Bender", bendingTypes: ["Fire", "Lightning"], pronouns: { s: 'he', p: 'his', o: 'him' }, 
        style: "overwhelming firebending", role: "dominant_offense", tone: "arrogant_supreme", victoryStyle: "Supreme", powerTier: 9,
        techniques: [
            {verb: "generate", object: "a massive bolt of lightning"}, 
            {verb: "unleash", object: "a continuous, powerful stream of fire"}, 
            {verb: "propel", object: "himself with fire jets"}, 
            {verb: "incinerate", object: "anything in his path"},
            {verb: "overwhelm", object: "his opponent with a devastating inferno", finisher: true, finalFlavor: ["Ozai unleashed a massive, unstoppable bolt of lightning, ending the fight with absolute power.", "Ozai simply walked forward, a wall of all-consuming fire radiating from him, incinerating his opponent's defenses and forcing a swift, terrified surrender."]}
        ], 
        strengths: ["Exceptional Firebending Prowess", "Indomitable Will", "Raw Power", "Fear-Inducing Presence", "hot", "open", "exposed"], 
        weaknesses: ["Over-reliance on Offensive Power", "Extreme Arrogance", "Underestimates Opponents", "Poor Defensive Strategy", "water_rich", "ice_rich", "slippery", "cold", "cramped", "dense"], 
        quotes: {
            preBattle: "I am the Phoenix King! You are nothing!",
            postWin: "The Fire Nation is supreme! My power is absolute!",
            postWin_overwhelming: ["'I am the Phoenix King! There is no equal!'"],
            postLose: "This cannot be! I am the Fire Lord!",
        },
        relationships: {
            'azula': { type: "father_daughter", bond: "power_struggle" },
            'zuko': { type: "father_son", bond: "emotional_conflict", history: "neglect_and_disappointment" }
        }
    },
    'bumi': { 
        id: 'bumi', name: "Bumi", type: "Bender", bendingTypes: ["Earth"], pronouns: { s: 'he', p: 'his', o: 'him' }, 
        style: "unpredictable earthbending", role: "mad_genius", tone: "eccentric_powerful", victoryStyle: "Madcap", powerTier: 8,
        techniques: [
            {verb: "launch", object: "a massive stone platform"}, 
            {verb: "turn", object: "the ground to quicksand"}, 
            {verb: "tunnel", object: "rapidly underground"}, 
            {verb: "collapse", object: "a nearby structure"}, 
            {verb: "hurl", object: "a barrage of earth disks"},
            {verb: "engulf", object: "his opponent in a vortex of rubble", finisher: true, finalFlavor: ["With a wild cackle, Bumi stomped his foot, and the very ground beneath his opponent erupted, launching them harmlessly out of the arena in a giant pillar of rock.", "Bumi waved his hands with theatrical flair, turning the battlefield into a churning, unpredictable mess of earth and stone that completely swallowed his foe's attack and left them trapped."]}
        ], 
        strengths: ["Mad Genius Tactics", "Brilliant Strategist", "Unpredictable", "Immense Power", "Terrain Control", "earth_rich", "urban", "dense", "vertical", "rocky"], 
        weaknesses: ["Underestimated", "Vulnerable when not on Earth", "Can be Distracted", "open", "exposed", "sandy", "water_rich", "slippery", "air_rich"], 
        quotes: {
            preBattle: "Let's play!",
            postWin: "Time for a nap! Or maybe some cabbage!",
            postWin_clever: ["'You thought you knew my next move, didn't you?! Haha!'"],
            postWin_overwhelming: ["'The earth moves for me! No one can stop the Mad King!'"],
            postLose: "Haha! You almost had me, you crazy kid!",
        },
        relationships: {
            'aang-airbending-only': {type: "mentor_student", bond: "strong_familial", dynamic: "friendly_rivalry"},
            'toph-beifong': {type: "peer", bond: "friendly_rivalry"},
            'azula': { type: "clash_of_styles", dynamic: "precision_vs_chaos" }
        }
    },
    'ty-lee': { 
        id: 'ty-lee', name: "Ty Lee", type: "Chi Blocker", bendingTypes: ["Chi-Blocking"], pronouns: { s: 'she', p: 'her', o: 'her' }, 
        style: "agile chi-blocking", role: "disabler", tone: "playful_acrobatic", victoryStyle: "Playful", powerTier: 4,
        techniques: [
            {verb: "execute", object: "a series of acrobatic flips"}, 
            {verb: "strike", object: "a vital pressure point"}, 
            {verb: "gracefully dodge", object: "an attack"}, 
            {verb: "use", object: "her agility to move like a blur"},
            {verb: "deliver", object: "a flurry of chi-blocking strikes", finisher: true, finalFlavor: ["In a flash of pink, Ty Lee cartwheeled past her opponent's defenses, landing a series of quick, precise jabs to their pressure points. Their bending sputtered and died, leaving them helpless.", "Ty Lee landed gracefully behind her foe, a single, silent finger-strike to the base of the neck ending the fight instantly. 'Your aura is... all blocked up!' she chirped."]}
        ], 
        strengths: ["Exceptional Agility", "Disables Benders", "Precise Strikes", "Unpredictable Movements", "cramped", "dense", "vertical", "precarious", "cover_rich", "plants_rich"], 
        weaknesses: ["Vulnerable if Immobilized", "Limited Offensive Power", "Fragile", "exposed", "slippery", "hot", "cold", "open"], 
        quotes: {
            preBattle: "Ooh! This is going to be fun!",
            postWin: "Looks like your chi's... on vacation!",
            postWin_clever: ["'Boing! You can't catch me!'", "'Looks like someone's aura is all murky now!'"],
            postWin_overwhelming: ["'Ta-da! That's how it's done!'"],
            postLose: "Aw, man! And I didn't even get to do my special handstand!",
        },
        relationships: {
            'mai': {type: "friend", bond: "strong_familial", dynamic: "contrasting_personalities"},
            'zuko': {type: "ally", dynamic: "former_teammate"}
        }
    },
    'mai': { 
        id: 'mai', name: "Mai", type: "Nonbender", bendingTypes: ["Non-Bending"], pronouns: { s: 'she', p: 'her', o: 'her' }, 
        style: "precise marksmanship", role: "sniper_zoner", tone: "unflappable_deadpan", victoryStyle: "Deadpan", powerTier: 4,
        techniques: [
            {verb: "unleash", object: "a volley of stilettos"}, 
            {verb: "pin", object: "her opponent's clothing to a wall"}, 
            {verb: "throw", object: "a shuriken to disarm her foe"}, 
            {verb: "launch", object: "silent, razor-sharp blades"},
            {verb: "strike", object: "a vital pressure point with a knife throw", finisher: true, finalFlavor: ["With an almost bored flick of her wrist, Mai sent a single, perfectly aimed stiletto that pinned her opponent's sleeve to a wall, ending the fight without a scratch.", "A flurry of knives erupted from Mai's sleeves, not to harm, but to herd her opponent into a corner, completely trapped and unable to continue."]}
        ], 
        strengths: ["Deadly Accuracy", "Highly Precise", "Unflappable Demeanor", "Ranged Dominance", "open", "cover_rich", "vertical"], 
        weaknesses: ["Limited to Ranged Attacks", "Vulnerable in Close Proximity", "Lack of Close Combat Skills", "cramped", "dense", "low_visibility", "slippery"], 
        quotes: {
            preBattle: "Don't waste my time.",
            postWin: "That's it. Are we done now?",
            postWin_overwhelming: ["'You were never a threat. Just... annoying.'"],
            postLose: "Hmph. Pathetic.",
        },
        relationships: {
            'ty-lee': {type: "friend", bond: "strong_familial", dynamic: "contrasting_personalities"},
            'sokka': {type: "rivalry", dynamic: "clash_of_wits"}
        }
    },
    'iroh': { 
        id: 'iroh', name: "Iroh", type: "Bender", bendingTypes: ["Fire"], pronouns: { s: 'he', p: 'his', o: 'him' }, 
        style: "wise firebending", role: "mentor_strategist", tone: "wise_calm", victoryStyle: "Wise", powerTier: 8,
        techniques: [
            {verb: "breathe", object: "a plume of controlled fire"}, 
            {verb: "heat", object: "the ground to limit movement"}, 
            {verb: "calmly redirect", object: "a lightning bolt"}, 
            {verb: "execute", object: "a subtle, evasive maneuver"}, 
            {verb: "launch", object: "a powerful, yet controlled, fire blast"},
            {verb: "envelop", object: "his opponent in a ring of flames", finisher: true, finalFlavor: ["Iroh sighed softly, then enveloped his opponent in a gentle, yet inescapable ring of flames, not to burn, but to show the fight was over. 'Would you care for some tea?' he offered.", "Sensing his opponent's energy, Iroh calmly guided their attack, redirecting it harmlessly into the sky. The sheer mastery of the move left his foe stunned into submission."]}
        ], 
        strengths: ["Masterful Strategist", "Profound Wisdom", "Lightning Redirection", "Hidden Power", "hot", "cover_rich", "cramped", "dense"], 
        weaknesses: ["Reluctance to Engage in Direct Combat", "Prefers Philosophy to Fighting", "water_rich", "ice_rich", "slippery", "cold", "open", "exposed"], 
        quotes: {
            preBattle: "Perhaps a cup of jasmine tea first?",
            postWin: "There is always hope for redirection, even in battle.",
            postWin_reflective: ["'Even in conflict, there is peace to be found.'"],
            postWin_clever: ["'The greatest victories are often won with the mind, not just the fist.'"],
            postLose: "A momentary lapse. It happens to the best of us.",
        },
        relationships: {
            'zuko': { type: "uncle_nephew", bond: "strong_familial", history: "mentorship_and_redemption" },
            'jeong-jeong': { type: "philosophical_peer", bond: "friendly", history: "shared_burden_of_firebending" }
        }
    },
    'pakku': { 
        id: 'pakku', name: "Pakku", type: "Bender", bendingTypes: ["Water"], pronouns: { s: 'he', p: 'his', o: 'him' }, 
        style: "disciplined waterbending", role: "master_disciplinarian", tone: "stern_commanding", victoryStyle: "Disciplined", powerTier: 7,
        techniques: [
            {verb: "create", object: "a vortex of razor-sharp ice shards"}, 
            {verb: "launch", object: "powerful water whips"}, 
            {verb: "ride", object: "a massive water spout"}, 
            {verb: "assume", object: "a defensive stance"}, 
            {verb: "shape", object: "a solid ice barrier"},
            {verb: "freeze", object: "the ground, trapping his opponent", finisher: true, finalFlavor: ["With a series of fluid, precise movements, Pakku encased his opponent in an unyielding prison of flawlessly clear ice, ending the duel with indisputable mastery.", "Pakku used his mastery over water to create a massive octopus form, its tentacles overwhelming his foe's defenses and proving his superior technique."]}
        ], 
        strengths: ["Exceptional Waterbending Prowess", "Disciplined Combatant", "Master Tactician", "water_rich", "ice_rich", "slippery", "cold", "open"], 
        weaknesses: ["Rigid Adherence to Tradition", "Can Underestimate Opponents", "Initial Arrogance", "Limited Adaptability", "hot", "sandy", "exposed", "cramped"], 
        quotes: {
            preBattle: "Let's see if you're worthy of my time.",
            postWin: "Discipline prevails.",
            postWin_overwhelming: ["'My mastery is absolute. There is no question of the outcome.'"],
            postLose: "This is... unacceptable.",
        },
        relationships: {
            'katara': { type: "master_student", bond: "strong_familial", history: "initial_denial_due_to_gender" },
            'sokka': { type: "opposed_philosophy", dynamic: "philosophical_clash" }
        }
    },
    'jeong-jeong': { 
        id: 'jeong-jeong', name: "Jeong Jeong", type: "Bender", bendingTypes: ["Fire"], pronouns: { s: 'he', p: 'his', o: 'him' }, 
        style: "controlled firebending", role: "defensive_zoner", tone: "wise_reluctant", victoryStyle: "Wise_Reluctant", powerTier: 6,
        techniques: [
            {verb: "create", object: "a massive, impenetrable wall of fire"}, 
            {verb: "launch", object: "small, precise fire blasts"}, 
            {verb: "raise", object: "pillars of flame from the ground"}, 
            {verb: "evade", object: "with a burst of fire jets"}, 
            {verb: "control", object: "a ring of fire to maintain distance"},
            {verb: "dissipate", object: "his flames into smoke", finisher: true, finalFlavor: ["Jeong Jeong calmly raised an impenetrable wall of flame, not to attack, but to show the utter futility of continuing the fight. His opponent, facing the impassable barrier, conceded.", "With a heavy sigh, Jeong Jeong extinguished his opponent's will to fight by demonstrating overwhelming control, extinguishing their attacks without ever launching his own."]}
        ], 
        strengths: ["Exceptional Self-Control", "Wise Strategist", "Defensive Master", "hot", "cover_rich", "cramped", "dense"], 
        weaknesses: ["Reluctance to Fight", "Pessimistic Outlook", "Less Offensive Power", "water_rich", "ice_rich", "slippery", "cold", "open", "exposed", "low_visibility"], 
        quotes: {
            preBattle: "I seek not to fight, but to teach. If you insist.",
            postWin: "The destructive path of fire has been averted, for now.",
            postWin_reflective: ["'The true victory lies in avoiding destruction, not causing it.'"],
            postLose: "Such is the way of things. All flames eventually fade.",
        },
        relationships: {
            'iroh': { type: "philosophical_peer", bond: "friendly", history: "shared_burden_of_firebending" },
            'ty-lee': {type: "clash_of_styles", dynamic: "fire_vs_agility"}
        }
    },
};
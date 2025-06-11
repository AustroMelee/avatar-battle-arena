'use strict';

export const characters = {
    'sokka': {
        id: 'sokka', name: "Sokka", type: "Nonbender", bendingTypes: ["Non-Bending"], pronouns: { s: 'he', p: 'his', o: 'him' },
        style: "strategic non-bending", role: "tactician", tone: "improvisational_ironic", victoryStyle: "Madcap", powerTier: 3,
        maxHealth: 100, maxEnergy: 100,
        techniques: [
            { name: "Sword Strike", verb: 'strike', object: 'with his meteorite sword', type: 'Offense', power: 40, emoji: '⚔️', requiresArticle: false },
            { name: "Boomerang Throw", verb: 'throw', object: 'his trusty boomerang', type: 'Offense', power: 35, emoji: '🪃', requiresArticle: false },
            { name: "Shield Block", verb: 'block', object: 'with his shield', type: 'Defense', power: 30, emoji: '🛡️', requiresArticle: false },
            { name: "Tactical Positioning", verb: 'reposition', object: 'for a tactical advantage', type: 'Utility', power: 20, emoji: '🗺️', requiresArticle: false },
            { name: "Improvised Trap", verb: 'devise', object: 'a clever trap', type: 'Utility', power: 50, emoji: '🪤', requiresArticle: true },
            { name: "Sokka Style", verb: 'attempt', object: 'a tactical feint', type: 'Offense', power: 25, emoji: '🧠', requiresArticle: true },
            { name: "The Sokka Special", verb: 'spring', object: 'a masterfully constructed snare trap', type: 'Finisher', power: 75, emoji: '🏆', requiresArticle: true }
        ],
        strengths: ["Master Strategist", "Innovative Tactician", "Resourceful", "Adaptable", "open", "cover_rich", "urban", "dense"],
        weaknesses: ["Vulnerable to Direct Bending Attacks", "Reliance on Equipment", "Physically Average", "exposed", "slippery", "hot", "cold"],
        quotes: {
            preBattle: ["Alright, let's see what kind of mess we can get into!"],
            postWin: ["Boomerang! You *do* always come back!"],
            postWin_dominant: ["See? Brains over brawn... and a little bit of improvisation!", "Sokka chirped, retrieving his boomerang."],
            postWin_stomp: ["BOOMERANG! And that's all she wrote, folks! You totally didn't see that coming, did you?!"],
            postWin_specific: { 'pakku': ["See, Pakku? Brains over brawn... and a little bit of improvisation!"], 'katara': ["Who's the master strategist now, Katara? Boomerang one, bending zero!"] },
            postWin_clever: ["My genius is sometimes... it's almost frightening!", "Plan G was a success! Now, who's hungry?"],
            postWin_reflective: ["Whew. Okay. That was a little too close. But a win's a win!"],
            postWin_overwhelming: ["Nailed it! I am the greatest warrior-inventor of our time!"],
            postLose: ["Well, that's just unfair. Who designed this arena?"],
        },
        relationships: {
            'katara': {type: "sibling", bond: "strong_familial", dynamic: "friendly_rivalry"},
            'pakku': {type: "opposed_philosophy", dynamic: "philosophical_clash"}
        }
    },
    'aang-airbending-only': {
        id: 'aang-airbending-only', name: "Aang (Airbending only)", type: "Bender", bendingTypes: ["Air"], pronouns: { s: 'he', p: 'his', o: 'him' },
        style: "evasive airbending", role: "evader", tone: "pacifistic_agile", victoryStyle: "Pacifist", powerTier: 9,
        maxHealth: 100, maxEnergy: 100,
        techniques: [
            { name: "Air Scooter", verb: 'ride', object: 'his air scooter', type: 'Utility', power: 20, emoji: '🛴', requiresArticle: false },
            { name: "Air Blast", verb: 'unleash', object: 'a focused blast of air', type: 'Offense', power: 40, emoji: '💨', requiresArticle: false },
            { name: "Wind Shield", verb: 'form', object: 'a swirling shield of wind', type: 'Defense', power: 50, emoji: '🛡️', requiresArticle: false },
            { name: "Tornado Whirl", verb: 'create', object: 'a disorienting tornado', type: 'Offense', power: 65, emoji: '🌪️', requiresArticle: true },
            { name: "Air Cushion", verb: 'create', object: 'a cushion of air', type: 'Utility', power: 25, emoji: '☁️', requiresArticle: true },
            { name: "Gust Push", verb: 'push', object: 'with a sudden gust of wind', type: 'Offense', power: 30, emoji: '🌬️', requiresArticle: false },
            { name: "Sweeping Gust", verb: 'sweep', object: 'his foe off their feet', type: 'Finisher', power: 80, emoji: '🧹', requiresArticle: false }
        ],
        strengths: ["Unrivaled Evasiveness", "Exceptional Mobility", "Pacifistic", "open", "vertical", "air_rich", "high_altitude"],
        weaknesses: ["Aversion to Lethal Force", "Direct Confrontation", "Vulnerable to Ground Traps", "cramped", "dense", "sandy", "low_visibility"],
        quotes: {
            preBattle: ["Let's keep this light, okay?"],
            postWin: ["Phew! Nobody got hurt, right? Mostly."],
            postWin_clever: ["Sometimes the best way to win is to just not get hit!"],
            postWin_reflective: ["That was intense, but I'm glad it's over peacefully."],
            postWin_overwhelming: ["Whoa, that was a lot of air! Are you okay?"],
            postLose: ["Guess I need a bit more practice at... not getting defeated."],
        },
        relationships: {
            'toph-beifong': {type: "friend_teacher", dynamic: "clash_of_elements"},
            'bumi': {type: "mentor_student", dynamic: "friendly_rivalry"}
        }
    },
    'katara': {
        id: 'katara', name: "Katara", type: "Bender", bendingTypes: ["Water", "Healing"], pronouns: { s: 'she', p: 'her', o: 'her' },
        style: "masterful waterbending", role: "versatile_control", tone: "fierce_compassionate", victoryStyle: "Fierce", powerTier: 7,
        maxHealth: 100, maxEnergy: 100,
        techniques: [
            { name: "Water Whip", verb: 'lash', object: 'out with a water whip', type: 'Offense', power: 45, emoji: '💧', requiresArticle: false },
            { name: "Ice Spears", verb: 'launch', object: 'a volley of ice spears', type: 'Offense', power: 55, emoji: '🧊', requiresArticle: true },
            { name: "Water Shield", verb: 'raise', object: 'a shield of water', type: 'Defense', power: 50, emoji: '🛡️', requiresArticle: true },
            { name: "Healing Waters", verb: 'use', object: 'healing waters', type: 'Utility', power: 30, emoji: '🩹', requiresArticle: false },
            { name: "Ice Prison", verb: 'create', object: 'an ice prison', type: 'Utility', power: 60, emoji: '🧊', requiresArticle: true },
            { name: "Tidal Wave", verb: 'summon', object: 'a massive tidal wave', type: 'Finisher', power: 90, emoji: '🌊', requiresArticle: true },
            { name: "Bloodbending", verb: 'control', object: "her opponent's body", type: 'Finisher', power: 100, emoji: '🩸', requiresArticle: false }
        ],
        strengths: ["Prodigious Bending Talent", "Exceptional Healing", "Fierce Determination", "water_rich", "ice_rich", "plants_rich", "cover_rich", "slippery"],
        weaknesses: ["Emotional Volatility", "Limited Hand-to-Hand Combat", "Reliance on Water Source", "hot", "exposed", "sandy", "dry"],
        quotes: {
            preBattle: ["I won't hold back. Not if you won't."],
            postWin: ["That's how you do it, for my family, for my tribe!"],
            postWin_reflective: ["Winning is sometimes hard, but I'll always fight for what's right."],
            postWin_overwhelming: ["That's what happens when you underestimate a waterbender!"],
            postLose: ["I won't let this happen again!"],
        },
        relationships: {
            'pakku': { type: "master_student", history: "initial_denial_due_to_gender" },
            'sokka': {type: "sibling", bond: "strong_familial", dynamic: "friendly_rivalry"}
        }
    },
    'toph-beifong': {
        id: 'toph-beifong', name: "Toph", type: "Bender", bendingTypes: ["Earth", "Metal", "Sand"], pronouns: { s: 'she', p: 'her', o: 'her' },
        style: "unrelenting earthbending", role: "tank_disabler", tone: "cocky_theatrical", victoryStyle: "Cocky", powerTier: 7,
        maxHealth: 100, maxEnergy: 100,
        techniques: [
            { name: "Earth Wave", verb: 'send', object: 'a powerful wave of earth', type: 'Offense', power: 60, emoji: '🌊', requiresArticle: true },
            { name: "Rock Armor", verb: 'don', object: 'a suit of rock armor', type: 'Defense', power: 75, emoji: '🗿', requiresArticle: true },
            { name: "Seismic Slam", verb: 'slam', object: 'her fists to the ground', type: 'Offense', power: 70, emoji: '💥', requiresArticle: false },
            { name: "Metal Bending", verb: 'bend', object: 'the metal in the environment', type: 'Offense', power: 80, emoji: '🔩', requiresArticle: false },
            { name: "Earth Tunnel", verb: 'tunnel', object: 'underground to reposition', type: 'Utility', power: 30, emoji: '🚇', requiresArticle: false },
            { name: "Boulder Throw", verb: 'launch', object: 'a volley of rock projectiles', type: 'Offense', power: 65, emoji: '🪨', requiresArticle: false },
            { name: "Quicksand Trap", verb: 'turn', object: 'the ground to quicksand', type: 'Utility', power: 55, emoji: '⏳', requiresArticle: false },
            { name: "Rock Coffin", verb: 'entomb', object: 'her foe in a prison of rock', type: 'Finisher', power: 95, emoji: '⚰️', requiresArticle: false }
        ],
        strengths: ["Unconventional Fighting Style", "Seismic Perception", "Immovable", "Terrain Control", "earth_rich", "metal_rich", "dense", "cover_rich", "sandy", "rocky"],
        weaknesses: ["Vulnerable to Airborne Opponents", "Reliance on Bare Feet", "air_rich", "water_rich", "slippery", "vertical", "exposed"],
        quotes: {
            preBattle: ["Let's see what you're made of, twinkletoes."],
            postWin: ["Told you I was the best. The greatest earthbender in the world!"],
            postWin_clever: ["Who needs eyes when you can see with your feet?", "Ground game strong, always."],
            postWin_overwhelming: ["HA! That's what happens when you fight the greatest earthbender in the world!"],
            postLose: ["Whatever. That doesn’t count. You cheated!"],
        },
        relationships: {
            'aang-airbending-only': {type: "friend_teacher", dynamic: "clash_of_elements"},
            'bumi': {type: "peer", dynamic: "friendly_rivalry"}
        }
    },
    'zuko': {
        id: 'zuko', name: "Zuko", type: "Bender", bendingTypes: ["Fire"], pronouns: { s: 'he', p: 'his', o: 'him' },
        style: "adaptive firebending", role: "brawler_redemption", tone: "determined_brooding", victoryStyle: "Determined", powerTier: 6,
        maxHealth: 100, maxEnergy: 100,
        techniques: [
            { name: "Fire Daggers", verb: 'throw', object: 'a volley of fire daggers', type: 'Offense', power: 45, emoji: '🔪', requiresArticle: true },
            { name: "Flame Sword", verb: 'ignite', object: 'his dual dao swords', type: 'Offense', power: 55, emoji: '⚔️', requiresArticle: false },
            { name: "Fire Shield", verb: 'create', object: 'a swirling fire shield', type: 'Defense', power: 50, emoji: '🛡️', requiresArticle: true },
            { name: "Dragon's Breath", verb: 'unleash', object: 'a sustained stream of fire', type: 'Offense', power: 70, emoji: '🐉', requiresArticle: false },
            { name: "Agni Kai Stance", verb: 'assume', object: 'the Agni Kai stance', type: 'Utility', power: 30, emoji: '🤺', requiresArticle: false },
            { name: "Fire Whip", verb: 'lash', object: 'out with a whip of fire', type: 'Offense', power: 60, emoji: '🔥', requiresArticle: false },
            { name: "Blazing Charge", verb: 'charge', object: 'forward, propelled by fire', type: 'Offense', power: 65, emoji: '🚀', requiresArticle: false },
            { name: "Redemption's Fury", verb: 'overwhelm', object: 'his opponent with a flurry of attacks', type: 'Finisher', power: 85, emoji: '🔥', requiresArticle: false }
        ],
        strengths: ["Unwavering Determination", "Exceptional Swordsman", "Resilient", "hot", "metal_rich", "cramped", "dense"],
        weaknesses: ["Emotional Instability", "Impulsiveness", "Vulnerable to Water", "water_rich", "ice_rich", "slippery", "open", "exposed", "precarious", "cold"],
        quotes: {
            preBattle: ["I've struggled for my honor. I'm not losing this."],
            postWin: ["I fought for my own path. And I won."],
            postWin_dominant: ["My honor is my own. And I will not be defeated.", "That was a mistake. Challenging me."],
            postWin_stomp: ["Pathetic. That was hardly a challenge."],
            postWin_specific: { 'azula': ["No lightning today, Azula? I've changed. I'm stronger."] },
            postWin_reflective: ["I'm... stronger now. This proves it.", "(Zuko says nothing, only breathing heavily, the internal battle more difficult than the external one.)"],
            postWin_overwhelming: ["My fire burns hotter because I fight for something real!"],
            postLose: ["Agh! Why can't I ever win?!"],
        },
        relationships: {
            'iroh': { type: "uncle_nephew", bond: "strong_familial", dynamic: "emotional_conflict" },
            'azula': { type: "sibling_rivalry", bond: "power_struggle", dynamic: "long_standing_conflict" }
        }
    },
    'azula': {
        id: 'azula', name: "Azula", type: "Bender", bendingTypes: ["Fire", "Lightning"], pronouns: { s: 'she', p: 'her', o: 'her' },
        style: "lethal firebending", role: "dominant_offense", tone: "calculated_ruthless", victoryStyle: "Ruthless", powerTier: 8,
        maxHealth: 100, maxEnergy: 100,
        techniques: [
            { name: "Blue Fire Daggers", verb: 'launch', object: 'razor-sharp blue fire daggers', type: 'Offense', power: 45, emoji: '🔪', requiresArticle: false },
            { name: "Fire Whip", verb: 'lash', object: 'out with a fire whip', type: 'Offense', power: 55, emoji: '🔥', requiresArticle: false },
            { name: "Lightning Generation", verb: 'generate', object: 'a precise bolt of lightning', type: 'Finisher', power: 100, emoji: '⚡', requiresArticle: true },
            { name: "Flame Burst", verb: 'erupt', object: 'with a burst of blue flame', type: 'Defense', power: 50, emoji: '💥', requiresArticle: false },
            { name: "Fire Jets", verb: 'propel', object: 'herself with jets of fire', type: 'Utility', power: 30, emoji: '🚀', requiresArticle: false },
            { name: "Precision Strike", verb: 'strike', object: 'with a focused fire blast', type: 'Offense', power: 70, emoji: '🎯', requiresArticle: false },
            { name: "Heat Wave", verb: 'release', object: 'a debilitating heat wave', type: 'Utility', power: 35, emoji: '☀️', requiresArticle: true },
            { name: "Fire Shield", verb: 'create', object: 'a shield of rotating fire', type: 'Defense', power: 60, emoji: '🛡️', requiresArticle: true }
        ],
        strengths: ["Firebending Prodigy", "Master Tactician", "Ruthless", "Agile", "Intimidating", "hot", "open", "exposed"],
        weaknesses: ["Deep-seated Mental Instability", "Arrogant", "Overconfident", "water_rich", "ice_rich", "slippery", "cold", "cramped", "low_visibility"],
        quotes: {
            preBattle: ["Don't bother. You're outmatched."],
            postWin: ["Flawless. As expected."],
            postWin_clever: ["Did you truly think you could outwit me?"],
            postWin_overwhelming: ["My power is absolute. You are beneath me."],
            postLose: ["Impossible! This is insubordination!"],
        },
        relationships: {
            'ozai-not-comet-enhanced': { type: "father_daughter", bond: "power_struggle" },
            'zuko': { type: "sibling_rivalry", bond: "power_struggle" }
        }
    },
    'ozai-not-comet-enhanced': {
        id: 'ozai-not-comet-enhanced', name: "Ozai (No Comet)", type: "Bender", bendingTypes: ["Fire", "Lightning"], pronouns: { s: 'he', p: 'his', o: 'him' },
        style: "overwhelming firebending", role: "dominant_offense", tone: "arrogant_supreme", victoryStyle: "Supreme", powerTier: 9,
        maxHealth: 100, maxEnergy: 100,
        techniques: [
            { name: "Fire Comet", verb: 'launch', object: 'a massive fire comet', type: 'Offense', power: 80, emoji: '☄️', requiresArticle: true },
            { name: "Flame Tornado", verb: 'create', object: 'a searing flame tornado', type: 'Offense', power: 75, emoji: '🌪️', requiresArticle: true },
            { name: "Royal Fire", verb: 'unleash', object: 'a blast of royal fire', type: 'Offense', power: 65, emoji: '👑', requiresArticle: true },
            { name: "Fire Armor", verb: 'ignite', object: 'a suit of fire armor', type: 'Defense', power: 60, emoji: '🛡️', requiresArticle: true },
            { name: "Dragon's Roar", verb: 'breathe', object: 'a devastating cone of fire', type: 'Offense', power: 85, emoji: '🐉', requiresArticle: true },
            { name: "Phoenix Strike", verb: 'dive', object: 'with a phoenix strike', type: 'Offense', power: 70, emoji: '🐦', requiresArticle: false },
            { name: "Inferno Field", verb: 'set', object: 'the battlefield ablaze', type: 'Utility', power: 50, emoji: '🌍', requiresArticle: false },
            { name: "Emperor's Wrath", verb: 'unleash', object: "the Emperor's Wrath", type: 'Finisher', power: 100, emoji: '😠', requiresArticle: false }
        ],
        strengths: ["Exceptional Firebending Prowess", "Indomitable Will", "Raw Power", "Fear-Inducing Presence", "hot", "open", "exposed"],
        weaknesses: ["Over-reliance on Offensive Power", "Extreme Arrogance", "Underestimates Opponents", "Poor Defensive Strategy", "water_rich", "ice_rich", "slippery", "cold", "cramped", "dense"],
        quotes: {
            preBattle: ["I am the Phoenix King! You are nothing!"],
            postWin: ["The Fire Nation is supreme! My power is absolute!"],
            postWin_overwhelming: ["I am the Phoenix King! There is no equal!"],
            postLose: ["This cannot be! I am the Fire Lord!"],
        },
        relationships: {
            'azula': { type: "father_daughter", bond: "power_struggle" },
            'zuko': { type: "father_son", bond: "emotional_conflict", history: "neglect_and_disappointment" }
        }
    },
    'bumi': {
        id: 'bumi', name: "Bumi", type: "Bender", bendingTypes: ["Earth"], pronouns: { s: 'he', p: 'his', o: 'him' },
        style: "unpredictable earthbending", role: "mad_genius", tone: "eccentric_powerful", victoryStyle: "Madcap", powerTier: 8,
        maxHealth: 100, maxEnergy: 100,
        techniques: [
            { name: "Rock Avalanche", verb: 'trigger', object: 'a massive rock avalanche', type: 'Finisher', power: 95, emoji: '🌋', requiresArticle: true },
            { name: "Earth Armor", verb: 'don', object: 'a suit of earth armor', type: 'Defense', power: 70, emoji: '🗿', requiresArticle: true },
            { name: "Seismic Scan", verb: 'scan', object: 'the battlefield with seismic sense', type: 'Utility', power: 15, emoji: '📡', requiresArticle: false },
            { name: "Boulder Throw", verb: 'hurl', object: 'a giant boulder', type: 'Offense', power: 60, emoji: '🪨', requiresArticle: true },
            { name: "Ground Spike", verb: 'erupt', object: 'a spike of rock from the ground', type: 'Offense', power: 45, emoji: '⛰️', requiresArticle: true },
            { name: "Earthen Prison", verb: 'trap', object: 'his foe in an earthen prison', type: 'Utility', power: 50, emoji: '🧱', requiresArticle: false },
            { name: "Terrain Reshape", verb: 'reshape', object: 'the battlefield', type: 'Utility', power: 40, emoji: '🌍', requiresArticle: false }
        ],
        strengths: ["Mad Genius Tactics", "Brilliant Strategist", "Unpredictable", "Immense Power", "Terrain Control", "earth_rich", "urban", "dense", "vertical", "rocky"],
        weaknesses: ["Underestimated", "Vulnerable when not on Earth", "Can be Distracted", "open", "exposed", "sandy", "water_rich", "slippery", "air_rich"],
        quotes: {
            preBattle: ["Let's play!"],
            postWin: ["Time for a nap! Or maybe some cabbage!"],
            postWin_clever: ["You thought you knew my next move, didn't you?! Haha!"],
            postWin_overwhelming: ["The earth moves for me! No one can stop the Mad King!"],
            postLose: ["Haha! You almost had me, you crazy kid!"],
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
        maxHealth: 100, maxEnergy: 100,
        techniques: [
            { name: "Acrobatic Flips", verb: 'execute', object: 'a series of acrobatic flips', type: 'Utility', power: 25, emoji: '🤸‍♀️', requiresArticle: true },
            { name: "Pressure Point Strike", verb: 'strike', object: 'a vital pressure point', type: 'Offense', power: 60, emoji: '🎯', requiresArticle: true },
            { name: "Graceful Dodge", verb: 'gracefully dodge', object: 'an incoming attack', type: 'Defense', power: 40, emoji: '🍃', requiresArticle: true },
            { name: "Blur of Motion", verb: 'move', object: 'like a blur', type: 'Utility', power: 20, emoji: '💨', requiresArticle: false },
            { name: "Chi-Blocking Flurry", verb: 'deliver', object: 'a flurry of chi-blocking strikes', type: 'Finisher', power: 85, emoji: '🛑', requiresArticle: true }
        ],
        strengths: ["Exceptional Agility", "Disables Benders", "Precise Strikes", "Unpredictable Movements", "cramped", "dense", "vertical", "precarious", "cover_rich", "plants_rich"],
        weaknesses: ["Vulnerable if Immobilized", "Limited Offensive Power", "Fragile", "exposed", "slippery", "hot", "cold", "open"],
        quotes: {
            preBattle: ["Ooh! This is going to be fun!"],
            postWin: ["Looks like your chi's... on vacation!"],
            postWin_clever: ["Boing! You can't catch me!", "Looks like someone's aura is all murky now!"],
            postWin_overwhelming: ["Ta-da! That's how it's done!"],
            postLose: ["Aw, man! And I didn't even get to do my special handstand!"],
        },
        relationships: {
            'mai': {type: "friend", bond: "strong_familial", dynamic: "contrasting_personalities"},
            'zuko': {type: "ally", dynamic: "former_teammate"}
        }
    },
    'mai': {
        id: 'mai', name: "Mai", type: "Nonbender", bendingTypes: ["Non-Bending"], pronouns: { s: 'she', p: 'her', o: 'her' },
        style: "precise marksmanship", role: "sniper_zoner", tone: "unflappable_deadpan", victoryStyle: "Deadpan", powerTier: 4,
        maxHealth: 100, maxEnergy: 100,
        techniques: [
            { name: "Knife Barrage", verb: 'unleash', object: 'a barrage of knives', type: 'Offense', power: 50, emoji: '🔪', requiresArticle: true },
            { name: "Precision Strike", verb: 'throw', object: 'a single, perfectly aimed knife', type: 'Offense', power: 65, emoji: '🎯', requiresArticle: true },
            { name: "Knife Wall", verb: 'create', object: 'a defensive wall of knives', type: 'Defense', power: 45, emoji: '🧱', requiresArticle: true },
            { name: "Acrobatic Dodge", verb: 'dodge', object: 'with an acrobatic flip', type: 'Defense', power: 30, emoji: '🤸‍♀️', requiresArticle: false },
            { name: "Pinning Strike", verb: 'pin', object: "her foe's sleeve to a wall", type: 'Utility', power: 40, emoji: '📌', requiresArticle: false },
            { name: "Ricochet Shot", verb: 'launch', object: 'a ricochet shot', type: 'Offense', power: 55, emoji: '🔄', requiresArticle: true },
            { name: "Final Pin", verb: 'unleash', object: 'a final volley to trap her opponent', type: 'Finisher', power: 80, emoji: '📍', requiresArticle: false }
        ],
        strengths: ["Deadly Accuracy", "Highly Precise", "Unflappable Demeanor", "Ranged Dominance", "open", "cover_rich", "vertical"],
        weaknesses: ["Limited to Ranged Attacks", "Vulnerable in Close Proximity", "Lack of Close Combat Skills", "cramped", "dense", "low_visibility", "slippery"],
        quotes: {
            preBattle: ["Don't waste my time."],
            postWin: ["That's it. Are we done now?"],
            postWin_overwhelming: ["You were never a threat. Just... annoying."],
            postLose: ["Hmph. Pathetic."],
        },
        relationships: {
            'ty-lee': {type: "friend", bond: "strong_familial", dynamic: "contrasting_personalities"},
            'sokka': {type: "rivalry", dynamic: "clash_of_wits"}
        }
    },
    'iroh': {
        id: 'iroh', name: "Iroh", type: "Bender", bendingTypes: ["Fire"], pronouns: { s: 'he', p: 'his', o: 'him' },
        style: "wise firebending", role: "mentor_strategist", tone: "wise_calm", victoryStyle: "Wise", powerTier: 8,
        maxHealth: 100, maxEnergy: 100,
        techniques: [
            { name: "Fire Breath", verb: 'breathe', object: 'a plume of controlled fire', type: 'Offense', power: 60, emoji: '🐉', requiresArticle: true },
            { name: "Lightning Generation", verb: 'generate', object: 'a powerful bolt of lightning', type: 'Finisher', power: 95, emoji: '⚡', requiresArticle: true },
            { name: "Lightning Redirection", verb: 'redirect', object: 'an incoming lightning attack', type: 'Defense', power: 80, emoji: '🔄', requiresArticle: true },
            { name: "Flame Barrier", verb: 'create', object: 'a wall of fire', type: 'Defense', power: 65, emoji: '🧱', requiresArticle: true },
            { name: "Dragon Dance", verb: 'perform', object: 'the Dragon Dance', type: 'Utility', power: 25, emoji: '💃', requiresArticle: false },
            { name: "Spiritual Fire", verb: 'unleash', object: 'spiritual fire', type: 'Offense', power: 70, emoji: '🧘', requiresArticle: false },
            { name: "Warming Embrace", verb: 'offer', object: 'a warming embrace', type: 'Utility', power: 20, emoji: '☕', requiresArticle: true },
            { name: "Wise Strike", verb: 'strike', object: 'with a precise blast of fire', type: 'Offense', power: 50, emoji: '🍵', requiresArticle: false }
        ],
        strengths: ["Masterful Strategist", "Profound Wisdom", "Lightning Redirection", "Hidden Power", "hot", "cover_rich", "cramped", "dense"],
        weaknesses: ["Reluctance to Engage in Direct Combat", "Prefers Philosophy to Fighting", "water_rich", "ice_rich", "slippery", "cold", "open", "exposed"],
        quotes: {
            preBattle: ["Perhaps a cup of jasmine tea first?"],
            postWin: ["There is always hope for redirection, even in battle."],
            postWin_reflective: ["Even in conflict, there is peace to be found."],
            postWin_clever: ["The greatest victories are often won with the mind, not just the fist."],
            postLose: ["A momentary lapse. It happens to the best of us."],
        },
        relationships: {
            'zuko': { type: "uncle_nephew", bond: "strong_familial", history: "mentorship_and_redemption" },
            'jeong-jeong': { type: "philosophical_peer", bond: "friendly", history: "shared_burden_of_firebending" }
        }
    },
    'pakku': {
        id: 'pakku', name: "Pakku", type: "Bender", bendingTypes: ["Water"], pronouns: { s: 'he', p: 'his', o: 'him' },
        style: "disciplined waterbending", role: "master_disciplinarian", tone: "stern_commanding", victoryStyle: "Disciplined", powerTier: 7,
        maxHealth: 100, maxEnergy: 100,
        techniques: [
            { name: "Ice Spikes", verb: 'launch', object: 'a volley of ice spikes', type: 'Offense', power: 50, emoji: '🧊', requiresArticle: true },
            { name: "Water Barrier", verb: 'erect', object: 'a solid water barrier', type: 'Defense', power: 60, emoji: '🛡️', requiresArticle: true },
            { name: "Frozen Ground", verb: 'freeze', object: 'the ground', type: 'Utility', power: 35, emoji: '❄️', requiresArticle: false },
            { name: "Ice Prison", verb: 'encase', object: 'his foe in an ice prison', type: 'Utility', power: 65, emoji: '🧊', requiresArticle: false },
            { name: "Tidal Surge", verb: 'summon', object: 'a powerful tidal surge', type: 'Offense', power: 75, emoji: '🌊', requiresArticle: true },
            { name: "Ice Armor", verb: 'form', object: 'a suit of ice armor', type: 'Defense', power: 70, emoji: '🗿', requiresArticle: true },
            { name: "Octopus Form", verb: 'assume', object: 'the Octopus Form', type: 'Finisher', power: 90, emoji: '🐙', requiresArticle: false }
        ],
        strengths: ["Exceptional Waterbending Prowess", "Disciplined Combatant", "Master Tactician", "water_rich", "ice_rich", "slippery", "cold", "open"],
        weaknesses: ["Rigid Adherence to Tradition", "Can Underestimate Opponents", "Initial Arrogance", "Limited Adaptability", "hot", "sandy", "exposed", "cramped"],
        quotes: {
            preBattle: ["Let's see if you're worthy of my time."],
            postWin: ["Discipline prevails."],
            postWin_overwhelming: ["My mastery is absolute. There is no question of the outcome."],
            postLose: ["This is... unacceptable."],
        },
        relationships: {
            'katara': { type: "master_student", bond: "strong_familial", history: "initial_denial_due_to_gender" },
            'sokka': { type: "opposed_philosophy", dynamic: "philosophical_clash" }
        }
    },
    'jeong-jeong': {
        id: 'jeong-jeong', name: "Jeong Jeong", type: "Bender", bendingTypes: ["Fire"], pronouns: { s: 'he', p: 'his', o: 'him' },
        style: "controlled firebending", role: "defensive_zoner", tone: "wise_reluctant", victoryStyle: "Wise_Reluctant", powerTier: 6,
        maxHealth: 100, maxEnergy: 100,
        techniques: [
            { name: "Controlled Inferno", verb: 'create', object: 'a controlled inferno', type: 'Offense', power: 80, emoji: '🔥', requiresArticle: true },
            { name: "Fire Wall", verb: 'raise', object: 'an impenetrable wall of fire', type: 'Defense', power: 85, emoji: '🧱', requiresArticle: true },
            { name: "Flame Whips", verb: 'conjure', object: 'precise flame whips', type: 'Offense', power: 55, emoji: '🐍', requiresArticle: false },
            { name: "Fire Cloak", verb: 'don', object: 'a cloak of defensive fire', type: 'Defense', power: 50, emoji: '🧥', requiresArticle: true },
            { name: "Precision Burn", verb: 'inflict', object: 'a surgical burn', type: 'Offense', power: 45, emoji: '🎯', requiresArticle: true },
            { name: "Flame Dispersion", verb: 'disperse', object: 'an incoming fire attack', type: 'Defense', power: 60, emoji: '💨', requiresArticle: true },
            { name: "Reluctant Finale", verb: 'end', object: 'the fight with a wall of flame', type: 'Finisher', power: 90, emoji: '🛑', requiresArticle: false }
        ],
        strengths: ["Exceptional Self-Control", "Wise Strategist", "Defensive Master", "hot", "cover_rich", "cramped", "dense"],
        weaknesses: ["Reluctance to Fight", "Pessimistic Outlook", "Less Offensive Power", "water_rich", "ice_rich", "slippery", "cold", "open", "exposed", "low_visibility"],
        quotes: {
            preBattle: ["I seek not to fight, but to teach. If you insist."],
            postWin: ["The destructive path of fire has been averted, for now."],
            postWin_reflective: ["The true victory lies in avoiding destruction, not causing it."],
            postLose: ["Such is the way of things. All flames eventually fade."],
        },
        relationships: {
            'iroh': { type: "philosophical_peer", bond: "friendly", history: "shared_burden_of_firebending" },
            'ty-lee': {type: "clash_of_styles", dynamic: "fire_vs_agility"}
        }
    },
};

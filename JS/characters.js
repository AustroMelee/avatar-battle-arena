// FILE: js/characters.js
'use strict';

export const characters = {
    'sokka': {
        id: 'sokka', name: "Sokka", type: "Nonbender", bendingTypes: ["Non-Bending"], pronouns: { s: 'he', p: 'his', o: 'him' },
        style: "strategic non-bending", role: "tactician", tone: "improvisational_ironic", victoryStyle: "Madcap", powerTier: 3,
        personalityTags: ['restrained', 'tactical'],
        maxHealth: 100, maxEnergy: 100,
        techniques: [
            { name: "Sword Strike", verb: 'strike', object: 'with his meteorite sword', type: 'Offense', power: 40, emoji: '⚔️', element: 'physical', moveTags: ['precise'] },
            { name: "Boomerang Throw", verb: 'throw', object: 'his trusty boomerang', type: 'Offense', power: 35, emoji: '🪃', element: 'physical', moveTags: ['precise'] },
            { name: "Shield Block", verb: 'block', object: 'with his shield', type: 'Defense', power: 30, emoji: '🛡️', element: 'utility', moveTags: [] },
            { name: "Tactical Positioning", verb: 'reposition', object: 'for a tactical advantage', type: 'Utility', power: 20, emoji: '🗺️', element: 'utility', moveTags: [] },
            { name: "Improvised Trap", verb: 'devise', object: 'a clever trap', type: 'Utility', power: 50, emoji: '🪤', requiresArticle: true, element: 'utility', moveTags: [] },
            { name: "Sokka Style", verb: 'attempt', object: 'a tactical feint', type: 'Offense', power: 25, emoji: '🧠', requiresArticle: true, element: 'utility', moveTags: [] },
            { name: "The Sokka Special", verb: 'spring', object: 'a masterfully constructed snare trap', type: 'Finisher', power: 75, emoji: '🏆', requiresArticle: true, element: 'utility', moveTags: [] }
        ],
        strengths: ["Master Strategist", "Innovative Tactician", "Resourceful", "Adaptable", "open", "cover_rich", "urban", "dense"],
        weaknesses: ["Vulnerable to Direct Bending Attacks", "Reliance on Equipment", "Physically Average", "exposed", "slippery", "hot", "cold"],
        quotes: {
            postWin: ["Boomerang! You *do* always come back!"],
            postWin_overwhelming: ["Nailed it! I am the greatest warrior-inventor of our time!"],
        }
    },
    'aang-airbending-only': {
        id: 'aang-airbending-only', name: "Aang (Airbending only)", type: "Bender", bendingTypes: ["Air"], pronouns: { s: 'he', p: 'his', o: 'him' },
        style: "evasive airbending", role: "evader", tone: "pacifistic_agile", victoryStyle: "Pacifist", powerTier: 9,
        personalityTags: ['pacifistic', 'restrained'],
        maxHealth: 100, maxEnergy: 100,
        techniques: [
            { name: "Air Scooter", verb: 'ride', object: 'his air scooter', type: 'Utility', power: 20, emoji: '🛴', element: 'air', moveTags: ['evasive'] },
            { name: "Air Blast", verb: 'unleash', object: 'a focused blast of air', type: 'Offense', power: 40, emoji: '💨', requiresArticle: true, element: 'air', moveTags: ['collateral_damage_low'] },
            { name: "Wind Shield", verb: 'form', object: 'a swirling shield of wind', type: 'Defense', power: 50, emoji: '🛡️', requiresArticle: true, element: 'air', moveTags: [] },
            { name: "Tornado Whirl", verb: 'create', object: 'a disorienting tornado', type: 'Offense', power: 65, emoji: '🌪️', requiresArticle: true, element: 'air', moveTags: ['collateral_damage_high'] },
            { name: "Air Cushion", verb: 'create', object: 'a cushion of air', type: 'Utility', power: 25, emoji: '☁️', requiresArticle: true, element: 'air', moveTags: ['defensive'] },
            { name: "Gust Push", verb: 'push', object: 'with a sudden gust of wind', type: 'Offense', power: 30, emoji: '🌬️', element: 'air', moveTags: ['collateral_damage_low'] },
            { name: "Sweeping Gust", verb: 'sweep', object: 'his foe off their feet', type: 'Finisher', power: 80, emoji: '🧹', element: 'air', moveTags: ['collateral_damage_medium'] }
        ],
        strengths: ["Unrivaled Evasiveness", "Exceptional Mobility", "open", "vertical", "air_rich", "high_altitude"],
        weaknesses: ["Aversion to Lethal Force", "Direct Confrontation", "Vulnerable to Ground Traps", "cramped", "dense", "sandy", "low_visibility"],
        quotes: {
            postWin: ["Phew! Nobody got hurt, right? Mostly."],
            postWin_overwhelming: ["Whoa, that was a lot of air! Are you okay?"],
        }
    },
    'katara': {
        id: 'katara', name: "Katara", type: "Bender", bendingTypes: ["Water", "Healing"], pronouns: { s: 'she', p: 'her', o: 'her' },
        style: "masterful waterbending", role: "versatile_control", tone: "fierce_compassionate", victoryStyle: "Fierce", powerTier: 7,
        personalityTags: ['restrained', 'protective'],
        maxHealth: 100, maxEnergy: 100,
        canteenMoves: [
            { name: "Water Stream", verb: 'shoot', object: 'a thin stream of water', type: 'Offense', power: 15, emoji: '💧', requiresArticle: true, element: 'water', moveTags: ['requires_canteen'] },
            { name: "Mist Cloud", verb: 'create', object: 'a small cloud of mist', type: 'Utility', power: 10, emoji: '🌫️', requiresArticle: true, element: 'water', moveTags: ['requires_canteen', 'defensive'] }
        ],
        techniques: [
            { name: "Water Whip", verb: 'lash', object: 'out with a water whip', type: 'Offense', power: 45, emoji: '💧', element: 'water', moveTags: ['requires_water_source', 'collateral_damage_low'] },
            { name: "Ice Spears", verb: 'launch', object: 'a volley of ice spears', type: 'Offense', power: 55, emoji: '🧊', requiresArticle: true, element: 'ice', moveTags: ['requires_water_source', 'collateral_damage_medium'] },
            { name: "Water Shield", verb: 'raise', object: 'a shield of water', type: 'Defense', power: 50, emoji: '🛡️', requiresArticle: true, element: 'water', moveTags: ['requires_water_source'] },
            { name: "Healing Waters", verb: 'use', object: 'healing waters', type: 'Utility', power: 30, emoji: '🩹', element: 'healing', moveTags: ['requires_water_source'] },
            { name: "Ice Prison", verb: 'create', object: 'an ice prison', type: 'Utility', power: 60, emoji: '🧊', requiresArticle: true, element: 'ice', moveTags: ['requires_water_source', 'collateral_damage_medium'] },
            { name: "Tidal Wave", verb: 'summon', object: 'a massive tidal wave', type: 'Finisher', power: 90, emoji: '🌊', requiresArticle: true, element: 'water', moveTags: ['requires_water_source', 'collateral_damage_high'] },
            { name: "Bloodbending", verb: 'control', object: "her opponent's body", type: 'Finisher', power: 100, emoji: '🩸', element: 'special', moveTags: ['requires_water_source'] }
        ],
        strengths: ["Prodigious Bending Talent", "Exceptional Healing", "Fierce Determination", "water_rich", "ice_rich", "plants_rich", "cover_rich", "slippery"],
        weaknesses: ["Emotional Volatility", "Limited Hand-to-Hand Combat", "Reliance on Water Source", "hot", "exposed", "sandy", "dry"],
        quotes: {
            postWin: ["That's how you do it, for my family, for my tribe!"],
            postWin_overwhelming: ["That's what happens when you underestimate a waterbender!"],
        }
    },
    'toph-beifong': {
        id: 'toph-beifong', name: "Toph", type: "Bender", bendingTypes: ["Earth", "Metal", "Sand"], pronouns: { s: 'she', p: 'her', o: 'her' },
        style: "unrelenting earthbending", role: "tank_disabler", tone: "cocky_theatrical", victoryStyle: "Cocky", powerTier: 7,
        personalityTags: ['unrestrained', 'confident'],
        maxHealth: 100, maxEnergy: 100,
        techniques: [
            { name: "Earth Wave", verb: 'send', object: 'a powerful wave of earth', type: 'Offense', power: 60, emoji: '🌊', requiresArticle: true, element: 'earth', moveTags: ['requires_earth_source', 'collateral_damage_high'] },
            { name: "Rock Armor", verb: 'don', object: 'a suit of rock armor', type: 'Defense', power: 75, emoji: '🗿', requiresArticle: true, element: 'earth', moveTags: ['requires_earth_source'] },
            { name: "Seismic Slam", verb: 'slam', object: 'her fists to the ground', type: 'Offense', power: 70, emoji: '💥', element: 'earth', moveTags: ['requires_earth_source', 'collateral_damage_medium'] },
            { name: "Metal Bending", verb: 'bend', object: 'the metal in the environment', type: 'Offense', power: 80, emoji: '🔩', element: 'metal', moveTags: ['requires_metal_source'] },
            { name: "Earth Tunnel", verb: 'tunnel', object: 'underground to reposition', type: 'Utility', power: 30, emoji: '🚇', element: 'earth', moveTags: ['requires_earth_source'] },
            { name: "Boulder Throw", verb: 'launch', object: 'a volley of rock projectiles', type: 'Offense', power: 65, emoji: '🪨', element: 'earth', moveTags: ['requires_earth_source', 'collateral_damage_high'] },
            { name: "Quicksand Trap", verb: 'turn', object: 'the ground to quicksand', type: 'Utility', power: 55, emoji: '⏳', element: 'sand', moveTags: ['requires_earth_source'] },
            { name: "Rock Coffin", verb: 'entomb', object: 'her foe in a prison of rock', type: 'Finisher', power: 95, emoji: '⚰️', element: 'earth', moveTags: ['requires_earth_source', 'collateral_damage_medium'] }
        ],
        strengths: ["Unconventional Fighting Style", "Seismic Perception", "Immovable", "Terrain Control", "earth_rich", "metal_rich", "dense", "cover_rich", "sandy", "rocky"],
        weaknesses: ["Vulnerable to Airborne Opponents", "Reliance on Bare Feet", "air_rich", "water_rich", "slippery", "vertical", "exposed"],
        quotes: {
            postWin: ["Told you I was the best. The greatest earthbender in the world!"],
            postWin_overwhelming: ["HA! That's what happens when you fight the greatest earthbender in the world!"],
        }
    },
    'zuko': {
        id: 'zuko', name: "Zuko", type: "Bender", bendingTypes: ["Fire"], pronouns: { s: 'he', p: 'his', o: 'him' },
        style: "adaptive firebending", role: "brawler_redemption", tone: "determined_brooding", victoryStyle: "Determined", powerTier: 6,
        personalityTags: ['restrained', 'impulsive'],
        maxHealth: 100, maxEnergy: 100,
        techniques: [
            { name: "Fire Daggers", verb: 'throw', object: 'a volley of fire daggers', type: 'Offense', power: 45, emoji: '🔪', requiresArticle: true, element: 'fire', moveTags: ['collateral_damage_low'] },
            { name: "Flame Sword", verb: 'ignite', object: 'his dual dao swords', type: 'Offense', power: 55, emoji: '⚔️', element: 'fire', moveTags: ['precise'] },
            { name: "Fire Shield", verb: 'create', object: 'a swirling fire shield', type: 'Defense', power: 50, emoji: '🛡️', requiresArticle: true, element: 'fire', moveTags: [] },
            { name: "Dragon's Breath", verb: 'unleash', object: 'a sustained stream of fire', type: 'Offense', power: 70, emoji: '🐉', element: 'fire', moveTags: ['collateral_damage_medium'] },
            { name: "Agni Kai Stance", verb: 'assume', object: 'the Agni Kai stance', type: 'Utility', power: 30, emoji: '🤺', element: 'utility', moveTags: [] },
            { name: "Fire Whip", verb: 'lash', object: 'out with a whip of fire', type: 'Offense', power: 60, emoji: '🔥', element: 'fire', moveTags: ['collateral_damage_low'] },
            { name: "Blazing Charge", verb: 'charge', object: 'forward, propelled by fire', type: 'Offense', power: 65, emoji: '🚀', element: 'fire', moveTags: ['collateral_damage_medium'] },
            { name: "Redemption's Fury", verb: 'overwhelm', object: 'his opponent with a flurry of attacks', type: 'Finisher', power: 85, emoji: '🔥', element: 'fire', moveTags: ['collateral_damage_medium'] }
        ],
        strengths: ["Unwavering Determination", "Exceptional Swordsman", "Resilient", "hot", "metal_rich", "cramped", "dense"],
        weaknesses: ["Emotional Instability", "Impulsiveness", "Vulnerable to Water", "water_rich", "ice_rich", "slippery", "open", "exposed", "precarious", "cold"],
        quotes: {
            postWin: ["I fought for my own path. And I won."],
            postWin_overwhelming: ["My fire burns hotter because I fight for something real!"],
        }
    },
    'azula': {
        id: 'azula', name: "Azula", type: "Bender", bendingTypes: ["Fire", "Lightning"], pronouns: { s: 'she', p: 'her', o: 'her' },
        style: "lethal firebending", role: "dominant_offense", tone: "calculated_ruthless", victoryStyle: "Ruthless", powerTier: 8,
        personalityTags: ['unrestrained', 'perfectionist'],
        maxHealth: 100, maxEnergy: 100,
        techniques: [
            { name: "Blue Fire Daggers", verb: 'launch', object: 'razor-sharp blue fire daggers', type: 'Offense', power: 45, emoji: '🔪', element: 'fire', moveTags: ['collateral_damage_low', 'precise'] },
            { name: "Fire Whip", verb: 'lash', object: 'out with a fire whip', type: 'Offense', power: 55, emoji: '🔥', element: 'fire', moveTags: ['collateral_damage_low'] },
            { name: "Lightning Generation", verb: 'generate', object: 'a precise bolt of lightning', type: 'Finisher', power: 100, emoji: '⚡', requiresArticle: true, element: 'lightning', moveTags: ['collateral_damage_high'] },
            { name: "Flame Burst", verb: 'erupt with', object: 'a burst of blue flame', type: 'Defense', power: 50, emoji: '💥', requiresArticle: true, element: 'fire', moveTags: ['collateral_damage_medium'] },
            { name: "Fire Jets", verb: 'propel', object: 'herself with jets of fire', type: 'Utility', power: 30, emoji: '🚀', element: 'fire', moveTags: ['evasive'] },
            { name: "Precision Strike", verb: 'strike', object: 'with a focused fire blast', type: 'Offense', power: 70, emoji: '🎯', element: 'fire', moveTags: ['collateral_damage_medium', 'precise'] },
            { name: "Heat Wave", verb: 'release', object: 'a debilitating heat wave', type: 'Utility', power: 35, emoji: '☀️', requiresArticle: true, element: 'fire', moveTags: ['collateral_damage_medium'] },
            { name: "Fire Shield", verb: 'create', object: 'a shield of rotating fire', type: 'Defense', power: 60, emoji: '🛡️', requiresArticle: true, element: 'fire', moveTags: [] }
        ],
        strengths: ["Firebending Prodigy", "Master Tactician", "Ruthless", "Agile", "Intimidating", "hot", "open", "exposed"],
        weaknesses: ["Deep-seated Mental Instability", "Arrogant", "Overconfident", "water_rich", "ice_rich", "slippery", "cold", "cramped", "low_visibility"],
        quotes: {
            postWin: ["Flawless. As expected."],
            postWin_overwhelming: ["My power is absolute. You are beneath me."],
        }
    },
    'ozai-not-comet-enhanced': {
        id: 'ozai-not-comet-enhanced', name: "Ozai (No Comet)", type: "Bender", bendingTypes: ["Fire", "Lightning"], pronouns: { s: 'he', p: 'his', o: 'him' },
        style: "overwhelming firebending", role: "dominant_offense", tone: "arrogant_supreme", victoryStyle: "Supreme", powerTier: 9,
        personalityTags: ['unrestrained', 'destructive'],
        maxHealth: 100, maxEnergy: 100,
        techniques: [
            { name: "Fire Comet", verb: 'launch', object: 'a massive fire comet', type: 'Offense', power: 80, emoji: '☄️', requiresArticle: true, element: 'fire', moveTags: ['collateral_damage_high'] },
            { name: "Flame Tornado", verb: 'create', object: 'a searing flame tornado', type: 'Offense', power: 75, emoji: '🌪️', requiresArticle: true, element: 'fire', moveTags: ['collateral_damage_high'] },
            { name: "Royal Fire", verb: 'unleash', object: 'a blast of royal fire', type: 'Offense', power: 65, emoji: '👑', requiresArticle: true, element: 'fire', moveTags: ['collateral_damage_medium'] },
            { name: "Fire Armor", verb: 'ignite', object: 'a suit of fire armor', type: 'Defense', power: 60, emoji: '🛡️', requiresArticle: true, element: 'fire', moveTags: [] },
            { name: "Dragon's Roar", verb: 'breathe', object: 'a devastating cone of fire', type: 'Offense', power: 85, emoji: '🐉', requiresArticle: true, element: 'fire', moveTags: ['collateral_damage_high'] },
            { name: "Phoenix Strike", verb: 'dive', object: 'with a phoenix strike', type: 'Offense', power: 70, emoji: '🐦', element: 'fire', moveTags: ['collateral_damage_medium'] },
            { name: "Inferno Field", verb: 'set', object: 'the battlefield ablaze', type: 'Utility', power: 50, emoji: '🌍', element: 'fire', moveTags: ['collateral_damage_high'] },
            { name: "Emperor's Wrath", verb: 'unleash', object: "the Emperor's Wrath", type: 'Finisher', power: 100, emoji: '😠', element: 'fire', moveTags: ['collateral_damage_high'] }
        ],
        strengths: ["Exceptional Firebending Prowess", "Indomitable Will", "Raw Power", "Fear-Inducing Presence", "hot", "open", "exposed"],
        weaknesses: ["Over-reliance on Offensive Power", "Extreme Arrogance", "Underestimates Opponents", "Poor Defensive Strategy", "water_rich", "ice_rich", "slippery", "cold", "cramped", "dense"],
        quotes: {
            postWin: ["The Fire Nation is supreme! My power is absolute!"],
            postWin_overwhelming: ["I am the Phoenix King! There is no equal!"],
        }
    },
    'bumi': {
        id: 'bumi', name: "Bumi", type: "Bender", bendingTypes: ["Earth"], pronouns: { s: 'he', p: 'his', o: 'him' },
        style: "unpredictable earthbending", role: "mad_genius", tone: "eccentric_powerful", victoryStyle: "Madcap", powerTier: 8,
        personalityTags: ['unrestrained', 'theatrical'],
        maxHealth: 100, maxEnergy: 100,
        techniques: [
            { name: "Rock Avalanche", verb: 'trigger', object: 'a massive rock avalanche', type: 'Finisher', power: 95, emoji: '🌋', requiresArticle: true, element: 'earth', moveTags: ['requires_earth_source', 'collateral_damage_high'] },
            { name: "Earth Armor", verb: 'don', object: 'a suit of earth armor', type: 'Defense', power: 70, emoji: '🗿', requiresArticle: true, element: 'earth', moveTags: ['requires_earth_source'] },
            { name: "Seismic Scan", verb: 'scan', object: 'the battlefield with seismic sense', type: 'Utility', power: 15, emoji: '📡', element: 'utility', moveTags: [] },
            { name: "Boulder Throw", verb: 'hurl', object: 'a giant boulder', type: 'Offense', power: 60, emoji: '🪨', requiresArticle: true, element: 'earth', moveTags: ['requires_earth_source', 'collateral_damage_high'] },
            { name: "Ground Spike", verb: 'erupt with', object: 'a spike of rock from the ground', type: 'Offense', power: 45, emoji: '⛰️', requiresArticle: true, element: 'earth', moveTags: ['requires_earth_source', 'collateral_damage_low'] },
            { name: "Earthen Prison", verb: 'trap', object: 'his foe in an earthen prison', type: 'Utility', power: 50, emoji: '🧱', element: 'earth', moveTags: ['requires_earth_source', 'collateral_damage_medium'] },
            { name: "Terrain Reshape", verb: 'reshape', object: 'the battlefield', type: 'Utility', power: 40, emoji: '🌍', element: 'earth', moveTags: ['requires_earth_source', 'collateral_damage_high'] }
        ],
        strengths: ["Mad Genius Tactics", "Brilliant Strategist", "Unpredictable", "Immense Power", "Terrain Control", "earth_rich", "urban", "dense", "vertical", "rocky"],
        weaknesses: ["Underestimated", "Vulnerable when not on Earth", "Can be Distracted", "open", "exposed", "sandy", "water_rich", "slippery", "air_rich"],
        quotes: {
            postWin: ["Time for a nap! Or maybe some cabbage!"],
            postWin_overwhelming: ["The earth moves for me! No one can stop the Mad King!"],
        }
    },
    'pakku': {
        id: 'pakku', name: "Pakku", type: "Bender", bendingTypes: ["Water"], pronouns: { s: 'he', p: 'his', o: 'him' },
        style: "disciplined waterbending", role: "master_disciplinarian", tone: "stern_commanding", victoryStyle: "Disciplined", powerTier: 7,
        personalityTags: ['restrained', 'traditionalist'],
        maxHealth: 100, maxEnergy: 100,
        canteenMoves: [
            { name: "Canteen Whip", verb: 'lash out with', object: 'a whip from his canteen', type: 'Offense', power: 20, emoji: '💧', element: 'water', moveTags: ['requires_canteen'] },
            { name: "Ice Darts", verb: 'fire', object: 'small ice darts', type: 'Offense', power: 15, emoji: '🧊', element: 'ice', moveTags: ['requires_canteen'] }
        ],
        techniques: [
            { name: "Ice Spikes", verb: 'launch', object: 'a volley of ice spikes', type: 'Offense', power: 50, emoji: '🧊', requiresArticle: true, element: 'ice', moveTags: ['requires_water_source', 'collateral_damage_medium'] },
            { name: "Water Barrier", verb: 'erect', object: 'a solid water barrier', type: 'Defense', power: 60, emoji: '🛡️', requiresArticle: true, element: 'water', moveTags: ['requires_water_source'] },
            { name: "Frozen Ground", verb: 'freeze', object: 'the ground', type: 'Utility', power: 35, emoji: '❄️', element: 'ice', moveTags: ['requires_water_source', 'collateral_damage_low'] },
            { name: "Ice Prison", verb: 'encase', object: 'his foe in an ice prison', type: 'Utility', power: 65, emoji: '🧊', element: 'ice', moveTags: ['requires_water_source', 'collateral_damage_medium'] },
            { name: "Tidal Surge", verb: 'summon', object: 'a powerful tidal surge', type: 'Offense', power: 75, emoji: '🌊', requiresArticle: true, element: 'water', moveTags: ['requires_water_source', 'collateral_damage_high'] },
            { name: "Ice Armor", verb: 'form', object: 'a suit of ice armor', type: 'Defense', power: 70, emoji: '🗿', requiresArticle: true, element: 'ice', moveTags: ['requires_water_source'] },
            { name: "Octopus Form", verb: 'assume', object: 'the Octopus Form', type: 'Finisher', power: 90, emoji: '🐙', element: 'water', moveTags: ['requires_water_source', 'collateral_damage_medium'] }
        ],
        strengths: ["Exceptional Waterbending Prowess", "Disciplined Combatant", "Master Tactician", "water_rich", "ice_rich", "slippery", "cold", "open"],
        weaknesses: ["Rigid Adherence to Tradition", "Can Underestimate Opponents", "Initial Arrogance", "Limited Adaptability", "hot", "sandy", "exposed", "cramped"],
        quotes: {
            postWin: ["Discipline prevails."],
            postWin_overwhelming: ["My mastery is absolute. There is no question of the outcome."],
        }
    },
    'jeong-jeong': {
        id: 'jeong-jeong', name: "Jeong Jeong", type: "Bender", bendingTypes: ["Fire"], pronouns: { s: 'he', p: 'his', o: 'him' },
        style: "controlled firebending", role: "defensive_zoner", tone: "wise_reluctant", victoryStyle: "Wise_Reluctant", powerTier: 6,
        personalityTags: ['restrained', 'defensive'],
        maxHealth: 100, maxEnergy: 100,
        techniques: [
            { name: "Controlled Inferno", verb: 'create', object: 'a controlled inferno', type: 'Offense', power: 80, emoji: '🔥', requiresArticle: true, element: 'fire', moveTags: ['collateral_damage_medium'] },
            { name: "Fire Wall", verb: 'raise', object: 'an impenetrable wall of fire', type: 'Defense', power: 85, emoji: '🧱', requiresArticle: true, element: 'fire', moveTags: ['collateral_damage_high'] },
            { name: "Flame Whips", verb: 'conjure', object: 'precise flame whips', type: 'Offense', power: 55, emoji: '🐍', element: 'fire', moveTags: ['collateral_damage_low'] },
            { name: "Fire Cloak", verb: 'don', object: 'a cloak of defensive fire', type: 'Defense', power: 50, emoji: '🧥', requiresArticle: true, element: 'fire', moveTags: [] },
            { name: "Precision Burn", verb: 'inflict', object: 'a surgical burn', type: 'Offense', power: 45, emoji: '🎯', requiresArticle: true, element: 'fire', moveTags: ['precise'] },
            { name: "Flame Dispersion", verb: 'disperse', object: 'an incoming fire attack', type: 'Defense', power: 60, emoji: '💨', requiresArticle: true, element: 'fire', moveTags: [] },
            { name: "Reluctant Finale", verb: 'end', object: 'the fight with a wall of flame', type: 'Finisher', power: 90, emoji: '🛑', element: 'fire', moveTags: ['collateral_damage_high'] }
        ],
        strengths: ["Exceptional Self-Control", "Wise Strategist", "Defensive Master", "hot", "cover_rich", "cramped", "dense"],
        weaknesses: ["Reluctance to Fight", "Pessimistic Outlook", "Less Offensive Power", "water_rich", "ice_rich", "slippery", "cold", "open", "exposed", "low_visibility"],
        quotes: {
            postWin: ["The destructive path of fire has been averted, for now."],
            postWin_reflective: ["The true victory lies in avoiding destruction, not causing it."],
        }
    },
};
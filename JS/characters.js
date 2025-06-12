// FILE: js/characters.js
'use strict';

export const characters = {
    'sokka': {
        id: 'sokka', name: "Sokka", type: "Nonbender", pronouns: { s: 'he', p: 'his', o: 'him' },
        victoryStyle: "Madcap", powerTier: 3,
        pacingProfile: 'tactical',
        personalityProfile: { aggression: 0.5, patience: 0.6, riskTolerance: 0.4, opportunism: 0.7 },
        environmentalAffinity: { hasCover: 1.1, isUrban: 1.05, isExposed: 0.95, plantsRich: 1.05 },
        techniques: [
            { name: "Sword Strike", verb: 'strike', object: 'with his meteorite sword', type: 'Offense', power: 40, element: 'physical', moveTags: ['melee_range', 'single_target', 'precise'],
              usageRequirements: {}, environmentBonuses: {}, environmentPenalties: {} },
            { name: "Boomerang Throw", verb: 'throw', object: 'his trusty boomerang', type: 'Offense', power: 35, element: 'physical', moveTags: ['ranged_attack', 'projectile', 'single_target', 'unpredictable'],
              usageRequirements: {}, environmentBonuses: { isExposed: 1.1 }, environmentPenalties: { isDense: 0.8, isCramped: 0.8, low_visibility: 0.7 } },
            { name: "Shield Block", verb: 'block', object: 'with his shield', type: 'Defense', power: 30, element: 'utility', moveTags: ['defensive_stance', 'utility_block'],
              usageRequirements: {}, environmentBonuses: {}, environmentPenalties: {} },
            { name: "Tactical Positioning", verb: 'reposition', object: 'for a tactical advantage', type: 'Utility', power: 20, element: 'utility', moveTags: ['utility_reposition', 'evasive'],
              setup: { name: 'Outmaneuvered', duration: 1, intensity: 1.1 },
              usageRequirements: {}, environmentBonuses: { hasCover: 1.5, isDense: 1.3 }, environmentPenalties: { isExposed: 0.7 } },
            { name: "Improvised Trap", verb: 'devise', object: 'clever trap', type: 'Utility', power: 50, requiresArticle: true, element: 'utility', moveTags: ['trap_delayed', 'utility_control', 'environmental_manipulation'],
              setup: { name: 'Trapped', duration: 2, intensity: 1.3 },
              usageRequirements: {}, environmentBonuses: { hasCover: 1.4, plantsRich: 1.3, isUrban: 1.2 }, environmentPenalties: { isExposed: 0.6, isSandy: 0.7 } },
            { name: "The Sokka Special", verb: 'spring', object: 'masterfully constructed snare trap', type: 'Finisher', power: 75, requiresArticle: true, element: 'utility', moveTags: ['trap_delayed', 'debuff_disable', 'single_target', 'requires_opening'],
              usageRequirements: {}, environmentBonuses: { hasCover: 1.5, plantsRich: 1.4, isUrban: 1.3 }, environmentPenalties: { isExposed: 0.5, isSandy: 0.6 } }
        ],
        quotes: { postWin: ["Boomerang! You *do* always come back!"], postWin_overwhelming: ["Nailed it! I am the greatest warrior-inventor of our time!"], postWin_specific: { 'aang-airbending-only': "See? Brains beat brawn... and... wind." } }
    },
    'aang-airbending-only': {
        id: 'aang-airbending-only', name: "Aang (Airbending only)", type: "Bender", pronouns: { s: 'he', p: 'his', o: 'him' },
        victoryStyle: "Pacifist", powerTier: 9,
        pacingProfile: 'tactical',
        personalityProfile: { aggression: 0.5, patience: 0.9, riskTolerance: 0.2, opportunism: 0.7 },
        environmentalAffinity: { airRich: 1.1, isExposed: 1.05, isUrban: 0.9, isIndustrial: 0.9 },
        techniques: [
            { name: "Air Scooter", verb: 'ride', object: 'his air scooter', type: 'Utility', power: 20, element: 'air', moveTags: ['utility_reposition', 'evasive', 'channeled'],
              setup: { name: 'Off-Balance', duration: 1, intensity: 1.15 },
              usageRequirements: {}, environmentBonuses: { airRich: 1.3, isVertical: 1.2 }, environmentPenalties: { isCramped: 0.8 } },
            { name: "Air Blast", verb: 'unleash', object: 'focused blast of air', type: 'Offense', power: 40, requiresArticle: true, element: 'air', moveTags: ['ranged_attack', 'area_of_effect_small', 'pushback'],
              usageRequirements: {}, environmentBonuses: { airRich: 1.4, high_altitude: 1.2 }, environmentPenalties: {} },
            { name: "Wind Shield", verb: 'form', object: 'swirling shield of wind', type: 'Defense', power: 50, requiresArticle: true, element: 'air', moveTags: ['defensive_stance', 'utility_block', 'projectile_defense'],
              usageRequirements: {}, environmentBonuses: { airRich: 1.4 }, environmentPenalties: {} },
            { name: "Tornado Whirl", verb: 'create', object: 'disorienting tornado', type: 'Offense', power: 65, requiresArticle: true, element: 'air', moveTags: ['area_of_effect', 'channeled', 'utility_control'],
              setup: { name: 'Disoriented', duration: 2, intensity: 1.25 },
              usageRequirements: {}, environmentBonuses: { airRich: 1.5, isExposed: 1.2 }, environmentPenalties: { isCramped: 0.7 } },
            { name: "Gust Push", verb: 'push', object: 'with a sudden gust of wind', type: 'Offense', power: 30, element: 'air', moveTags: ['ranged_attack', 'single_target', 'pushback'],
              usageRequirements: {}, environmentBonuses: { airRich: 1.3 }, environmentPenalties: {} },
            { name: "Sweeping Gust", verb: 'sweep', object: 'his foe off their feet', type: 'Finisher', power: 80, element: 'air', moveTags: ['area_of_effect', 'debuff_disable', 'pushback', 'requires_opening'],
              usageRequirements: {}, environmentBonuses: { airRich: 1.6, isExposed: 1.3 }, environmentPenalties: { isCramped: 0.6 } }
        ],
        quotes: { postWin: ["Phew! Nobody got hurt, right? Mostly."], postWin_overwhelming: ["Whoa, that was a lot of air! Are you okay?"], postWin_specific: { 'ozai-not-comet-enhanced': "It's over. This world doesn't need any more destruction." } }
    },
    'katara': {
        id: 'katara', name: "Katara", type: "Bender", pronouns: { s: 'she', p: 'her', o: 'her' },
        victoryStyle: "Fierce", powerTier: 7,
        pacingProfile: 'tactical',
        personalityProfile: { aggression: 0.6, patience: 0.7, riskTolerance: 0.5, opportunism: 0.8 },
        environmentalAffinity: { waterRich: 1.1, isCold: 1.05, isUrban: 0.9, isHot: 0.9 },
        techniques: [
            { name: "Water Whip", verb: 'lash', object: 'out with a water whip', type: 'Offense', power: 45, element: 'water', moveTags: ['melee_range', 'ranged_attack_medium', 'channeled', 'single_target'],
              usageRequirements: {}, environmentBonuses: { waterRich: 1.3, isCoastal: 1.2 }, environmentPenalties: { isHot: 0.5, isSandy: 0.4 } },
            { name: "Ice Spears", verb: 'launch', object: 'volley of ice spears', type: 'Offense', power: 55, requiresArticle: true, element: 'ice', moveTags: ['ranged_attack', 'projectile', 'area_of_effect_small'],
              usageRequirements: {}, environmentBonuses: { waterRich: 1.2, iceRich: 1.4, isCold: 1.3 }, environmentPenalties: { isHot: 0.4, isSandy: 0.5 } },
            { name: "Water Shield", verb: 'raise', object: 'shield of water', type: 'Defense', power: 50, requiresArticle: true, element: 'water', moveTags: ['defensive_stance', 'utility_block', 'projectile_defense', 'construct_creation'],
              usageRequirements: {}, environmentBonuses: { waterRich: 1.4 }, environmentPenalties: { isHot: 0.6, isSandy: 0.5 } },
            { name: "Ice Prison", verb: 'create', object: 'ice prison', type: 'Utility', power: 60, requiresArticle: true, element: 'ice', moveTags: ['utility_control', 'debuff_disable', 'construct_creation', 'single_target'],
              setup: { name: 'Immobilized', duration: 2, intensity: 1.4 },
              usageRequirements: { waterRich: true }, environmentBonuses: { iceRich: 1.3, isCold: 1.2 }, environmentPenalties: { isHot: 0.5 } },
            { name: "Tidal Wave", verb: 'summon', object: 'massive tidal wave', type: 'Finisher', power: 90, requiresArticle: true, element: 'water', moveTags: ['area_of_effect_large', 'environmental_manipulation', 'channeled', 'requires_opening'],
              usageRequirements: { waterRich: true }, environmentBonuses: { isCoastal: 1.5 }, environmentPenalties: {} },
            { name: "Bloodbending", verb: 'control', object: "her opponent's body", type: 'Finisher', power: 100, element: 'special', moveTags: ['channeled', 'debuff_disable', 'single_target', 'unblockable', 'requires_opening'],
              usageRequirements: { isNight: true }, environmentBonuses: {}, environmentPenalties: {} }
        ],
        quotes: { postWin: ["That's how you do it, for my family, for my tribe!"], postWin_overwhelming: ["That's what happens when you underestimate a waterbender!"], postWin_specific: { 'azula': "You're beaten. It's over." } }
    },
    'toph-beifong': {
        id: 'toph-beifong', name: "Toph", type: "Bender", pronouns: { s: 'she', p: 'her', o: 'her' },
        victoryStyle: "Cocky", powerTier: 7,
        pacingProfile: 'opportunist',
        personalityProfile: { aggression: 0.85, patience: 0.4, riskTolerance: 0.8, opportunism: 0.9 },
        environmentalAffinity: { earthRich: 1.2, isRocky: 1.1, metalRich: 1.1, isPrecarious: 0.8, isSlippery: 0.9, hasShiftingGround: 1.1 },
        techniques: [
            { name: "Earth Wave", verb: 'send', object: 'powerful wave of earth', type: 'Offense', power: 60, requiresArticle: true, element: 'earth', moveTags: ['area_of_effect', 'environmental_manipulation'],
              usageRequirements: { earthRich: true }, environmentBonuses: { isRocky: 1.2 }, environmentPenalties: {} },
            { name: "Rock Armor", verb: 'don', object: 'suit of rock armor', type: 'Defense', power: 75, requiresArticle: true, element: 'earth', moveTags: ['defensive_stance', 'utility_armor', 'construct_creation', 'requires_opening'],
              usageRequirements: { earthRich: true }, environmentBonuses: { isRocky: 1.3 }, environmentPenalties: {} },
            { name: "Seismic Slam", verb: 'slam', object: 'her fists to the ground', type: 'Offense', power: 70, element: 'earth', moveTags: ['area_of_effect_large', 'environmental_manipulation', 'unblockable_ground'],
              setup: { name: 'Staggered', duration: 1, intensity: 1.35 },
              usageRequirements: { earthRich: true }, environmentBonuses: { hasShiftingGround: 1.4, isRocky: 1.2 }, environmentPenalties: {} },
            { name: "Metal Bending", verb: 'bend', object: 'the metal in the environment', type: 'Offense', power: 80, element: 'metal', moveTags: ['environmental_manipulation', 'utility_control', 'versatile'],
              usageRequirements: { metalRich: true }, environmentBonuses: { isIndustrial: 1.5 }, environmentPenalties: {} },
            { name: "Boulder Throw", verb: 'launch', object: 'volley of rock projectiles', type: 'Offense', power: 65, element: 'earth', moveTags: ['ranged_attack', 'projectile', 'area_of_effect_small'],
              usageRequirements: { earthRich: true }, environmentBonuses: { isRocky: 1.3 }, environmentPenalties: {} },
            { name: "Rock Coffin", verb: 'entomb', object: 'her foe in a prison of rock', type: 'Finisher', power: 95, element: 'earth', moveTags: ['debuff_disable', 'single_target', 'construct_creation', 'requires_opening'],
              usageRequirements: { earthRich: true }, environmentBonuses: { isRocky: 1.4, isCramped: 1.2 }, environmentPenalties: {} }
        ],
        quotes: { postWin: ["Told you I was the best. The greatest earthbender in the world!"], postWin_overwhelming: ["HA! That's what happens when you fight the greatest earthbender in the world!"], postWin_specific: { 'bumi': "Looks like I'm still the champ, Bumi!" } }
    },
    'zuko': {
        id: 'zuko', name: "Zuko", type: "Bender", pronouns: { s: 'he', p: 'his', o: 'him' },
        victoryStyle: "Determined", powerTier: 6,
        pacingProfile: 'tactical',
        personalityProfile: { aggression: 0.75, patience: 0.6, riskTolerance: 0.6, opportunism: 0.8 },
        environmentalAffinity: { isHot: 1.05, isCold: 0.95, isUrban: 1.0 },
        techniques: [
            { name: "Fire Daggers", verb: 'throw', object: 'volley of fire daggers', type: 'Offense', power: 45, requiresArticle: true, element: 'fire', moveTags: ['ranged_attack', 'projectile', 'area_of_effect_small'],
              usageRequirements: {}, environmentBonuses: { isHot: 1.2 }, environmentPenalties: { isCold: 0.8, waterRich: 0.9 } },
            { name: "Flame Sword", verb: 'ignite', object: 'his dual dao swords', type: 'Offense', power: 55, element: 'fire', moveTags: ['melee_range', 'channeled', 'precise'],
              usageRequirements: {}, environmentBonuses: { isHot: 1.1 }, environmentPenalties: { isCold: 0.9 } },
            { name: "Fire Shield", verb: 'create', object: 'swirling fire shield', type: 'Defense', power: 50, requiresArticle: true, element: 'fire', moveTags: ['defensive_stance', 'utility_block', 'projectile_defense'],
              usageRequirements: {}, environmentBonuses: { isHot: 1.25 }, environmentPenalties: { isCold: 0.75 } },
            { name: "Dragon's Breath", verb: 'unleash', object: 'sustained stream of fire', type: 'Offense', power: 70, requiresArticle: true, element: 'fire', moveTags: ['ranged_attack', 'channeled', 'area_of_effect'],
              usageRequirements: {}, environmentBonuses: { isHot: 1.3 }, environmentPenalties: { isCold: 0.7 } },
            { name: "Fire Whip", verb: 'lash', object: 'out with a whip of fire', type: 'Offense', power: 60, element: 'fire', moveTags: ['melee_range', 'ranged_attack_medium', 'channeled', 'single_target'],
              usageRequirements: {}, environmentBonuses: { isHot: 1.2 }, environmentPenalties: { isCold: 0.8 } },
            { name: "Redemption's Fury", verb: 'overwhelm', object: 'his opponent with a flurry of attacks', type: 'Finisher', power: 85, element: 'fire', moveTags: ['melee_range', 'area_of_effect_small', 'versatile', 'requires_opening'],
              usageRequirements: {}, environmentBonuses: { isHot: 1.2 }, environmentPenalties: { isCold: 0.85 } }
        ],
        quotes: { postWin: ["I fought for my own path. And I won."], postWin_overwhelming: ["My fire burns hotter because I fight for something real!"], postWin_specific: { 'azula': "It's over, Azula. I've found my own strength." } }
    },
    'azula': {
        id: 'azula', name: "Azula", type: "Bender", pronouns: { s: 'she', p: 'her', o: 'her' },
        victoryStyle: "Ruthless", powerTier: 8,
        pacingProfile: 'tactical',
        personalityProfile: { aggression: 0.9, patience: 0.3, riskTolerance: 0.9, opportunism: 1.0 },
        environmentalAffinity: { isHot: 1.1, isCold: 0.9, isUrban: 1.1, isIndustrial: 1.05 },
        techniques: [
            { name: "Calculated Feint", verb: 'execute', object: 'a deceptive feint', type: 'Utility', power: 15, element: 'utility', moveTags: ['utility_reposition'],
              setup: { name: 'Exposed', duration: 2, intensity: 1.5 },
              usageRequirements: {}, environmentBonuses: {}, environmentPenalties: {} },
            { name: "Blue Fire Daggers", verb: 'launch', object: 'razor-sharp blue fire daggers', type: 'Offense', power: 45, element: 'fire', moveTags: ['ranged_attack', 'projectile', 'precise', 'area_of_effect_small'],
              usageRequirements: {}, environmentBonuses: { isHot: 1.25 }, environmentPenalties: { isCold: 0.75 } },
            { name: "Fire Whip", verb: 'lash', object: 'out with a fire whip', type: 'Offense', power: 55, element: 'fire', moveTags: ['melee_range', 'ranged_attack_medium', 'channeled', 'single_target'],
              usageRequirements: {}, environmentBonuses: { isHot: 1.2 }, environmentPenalties: { isCold: 0.8 } },
            { name: "Lightning Generation", verb: 'generate', object: 'precise bolt of lightning', type: 'Finisher', power: 100, requiresArticle: true, element: 'lightning', moveTags: ['ranged_attack', 'instantaneous', 'single_target', 'unblockable_standard', 'requires_opening'],
              usageRequirements: {}, environmentBonuses: {}, environmentPenalties: { waterRich: 0.9 } },
            { name: "Flame Burst", verb: 'erupt with', object: 'burst of blue flame', type: 'Defense', power: 50, requiresArticle: true, element: 'fire', moveTags: ['defensive_stance', 'utility_block', 'area_of_effect_small', 'pushback'],
              usageRequirements: {}, environmentBonuses: { isHot: 1.3 }, environmentPenalties: { isCold: 0.7 } },
            { name: "Precision Strike", verb: 'strike', object: 'with a focused fire blast', type: 'Offense', power: 70, element: 'fire', moveTags: ['ranged_attack', 'single_target', 'precise'],
              usageRequirements: {}, environmentBonuses: { isHot: 1.3 }, environmentPenalties: { isCold: 0.7 } }
        ],
        quotes: { postWin: ["Flawless. As expected."], postWin_overwhelming: ["My power is absolute. You are beneath me."], postWin_specific: { 'zuko': "You were always weak, Zuzu. That's why you'll always lose." } }
    },
    'ozai-not-comet-enhanced': {
        id: 'ozai-not-comet-enhanced', name: "Ozai (No Comet)", type: "Bender", pronouns: { s: 'he', p: 'his', o: 'him' },
        victoryStyle: "Supreme", powerTier: 9,
        pacingProfile: 'berserker',
        personalityProfile: { aggression: 0.95, patience: 0.2, riskTolerance: 1.0, opportunism: 1.0 },
        environmentalAffinity: { isHot: 1.2, isCold: 0.8, isIndustrial: 1.1, isUrban: 1.2 },
        techniques: [
            { name: "Jet Propulsion", verb: 'propel himself', object: 'forward with a burst of flame', type: 'Utility', power: 30, element: 'fire', moveTags: ['utility_reposition', 'evasive'],
                setup: { name: 'Pressured', duration: 1, intensity: 1.2 },
                usageRequirements: {}, environmentBonuses: { isExposed: 1.2 }, environmentPenalties: { isCramped: 0.7 } },
            { name: "Scorching Blast", verb: 'unleash', object: 'scorching blast of fire', type: 'Offense', power: 70, requiresArticle: true, element: 'fire', moveTags: ['ranged_attack', 'area_of_effect_small'],
                usageRequirements: {}, environmentBonuses: { isHot: 1.3, isIndustrial: 1.1 }, environmentPenalties: { isCold: 0.7 } },
            { name: "Flame Wall", verb: 'erect', object: 'towering wall of flame', type: 'Defense', power: 65, requiresArticle: true, element: 'fire', moveTags: ['defensive_stance', 'utility_block', 'construct_creation', 'area_of_effect_large'],
                usageRequirements: {}, environmentBonuses: { isHot: 1.3, isCramped: 1.2 }, environmentPenalties: { isCold: 0.7, waterRich: 0.8 } },
            { name: "Dragon's Roar", verb: 'breathe', object: 'devastating cone of fire', type: 'Offense', power: 85, requiresArticle: true, element: 'fire', moveTags: ['ranged_attack', 'area_of_effect', 'channeled'],
                usageRequirements: {}, environmentBonuses: { isHot: 1.5 }, environmentPenalties: { isCold: 0.5 } },
            { name: "Emperor's Wrath", verb: 'unleash', object: "the Emperor's Wrath", type: 'Finisher', power: 100, element: 'fire', moveTags: ['area_of_effect_large', 'versatile', 'unblockable_standard', 'requires_opening'],
                usageRequirements: {}, environmentBonuses: { isHot: 1.5 }, environmentPenalties: { isCold: 0.5 } }
        ],
        quotes: { postWin: ["The Fire Nation is supreme! My power is absolute!"], postWin_overwhelming: ["I am the Phoenix King! There is no equal!"], postWin_specific: { 'aang-airbending-only': "You thought you could stop me, child? You are nothing." } }
    },
    'bumi': {
        id: 'bumi', name: "Bumi", type: "Bender", pronouns: { s: 'he', p: 'his', o: 'him' },
        victoryStyle: "Madcap", powerTier: 8,
        pacingProfile: 'opportunist',
        personalityProfile: { aggression: 0.8, riskTolerance: 0.9, opportunism: 0.7, patience: 0.5 },
        environmentalAffinity: { earthRich: 1.2, isRocky: 1.1, isUrban: 1.1 },
        techniques: [
            { name: "Rock Avalanche", verb: 'trigger', object: 'massive rock avalanche', type: 'Finisher', power: 95, requiresArticle: true, element: 'earth', moveTags: ['area_of_effect_large', 'environmental_manipulation', 'requires_opening'],
              usageRequirements: { earthRich: true }, environmentBonuses: { isVertical: 1.4, isRocky: 1.3 }, environmentPenalties: {} },
            { name: "Boulder Throw", verb: 'hurl', object: 'giant boulder', type: 'Offense', power: 60, requiresArticle: true, element: 'earth', moveTags: ['ranged_attack', 'projectile', 'single_target'],
              usageRequirements: { earthRich: true }, environmentBonuses: { isRocky: 1.2 }, environmentPenalties: {} },
            { name: "Ground Spike", verb: 'erupt with', object: 'spike of rock from the ground', type: 'Offense', power: 45, requiresArticle: true, element: 'earth', moveTags: ['melee_range', 'ranged_attack_medium', 'single_target', 'unblockable_ground'],
              usageRequirements: { earthRich: true }, environmentBonuses: { isRocky: 1.2 }, environmentPenalties: {} },
            { name: "Terrain Reshape", verb: 'reshape', object: 'the battlefield', type: 'Utility', power: 40, element: 'earth', moveTags: ['utility_control', 'environmental_manipulation'],
              setup: { name: 'Unstable', duration: 2, intensity: 1.2 },
              usageRequirements: { earthRich: true }, environmentBonuses: { hasShiftingGround: 1.5, isUrban: 1.2 }, environmentPenalties: {} }
        ],
        quotes: { postWin: ["Time for a nap! Or maybe some cabbage!"], postWin_overwhelming: ["The earth moves for me! No one can stop the Mad King!"], postWin_specific: { 'toph-beifong': "Not bad, Twinkle-toes! But you have to get up pretty early in the morning to out-crazy me!" } }
    },
    'pakku': {
        id: 'pakku', name: "Pakku", type: "Bender", pronouns: { s: 'he', p: 'his', o: 'him' },
        victoryStyle: "Disciplined", powerTier: 7,
        pacingProfile: 'tactical',
        personalityProfile: { aggression: 0.6, riskTolerance: 0.4, opportunism: 0.8, patience: 0.8 },
        environmentalAffinity: { waterRich: 1.1, iceRich: 1.1, isCold: 1.1, isHot: 0.9, isUrban: 1.0 },
        techniques: [
            { name: "Ice Spikes", verb: 'launch', object: 'volley of ice spikes', type: 'Offense', power: 50, requiresArticle: true, element: 'ice', moveTags: ['ranged_attack', 'projectile', 'area_of_effect_small'],
              usageRequirements: {}, environmentBonuses: { waterRich: 1.1, iceRich: 1.4, isCold: 1.3 }, environmentPenalties: { isHot: 0.4, isSandy: 0.5 } },
            { name: "Water Barrier", verb: 'erect', object: 'solid water barrier', type: 'Defense', power: 60, requiresArticle: true, element: 'water', moveTags: ['defensive_stance', 'utility_block', 'construct_creation', 'setup'],
              usageRequirements: {}, environmentBonuses: { waterRich: 1.4 }, environmentPenalties: { isHot: 0.5, isSandy: 0.4 } },
            { name: "Tidal Surge", verb: 'summon', object: 'powerful tidal surge', type: 'Offense', power: 75, requiresArticle: true, element: 'water', moveTags: ['area_of_effect', 'environmental_manipulation'],
              usageRequirements: { waterRich: true }, environmentBonuses: { isCoastal: 1.4 }, environmentPenalties: {} },
            { name: "Octopus Form", verb: 'assume', object: 'the Octopus Form', type: 'Finisher', power: 90, element: 'water', moveTags: ['defensive_stance', 'channeled', 'versatile', 'area_of_effect_small', 'requires_opening'],
              usageRequirements: { waterRich: true }, environmentBonuses: { iceRich: 1.2, isCold: 1.1 }, environmentPenalties: {} }
        ],
        quotes: { postWin: ["Discipline prevails."], postWin_overwhelming: ["My mastery is absolute. There is no question of the outcome."], postWin_specific: { 'katara': "You have learned much, but the student has not yet surpassed the master." } }
    },
    'jeong-jeong': {
        id: 'jeong-jeong', name: "Jeong Jeong", type: "Bender", pronouns: { s: 'he', p: 'his', o: 'him' },
        victoryStyle: "Wise_Reluctant", powerTier: 6,
        pacingProfile: 'tactical',
        personalityProfile: { aggression: 0.2, riskTolerance: 0.3, opportunism: 0.5, patience: 0.9 },
        environmentalAffinity: { isHot: 1.05, isCold: 0.95, isUrban: 0.9, plantsRich: 1.1 },
        techniques: [
            { name: "Controlled Inferno", verb: 'create', object: 'controlled inferno', type: 'Offense', power: 80, emoji: '🔥', requiresArticle: true, element: 'fire', moveTags: ['area_of_effect', 'channeled'],
              usageRequirements: {}, environmentBonuses: { isHot: 1.1, plantsRich: 1.3 }, environmentPenalties: { isCold: 0.8, waterRich: 0.85 } },
            { name: "Fire Wall", verb: 'raise', object: 'impenetrable wall of fire', type: 'Defense', power: 85, emoji: '🧱', requiresArticle: true, element: 'fire', moveTags: ['defensive_stance', 'utility_block', 'construct_creation', 'area_of_effect_large'],
              setup: { name: 'Cornered', duration: 2, intensity: 1.2 },
              usageRequirements: {}, environmentBonuses: { isHot: 1.2, isCramped: 1.2 }, environmentPenalties: { isCold: 0.75, waterRich: 0.8 } },
            { name: "Flame Whips", verb: 'conjure', object: 'precise flame whips', type: 'Offense', power: 55, emoji: '🐍', element: 'fire', moveTags: ['melee_range', 'ranged_attack_medium', 'single_target', 'precise'],
              usageRequirements: {}, environmentBonuses: { isHot: 1.1 }, environmentPenalties: { isCold: 0.8 } },
            { name: "Precision Burn", verb: 'inflict', object: 'surgical burn', type: 'Offense', power: 45, emoji: '🎯', requiresArticle: true, element: 'fire', moveTags: ['ranged_attack', 'single_target', 'precise'],
              usageRequirements: {}, environmentBonuses: { isHot: 1.1 }, environmentPenalties: { isCold: 0.8 } },
            { name: "Reluctant Finale", verb: 'end', object: 'the fight with a wall of flame', type: 'Finisher', power: 90, emoji: '🛑', element: 'fire', moveTags: ['area_of_effect_large', 'pushback', 'environmental_manipulation', 'requires_opening'],
              usageRequirements: {}, environmentBonuses: { isHot: 1.2, isCramped: 1.3 }, environmentPenalties: { isCold: 0.8, waterRich: 0.8 } }
        ],
        quotes: { postWin: ["The destructive path of fire has been averted, for now."], postWin_reflective: ["The true victory lies in avoiding destruction, not causing it."] }
    },
    'mai': {
        id: 'mai', name: "Mai", type: "Nonbender", pronouns: { s: 'she', p: 'her', o: 'her' },
        victoryStyle: "Deadpan", powerTier: 4,
        pacingProfile: 'opportunist',
        personalityProfile: { aggression: 0.4, riskTolerance: 0.4, opportunism: 0.8, patience: 0.7 },
        environmentalAffinity: { isUrban: 1.1, hasCover: 1.1, isCramped: 1.05, isExposed: 0.9 },
        techniques: [
            { name: "Knife Barrage", verb: 'unleash', object: 'barrage of knives', type: 'Offense', power: 50, emoji: '🔪', requiresArticle: true, element: 'physical', moveTags: ['ranged_attack', 'projectile', 'area_of_effect_small'],
              usageRequirements: {}, environmentBonuses: {}, environmentPenalties: { low_visibility: 0.8 } },
            { name: "Precision Strike", verb: 'throw', object: 'single, perfectly aimed knife', type: 'Offense', power: 65, emoji: '🎯', requiresArticle: true, element: 'physical', moveTags: ['ranged_attack', 'projectile', 'single_target', 'precise'],
              usageRequirements: {}, environmentBonuses: {}, environmentPenalties: { low_visibility: 0.7 } },
            { name: "Knife Wall", verb: 'create', object: 'defensive wall of knives', type: 'Defense', power: 45, emoji: '🧱', requiresArticle: true, element: 'physical', moveTags: ['defensive_stance', 'utility_block', 'trap_delayed'],
              usageRequirements: {}, environmentBonuses: {}, environmentPenalties: {} },
            { name: "Pinning Strike", verb: 'pin', object: "her foe's sleeve to a wall", type: 'Utility', power: 40, emoji: '📌', element: 'physical', moveTags: ['ranged_attack', 'projectile', 'debuff_disable', 'single_target', 'precise'],
              setup: { name: 'Pinned', duration: 2, intensity: 1.45 },
              usageRequirements: {}, environmentBonuses: { isUrban: 1.3, hasCover: 1.2, plantsRich: 1.2 }, environmentPenalties: { isExposed: 0.6, isSandy: 0.8 } },
            { name: "Ricochet Shot", verb: 'launch', object: 'ricochet shot', type: 'Offense', power: 55, emoji: '🔄', requiresArticle: true, element: 'physical', moveTags: ['ranged_attack', 'projectile', 'unpredictable', 'bypasses_defense'],
              usageRequirements: {}, environmentBonuses: { isUrban: 1.4, isCramped: 1.3, isRocky: 1.2 }, environmentPenalties: { isExposed: 0.7, isSandy: 0.8 } },
            { name: "Final Pin", verb: 'unleash', object: 'final volley to trap her opponent', type: 'Finisher', power: 80, emoji: '📍', requiresArticle: true, element: 'physical', moveTags: ['ranged_attack', 'projectile', 'debuff_disable', 'area_of_effect', 'requires_opening'],
              usageRequirements: {}, environmentBonuses: { isCramped: 1.2 }, environmentPenalties: { isExposed: 0.8 } }
        ],
        quotes: { postWin: ["That's it. Are we done now?"], postWin_overwhelming: ["You were never a threat. Just... annoying."], postWin_specific: { 'ty-lee': "Try to flip your way out of that one." } }
    },
    'ty-lee': {
        id: 'ty-lee', name: "Ty Lee", type: "Chi Blocker", pronouns: { s: 'she', p: 'her', o: 'her' },
        victoryStyle: "Playful", powerTier: 4,
        pacingProfile: 'opportunist',
        personalityProfile: { aggression: 0.8, riskTolerance: 0.7, opportunism: 0.9, patience: 0.3 },
        environmentalAffinity: { isUrban: 1.1, isDense: 1.05, isExposed: 0.95, isSlippery: 0.9, hasShiftingGround: 0.95 },
        techniques: [
            { name: "Acrobatic Flips", verb: 'execute', object: 'series of acrobatic flips', type: 'Utility', power: 25, emoji: '🤸‍♀️', requiresArticle: true, element: 'utility', moveTags: ['utility_reposition', 'evasive'],
              setup: { name: 'Distracted', duration: 1, intensity: 1.2 },
              usageRequirements: {}, environmentBonuses: { isVertical: 1.3 }, environmentPenalties: { isSlippery: 0.7, hasShiftingGround: 0.8 } },
            { name: "Pressure Point Strike", verb: 'strike', object: 'vital pressure point', type: 'Offense', power: 60, emoji: '🎯', requiresArticle: true, element: 'physical', moveTags: ['melee_range', 'single_target', 'debuff_disable', 'precise'],
              usageRequirements: {}, environmentBonuses: {}, environmentPenalties: {} },
            { name: "Graceful Dodge", verb: 'dodge', object: 'incoming attack', type: 'Defense', power: 40, emoji: '🍃', requiresArticle: true, element: 'utility', moveTags: ['utility_reposition', 'evasive'],
              usageRequirements: {}, environmentBonuses: {}, environmentPenalties: { isSlippery: 0.8, isCramped: 0.9 } },
            { name: "Chi-Blocking Flurry", verb: 'deliver', object: 'flurry of chi-blocking strikes', type: 'Finisher', power: 85, emoji: '🛑', requiresArticle: true, element: 'special', moveTags: ['melee_range', 'debuff_disable', 'single_target', 'unblockable', 'requires_opening'],
              usageRequirements: {}, environmentBonuses: {}, environmentPenalties: {} }
        ],
        quotes: { postWin: ["Looks like your chi's... on vacation!"], postWin_overwhelming: ["Ta-da! That's how it's done!"], postWin_specific: { 'mai': "Sorry, Mai! Your aura is still a lovely shade of gloomy pink, though!" } }
    },
};
// FILE: data/characters/gaang.js
'use strict';

// Contains character data for the core members of Team Avatar.

export const gaangCharacters = {
    'sokka': {
        id: 'sokka', name: "Sokka", type: "Nonbender", pronouns: { s: 'he', p: 'his', o: 'him' },
        victoryStyle: "Madcap", powerTier: 3,
        pacingProfile: 'tactical',
        personalityProfile: { aggression: 0.5, patience: 0.6, riskTolerance: 0.4, opportunism: 0.7 },
        environmentalAffinity: { hasCover: 1.1, isUrban: 1.05, isExposed: 0.95, plantsRich: 1.05 },
        techniques: [
            { name: "Sword Strike", verb: 'strike', object: 'with his meteorite sword', type: 'Offense', power: 40, element: 'physical', moveTags: ['melee_range', 'single_target', 'precise'] },
            { name: "Boomerang Throw", verb: 'throw', object: 'his trusty boomerang', type: 'Offense', power: 35, element: 'physical', moveTags: ['ranged_attack', 'projectile', 'single_target', 'unpredictable'] },
            { name: "Shield Block", verb: 'block', object: 'with his shield', type: 'Defense', power: 30, element: 'utility', moveTags: ['defensive_stance', 'utility_block'] },
            { name: "Tactical Positioning", verb: 'reposition', object: 'for a tactical advantage', type: 'Utility', power: 20, element: 'utility', moveTags: ['utility_reposition', 'evasive'], setup: { name: 'Outmaneuvered', duration: 1, intensity: 1.1 } },
            { name: "Improvised Trap", verb: 'devise', object: 'clever trap', type: 'Utility', power: 50, requiresArticle: true, element: 'utility', moveTags: ['trap_delayed', 'utility_control', 'environmental_manipulation'], setup: { name: 'Trapped', duration: 2, intensity: 1.3 } },
            { name: "The Sokka Special", verb: 'spring', object: 'masterfully constructed snare trap', type: 'Finisher', power: 75, requiresArticle: true, element: 'utility', moveTags: ['trap_delayed', 'debuff_disable', 'single_target', 'requires_opening'] }
        ],
        quotes: { postWin: ["Boomerang! You *do* always come back!"], postWin_overwhelming: ["Nailed it! I am the greatest warrior-inventor of our time!"], postWin_specific: { 'aang-airbending-only': "See? Brains beat brawn... and... wind." } },
        relationships: {
            'katara': { relationshipType: 'sibling_support', stressModifier: 0.9, resilienceModifier: 1.2 }
        }
    },
    'aang-airbending-only': {
        id: 'aang-airbending-only', name: "Aang (Airbending only)", type: "Bender", pronouns: { s: 'he', p: 'his', o: 'him' },
        victoryStyle: "Pacifist", powerTier: 9,
        pacingProfile: 'tactical',
        personalityProfile: { aggression: 0.5, patience: 0.9, riskTolerance: 0.2, opportunism: 0.7 },
        environmentalAffinity: { airRich: 1.1, isExposed: 1.05, isUrban: 0.9, isIndustrial: 0.9 },
        techniques: [
            { name: "Air Scooter", verb: 'ride', object: 'his air scooter', type: 'Utility', power: 20, element: 'air', moveTags: ['utility_reposition', 'evasive', 'channeled'], setup: { name: 'Off-Balance', duration: 1, intensity: 1.15 } },
            { name: "Air Blast", verb: 'unleash', object: 'focused blast of air', type: 'Offense', power: 40, requiresArticle: true, element: 'air', moveTags: ['ranged_attack', 'area_of_effect_small', 'pushback'] },
            { name: "Wind Shield", verb: 'form', object: 'swirling shield of wind', type: 'Defense', power: 50, requiresArticle: true, element: 'air', moveTags: ['defensive_stance', 'utility_block', 'projectile_defense'] },
            { name: "Tornado Whirl", verb: 'create', object: 'disorienting tornado', type: 'Offense', power: 65, requiresArticle: true, element: 'air', moveTags: ['area_of_effect', 'channeled', 'utility_control'], setup: { name: 'Disoriented', duration: 2, intensity: 1.25 } },
            { name: "Gust Push", verb: 'push', object: 'with a sudden gust of wind', type: 'Offense', power: 30, element: 'air', moveTags: ['ranged_attack', 'single_target', 'pushback'] },
            { name: "Sweeping Gust", verb: 'sweep', object: 'his foe off their feet', type: 'Finisher', power: 80, element: 'air', moveTags: ['area_of_effect', 'debuff_disable', 'pushback', 'requires_opening'] }
        ],
        quotes: { postWin: ["Phew! Nobody got hurt, right? Mostly."], postWin_overwhelming: ["Whoa, that was a lot of air! Are you okay?"], postWin_specific: { 'ozai-not-comet-enhanced': "It's over. This world doesn't need any more destruction." } },
        relationships: {
            'ozai-not-comet-enhanced': { relationshipType: "fated_adversary", stressModifier: 1.4, resilienceModifier: 1.3, emotionalModifiers: { aggressionBoost: 0.2, riskToleranceReduction: 0.3, patienceBoost: 0.2, } },
            'azula': { relationshipType: "nonlethal_pacifism", stressModifier: 1.2, resilienceModifier: 1.2, emotionalModifiers: { aggressionReduction: 0.4, riskToleranceReduction: 0.5, patienceBoost: 0.3, mercyTrigger: true, } }
        }
    },
    'katara': {
        id: 'katara', name: "Katara", type: "Bender", pronouns: { s: 'she', p: 'her', o: 'her' },
        victoryStyle: "Fierce", powerTier: 7,
        pacingProfile: 'tactical',
        personalityProfile: { aggression: 0.6, patience: 0.7, riskTolerance: 0.5, opportunism: 0.8 },
        environmentalAffinity: { waterRich: 1.1, isCold: 1.05, isUrban: 0.9, isHot: 0.9 },
        techniques: [
            { name: "Water Whip", verb: 'lash', object: 'out with a water whip', type: 'Offense', power: 45, element: 'water', moveTags: ['melee_range', 'ranged_attack_medium', 'channeled', 'single_target'] },
            { name: "Ice Spears", verb: 'launch', object: 'volley of ice spears', type: 'Offense', power: 55, requiresArticle: true, element: 'ice', moveTags: ['ranged_attack', 'projectile', 'area_of_effect_small'] },
            { name: "Water Shield", verb: 'raise', object: 'shield of water', type: 'Defense', power: 50, requiresArticle: true, element: 'water', moveTags: ['defensive_stance', 'utility_block', 'projectile_defense', 'construct_creation'] },
            { name: "Ice Prison", verb: 'create', object: 'ice prison', type: 'Utility', power: 60, requiresArticle: true, element: 'ice', moveTags: ['utility_control', 'debuff_disable', 'construct_creation', 'single_target'], setup: { name: 'Immobilized', duration: 2, intensity: 1.4 } },
            { name: "Tidal Wave", verb: 'summon', object: 'massive tidal wave', type: 'Finisher', power: 90, requiresArticle: true, element: 'water', moveTags: ['area_of_effect_large', 'environmental_manipulation', 'channeled', 'requires_opening'] },
            { name: "Bloodbending", verb: 'control', object: "her opponent's body", type: 'Finisher', power: 100, element: 'special', moveTags: ['channeled', 'debuff_disable', 'single_target', 'unblockable', 'requires_opening'] }
        ],
        quotes: { postWin: ["That's how you do it, for my family, for my tribe!"], postWin_overwhelming: ["That's what happens when you underestimate a waterbender!"], postWin_specific: { 'azula': "You're beaten. It's over." } },
        relationships: {
            'zuko': { relationshipType: "tense_alliance", stressModifier: 1.0, resilienceModifier: 1.1, emotionalModifiers: { opportunismBoost: 0.2, patienceBoost: 0.1, } },
            'azula': { relationshipType: "bitter_rivalry", stressModifier: 1.5, resilienceModifier: 1.0, emotionalModifiers: { aggressionBoost: 0.3, riskToleranceBoost: 0.2, opportunismBoost: 0.2, } }
        }
    },
    'toph-beifong': {
        id: 'toph-beifong', name: "Toph", type: "Bender", pronouns: { s: 'she', p: 'her', o: 'her' },
        victoryStyle: "Cocky", powerTier: 7,
        pacingProfile: 'opportunist',
        personalityProfile: { aggression: 0.85, patience: 0.4, riskTolerance: 0.8, opportunism: 0.9 },
        environmentalAffinity: { earthRich: 1.2, isRocky: 1.1, metalRich: 1.1, isPrecarious: 0.8, isSlippery: 0.9, hasShiftingGround: 1.1 },
        techniques: [
            { name: "Earth Wave", verb: 'send', object: 'powerful wave of earth', type: 'Offense', power: 60, requiresArticle: true, element: 'earth', moveTags: ['area_of_effect', 'environmental_manipulation'] },
            { name: "Rock Armor", verb: 'don', object: 'suit of rock armor', type: 'Defense', power: 75, requiresArticle: true, element: 'earth', moveTags: ['defensive_stance', 'utility_armor', 'construct_creation', 'requires_opening'] },
            { name: "Seismic Slam", verb: 'slam', object: 'her fists to the ground', type: 'Offense', power: 70, element: 'earth', moveTags: ['area_of_effect_large', 'environmental_manipulation', 'unblockable_ground'], setup: { name: 'Staggered', duration: 1, intensity: 1.35 } },
            { name: "Metal Bending", verb: 'bend', object: 'the metal in the environment', type: 'Offense', power: 80, element: 'metal', moveTags: ['environmental_manipulation', 'utility_control', 'versatile'] },
            { name: "Boulder Throw", verb: 'launch', object: 'volley of rock projectiles', type: 'Offense', power: 65, element: 'earth', moveTags: ['ranged_attack', 'projectile', 'area_of_effect_small'] },
            { name: "Rock Coffin", verb: 'entomb', object: 'her foe in a prison of rock', type: 'Finisher', power: 95, element: 'earth', moveTags: ['debuff_disable', 'single_target', 'construct_creation', 'requires_opening'] }
        ],
        quotes: { postWin: ["Told you I was the best. The greatest earthbender in the world!"], postWin_overwhelming: ["HA! That's what happens when you fight the greatest earthbender in the world!"], postWin_specific: { 'bumi': "Looks like I'm still the champ, Bumi!" } },
        relationships: {}
    },
    'zuko': {
        id: 'zuko', name: "Zuko", type: "Bender", pronouns: { s: 'he', p: 'his', o: 'him' },
        victoryStyle: "Determined", powerTier: 6,
        pacingProfile: 'tactical',
        personalityProfile: { aggression: 0.75, patience: 0.6, riskTolerance: 0.6, opportunism: 0.8 },
        environmentalAffinity: { isHot: 1.05, isCold: 0.95, isUrban: 1.0 },
        techniques: [
            { name: "Fire Daggers", verb: 'throw', object: 'volley of fire daggers', type: 'Offense', power: 45, requiresArticle: true, element: 'fire', moveTags: ['ranged_attack', 'projectile', 'area_of_effect_small'] },
            { name: "Flame Sword", verb: 'ignite', object: 'his dual dao swords', type: 'Offense', power: 55, element: 'fire', moveTags: ['melee_range', 'channeled', 'precise'] },
            { name: "Fire Shield", verb: 'create', object: 'swirling fire shield', type: 'Defense', power: 50, requiresArticle: true, element: 'fire', moveTags: ['defensive_stance', 'utility_block', 'projectile_defense'] },
            { name: "Dragon's Breath", verb: 'unleash', object: 'sustained stream of fire', type: 'Offense', power: 70, requiresArticle: true, element: 'fire', moveTags: ['ranged_attack', 'channeled', 'area_of_effect'] },
            { name: "Fire Whip", verb: 'lash', object: 'out with a whip of fire', type: 'Offense', power: 60, element: 'fire', moveTags: ['melee_range', 'ranged_attack_medium', 'channeled', 'single_target'] },
            { name: "Redemption's Fury", verb: 'overwhelm', object: 'his opponent with a flurry of attacks', type: 'Finisher', power: 85, element: 'fire', moveTags: ['melee_range', 'area_of_effect_small', 'versatile', 'requires_opening'] }
        ],
        quotes: { postWin: ["I fought for my own path. And I won."], postWin_overwhelming: ["My fire burns hotter because I fight for something real!"], postWin_specific: { 'azula': "It's over, Azula. I've found my own strength." } },
        relationships: {
            'azula': { relationshipType: "sibling_rivalry_inferior", stressModifier: 2.0, resilienceModifier: 0.8, emotionalModifiers: { aggressionBoost: 0.2, riskToleranceBoost: 0.3, patienceReduction: 0.2, } },
            'ozai-not-comet-enhanced': { relationshipType: "parental_defiance", stressModifier: 1.8, resilienceModifier: 1.2, emotionalModifiers: { aggressionBoost: 0.3, riskToleranceReduction: 0.1, patienceBoost: 0.2, } },
            'iroh': { relationshipType: "mentor_respect", stressModifier: 0.5, resilienceModifier: 1.5, emotionalModifiers: { aggressionReduction: 0.2, patienceBoost: 0.4, riskToleranceReduction: 0.2, } }
        }
    },
};
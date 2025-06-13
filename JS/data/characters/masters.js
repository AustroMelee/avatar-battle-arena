// FILE: data/characters/masters.js
'use strict';

// Contains character data for the established and powerful masters. (V2 with full personality profiles)

export const masterCharacters = {
    'bumi': {
        id: 'bumi', name: "Bumi", type: "Bender", pronouns: { s: 'he', p: 'his', o: 'him' },
        victoryStyle: "Madcap", powerTier: 8,
        pacingProfile: 'opportunist',
        personalityProfile: { aggression: 0.8, patience: 0.5, riskTolerance: 0.9, opportunism: 0.7, creativity: 1.0, defensiveBias: 0.3, antiRepeater: 0.9, signatureMoveBias: { "Rock Avalanche": 1.2, "Terrain Reshape": 1.4 } },
        behaviorProfile: { predictability: 0.1, creativity: 1.0, focus: 0.4 },
        specialTraits: { resilientToManipulation: 1.0 }, // Mad genius, sees through everything
        techniques: [
            { name: "Rock Avalanche", verb: 'trigger', object: 'massive rock avalanche', type: 'Finisher', power: 95, requiresArticle: true, element: 'earth', moveTags: ['area_of_effect_large', 'environmental_manipulation', 'requires_opening', 'highRisk'] },
            { name: "Boulder Throw", verb: 'hurl', object: 'giant boulder', type: 'Offense', power: 60, requiresArticle: true, element: 'earth', moveTags: ['ranged_attack', 'projectile', 'single_target'] },
            { name: "Ground Spike", verb: 'erupt with', object: 'spike of rock from the ground', type: 'Offense', power: 45, requiresArticle: true, element: 'earth', moveTags: ['melee_range', 'ranged_attack_medium', 'single_target', 'unblockable_ground'] },
            { name: "Terrain Reshape", verb: 'reshape', object: 'the battlefield', type: 'Utility', power: 40, element: 'earth', moveTags: ['utility_control', 'environmental_manipulation'] }
        ],
        quotes: { postWin: ["Time for a nap! Or maybe some cabbage!"], postWin_overwhelming: ["The earth moves for me! No one can stop the Mad King!"], postWin_specific: { 'toph-beifong': "Not bad, Twinkle-toes! But you have to get up pretty early in the morning to out-crazy me!" } },
        relationships: {}
    },
    'pakku': {
        id: 'pakku', name: "Pakku", type: "Bender", pronouns: { s: 'he', p: 'his', o: 'him' },
        victoryStyle: "Disciplined", powerTier: 7,
        pacingProfile: 'tactical',
        personalityProfile: { aggression: 0.6, patience: 0.8, riskTolerance: 0.4, opportunism: 0.8, creativity: 0.4, defensiveBias: 0.7, antiRepeater: 0.2, signatureMoveBias: { "Octopus Form": 1.5, "Water Barrier": 1.3 } },
        behaviorProfile: { predictability: 0.9, creativity: 0.4, focus: 0.9 },
        specialTraits: { resilientToManipulation: 0.8 }, // Rigid and disciplined mind
        techniques: [
            { name: "Ice Spikes", verb: 'launch', object: 'volley of ice spikes', type: 'Offense', power: 50, requiresArticle: true, element: 'ice', moveTags: ['ranged_attack', 'projectile', 'area_of_effect_small'] },
            { name: "Water Barrier", verb: 'erect', object: 'solid water barrier', type: 'Defense', power: 60, requiresArticle: true, element: 'water', moveTags: ['defensive_stance', 'utility_block', 'construct_creation', 'setup'] },
            { name: "Tidal Surge", verb: 'summon', object: 'powerful tidal surge', type: 'Offense', power: 75, requiresArticle: true, element: 'water', moveTags: ['area_of_effect', 'environmental_manipulation'] },
            { name: "Octopus Form", verb: 'assume', object: 'the Octopus Form', type: 'Finisher', power: 90, element: 'water', moveTags: ['defensive_stance', 'channeled', 'versatile', 'area_of_effect_small', 'requires_opening'] }
        ],
        quotes: { postWin: ["Discipline prevails."], postWin_overwhelming: ["My mastery is absolute. There is no question of the outcome."], postWin_specific: { 'katara': "You have learned much, but the student has not yet surpassed the master." } },
        relationships: {}
    },
    'jeong-jeong': {
        id: 'jeong-jeong', name: "Jeong Jeong", type: "Bender", pronouns: { s: 'he', p: 'his', o: 'him' },
        victoryStyle: "Wise_Reluctant", powerTier: 6,
        pacingProfile: 'tactical',
        personalityProfile: { aggression: 0.2, patience: 0.9, riskTolerance: 0.3, opportunism: 0.5, creativity: 0.5, defensiveBias: 0.9, antiRepeater: 0.4, signatureMoveBias: { "Fire Wall": 1.6 } },
        behaviorProfile: { predictability: 0.8, creativity: 0.5, focus: 0.85 },
        specialTraits: { resilientToManipulation: 1.0 }, // Master of self-control
        techniques: [
            { name: "Controlled Inferno", verb: 'create', object: 'controlled inferno', type: 'Offense', power: 80, emoji: '🔥', requiresArticle: true, element: 'fire', moveTags: ['area_of_effect', 'channeled'] },
            { name: "Fire Wall", verb: 'raise', object: 'impenetrable wall of fire', type: 'Defense', power: 85, emoji: '🧱', requiresArticle: true, element: 'fire', moveTags: ['defensive_stance', 'utility_block', 'construct_creation', 'area_of_effect_large'], setup: { name: 'Cornered', duration: 2, intensity: 1.2 } },
            { name: "Flame Whips", verb: 'conjure', object: 'precise flame whips', type: 'Offense', power: 55, emoji: '🐍', element: 'fire', moveTags: ['melee_range', 'ranged_attack_medium', 'single_target', 'precise'] },
            { name: "Precision Burn", verb: 'inflict', object: 'surgical burn', type: 'Offense', power: 45, emoji: '🎯', requiresArticle: true, element: 'fire', moveTags: ['ranged_attack', 'single_target', 'precise'] },
            { name: "Reluctant Finale", verb: 'end', object: 'the fight with a wall of flame', type: 'Finisher', power: 90, emoji: '🛑', element: 'fire', moveTags: ['area_of_effect_large', 'pushback', 'environmental_manipulation', 'requires_opening'] }
        ],
        quotes: { postWin: ["The destructive path of fire has been averted, for now."], postWin_reflective: ["The true victory lies in avoiding destruction, not causing it."] },
        relationships: {}
    },
};
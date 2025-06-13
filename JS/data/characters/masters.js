'use strict';

export const masterCharacters = {
    'bumi': {
        id: 'bumi', name: "Bumi", type: "Bender", pronouns: { s: 'he', p: 'his', o: 'him' },
        imageUrl: 'https://static.wikia.nocookie.net/avatar/images/e/e8/King_Bumi.png/revision/latest?cb=20140106141303',
        victoryStyle: "Madcap", powerTier: 8,
        personalityProfile: { aggression: 0.8, patience: 0.5, riskTolerance: 0.9, opportunism: 0.7, creativity: 1.0, defensiveBias: 0.3, antiRepeater: 0.9, signatureMoveBias: { "Rock Avalanche": 1.2, "Terrain Reshape": 1.4 } },
        specialTraits: { resilientToManipulation: 1.0 },
        narrative: {
            battleStart: [{ type: 'spoken', line: "Lettuce leaf? Mmm, tasty! Oh, right, the fight!" }, { type: 'internal', line: "They expect me to be a straightforward old man. Heh. Time to think outside the box... or inside the rock!" }],
            onIntentSelection: {
                DesperateGambit: [{ type: 'spoken', line: "Let's try some neutral jing! You know, the kind where I wait... and then throw a building at you!" }],
                BreakTheTurtle: [{ type: 'internal', line: "A rock can be a very patient opponent. But I'm more patient!" }]
            },
            onManipulation: {
                asVictim: [{ type: 'spoken', line: "Your words are like tiny pebbles! They bounce right off my magnificent rock-hard abs!" }]
            },
            onPrediction: {
                correct: [{ type: 'spoken', line: "Your rock-and-roll is a little off-key! I knew you'd do that." }],
            },
            onVictory: { Default: [{ line: "Time for a nap! Or maybe some cabbage!" }] }
        },
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
        imageUrl: 'https://static.wikia.nocookie.net/avatar/images/b/bb/Pakku_looking_smug.png/revision/latest?cb=20140119164142',
        victoryStyle: "Disciplined", powerTier: 7,
        personalityProfile: { aggression: 0.6, patience: 0.8, riskTolerance: 0.4, opportunism: 0.8, creativity: 0.4, defensiveBias: 0.7, antiRepeater: 0.2, signatureMoveBias: { "Octopus Form": 1.5, "Water Barrier": 1.3 } },
        specialTraits: { resilientToManipulation: 0.8 },
        narrative: {
            battleStart: [{ type: 'spoken', line: "Let us see if you have learned anything about discipline." }],
            onIntentSelection: {
                CautiousDefense: [{ type: 'internal', line: "A flawless defense is the foundation of victory. Let them waste their energy." }],
                OpeningMoves: [{ type: 'internal', line: "Observe their form. Find the weakness in their style." }]
            },
            onManipulation: {
                asVictim: [{ type: 'spoken', line: "Your pathetic attempts at mind games are as formless as your technique." }]
            },
            onPrediction: {
                correct: [{ type: 'internal', line: "An undisciplined attack. As expected." }],
                wrong: [{ type: 'internal', line: "A surprising lack of form. It will not work a second time." }]
            },
            onVictory: { Default: [{ line: "Discipline prevails." }] }
        },
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
        imageUrl: 'https://static.wikia.nocookie.net/avatar/images/a/a7/Jeong_Jeong_serious.png/revision/latest?cb=20140116113256',
        victoryStyle: "Wise_Reluctant", powerTier: 6,
        personalityProfile: { aggression: 0.2, patience: 0.9, riskTolerance: 0.3, opportunism: 0.5, creativity: 0.5, defensiveBias: 0.9, antiRepeater: 0.4, signatureMoveBias: { "Fire Wall": 1.6 } },
        specialTraits: { resilientToManipulation: 1.0 },
        narrative: {
            battleStart: [{ type: 'spoken', line: "You wish to see the destructive power of fire? I will show you... so that you may learn to respect it." }],
            onIntentSelection: {
                CautiousDefense: [{ type: 'internal', line: "Control. Fire must be controlled, contained. I will not let it rage." }],
            },
            onManipulation: {
                asVictim: [{ type: 'internal', line: "Words are wind. The flame within me is steady." }]
            },
            onMoveExecution: {
                'Fire Wall': { Critical: [{ type: 'internal', line: "This is what I warned of... the terrible power..." }] }
            },
            onVictory: { Default: [{ line: "The destructive path of fire has been averted, for now." }] }
        },
        techniques: [
            { name: "Controlled Inferno", verb: 'create', object: 'controlled inferno', type: 'Offense', power: 80, requiresArticle: true, element: 'fire', moveTags: ['area_of_effect', 'channeled'] },
            { name: "Fire Wall", verb: 'raise', object: 'impenetrable wall of fire', type: 'Defense', power: 85, requiresArticle: true, element: 'fire', moveTags: ['defensive_stance', 'utility_block', 'construct_creation', 'area_of_effect_large'], setup: { name: 'Cornered', duration: 2, intensity: 1.2 } },
            { name: "Flame Whips", verb: 'conjure', object: 'precise flame whips', type: 'Offense', power: 55, element: 'fire', moveTags: ['melee_range', 'ranged_attack_medium', 'single_target', 'precise'] },
            { name: "Precision Burn", verb: 'inflict', object: 'surgical burn', type: 'Offense', power: 45, requiresArticle: true, element: 'fire', moveTags: ['ranged_attack', 'single_target', 'precise'] },
            { name: "Reluctant Finale", verb: 'end', object: 'the fight with a wall of flame', type: 'Finisher', power: 90, element: 'fire', moveTags: ['area_of_effect_large', 'pushback', 'environmental_manipulation', 'requires_opening'] }
        ],
        quotes: { postWin: ["The destructive path of fire has been averted, for now."], postWin_reflective: ["The true victory lies in avoiding destruction, not causing it."] },
        relationships: {}
    },
};
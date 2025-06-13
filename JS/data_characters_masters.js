// FILE: data_characters_masters.js
'use strict';

export const masterCharacters = {
    'bumi': {
        id: 'bumi', name: "Bumi", type: "Bender", pronouns: { s: 'he', p: 'his', o: 'him' },
        imageUrl: 'https://static.wikia.nocookie.net/avatar/images/e/e8/King_Bumi.png',
        victoryStyle: "Madcap", powerTier: 8,
        personalityProfile: { aggression: 0.8, patience: 0.5, riskTolerance: 0.9, opportunism: 0.7, creativity: 1.0, defensiveBias: 0.3, antiRepeater: 0.9, signatureMoveBias: { "Rock Avalanche": 1.2, "Terrain Reshape": 1.4 } },
        specialTraits: { resilientToManipulation: 1.0 },
        collateralTolerance: 0.5, // Moderate tolerance. Enjoys chaos, but cares about his city/earth kingdom
        mobility: 0.3, // Bumi relies on raw earth power, not nimble movement
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
            onCollateral: {
                causingDamage: [
                    { type: 'spoken', line: "Whee! Buildings make excellent projectiles!" },
                    { type: 'internal', line: "A little structural re-design never hurt anyone... much." },
                    { type: 'spoken', line: "Just making sure the ground is properly agitated!" }
                ],
                observingDamage: [
                    { type: 'spoken', line: "Now that's a mess! But don't worry, the earth can heal itself!" },
                    { type: 'internal', line: "Such an inefficient way to make rubble. Needs more whimsy!" },
                    { type: 'spoken', line: "What, are you trying to rearrange the whole city? That's my job!" }
                ],
                stressedByDamage: [
                    { type: 'internal', line: "This is getting a bit too destructive. Even for me, chaos has its limits!" },
                    { type: 'spoken', line: "Whoa there, {opponent.s}! Let's not bring down the whole neighborhood!" }
                ],
                thrivingInDamage: [ // Bumi thrives on chaotic, shifting earth
                    { type: 'internal', line: "Ah, the symphony of crumbling stone! It's music to my ears!" },
                    { type: 'spoken', line: "Come on, make more noise! The more unstable it gets, the more fun I have!" }
                ]
            },
            onVictory: { Default: [{ line: "Time for a nap! Or maybe some cabbage!" }] },
            onMoveExecution: {
                'Tactical Reposition': { Critical: [{ type: 'spoken', line: "Didn't see that coming, did ya?!" }], Weak: [{ type: 'internal', line: "Ugh, my knees aren't what they used to be." }] }
            }
        },
        techniques: [
            { name: "Rock Avalanche", verb: 'trigger', object: 'massive rock avalanche', type: 'Finisher', power: 95, requiresArticle: true, element: 'earth', moveTags: ['area_of_effect_large', 'environmental_manipulation', 'requires_opening', 'highRisk'], collateralImpact: 'high' },
            { name: "Boulder Throw", verb: 'hurl', object: 'giant boulder', type: 'Offense', power: 60, requiresArticle: true, element: 'earth', moveTags: ['ranged_attack', 'projectile', 'single_target'], collateralImpact: 'medium' },
            { name: "Ground Spike", verb: 'erupt with', object: 'spike of rock from the ground', type: 'Offense', power: 45, requiresArticle: true, element: 'earth', moveTags: ['melee_range', 'ranged_attack_medium', 'single_target', 'unblockable_ground'], collateralImpact: 'low' },
            { name: "Terrain Reshape", verb: 'reshape', object: 'the battlefield', type: 'Utility', power: 40, element: 'earth', moveTags: ['utility_control', 'environmental_manipulation'], collateralImpact: 'low' },
            { name: "Tactical Reposition", verb: 'execute', object: 'a nimble repositioning', type: 'Utility', power: 10, element: 'utility', moveTags: ['mobility_move', 'evasive', 'reposition'], isRepositionMove: true, collateralImpact: 'none' } // NEW MOVE
        ],
        quotes: { postWin: ["Time for a nap! Or maybe some cabbage!"], postWin_overwhelming: ["The earth moves for me! No one can stop the Mad King!"], postWin_specific: { 'toph-beifong': "Not bad, Twinkle-toes! But you have to get up pretty early in the morning to out-crazy me!" } },
        relationships: {}
    },
    'pakku': {
        id: 'pakku', name: "Pakku", type: "Bender", pronouns: { s: 'he', p: 'his', o: 'him' },
        imageUrl: 'https://static.wikia.nocookie.net/avatar/images/b/bb/Pakku_looking_smug.png',
        victoryStyle: "Disciplined", powerTier: 7,
        personalityProfile: { aggression: 0.6, patience: 0.8, riskTolerance: 0.4, opportunism: 0.8, creativity: 0.4, defensiveBias: 0.7, antiRepeater: 0.2, signatureMoveBias: { "Octopus Form": 1.5, "Water Barrier": 1.3 } },
        specialTraits: { resilientToManipulation: 0.8 },
        collateralTolerance: 0.3, // Moderate-low tolerance, values order and control
        mobility: 0.5, // Pakku is disciplined, not particularly nimble but efficient
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
            onCollateral: {
                causingDamage: [
                    { type: 'internal', line: "A necessary disruption. Control the water, control the chaos." },
                    { type: 'spoken', line: "Such an unruly display. This is not the way of water." }
                ],
                observingDamage: [
                    { type: 'spoken', line: "Senseless. Such a waste of resources." },
                    { type: 'internal', line: "Their lack of control is evident in their wake of destruction." },
                    { type: 'spoken', line: "This is merely recklessness, not power." }
                ],
                stressedByDamage: [
                    { type: 'internal', line: "The environment is becoming too volatile. I must reassert control." },
                    { type: 'spoken', line: "This chaos is intolerable!" }
                ],
                thrivingInDamage: [] // Not applicable for Pakku
            },
            onVictory: { Default: [{ line: "Discipline prevails." }] },
            onMoveExecution: {
                'Tactical Reposition': { Critical: [{ type: 'spoken', line: "Proper form is everything." }], Weak: [{ type: 'internal', line: "My movements were not precise enough." }] }
            }
        },
        techniques: [
            { name: "Ice Spikes", verb: 'launch', object: 'volley of ice spikes', type: 'Offense', power: 50, requiresArticle: true, element: 'ice', moveTags: ['ranged_attack', 'projectile', 'area_of_effect_small'], collateralImpact: 'low' },
            { name: "Water Barrier", verb: 'erect', object: 'solid water barrier', type: 'Defense', power: 60, requiresArticle: true, element: 'water', moveTags: ['defensive_stance', 'utility_block', 'construct_creation', 'setup'], collateralImpact: 'none' },
            { name: "Tidal Surge", verb: 'summon', object: 'powerful tidal surge', type: 'Offense', power: 75, requiresArticle: true, element: 'water', moveTags: ['area_of_effect', 'environmental_manipulation'], collateralImpact: 'medium' },
            { name: "Octopus Form", verb: 'assume', object: 'the Octopus Form', type: 'Finisher', power: 90, element: 'water', moveTags: ['defensive_stance', 'channeled', 'versatile', 'area_of_effect_small', 'requires_opening'], collateralImpact: 'low' },
            { name: "Tactical Reposition", verb: 'execute', object: 'a nimble repositioning', type: 'Utility', power: 10, element: 'utility', moveTags: ['mobility_move', 'evasive', 'reposition'], isRepositionMove: true, collateralImpact: 'none' } // NEW MOVE
        ],
        quotes: { postWin: ["Discipline prevails."], postWin_overwhelming: ["My mastery is absolute. There is no question of the outcome."], postWin_specific: { 'katara': "You have learned much, but the student has not yet surpassed the master." } },
        relationships: {}
    },
    'jeong-jeong': {
        id: 'jeong-jeong', name: "Jeong Jeong", type: "Bender", pronouns: { s: 'he', p: 'his', o: 'him' },
        imageUrl: 'https://static.wikia.nocookie.net/avatar/images/a/a7/Jeong_Jeong_serious.png',
        victoryStyle: "Wise_Reluctant", powerTier: 6,
        personalityProfile: { aggression: 0.2, patience: 0.9, riskTolerance: 0.3, opportunism: 0.5, creativity: 0.5, defensiveBias: 0.9, antiRepeater: 0.4, signatureMoveBias: { "Fire Wall": 1.6 } },
        specialTraits: { resilientToManipulation: 1.0 },
        collateralTolerance: 0.0, // Extremely low tolerance, fears fire's destructive potential
        mobility: 0.4, // Jeong Jeong is disciplined, but not known for rapid movement
        narrative: {
            battleStart: [{ type: 'spoken', line: "You wish to see the destructive power of fire? I will show you... so that you may learn to respect it." }],
            onIntentSelection: {
                CautiousDefense: [{ type: 'internal', line: "Control. Fire must be controlled, contained. I will not let it rage." }],
            },
            onManipulation: {
                asVictim: [{ type: 'internal', line: "Words are wind. The flame within me is steady." }]
            },
            onMoveExecution: {
                'Fire Wall': { Critical: [{ type: 'internal', line: "This is what I warned of... the terrible power..." }] },
                'Tactical Reposition': { Critical: [{ type: 'spoken', line: "The flame is where I direct it." }], Weak: [{ type: 'internal', line: "A lapse in control. Unacceptable." }] }
            },
            onCollateral: {
                causingDamage: [
                    { type: 'internal', line: "No! This is exactly what I wish to avoid. Control the flame!" },
                    { type: 'spoken', line: "Fire is not meant for such senseless devastation!" },
                    { type: 'internal', line: "The destructive path... I must contain it." }
                ],
                observingDamage: [
                    { type: 'spoken', line: "This is a perversion of bending! A demonstration of pure chaos!" },
                    { type: 'internal', line: "The fire rages out of control. My worst fears realized." },
                    { type: 'spoken', line: "Look at the ruin! Is this what you seek?" }
                ],
                stressedByDamage: [
                    { type: 'internal', line: "The inferno grows... I cannot let it consume everything!" },
                    { type: 'spoken', line: "This is a nightmare! I must stop it!" }
                ],
                thrivingInDamage: [] // Not applicable for Jeong Jeong
            },
            onVictory: { Default: [{ line: "The destructive path of fire has been averted, for now." }] }
        },
        techniques: [
            { name: "Controlled Inferno", verb: 'create', object: 'controlled inferno', type: 'Offense', power: 80, requiresArticle: true, element: 'fire', moveTags: ['area_of_effect', 'channeled'], collateralImpact: 'high' },
            { name: "Fire Wall", verb: 'raise', object: 'impenetrable wall of fire', type: 'Defense', power: 85, requiresArticle: true, element: 'fire', moveTags: ['defensive_stance', 'utility_block', 'construct_creation', 'area_of_effect_large'], setup: { name: 'Cornered', duration: 2, intensity: 1.2 }, collateralImpact: 'medium' },
            { name: "Flame Whips", verb: 'conjure', object: 'precise flame whips', type: 'Offense', power: 55, element: 'fire', moveTags: ['melee_range', 'ranged_attack_medium', 'single_target', 'precise'], collateralImpact: 'low' },
            { name: "Precision Burn", verb: 'inflict', object: 'surgical burn', type: 'Offense', power: 45, requiresArticle: true, element: 'fire', moveTags: ['ranged_attack', 'single_target', 'precise'], collateralImpact: 'none' },
            { name: "Reluctant Finale", verb: 'end', object: 'the fight with a wall of flame', type: 'Finisher', power: 90, element: 'fire', moveTags: ['area_of_effect_large', 'pushback', 'environmental_manipulation', 'requires_opening'], collateralImpact: 'medium' },
            { name: "Tactical Reposition", verb: 'execute', object: 'a nimble repositioning', type: 'Utility', power: 10, element: 'utility', moveTags: ['mobility_move', 'evasive', 'reposition'], isRepositionMove: true, collateralImpact: 'none' } // NEW MOVE
        ],
        quotes: { postWin: ["The destructive path of fire has been averted, for now."], postWin_reflective: ["The true victory lies in avoiding destruction, not causing it."] },
        relationships: {}
    },
};
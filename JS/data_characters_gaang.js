'use strict';

export const gaangCharacters = {
    'sokka': {
        id: 'sokka', name: "Sokka", type: "Nonbender", pronouns: { s: 'he', p: 'his', o: 'him' },
        imageUrl: 'https://static.wikia.nocookie.net/avatar/images/c/cc/Sokka.png',
        victoryStyle: "Madcap", powerTier: 3,
        personalityProfile: { aggression: 0.5, patience: 0.6, riskTolerance: 0.4, opportunism: 0.7, creativity: 0.9, defensiveBias: 0.3, antiRepeater: 0.8, signatureMoveBias: { "Boomerang Throw": 1.2, "Improvised Trap": 1.4 } },
        specialTraits: { resilientToManipulation: 0.2 },
        collateralTolerance: 0.5, // Moderate tolerance, mostly dislikes it if it disrupts plans
        narrative: {
            battleStart: [{ type: 'spoken', line: "Alright team, let's see what Sokka's got! Time for some strategy!" }, { type: 'internal', line: "Okay, {opponentName} looks tough. Don't panic. Just find an opening. You're the idea guy." }],
            onIntentSelection: {
                OpeningMoves: [{ type: 'internal', line: "Gotta test their defenses first. See what I'm working with." }],
                PressAdvantage: [{ type: 'spoken', line: "I've got you now! You can't escape my brilliant tactics!" }],
                DesperateGambit: [{ type: 'spoken', line: "This is crazy... but it just might work!" }],
                CautiousDefense: [{ type: 'internal', line: "Whoa, {opponent.s} is strong. Better play it safe for a bit." }],
                BreakTheTurtle: [{ type: 'spoken', line: "Think you can hide? My boomerang says otherwise!" }]
            },
            onMoveExecution: {
                'Boomerang Throw': { Critical: [{ type: 'spoken', line: "See? Boomerang always comes back! And it hits HARD!" }], Weak: [{ type: 'spoken', line: "Wait, where did it... oh, it's stuck in a tree. Great." }] },
                'Improvised Trap': { Critical: [{ type: 'spoken', line: "Ha! You fell right into my ingeniously designed trap!" }], Weak: [{ type: 'internal', line: "Okay, so the rope trap needs... more rope. And a better trigger. And maybe a sign." }] }
            },
            onStateChange: {
                stressed: [{ type: 'internal', line: "This is not going according to plan. At all." }],
                shaken: [{ type: 'internal', line: "Come on, pull it together! Can't let the team down!" }],
            },
            onCollateral: {
                causingDamage: [
                    { type: 'internal', line: "Whoops. That wasn't part of the plan, but it works!" },
                    { type: 'spoken', line: "Just some minor redecorating! Nothing I can't handle." },
                    { type: 'internal', line: "Okay, new tactical objective: don't break anything else important." }
                ],
                observingDamage: [
                    { type: 'spoken', line: "Hey! Watch the merchandise! That's a structural beam, not a punching bag!" },
                    { type: 'internal', line: "Great, now how am I supposed to set up a tripwire with all this rubble?" },
                    { type: 'spoken', line: "Are you paying for that, or am I? Because I'm not." }
                ],
                stressedByDamage: [
                    { type: 'internal', line: "This is getting too chaotic. My plans are falling apart faster than that wall!" },
                    { type: 'spoken', line: "My brain can't keep up with all this destruction!" }
                ],
                thrivingInDamage: [] // Not applicable for Sokka
            },
            onVictory: {
                Finisher: [{ line: "And that, my friends, is how you end a fight with *style* and *strategy*!" }],
                Default: [{ line: "Boomerang! You *do* always come back!" }]
            },
            onManipulation: { asVictim: [{ type: 'internal', line: "Ugh, don't listen to {opponent.o}! It's a trick! Focus, Sokka, focus!" }] },
            onPrediction: {
                correct: [{ type: 'spoken', line: "Ha! I knew {opponent.s} would do that! Classic rookie mistake." }],
                wrong: [{ type: 'spoken', line: "Wha-? Okay, new plan! The old plan is bad." }]
            },
            relationships: { 'katara': { narrative: { battleStart: [{ type: 'spoken', line: "Don't go easy on me just 'cause I'm your brother!" }] } } }
        },
        techniques: [
            { name: "Sword Strike", verb: 'strike', object: 'with his meteorite sword', type: 'Offense', power: 40, element: 'physical', moveTags: ['melee_range', 'single_target', 'precise'], collateralImpact: 'none' },
            { name: "Boomerang Throw", verb: 'throw', object: 'his trusty boomerang', type: 'Offense', power: 35, element: 'physical', moveTags: ['ranged_attack', 'projectile', 'single_target', 'unpredictable'], collateralImpact: 'low' },
            { name: "Shield Block", verb: 'block', object: 'with his shield', type: 'Defense', power: 30, element: 'utility', moveTags: ['defensive_stance', 'utility_block'], collateralImpact: 'none' },
            { name: "Tactical Positioning", verb: 'reposition', object: 'for a tactical advantage', type: 'Utility', power: 20, element: 'utility', moveTags: ['utility_reposition', 'evasive'], setup: { name: 'Outmaneuvered', duration: 1, intensity: 1.1 }, collateralImpact: 'none' },
            { name: "Improvised Trap", verb: 'devise', object: 'clever trap', type: 'Utility', power: 50, requiresArticle: true, element: 'utility', moveTags: ['trap_delayed', 'utility_control', 'environmental_manipulation'], setup: { name: 'Trapped', duration: 2, intensity: 1.3 }, collateralImpact: 'low' },
            { name: "The Sokka Special", verb: 'spring', object: 'masterfully constructed snare trap', type: 'Finisher', power: 75, requiresArticle: true, element: 'utility', moveTags: ['trap_delayed', 'debuff_disable', 'single_target', 'requires_opening', 'highRisk'], collateralImpact: 'medium' }
        ],
        quotes: { postWin: ["Boomerang! You *do* always come back!"], postWin_overwhelming: ["Nailed it! I am the greatest warrior-inventor of our time!"], postWin_specific: { 'aang-airbending-only': "See? Brains beat brawn... and... wind." } },
        relationships: { 'katara': { relationshipType: 'sibling_support', stressModifier: 0.9, resilienceModifier: 1.2 } }
    },
    'aang-airbending-only': {
        id: 'aang-airbending-only', name: "Aang (Airbending only)", type: "Bender", pronouns: { s: 'he', p: 'his', o: 'him' },
        imageUrl: 'https://static.wikia.nocookie.net/avatar/images/a/ae/Aang_at_Jasmine_Dragon.png',
        victoryStyle: "Pacifist", powerTier: 9,
        personalityProfile: { aggression: 0.2, patience: 0.9, riskTolerance: 0.2, opportunism: 0.7, creativity: 0.8, defensiveBias: 0.6, antiRepeater: 0.9, signatureMoveBias: { "Air Scooter": 1.5, "Wind Shield": 1.3 } },
        specialTraits: { resilientToManipulation: 0.6 },
        collateralTolerance: 0.05, // Very low tolerance, deeply distressed by damage
        narrative: {
            battleStart: [{ type: 'spoken', line: "I don't want to fight, but I will if I have to protect my friends." }, { type: 'internal', line: "Be like the leaf. Flow with the wind. Don't let them pin you down." }],
            onIntentSelection: {
                OpeningMoves: [{ type: 'internal', line: "Maybe if I'm evasive enough, {opponent.s} will just get tired and stop?" }],
                CautiousDefense: [{ type: 'spoken', line: "Let's just calm down for a second, okay?" }],
                CapitalizeOnOpening: [{ type: 'internal', line: "There's an opening! A quick puff of air should do it." }]
            },
            onManipulation: {
                asVictim: [{ type: 'internal', line: "{opponent.p} words are... heavy. But I can't let them stop me." }],
            },
            onPrediction: {
                correct: [{ type: 'internal', line: "I felt the shift in the air. I knew that was coming." }],
                wrong: [{ type: 'internal', line: "Whoa, that was fast. Gotta be quicker." }]
            },
            onStateChange: {
                stressed: [{ type: 'internal', line: "This is getting too violent. I have to end it without anyone getting seriously hurt." }],
                shaken: [{ type: 'spoken', line: "Please, stop! This isn't the way!" }],
                broken: [{ type: 'internal', line: "Everyone... Gyatso... I'm sorry..." }]
            },
            onMoveExecution: {
                'Air Scooter': { Critical: [{ type: 'spoken', line: "Whee! Try to catch me!" }] },
                'Sweeping Gust': { Critical: [{ type: 'spoken', line: "Sorry about that!" }] }
            },
            onCollateral: {
                causingDamage: [
                    { type: 'internal', line: "No! I have to be careful. I don't want to hurt the environment." },
                    { type: 'spoken', line: "Watch out! We don't have to destroy everything!" },
                    { type: 'internal', line: "I need to control my power. This is too much." }
                ],
                observingDamage: [
                    { type: 'spoken', line: "Stop! This isn't what bending is for!" },
                    { type: 'internal', line: "The balance is being broken. I have to restore it." },
                    { type: 'spoken', line: "Look at all this destruction... It's so sad." }
                ],
                stressedByDamage: [
                    { type: 'internal', line: "The world... it's hurting. I can't let this continue." },
                    { type: 'spoken', line: "This isn't what Gyatso taught me! I have to find a way out!" }
                ],
                thrivingInDamage: [] // Not applicable for Aang
            },
            onVictory: { Default: [{ line: "Phew! Nobody got hurt, right? Mostly." }] },
            relationships: { 'ozai-not-comet-enhanced': { narrative: { battleStart: [{ type: 'spoken', line: "I will not let you destroy this world, Fire Lord." }] } } }
        },
        techniques: [
            { name: "Air Scooter", verb: 'ride', object: 'his air scooter', type: 'Utility', power: 20, element: 'air', moveTags: ['utility_reposition', 'evasive', 'channeled'], setup: { name: 'Off-Balance', duration: 1, intensity: 1.15 }, collateralImpact: 'none' },
            { name: "Air Blast", verb: 'unleash', object: 'focused blast of air', type: 'Offense', power: 40, requiresArticle: true, element: 'air', moveTags: ['ranged_attack', 'area_of_effect_small', 'pushback'], collateralImpact: 'low' },
            { name: "Wind Shield", verb: 'form', object: 'swirling shield of wind', type: 'Defense', power: 50, requiresArticle: true, element: 'air', moveTags: ['defensive_stance', 'utility_block', 'projectile_defense'], collateralImpact: 'none' },
            { name: "Tornado Whirl", verb: 'create', object: 'disorienting tornado', type: 'Offense', power: 65, requiresArticle: true, element: 'air', moveTags: ['area_of_effect', 'channeled', 'utility_control'], setup: { name: 'Disoriented', duration: 2, intensity: 1.25 }, collateralImpact: 'medium' },
            { name: "Gust Push", verb: 'push', object: 'with a sudden gust of wind', type: 'Offense', power: 30, element: 'air', moveTags: ['ranged_attack', 'single_target', 'pushback'], collateralImpact: 'none' },
            { name: "Sweeping Gust", verb: 'sweep', object: 'his foe off their feet', type: 'Finisher', power: 80, element: 'air', moveTags: ['area_of_effect', 'debuff_disable', 'pushback', 'requires_opening'], collateralImpact: 'low' }
        ],
        quotes: { postWin: ["Phew! Nobody got hurt, right? Mostly."], postWin_overwhelming: ["Whoa, that was a lot of air! Are you okay?"], postWin_specific: { 'ozai-not-comet-enhanced': "It's over. This world doesn't need any more destruction." } },
        relationships: { 'ozai-not-comet-enhanced': { relationshipType: "fated_adversary", stressModifier: 1.4, resilienceModifier: 1.3 }, 'azula': { relationshipType: "nonlethal_pacifism", stressModifier: 1.2, resilienceModifier: 1.2 } }
    },
    'katara': {
        id: 'katara', name: "Katara", type: "Bender", pronouns: { s: 'she', p: 'her', o: 'her' },
        imageUrl: 'https://static.wikia.nocookie.net/avatar/images/7/7a/Katara_smiles_at_coronation.png',
        victoryStyle: "Fierce", powerTier: 7,
        personalityProfile: { aggression: 0.6, patience: 0.7, riskTolerance: 0.5, opportunism: 0.8, creativity: 0.7, defensiveBias: 0.5, antiRepeater: 0.6, signatureMoveBias: { "Water Whip": 1.2, "Ice Prison": 1.3 } },
        specialTraits: { resilientToManipulation: 0.9 },
        collateralTolerance: 0.15, // Low tolerance, compassionate
        narrative: {
            battleStart: [{ type: 'spoken', line: "You want a fight? You've got one." }, { type: 'internal', line: "Remember your training. Use their aggression against them. Be like the moon." }],
            onIntentSelection: {
                PressAdvantage: [{ type: 'internal', line: "They're on the defensive. Now's my chance to press the attack." }],
                DesperateGambit: [{ type: 'spoken', line: "I'm ending this. Right now." }],
                BreakTheTurtle: [{ type: 'internal', line: "They think they can just hide? I'll tear that wall down." }]
            },
            onMoveExecution: {
                'Bloodbending': { Critical: [{ type: 'spoken', line: "I'm sorry it had to be this way." }] }
            },
            onStateChange: {
                stressed: [{ type: 'internal', line: "Can't get sloppy. My family is counting on me." }],
                shaken: [{ type: 'internal', line: "His face... No, don't think about Jet. Focus on the now!" }],
                broken: [{ type: 'spoken', line: "You won't... take anyone else from me!" }]
            },
            onCollateral: {
                causingDamage: [
                    { type: 'internal', line: "I have to be careful not to hurt anything else." },
                    { type: 'spoken', line: "This is getting out of hand! I need to control my power." },
                    { type: 'internal', line: "Every broken piece makes me feel like I'm losing control." }
                ],
                observingDamage: [
                    { type: 'spoken', line: "Look at what you're doing! Stop this senseless destruction!" },
                    { type: 'internal', line: "My home... this world... it shouldn't be ravaged like this." },
                    { type: 'spoken', line: "There's no honor in tearing things apart!" }
                ],
                stressedByDamage: [
                    { type: 'internal', line: "This feels wrong... so wrong. I can't think straight." },
                    { type: 'spoken', line: "All this chaos... it's overwhelming!" }
                ],
                thrivingInDamage: [] // Not applicable for Katara
            },
            onVictory: {
                Finisher: [{ line: "It's over. You're beaten." }],
                Humiliation: [{ line: "That's what happens when you underestimate a waterbender from the Southern Water Tribe." }],
                Default: [{ line: "That's how you do it, for my family, for my tribe!" }]
            },
            relationships: {
                'azula': { narrative: { battleStart: [{ type: 'spoken', line: "This time, Azula, you're not getting away." }] } }
            }
        },
        techniques: [
            { name: "Water Whip", verb: 'lash', object: 'out with a water whip', type: 'Offense', power: 45, element: 'water', moveTags: ['melee_range', 'ranged_attack_medium', 'channeled', 'single_target'], collateralImpact: 'low' },
            { name: "Ice Spears", verb: 'launch', object: 'volley of ice spears', type: 'Offense', power: 55, requiresArticle: true, element: 'ice', moveTags: ['ranged_attack', 'projectile', 'area_of_effect_small'], collateralImpact: 'low' },
            { name: "Water Shield", verb: 'raise', object: 'shield of water', type: 'Defense', power: 50, requiresArticle: true, element: 'water', moveTags: ['defensive_stance', 'utility_block', 'projectile_defense', 'construct_creation'], collateralImpact: 'none' },
            { name: "Ice Prison", verb: 'create', object: 'ice prison', type: 'Utility', power: 60, requiresArticle: true, element: 'ice', moveTags: ['utility_control', 'debuff_disable', 'construct_creation', 'single_target'], setup: { name: 'Immobilized', duration: 2, intensity: 1.4 }, collateralImpact: 'low' },
            { name: "Tidal Wave", verb: 'summon', object: 'massive tidal wave', type: 'Finisher', power: 90, requiresArticle: true, element: 'water', moveTags: ['area_of_effect_large', 'environmental_manipulation', 'channeled', 'requires_opening'], collateralImpact: 'high' },
            { name: "Bloodbending", verb: 'control', object: "her opponent's body", type: 'Finisher', power: 100, element: 'special', moveTags: ['channeled', 'debuff_disable', 'single_target', 'unblockable', 'requires_opening', 'highRisk', 'humiliation'], collateralImpact: 'none' }
        ],
        quotes: { postWin: ["That's how you do it, for my family, for my tribe!"], postWin_overwhelming: ["That's what happens when you underestimate a waterbender!"], postWin_specific: { 'azula': "You're beaten. It's over." } },
        relationships: { 'zuko': { relationshipType: "tense_alliance", stressModifier: 1.0, resilienceModifier: 1.1 }, 'azula': { relationshipType: "bitter_rivalry", stressModifier: 1.5, resilienceModifier: 1.0 } }
    },
    'toph-beifong': {
        id: 'toph-beifong', name: "Toph", type: "Bender", pronouns: { s: 'she', p: 'her', o: 'her' },
        imageUrl: 'https://static.wikia.nocookie.net/avatar/images/4/46/Toph_Beifong.png',
        victoryStyle: "Cocky", powerTier: 7,
        personalityProfile: { aggression: 0.85, patience: 0.4, riskTolerance: 0.8, opportunism: 0.9, creativity: 1.0, defensiveBias: 0.2, antiRepeater: 0.8, signatureMoveBias: { "Seismic Slam": 1.4, "Metal Bending": 1.3 } },
        specialTraits: { resilientToManipulation: 0.5 },
        collateralTolerance: 0.6, // Higher than human element, but still cares about structures and earth
        narrative: {
            battleStart: [{ type: 'spoken', line: "Alright, let's get this over with. I've got rocks to sleep on." }, { type: 'internal', line: "I can feel their footsteps. Anxious. Good." }],
            onIntentSelection: {
                PressAdvantage: [{ type: 'spoken', line: "Feeling the pressure, Twinkle Toes?" }],
                BreakTheTurtle: [{ type: 'spoken', line: "You can't hide from me! I AM the ground you stand on!" }],
                CapitalizeOnOpening: [{ type: 'spoken', line: "You left your feet! Big mistake!" }]
            },
            onManipulation: {
                asVictim: [{ type: 'spoken', line: "Is that supposed to hurt my feelings? I can't see your face, but I'm guessing it's real ugly." }]
            },
            onPrediction: {
                correct: [{ type: 'spoken', line: "HA! I could feel you winding up for that from a mile away!" }],
                wrong: [{ type: 'internal', line: "Huh. They're lighter on their feet than I thought." }]
            },
            onStateChange: {
                stressed: [{ type: 'internal', line: "They're tougher than they look. Time to get serious." }],
                shaken: [{ type: 'spoken', line: "Okay, that one actually hurt. You're gonna pay for that!" }]
            },
            onMoveExecution: {
                'Seismic Slam': { Critical: [{ type: 'spoken', line: "There! How'd you like that one?" }] }
            },
            onCollateral: {
                causingDamage: [
                    { type: 'spoken', line: "Oops, my bad. Didn't see that building there. Kinda blind, you know?" },
                    { type: 'internal', line: "If they build it out of earth, it's fair game. That's just how it works." },
                    { type: 'spoken', line: "That's what you get for fighting the greatest earthbender!" }
                ],
                observingDamage: [
                    { type: 'spoken', line: "Hey! Easy on the ground! That's my turf you're messing with!" },
                    { type: 'internal', line: "Senseless destruction. What a waste of good earth." },
                    { type: 'spoken', line: "You're tearing up the place like a bad badger-mole! Show some respect!" }
                ],
                stressedByDamage: [
                    { type: 'internal', line: "This ground is getting too unstable. Can't feel anything properly!" },
                    { type: 'spoken', line: "Stop tearing up my world! I can't fight like this!" }
                ],
                thrivingInDamage: [ // Toph enjoys reshaping the battlefield, even if it's destructive to man-made structures
                    { type: 'internal', line: "More rubble, more raw material for me. This is getting fun!" },
                    { type: 'spoken', line: "Yeah, break it all down! Then I'll show you how to *really* move the earth!" }
                ]
            },
            onVictory: { Default: [{ line: "Told you I was the best. The greatest earthbender in the world!" }] }
        },
        techniques: [
            { name: "Earth Wave", verb: 'send', object: 'powerful wave of earth', type: 'Offense', power: 60, requiresArticle: true, element: 'earth', moveTags: ['area_of_effect', 'environmental_manipulation'], collateralImpact: 'medium' },
            { name: "Rock Armor", verb: 'don', object: 'suit of rock armor', type: 'Defense', power: 75, requiresArticle: true, element: 'earth', moveTags: ['defensive_stance', 'utility_armor', 'construct_creation', 'requires_opening'], collateralImpact: 'none' },
            { name: "Seismic Slam", verb: 'slam', object: 'her fists to the ground', type: 'Offense', power: 70, element: 'earth', moveTags: ['area_of_effect_large', 'environmental_manipulation', 'unblockable_ground'], collateralImpact: 'high' },
            { name: "Metal Bending", verb: 'bend', object: 'the metal in the environment', type: 'Offense', power: 80, element: 'metal', moveTags: ['environmental_manipulation', 'utility_control', 'versatile'], collateralImpact: 'medium' },
            { name: "Boulder Throw", verb: 'launch', object: 'volley of rock projectiles', type: 'Offense', power: 65, element: 'earth', moveTags: ['ranged_attack', 'projectile', 'area_of_effect_small'], collateralImpact: 'low' },
            { name: "Rock Coffin", verb: 'entomb', object: 'her foe in a prison of rock', type: 'Finisher', power: 95, element: 'earth', moveTags: ['debuff_disable', 'single_target', 'construct_creation', 'requires_opening'], collateralImpact: 'low' }
        ],
        quotes: { postWin: ["Told you I was the best. The greatest earthbender in the world!"], postWin_overwhelming: ["HA! That's what happens when you fight the greatest earthbender in the world!"], postWin_specific: { 'bumi': "Looks like I'm still the champ, Bumi!" } },
        relationships: {}
    },
    'zuko': {
        id: 'zuko', name: "Zuko", type: "Bender", pronouns: { s: 'he', p: 'his', o: 'him' },
        imageUrl: 'https://static.wikia.nocookie.net/avatar/images/4/4b/Zuko.png',
        victoryStyle: "Determined", powerTier: 6,
        personalityProfile: { aggression: 0.75, patience: 0.6, riskTolerance: 0.6, opportunism: 0.8, creativity: 0.5, defensiveBias: 0.4, antiRepeater: 0.5, signatureMoveBias: { "Flame Sword": 1.2, "Dragon's Breath": 1.3 } },
        specialTraits: { resilientToManipulation: 0.1 },
        collateralTolerance: 0.25, // Low-moderate tolerance, due to redemption arc
        narrative: {
            battleStart: [{ type: 'spoken', line: "I must restore my honor!" }, { type: 'internal', line: "Uncle's training... breathe. The dragon's breath comes from the spirit." }],
            onIntentSelection: {
                PressAdvantage: [{ type: 'internal', line: "Now. Push hard while they're off balance." }],
                CautiousDefense: [{ type: 'internal', line: "I can't be reckless. I need to wait for the right moment." }]
            },
            onManipulation: {
                asVictim: [{ type: 'internal', line: "Is {opponent.s} right? Am I weak? No! I choose my own destiny!" }],
            },
            onStateChange: {
                stressed: [{ type: 'internal', line: "Why can't I land a clean hit? Am I not strong enough?" }],
                shaken: [{ type: 'internal', line: "{opponent.p} voice... sounds just like Azula's. Get it together!" }],
                broken: [{ type: 'spoken', line: "I'm... so confused..." }]
            },
            onCollateral: {
                causingDamage: [
                    { type: 'internal', line: "I have to be careful. I don't want to cause unnecessary destruction." },
                    { type: 'spoken', line: "This isn't about burning everything down. It's about victory." },
                    { type: 'internal', line: "Just focus on my opponent. Don't let the fire rage out of control." }
                ],
                observingDamage: [
                    { type: 'internal', line: "This destruction... it reminds me of my past. I hate it." },
                    { type: 'spoken', line: "What is the point of this senseless tearing down?" },
                    { type: 'internal', line: "I can't let my emotions get the better of me. Not like my father." }
                ],
                stressedByDamage: [
                    { type: 'internal', line: "All this wreckage... it's like a mirror of my own turmoil!" },
                    { type: 'spoken', line: "I can't stand this! It's too much like... back then!" }
                ],
                thrivingInDamage: [] // Not applicable for Zuko
            },
            onVictory: { Default: [{ line: "I fought for my own path. And I won." }] },
            relationships: {
                'azula': { narrative: { battleStart: [{ type: 'spoken', line: "I'm not the same person I was, Azula." }] } },
                'ozai-not-comet-enhanced': { narrative: { battleStart: [{ type: 'spoken', line: "I'm not afraid of you anymore, Father." }] } }
            }
        },
        techniques: [
            { name: "Fire Daggers", verb: 'throw', object: 'volley of fire daggers', type: 'Offense', power: 45, requiresArticle: true, element: 'fire', moveTags: ['ranged_attack', 'projectile', 'area_of_effect_small'], collateralImpact: 'low' },
            { name: "Flame Sword", verb: 'ignite', object: 'his dual dao swords', type: 'Offense', power: 55, element: 'fire', moveTags: ['melee_range', 'channeled', 'precise'], collateralImpact: 'none' },
            { name: "Fire Shield", verb: 'create', object: 'swirling fire shield', type: 'Defense', power: 50, requiresArticle: true, element: 'fire', moveTags: ['defensive_stance', 'utility_block', 'projectile_defense'], collateralImpact: 'none' },
            { name: "Dragon's Breath", verb: 'unleash', object: 'sustained stream of fire', type: 'Offense', power: 70, requiresArticle: true, element: 'fire', moveTags: ['ranged_attack', 'channeled', 'area_of_effect'], collateralImpact: 'medium' },
            { name: "Fire Whip", verb: 'lash', object: 'out with a whip of fire', type: 'Offense', power: 60, element: 'fire', moveTags: ['melee_range', 'ranged_attack_medium', 'channeled', 'single_target'], collateralImpact: 'low' },
            { name: "Redemption's Fury", verb: 'overwhelm', object: 'his opponent with a flurry of attacks', type: 'Finisher', power: 85, element: 'fire', moveTags: ['melee_range', 'area_of_effect_small', 'versatile', 'requires_opening'], collateralImpact: 'medium' }
        ],
        quotes: { postWin: ["I fought for my own path. And I won."], postWin_overwhelming: ["My fire burns hotter because I fight for something real!"], postWin_specific: { 'azula': "It's over, Azula. I've found my own strength." } },
        relationships: { 'azula': { relationshipType: "sibling_rivalry_inferior", stressModifier: 2.0, resilienceModifier: 0.8 }, 'ozai-not-comet-enhanced': { relationshipType: "parental_defiance", stressModifier: 1.8, resilienceModifier: 1.2 }, 'iroh': { relationshipType: "mentor_respect", stressModifier: 0.5, resilienceModifier: 1.5 } }
    }
};
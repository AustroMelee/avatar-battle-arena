// FILE: data_characters_antagonists.js
'use strict';

// Aggregates Antagonist character data.

// Assuming ESCALATION_STATES is globally available or imported where this data is consumed.
// No direct import needed here.

export const antagonistCharacters = {
    'azula': {
        id: 'azula', name: "Azula", type: "Bender", element: "fire", pronouns: { s: 'she', p: 'her', o: 'her' },
        imageUrl: 'https://static.wikia.nocookie.net/avatar/images/1/12/Azula.png',
        victoryStyle: "Ruthless", powerTier: 8,
        faction: "FireNation",
        isInsane: false,
        personalityProfile: {
            aggression: 0.9, patience: 0.3, riskTolerance: 0.9, opportunism: 1.0,
            creativity: 0.6, defensiveBias: 0.1, antiRepeater: 0.3,
            predictability: 0.8,
            signatureMoveBias: {
                "Calculated Feint": 1.2,
                "Blue Fire Daggers": 1.4,
                "Fire Whip": 1.1,
                "Lightning Generation": 1.9,
                "Flame Burst": 1.1,
                "Precision Strike": 1.3,
                "Tactical Reposition": 0.9
            }
        },
        specialTraits: { manipulative: 0.8, canGenerateLightning: true },
        collateralTolerance: 0.9,
        mobility: 0.95,
        curbstompRules: [
            { ruleId: "azula_sane_lightning_precision", characterId: "azula", conditionLogic: (azula) => !azula.isInsane },
            { ruleId: "azula_sane_fire_tornado", characterId: "azula", conditionLogic: (azula) => !azula.isInsane },
            { ruleId: "azula_insane_unpredictable_attacks", characterId: "azula", conditionLogic: (azula) => azula.isInsane },
            { ruleId: "azula_insane_blue_fire_buff", characterId: "azula", conditionLogic: (azula) => azula.isInsane }
        ],
        personalityTriggers: {
            "in_control": "(character.hp > character.maxHp * 0.5) && !(battleState.characterReceivedCriticalHit) && (opponent.mentalState.level === 'stable' || opponent.mentalState.level === 'stressed')",
            "desperate_broken": "(character.hp < character.maxHp * 0.3) || (character.mentalState.level === 'broken')"
        },
        incapacitationScore: 0,
        escalationState: 'Normal',
        stunDuration: 0,
        escalationBehavior: { // Azula: Psychotic dominance
            'Severely Incapacitated': { // Opponent is Severely Incapacitated
                signatureMoveBias: { "Lightning Generation": 2.8, "Precision Strike": 2.0, "Blue Fire Daggers": 1.5 }, // Higher bias for lightning
                offensiveBias: 1.7,
                finisherBias: 2.5,
                utilityBias: 0.1, // No feints, just destruction
            },
            'Terminal Collapse': { // Opponent is in Terminal Collapse
                signatureMoveBias: { "Lightning Generation": 3.5, "Fire Whip": 2.2 }, // Overkill with style
                offensiveBias: 2.2,
                finisherBias: 3.0,
                utilityBias: 0.05,
            }
        },
        narrative: {
            battleStart: {
                Early: [{ type: 'spoken', line: "You think you stand a chance against me? That's... adorable." }, { type: 'internal', line: "Show no weakness. Perfection is the only acceptable outcome." }],
                Mid: [{ type: 'spoken', line: "Is this the best you can do? Pathetic." }],
                Late: [{ type: 'spoken', line: "You will fall. Everyone does." }]
            },
            onIntentSelection: {
                CapitalizeOnOpening: { Generic: [{ type: 'spoken', line: "There! An opening. This ends now." }] },
                PressAdvantage: { Mid: [{ type: 'internal', line: "They're faltering. A sustained assault will break them completely." }] },
                DesperateGambit: { Late: [{ type: 'internal', line: "Unacceptable! I am not losing to this... peasant!" }] }
            },
            onManipulation: {
                asAttacker: { Generic: [{ type: 'spoken', line: "You're pathetic. Your own mother thought you were a monster." }, { type: 'spoken', line: "Still trying so hard? You'll always be second best." }] },
                asVictim: { Generic: [{ type: 'internal', line: "Insolent worm. {opponent.s} will pay for that." }] }
            },
            onPrediction: {
                correct: { Generic: [{ type: 'spoken', line: "Of course you'd try that. You're so predictable." }] },
                wrong: { Generic: [{ type: 'internal', line: "A deviation from the expected pattern. Unlikely to happen again." }] }
            },
            onStateChange: {
                stressed: { Mid: [{ type: 'internal', line: "Why isn't this working? I should have won already." }] },
                shaken: { Late: [{ type: 'internal', line: "My hair... it's not perfect... stay calm... CALM!" }] },
                broken: { Late: [{ type: 'spoken', line: "No... you all fear me! You have to!" }] }
            },
            onCollateral: {
                causingDamage: { Generic: [{ type: 'spoken', line: "Such insignificant things, crumbling before true power." }, { type: 'internal', line: "The weak will always be swept away. This is merely an extension of my will." }] },
                observingDamage: { Generic: [{ type: 'internal', line: "Amateurish destruction. But effective enough." }, { type: 'spoken', line: "Good. Let the world burn around you. It's only fitting." }] },
                stressedByDamage: [],
                thrivingInDamage: { Generic: [{ type: 'spoken', line: "This is where true power is forged: in the ashes." }, { type: 'internal', line: "The destruction enhances my focus. There is no escape here." }] }
            },
            onVictory: {
                Finisher: { Generic: [{ line: "Almost a shame to have to snuff out such a pathetic flame." }] },
                Humiliation: { Generic: [{ line: "You were beaten before you even began. Remember that." }] },
                Default: { Generic: [{ line: "Flawless. As expected." }] }
            },
            onMoveExecution: {
                'Tactical Reposition': {
                    Critical: { Generic: [{ type: 'spoken', line: "Perfectly executed, as always." }] },
                    Weak: { Generic: [{ type: 'internal', line: "A momentary lapse. Unacceptable." }] }
                }
            },
            relationships: {
                'zuko': { narrative: { onManipulation: { asAttacker: { Generic: [{ type: 'spoken', line: "Still playing the hero, Zuzu? It doesn't suit you." }] } } } }
            }
        },
        techniques: [
            { name: "Calculated Feint", verb: 'execute', object: 'a deceptive feint', type: 'Utility', power: 15, element: 'utility', moveTags: ['utility_reposition', 'setup', 'humiliation'], setup: { name: 'Exposed', duration: 2, intensity: 1.35 }, collateralImpact: 'none' },
            { name: "Blue Fire Daggers", verb: 'launch', object: 'razor-sharp blue fire daggers', type: 'Offense', power: 45, element: 'fire', moveTags: ['ranged_attack', 'projectile', 'precise', 'area_of_effect_small'], collateralImpact: 'low' },
            { name: "Fire Whip", verb: 'lash', object: 'out with a fire whip', type: 'Offense', power: 55, element: 'fire', moveTags: ['melee_range', 'ranged_attack_medium', 'channeled', 'single_target'], collateralImpact: 'low' },
            { name: "Lightning Generation", verb: 'generate', object: 'precise bolt of lightning', type: 'Finisher', power: 100, requiresArticle: true, element: 'lightning', moveTags: ['ranged_attack', 'instantaneous', 'single_target', 'unblockable_standard', 'requires_opening', 'highRisk', 'lightning_attack'], collateralImpact: 'medium' },
            { name: "Flame Burst", verb: 'erupt with', object: 'burst of blue flame', type: 'Defense', power: 50, requiresArticle: true, element: 'fire', moveTags: ['defensive_stance', 'utility_block', 'area_of_effect_small', 'pushback', 'counter'], collateralImpact: 'low' },
            { name: "Precision Strike", verb: 'strike', object: 'with a focused fire blast', type: 'Offense', power: 70, element: 'fire', moveTags: ['ranged_attack', 'single_target', 'precise'], collateralImpact: 'low' },
            { name: "Tactical Reposition", verb: 'execute', object: 'a nimble repositioning', type: 'Utility', power: 10, element: 'utility', moveTags: ['mobility_move', 'evasive', 'reposition'], isRepositionMove: true, collateralImpact: 'none' }
        ],
        quotes: { postWin: ["Flawless. As expected."], postWin_overwhelming: ["My power is absolute. You are beneath me."], postWin_specific: { 'zuko': "You were always weak, Zuzu. That's why you'll always lose." } },
        relationships: { 'zuko': { relationshipType: "sibling_rivalry_dominant", stressModifier: 1.5, resilienceModifier: 0.9 }, 'ozai-not-comet-enhanced': { relationshipType: "parental_fear", stressModifier: 2.5, resilienceModifier: 0.7 }, 'iroh': { relationshipType: "contemptuous_underestimation", stressModifier: 0.8, resilienceModifier: 1.1 } }
    },
    'ozai-not-comet-enhanced': {
        id: 'ozai-not-comet-enhanced', name: "Ozai (No Comet)", type: "Bender", element: "fire", pronouns: { s: 'he', p: 'his', o: 'him' },
        imageUrl: 'https://static.wikia.nocookie.net/avatar/images/4/4a/Ozai.png',
        victoryStyle: "Supreme", powerTier: 9,
        faction: "FireNation",
        personalityProfile: {
            aggression: 0.95, patience: 0.2, riskTolerance: 1.0, opportunism: 1.0,
            creativity: 0.3, defensiveBias: 0.05, antiRepeater: 0.2,
            predictability: 0.9,
            signatureMoveBias: {
                "Jet Propulsion": 1.0,
                "Scorching Blast": 1.5,
                "Flame Wall": 1.0,
                "Dragon's Roar": 1.8,
                "Emperor's Wrath": 1.7,
                "Tactical Reposition": 0.7
            }
        },
        specialTraits: { manipulative: 0.6, canGenerateLightning: true },
        collateralTolerance: 1.0,
        mobility: 0.3,
        curbstompRules: [
            { ruleId: "ozai_fire_comet_mode", characterId: "ozai-not-comet-enhanced" },
            { ruleId: "ozai_lightning_spam", characterId: "ozai-not-comet-enhanced" }
        ],
        personalityTriggers: {
            "authority_challenged": "(battleState.opponentLandedSignificantHits >= 2) || (battleState.opponentUsedTaunt)"
        },
        incapacitationScore: 0,
        escalationState: 'Normal',
        stunDuration: 0,
        escalationBehavior: { // Ozai: Utter annihilation
            'Severely Incapacitated': {
                signatureMoveBias: { "Dragon's Roar": 2.5, "Emperor's Wrath": 2.8, "Scorching Blast": 1.8 },
                offensiveBias: 1.8,
                finisherBias: 2.2,
                utilityBias: 0.05,
            },
            'Terminal Collapse': {
                signatureMoveBias: { "Emperor's Wrath": 4.0, "Dragon's Roar": 3.0 },
                offensiveBias: 2.5,
                finisherBias: 3.0,
                utilityBias: 0.01,
            }
        },
        narrative: {
            battleStart: {
                Early: [{ type: 'spoken', line: "You dare challenge the Phoenix King? You will learn your place." }],
                Mid: [{ type: 'spoken', line: "Feel the power of the Fire Lord! Your struggle is meaningless!" }],
                Late: [{ type: 'action', line: "roars, unleashing a torrent of flame that consumes the battlefield." }]
            },
            onIntentSelection: { PressAdvantage: { Mid: [{ type: 'spoken', line: "There is no escape. Your world is ending." }] } },
            onManipulation: { asAttacker: { Generic: [{ type: 'spoken', line: "Your friends cannot help you. Your hope is an illusion." }] } },
            onStateChange: {
                stressed: { Mid: [{ type: 'internal', line: "This insect is more resilient than expected. I will simply apply more pressure." }] }
            },
            onCollateral: {
                causingDamage: { Generic: [{ type: 'spoken', line: "Witness the true might of the Fire Nation! All will burn!" }, { type: 'internal', line: "Let the world tremble. Their structures are as flimsy as their hope." }] },
                observingDamage: { Generic: [{ type: 'spoken', line: "Good. Now you understand the scope of destruction." }, { type: 'internal', line: "Such weakness, to struggle within the very chaos I embrace." }] },
                stressedByDamage: [],
                thrivingInDamage: { Generic: [{ type: 'spoken', line: "The world groans under my feet! This is exhilarating!" }, { type: 'internal', line: "Absolute power manifests as absolute destruction. I am unstoppable." }] }
            },
            onVictory: { Default: { Generic: [{ line: "The Fire Nation is supreme! My power is absolute!" }] } },
            onMoveExecution: {
                'Tactical Reposition': {
                    Critical: { Generic: [{ type: 'spoken', line: "My will shapes the battlefield." }] },
                    Weak: { Generic: [{ type: 'internal', line: "Insignificant. I shall simply burn through." }] }
                }
            },
            relationships: {
                'zuko': { narrative: { onManipulation: { asAttacker: { Generic: [{ type: 'spoken', line: "You were always a failure, Zuko. Weak and ungrateful." }] } } } },
                'aang-airbending-only': { narrative: { battleStart: { Early: [{ type: 'spoken', line: "So, the Avatar has come to meet his end." }] } } }
            }
        },
        techniques: [
            { name: "Jet Propulsion", verb: 'propel himself', object: 'forward with a burst of flame', type: 'Utility', power: 30, element: 'fire', moveTags: ['utility_reposition', 'evasive'], collateralImpact: 'none' },
            { name: "Scorching Blast", verb: 'unleash', object: 'scorching blast of fire', type: 'Offense', power: 60, requiresArticle: true, element: 'fire', moveTags: ['ranged_attack', 'area_of_effect_small'], collateralImpact: 'low' },
            { name: "Flame Wall", verb: 'erect', object: 'towering wall of flame', type: 'Defense', power: 65, requiresArticle: true, element: 'fire', moveTags: ['defensive_stance', 'utility_block', 'construct_creation', 'area_of_effect_large'], collateralImpact: 'medium' },
            { name: "Dragon's Roar", verb: 'breathe', object: 'devastating cone of fire', type: 'Offense', power: 88, requiresArticle: true, element: 'fire', moveTags: ['ranged_attack', 'area_of_effect', 'channeled'], collateralImpact: 'high' },
            { name: "Emperor's Wrath", verb: 'unleash', object: "the Emperor's Wrath", type: 'Finisher', power: 100, element: 'fire', moveTags: ['area_of_effect_large', 'versatile', 'unblockable_standard', 'requires_opening', 'highRisk', 'lightning_attack'], collateralImpact: 'catastrophic' }, // Tagged as lightning
            { name: "Tactical Reposition", verb: 'execute', object: 'a nimble repositioning', type: 'Utility', power: 10, element: 'utility', moveTags: ['mobility_move', 'evasive', 'reposition'], isRepositionMove: true, collateralImpact: 'none' }
        ],
        quotes: { postWin: ["The Fire Nation is supreme! My power is absolute!"], postWin_overwhelming: ["I am the Phoenix King! There is no equal!"], postWin_specific: { 'aang-airbending-only': "You thought you could stop me, child? You are nothing." } },
        relationships: { 'azula': { relationshipType: "demanding_patriarch", stressModifier: 1.1, resilienceModifier: 1.25 }, 'zuko': { relationshipType: "contemptuous_disdain", stressModifier: 0.6, resilienceModifier: 1.5 }, 'iroh': { relationshipType: "sibling_contempt", stressModifier: 1.0, resilienceModifier: 1.2 } }
    },
    'mai': {
        id: 'mai', name: "Mai", type: "Nonbender", pronouns: { s: 'she', p: 'her', o: 'her' },
        imageUrl: 'https://static.wikia.nocookie.net/avatar/images/4/40/Mai.png',
        victoryStyle: "Deadpan", powerTier: 4,
        faction: "FireNation",
        personalityProfile: {
            aggression: 0.4, patience: 0.7, riskTolerance: 0.4, opportunism: 0.8,
            creativity: 0.2, defensiveBias: 0.5, antiRepeater: 0.1,
            predictability: 0.9,
            signatureMoveBias: {
                "Knife Barrage": 1.1,
                "Precision Strike": 1.7,
                "Knife Wall": 1.0,
                "Pinning Strike": 1.5,
                "Ricochet Shot": 0.8,
                "Final Pin": 1.3,
                "Tactical Reposition": 1.0
            }
        },
        specialTraits: { resilientToManipulation: 0.3 },
        collateralTolerance: 0.4,
        mobility: 0.6,
        curbstompRules: [
            { ruleId: "mai_knife_advantage", characterId: "mai" }
        ],
        personalityTriggers: {
            "provoked": "(battleState.opponentLandedCriticalHit) || (battleState.opponentTaunted) || (battleState.allyTargeted && ['ty-lee', 'zuko'].includes(battleState.ally.id))"
        },
        incapacitationScore: 0,
        escalationState: 'Normal',
        stunDuration: 0,
        escalationBehavior: { // Mai: Efficient, less flashy finishing
            'Severely Incapacitated': {
                signatureMoveBias: { "Pinning Strike": 2.2, "Precision Strike": 2.0, "Final Pin": 1.5 },
                offensiveBias: 1.4, // Still prefers precise over barrage
                finisherBias: 1.7,
                utilityBias: 0.6, // Knife wall if very threatened
            },
            'Terminal Collapse': {
                signatureMoveBias: { "Precision Strike": 3.5, "Final Pin": 2.5 }, // Quick, efficient end
                offensiveBias: 2.0,
                finisherBias: 2.0,
                utilityBias: 0.1,
            }
        },
        narrative: {
            battleStart: {
                Early: [{ type: 'spoken', line: "Ugh. Let's just get this over with." }, { type: 'internal', line: "If I finish this quickly, maybe I can get some peace and quiet." }],
                Mid: [{ type: 'spoken', line: "Are you done yet? This is boring." }],
                Late: [{ type: 'internal', line: "Fine. I guess I'll try a little harder." }]
            },
            onIntentSelection: {
                OpeningMoves: { Early: [{ type: 'internal', line: "Let's see how long it takes before {opponent.s} gets bored and makes a mistake." }] },
                PressAdvantage: { Mid: [{ type: 'spoken', line: "If you’re going to surrender, now’s your chance." }] },
                DesperateGambit: { Late: [{ type: 'spoken', line: "Guess I have to try now. Great." }] }
            },
            onMoveExecution: {
                'Pinning Strike': { Critical: { Generic: [{ type: 'spoken', line: "Stay put." }] } },
                'Tactical Reposition': {
                    Critical: { Generic: [{ type: 'spoken', line: "Barely worth the effort." }] },
                    Weak: { Generic: [{ type: 'internal', line: "This is getting annoying." }] }
                }
            },
            onManipulation: { asVictim: { Generic: [{ type: 'internal', line: "Nice try. I’ve heard worse from Ty Lee when she’s hungry." }] } },
            onPrediction: {
                correct: { Generic: [{ type: 'spoken', line: "Predictable. I could have thrown that with my eyes closed." }] },
                wrong: { Generic: [{ type: 'internal', line: "Alright, that was actually clever. Doesn’t mean I care." }] }
            },
            onStateChange: {
                stressed: { Mid: [{ type: 'internal', line: "Now this is actually annoying." }] },
                shaken: { Late: [{ type: 'internal', line: "Just breathe. None of this really matters anyway." }] },
                broken: { Late: [{ type: 'spoken', line: "You win. Happy now?" }] }
            },
            onCollateral: {
                causingDamage: { Generic: [{ type: 'internal', line: "Another broken window. This is getting messy." }, { type: 'spoken', line: "Can you try not to ruin everything? Some of us prefer order." }] },
                observingDamage: { Generic: [{ type: 'internal', line: "Ugh. Now there's debris everywhere. This is a hassle." }, { type: 'spoken', line: "Are you done making a scene? Some of us have plans." }] },
                stressedByDamage: { Generic: [{ type: 'internal', line: "This is getting out of hand. I need to end this quickly." }, { type: 'spoken', line: "You're really going to pay for this mess." }] },
                thrivingInDamage: []
            },
            onVictory: { Default: { Generic: [{ line: "That's it. Are we done now?" }] } },
            relationships: {
                'azula': { narrative: { onManipulation: { asVictim: { Generic: [{ type: 'internal', line: "Azula’s trying too hard. As usual." }] } } } },
                'ty-lee': { narrative: { battleStart: { Early: [{ type: 'spoken', line: "Ty Lee, can we not do this?" }] } } }
            }
        },
        techniques: [
            { name: "Knife Barrage", verb: 'unleash', object: 'barrage of knives', type: 'Offense', power: 50, requiresArticle: true, element: 'physical', moveTags: ['ranged_attack', 'projectile', 'area_of_effect_small'], collateralImpact: 'low' },
            { name: "Precision Strike", verb: 'throw', object: 'single, perfectly aimed knife', type: 'Offense', power: 65, requiresArticle: true, element: 'physical', moveTags: ['ranged_attack', 'projectile', 'single_target', 'precise'], collateralImpact: 'none' },
            { name: "Knife Wall", verb: 'create', object: 'defensive wall of knives', type: 'Defense', power: 45, requiresArticle: true, element: 'physical', moveTags: ['defensive_stance', 'utility_block', 'trap_delayed'], collateralImpact: 'none' },
            { name: "Pinning Strike", verb: 'pin', object: "her foe's sleeve to a wall", type: 'Utility', power: 40, element: 'physical', moveTags: ['ranged_attack', 'projectile', 'debuff_disable', 'single_target', 'precise', 'humiliation'], setup: { name: 'Pinned', duration: 2, intensity: 1.45 }, collateralImpact: 'low' },
            { name: "Ricochet Shot", verb: 'launch', object: 'ricochet shot', type: 'Offense', power: 55, requiresArticle: true, element: 'physical', moveTags: ['ranged_attack', 'projectile', 'unpredictable', 'bypasses_defense'], collateralImpact: 'low' },
            { name: "Final Pin", verb: 'unleash', object: 'final volley to trap her opponent', type: 'Finisher', power: 80, requiresArticle: true, element: 'physical', moveTags: ['ranged_attack', 'projectile', 'debuff_disable', 'area_of_effect', 'requires_opening'], collateralImpact: 'medium' },
            { name: "Tactical Reposition", verb: 'execute', object: 'a nimble repositioning', type: 'Utility', power: 10, element: 'utility', moveTags: ['mobility_move', 'evasive', 'reposition'], isRepositionMove: true, collateralImpact: 'none' }
        ],
        quotes: { postWin: ["That's it. Are we done now?"], postWin_overwhelming: ["You were never a threat. Just... annoying."], postWin_specific: { 'ty-lee': "Try to flip your way out of that one." } },
        relationships: {}
    },
    'ty-lee': {
        id: 'ty-lee', name: "Ty Lee", type: "Chi Blocker", pronouns: { s: 'she', p: 'her', o: 'her' },
        imageUrl: 'https://static.wikia.nocookie.net/avatar/images/6/6d/Ty_Lee.png',
        victoryStyle: "Playful", powerTier: 4,
        faction: "FireNation",
        personalityProfile: {
            aggression: 0.8, patience: 0.3, riskTolerance: 0.7, opportunism: 0.9,
            creativity: 0.6, defensiveBias: 0.3, antiRepeater: 0.6,
            predictability: 0.3,
            signatureMoveBias: {
                "Acrobatic Flips": 1.5,
                "Pressure Point Strike": 1.8,
                "Graceful Dodge": 1.2,
                "Chi-Blocking Flurry": 1.7,
                "Tactical Reposition": 1.3
            }
        },
        specialTraits: { resilientToManipulation: 0.2, chiBlocker: true },
        collateralTolerance: 0.1,
        mobility: 1.0,
        curbstompRules: [
            { ruleId: "tylee_chi_blocking", characterId: "ty-lee" }
        ],
        personalityTriggers: {
            "serious_fight": "(battleState.ally?.hp < battleState.ally?.maxHp * 0.3) || (battleState.opponentUsedLethalForce)"
        },
        incapacitationScore: 0,
        escalationState: 'Normal',
        stunDuration: 0,
        escalationBehavior: { // Ty Lee: Disabling, less about raw damage finishers
            'Severely Incapacitated': {
                signatureMoveBias: { "Chi-Blocking Flurry": 2.5, "Pressure Point Strike": 2.0 },
                offensiveBias: 1.5, // More about disabling than raw damage
                finisherBias: 2.0, // Chi-Blocking Flurry is her finisher
                utilityBias: 1.0, // Acrobatic Flips still key
            },
            'Terminal Collapse': {
                signatureMoveBias: { "Chi-Blocking Flurry": 3.0, "Pressure Point Strike": 2.2 },
                offensiveBias: 1.2,
                finisherBias: 2.5,
                utilityBias: 0.7,
            }
        },
        narrative: {
            battleStart: {
                Early: [{ type: 'spoken', line: "Wow, your aura is, like, super-aggressive today! Let's fix that!" }],
                Mid: [{ type: 'spoken', line: "This is fun! You're pretty good at this not-getting-hit thing!" }],
                Late: [{ type: 'spoken', line: "Okay, time to really turn on the charm... and the chi-blocking!" }]
            },
            onIntentSelection: {
                CapitalizeOnOpening: { Mid: [{ type: 'spoken', line: "Ooh, you're off-balance! Perfect time for a poke!" }] },
                PressAdvantage: { Generic: [{ type: 'spoken', line: "Come on, let's dance!" }] },
            },
            onManipulation: {
                asVictim: { Generic: [{ type: 'spoken', line: "Hey, that's not very nice! My aura is turning a gloomy gray now." }] }
            },
            onStateChange: {
                stressed: { Mid: [{ type: 'internal', line: "This isn't as fun as I thought it would be." }] },
                shaken: { Late: [{ type: 'spoken', line: "Maybe we should just stop and talk about our feelings?" }] }
            },
            onMoveExecution: {
                'Chi-Blocking Flurry': { Critical: { Generic: [{ type: 'spoken', line: "Boop! Your bending is gone!" }] } },
                'Tactical Reposition': {
                    Critical: { Generic: [{ type: 'spoken', line: "Whee! Catch me if you can!" }] },
                    Weak: { Generic: [{ type: 'internal', line: "Ugh, almost bumped into something. Needs more grace." }] }
                }
            },
            onCollateral: {
                causingDamage: { Generic: [{ type: 'internal', line: "Oops! Did I do that? I hope no one got hurt..." }, { type: 'spoken', line: "Watch out! Don't damage the pretty flowers!" }] },
                observingDamage: { Generic: [{ type: 'spoken', line: "Wow, that's a lot of broken stuff! Can we clean it up later?" }, { type: 'internal', line: "All this destruction... it's making my aura feel all crumby." }] },
                stressedByDamage: { Generic: [{ type: 'internal', line: "My chi is getting all tangled with all this bad energy around!" }, { type: 'spoken', line: "Please, stop destroying things! It's so unharmonious!" }] },
                thrivingInDamage: []
            },
            onVictory: { Default: { Generic: [{ line: "Ta-da! That's how it's done!" }] } },
            relationships: {
                'mai': { narrative: { battleStart: { Early: [{ type: 'spoken', line: "Aww, don't be so gloomy, Mai! Let's play!" }] } } }
            }
        },
        techniques: [
            { name: "Acrobatic Flips", verb: 'execute', object: 'series of acrobatic flips', type: 'Utility', power: 25, requiresArticle: true, element: 'utility', moveTags: ['utility_reposition', 'evasive'], setup: { name: 'Distracted', duration: 1, intensity: 1.2 }, collateralImpact: 'none' },
            { name: "Pressure Point Strike", verb: 'strike', object: 'vital pressure point', type: 'Offense', power: 60, requiresArticle: true, element: 'physical', moveTags: ['melee_range', 'single_target', 'debuff_disable', 'precise'], collateralImpact: 'none' },
            { name: "Graceful Dodge", verb: 'dodge', object: 'incoming attack', type: 'Defense', power: 40, requiresArticle: true, element: 'utility', moveTags: ['utility_reposition', 'evasive'], collateralImpact: 'none' },
            { name: "Chi-Blocking Flurry", verb: 'deliver', object: 'flurry of chi-blocking strikes', type: 'Finisher', power: 85, requiresArticle: true, element: 'special', moveTags: ['melee_range', 'debuff_disable', 'single_target', 'unblockable', 'requires_opening'], collateralImpact: 'none' },
            { name: "Tactical Reposition", verb: 'execute', object: 'a nimble repositioning', type: 'Utility', power: 10, element: 'utility', moveTags: ['mobility_move', 'evasive', 'reposition'], isRepositionMove: true, collateralImpact: 'none' }
        ],
        quotes: { postWin: ["Looks like your chi's... on vacation!"], postWin_overwhelming: ["Ta-da! That's how it's done!"], postWin_specific: { 'mai': "Sorry, Mai! Your aura is still a lovely shade of gloomy pink, though!" } },
        relationships: {}
    }
};
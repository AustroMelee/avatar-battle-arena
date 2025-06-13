// FILE: data/characters/antagonists.js
'use strict';

// V5: PRONOUN OVERKILL. Every character object now has a compliant `pronouns` object.

export const antagonistCharacters = {
    'azula': {
        id: 'azula', name: "Azula", type: "Bender", pronouns: { s: 'she', p: 'her', o: 'her' },
        victoryStyle: "Ruthless", powerTier: 8,
        personalityProfile: { aggression: 0.9, patience: 0.3, riskTolerance: 0.9, opportunism: 1.0, creativity: 0.6, defensiveBias: 0.1, antiRepeater: 0.3, signatureMoveBias: { "Lightning Generation": 1.5, "Blue Fire Daggers": 1.2 } },
        specialTraits: { manipulative: 0.8 },
        narrative: {
            battleStart: [{ type: 'spoken', line: "You think you stand a chance against me? That's... adorable." }, { type: 'internal', line: "Show no weakness. Perfection is the only acceptable outcome." }],
            onIntentSelection: {
                CapitalizeOnOpening: [{ type: 'spoken', line: "There! An opening. This ends now." }],
                PressAdvantage: [{ type: 'internal', line: "They're faltering. A sustained assault will break them completely." }],
                DesperateGambit: [{ type: 'internal', line: "Unacceptable! I am not losing to this... peasant!" }]
            },
            onManipulation: {
                asAttacker: [ { type: 'spoken', line: "You're pathetic. Your own mother thought you were a monster." }, { type: 'spoken', line: "Still trying so hard? You'll always be second best." } ],
                asVictim: [{ type: 'internal', line: "Insolent worm. {opponent.s} will pay for that." }]
            },
            onPrediction: {
                correct: [{ type: 'spoken', line: "Of course you'd try that. You're so predictable." }],
                wrong: [{ type: 'internal', line: "A deviation from the expected pattern. Unlikely to happen again."}]
            },
            onStateChange: {
                stressed: [{ type: 'internal', line: "Why isn't this working? I should have won already." }],
                shaken: [{ type: 'internal', line: "My hair... it's not perfect... stay calm... CALM!" }],
                broken: [{ type: 'spoken', line: "No... you all fear me! You have to!" }]
            },
            onVictory: {
                Finisher: [{ line: "Almost a shame to have to snuff out such a pathetic flame." }],
                Humiliation: [{ line: "You were beaten before you even began. Remember that." }],
                Default: [{ line: "Flawless. As expected." }]
            },
            relationships: {
                'zuko': { narrative: { onManipulation: { asAttacker: [{ type: 'spoken', line: "Still playing the hero, Zuzu? It doesn't suit you." }] } } }
            }
        },
        techniques: [
            { name: "Calculated Feint", verb: 'execute', object: 'a deceptive feint', type: 'Utility', power: 15, element: 'utility', moveTags: ['utility_reposition', 'setup', 'humiliation'], setup: { name: 'Exposed', duration: 2, intensity: 1.35 } },
            { name: "Blue Fire Daggers", verb: 'launch', object: 'razor-sharp blue fire daggers', type: 'Offense', power: 45, element: 'fire', moveTags: ['ranged_attack', 'projectile', 'precise', 'area_of_effect_small'] },
            { name: "Fire Whip", verb: 'lash', object: 'out with a fire whip', type: 'Offense', power: 55, element: 'fire', moveTags: ['melee_range', 'ranged_attack_medium', 'channeled', 'single_target'] },
            { name: "Lightning Generation", verb: 'generate', object: 'precise bolt of lightning', type: 'Finisher', power: 100, requiresArticle: true, element: 'lightning', moveTags: ['ranged_attack', 'instantaneous', 'single_target', 'unblockable_standard', 'requires_opening', 'highRisk'] },
            { name: "Flame Burst", verb: 'erupt with', object: 'burst of blue flame', type: 'Defense', power: 50, requiresArticle: true, element: 'fire', moveTags: ['defensive_stance', 'utility_block', 'area_of_effect_small', 'pushback', 'counter'] },
            { name: "Precision Strike", verb: 'strike', object: 'with a focused fire blast', type: 'Offense', power: 70, element: 'fire', moveTags: ['ranged_attack', 'single_target', 'precise'] }
        ],
        quotes: { postWin: ["Flawless. As expected."], postWin_overwhelming: ["My power is absolute. You are beneath me."], postWin_specific: { 'zuko': "You were always weak, Zuzu. That's why you'll always lose." } },
        relationships: { 'zuko': { relationshipType: "sibling_rivalry_dominant", stressModifier: 1.5, resilienceModifier: 0.9 }, 'ozai-not-comet-enhanced': { relationshipType: "parental_fear", stressModifier: 2.5, resilienceModifier: 0.7 }, 'iroh': { relationshipType: "contemptuous_underestimation", stressModifier: 0.8, resilienceModifier: 1.1 } }
    },
    'ozai-not-comet-enhanced': {
        id: 'ozai-not-comet-enhanced', name: "Ozai (No Comet)", type: "Bender", pronouns: { s: 'he', p: 'his', o: 'him' },
        victoryStyle: "Supreme", powerTier: 9,
        personalityProfile: { aggression: 0.95, patience: 0.2, riskTolerance: 1.0, opportunism: 1.0, creativity: 0.3, defensiveBias: 0.05, antiRepeater: 0.2, signatureMoveBias: { "Dragon's Roar": 1.4, "Emperor's Wrath": 1.5 } },
        specialTraits: { manipulative: 0.6 },
        narrative: {
            battleStart: [{ type: 'spoken', line: "You dare challenge the Phoenix King? You will learn your place." }],
            onIntentSelection: { PressAdvantage: [{ type: 'spoken', line: "There is no escape. Your world is ending." }] },
            onManipulation: { asAttacker: [{ type: 'spoken', line: "Your friends cannot help you. Your hope is an illusion." }] },
            onStateChange: {
                stressed: [{ type: 'internal', line: "This insect is more resilient than expected. I will simply apply more pressure." }]
            },
            onVictory: { Default: [{ line: "The Fire Nation is supreme! My power is absolute!" }] },
            relationships: {
                'zuko': { narrative: { onManipulation: { asAttacker: [{ type: 'spoken', line: "You were always a failure, Zuko. Weak and ungrateful." }] } } },
                'aang-airbending-only': { narrative: { battleStart: [{ type: 'spoken', line: "So, the Avatar has come to meet his end." }] } }
            }
        },
        techniques: [
            { name: "Jet Propulsion", verb: 'propel himself', object: 'forward with a burst of flame', type: 'Utility', power: 30, element: 'fire', moveTags: ['utility_reposition', 'evasive'] },
            { name: "Scorching Blast", verb: 'unleash', object: 'scorching blast of fire', type: 'Offense', power: 60, requiresArticle: true, element: 'fire', moveTags: ['ranged_attack', 'area_of_effect_small'] },
            { name: "Flame Wall", verb: 'erect', object: 'towering wall of flame', type: 'Defense', power: 65, requiresArticle: true, element: 'fire', moveTags: ['defensive_stance', 'utility_block', 'construct_creation', 'area_of_effect_large'] },
            { name: "Dragon's Roar", verb: 'breathe', object: 'devastating cone of fire', type: 'Offense', power: 88, requiresArticle: true, element: 'fire', moveTags: ['ranged_attack', 'area_of_effect', 'channeled'] },
            { name: "Emperor's Wrath", verb: 'unleash', object: "the Emperor's Wrath", type: 'Finisher', power: 100, element: 'fire', moveTags: ['area_of_effect_large', 'versatile', 'unblockable_standard', 'requires_opening', 'highRisk'] }
        ],
        quotes: { postWin: ["The Fire Nation is supreme! My power is absolute!"], postWin_overwhelming: ["I am the Phoenix King! There is no equal!"], postWin_specific: { 'aang-airbending-only': "You thought you could stop me, child? You are nothing." } },
        relationships: { 'azula': { relationshipType: "demanding_patriarch", stressModifier: 1.1, resilienceModifier: 1.25 }, 'zuko': { relationshipType: "contemptuous_disdain", stressModifier: 0.6, resilienceModifier: 1.5 }, 'iroh': { relationshipType: "sibling_contempt", stressModifier: 1.0, resilienceModifier: 1.2 } }
    },
    'mai': {
        id: 'mai', name: "Mai", type: "Nonbender", pronouns: { s: 'she', p: 'her', o: 'her' },
        victoryStyle: "Deadpan", powerTier: 4,
        personalityProfile: { aggression: 0.4, patience: 0.7, riskTolerance: 0.4, opportunism: 0.8, creativity: 0.2, defensiveBias: 0.5, antiRepeater: 0.1, signatureMoveBias: { "Precision Strike": 1.3, "Pinning Strike": 1.4 } },
        specialTraits: { resilientToManipulation: 0.3 },
        narrative: {
            battleStart: [{ type: 'spoken', line: "Ugh. Let's just get this over with." }, { type: 'internal', line: "If I finish this quickly, maybe I can get some peace and quiet." }],
            onIntentSelection: {
                OpeningMoves: [{ type: 'internal', line: "Let's see how long it takes before {opponent.s} gets bored and makes a mistake." }],
                PressAdvantage: [{ type: 'spoken', line: "If you’re going to surrender, now’s your chance." }],
                DesperateGambit: [{ type: 'spoken', line: "Guess I have to try now. Great." }]
            },
            onMoveExecution: {
                'Pinning Strike': { Critical: [{ type: 'spoken', line: "Stay put." }] }
            },
            onManipulation: { asVictim: [{ type: 'internal', line: "Nice try. I’ve heard worse from Ty Lee when she’s hungry." }] },
            onPrediction: {
                correct: [{ type: 'spoken', line: "Predictable. I could have thrown that with my eyes closed." }],
                wrong: [{ type: 'internal', line: "Alright, that was actually clever. Doesn’t mean I care." }]
            },
            onStateChange: {
                stressed: [{ type: 'internal', line: "Now this is actually annoying." }],
                shaken: [{ type: 'internal', line: "Just breathe. None of this really matters anyway." }],
                broken: [{ type: 'spoken', line: "You win. Happy now?" }]
            },
            onVictory: { Default: [{ line: "That's it. Are we done now?" }] },
            relationships: {
                'azula': { narrative: { onManipulation: { asVictim: [{ type: 'internal', line: "Azula’s trying too hard. As usual." }] } } },
                'ty-lee': { narrative: { battleStart: [{ type: 'spoken', line: "Ty Lee, can we not do this?" }] } }
            }
        },
        techniques: [
            { name: "Knife Barrage", verb: 'unleash', object: 'barrage of knives', type: 'Offense', power: 50, requiresArticle: true, element: 'physical', moveTags: ['ranged_attack', 'projectile', 'area_of_effect_small'] },
            { name: "Precision Strike", verb: 'throw', object: 'single, perfectly aimed knife', type: 'Offense', power: 65, requiresArticle: true, element: 'physical', moveTags: ['ranged_attack', 'projectile', 'single_target', 'precise'] },
            { name: "Knife Wall", verb: 'create', object: 'defensive wall of knives', type: 'Defense', power: 45, requiresArticle: true, element: 'physical', moveTags: ['defensive_stance', 'utility_block', 'trap_delayed'] },
            { name: "Pinning Strike", verb: 'pin', object: "her foe's sleeve to a wall", type: 'Utility', power: 40, element: 'physical', moveTags: ['ranged_attack', 'projectile', 'debuff_disable', 'single_target', 'precise', 'humiliation'], setup: { name: 'Pinned', duration: 2, intensity: 1.45 } },
            { name: "Ricochet Shot", verb: 'launch', object: 'ricochet shot', type: 'Offense', power: 55, requiresArticle: true, element: 'physical', moveTags: ['ranged_attack', 'projectile', 'unpredictable', 'bypasses_defense'] },
            { name: "Final Pin", verb: 'unleash', object: 'final volley to trap her opponent', type: 'Finisher', power: 80, requiresArticle: true, element: 'physical', moveTags: ['ranged_attack', 'projectile', 'debuff_disable', 'area_of_effect', 'requires_opening'] }
        ],
        quotes: { postWin: ["That's it. Are we done now?"], postWin_overwhelming: ["You were never a threat. Just... annoying."], postWin_specific: { 'ty-lee': "Try to flip your way out of that one." } },
        relationships: {}
    },
    'ty-lee': {
        id: 'ty-lee', name: "Ty Lee", type: "Chi Blocker", pronouns: { s: 'she', p: 'her', o: 'her' },
        victoryStyle: "Playful", powerTier: 4,
        personalityProfile: { aggression: 0.8, patience: 0.3, riskTolerance: 0.7, opportunism: 0.9, creativity: 0.6, defensiveBias: 0.3, antiRepeater: 0.6, signatureMoveBias: { "Chi-Blocking Flurry": 1.3, "Pressure Point Strike": 1.2 } },
        specialTraits: { resilientToManipulation: 0.2 },
        narrative: {
            battleStart: [{ type: 'spoken', line: "Wow, your aura is, like, super-aggressive today! Let's fix that!" }],
            onIntentSelection: {
                CapitalizeOnOpening: [{ type: 'spoken', line: "Ooh, you're off-balance! Perfect time for a poke!" }],
                PressAdvantage: [{ type: 'spoken', line: "Come on, let's dance!" }],
            },
            onManipulation: {
                asVictim: [{ type: 'spoken', line: "Hey, that's not very nice! My aura is turning a gloomy gray now." }]
            },
            onStateChange: {
                stressed: [{ type: 'internal', line: "This isn't as fun as I thought it would be." }],
                shaken: [{ type: 'spoken', line: "Maybe we should just stop and talk about our feelings?" }]
            },
            onMoveExecution: {
                'Chi-Blocking Flurry': { Critical: [{ type: 'spoken', line: "Boop! Your bending is gone!" }] }
            },
            onVictory: { Default: [{ line: "Ta-da! That's how it's done!" }] },
            relationships: {
                'mai': { narrative: { battleStart: [{ type: 'spoken', line: "Aww, don't be so gloomy, Mai! Let's play!" }] } }
            }
        },
        techniques: [
            { name: "Acrobatic Flips", verb: 'execute', object: 'series of acrobatic flips', type: 'Utility', power: 25, requiresArticle: true, element: 'utility', moveTags: ['utility_reposition', 'evasive'], setup: { name: 'Distracted', duration: 1, intensity: 1.2 } },
            { name: "Pressure Point Strike", verb: 'strike', object: 'vital pressure point', type: 'Offense', power: 60, requiresArticle: true, element: 'physical', moveTags: ['melee_range', 'single_target', 'debuff_disable', 'precise'] },
            { name: "Graceful Dodge", verb: 'dodge', object: 'incoming attack', type: 'Defense', power: 40, requiresArticle: true, element: 'utility', moveTags: ['utility_reposition', 'evasive'] },
            { name: "Chi-Blocking Flurry", verb: 'deliver', object: 'flurry of chi-blocking strikes', type: 'Finisher', power: 85, requiresArticle: true, element: 'special', moveTags: ['melee_range', 'debuff_disable', 'single_target', 'unblockable', 'requires_opening'] }
        ],
        quotes: { postWin: ["Looks like your chi's... on vacation!"], postWin_overwhelming: ["Ta-da! That's how it's done!"], postWin_specific: { 'mai': "Sorry, Mai! Your aura is still a lovely shade of gloomy pink, though!" } },
        relationships: {}
    },
};
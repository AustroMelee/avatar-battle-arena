// FILE: data/characters/antagonists.js
'use strict';

// Contains character data for the primary antagonists of the series.

export const antagonistCharacters = {
    'azula': {
        id: 'azula', name: "Azula", type: "Bender", pronouns: { s: 'she', p: 'her', o: 'her' },
        victoryStyle: "Ruthless", powerTier: 8,
        pacingProfile: 'tactical',
        personalityProfile: { aggression: 0.9, patience: 0.3, riskTolerance: 0.9, opportunism: 1.0 },
        environmentalAffinity: { isHot: 1.1, isCold: 0.9, isUrban: 1.1, isIndustrial: 1.05 },
        techniques: [
            { name: "Calculated Feint", verb: 'execute', object: 'a deceptive feint', type: 'Utility', power: 15, element: 'utility', moveTags: ['utility_reposition'], setup: { name: 'Exposed', duration: 2, intensity: 1.35 } },
            { name: "Blue Fire Daggers", verb: 'launch', object: 'razor-sharp blue fire daggers', type: 'Offense', power: 45, element: 'fire', moveTags: ['ranged_attack', 'projectile', 'precise', 'area_of_effect_small'] },
            { name: "Fire Whip", verb: 'lash', object: 'out with a fire whip', type: 'Offense', power: 55, element: 'fire', moveTags: ['melee_range', 'ranged_attack_medium', 'channeled', 'single_target'] },
            { name: "Lightning Generation", verb: 'generate', object: 'precise bolt of lightning', type: 'Finisher', power: 100, requiresArticle: true, element: 'lightning', moveTags: ['ranged_attack', 'instantaneous', 'single_target', 'unblockable_standard', 'requires_opening'] },
            { name: "Flame Burst", verb: 'erupt with', object: 'burst of blue flame', type: 'Defense', power: 50, requiresArticle: true, element: 'fire', moveTags: ['defensive_stance', 'utility_block', 'area_of_effect_small', 'pushback'] },
            { name: "Precision Strike", verb: 'strike', object: 'with a focused fire blast', type: 'Offense', power: 70, element: 'fire', moveTags: ['ranged_attack', 'single_target', 'precise'] }
        ],
        quotes: { postWin: ["Flawless. As expected."], postWin_overwhelming: ["My power is absolute. You are beneath me."], postWin_specific: { 'zuko': "You were always weak, Zuzu. That's why you'll always lose." } },
        relationships: {
            'zuko': { relationshipType: "sibling_rivalry_dominant", stressModifier: 1.5, resilienceModifier: 0.9, emotionalModifiers: { aggressionBoost: 0.2, opportunismBoost: 0.3, patienceReduction: 0.2, } },
            'ozai-not-comet-enhanced': { relationshipType: "parental_fear", stressModifier: 2.5, resilienceModifier: 0.7, emotionalModifiers: { riskToleranceBoost: 0.3, aggressionReduction: 0.1, } },
            'iroh': { relationshipType: "contemptuous_underestimation", stressModifier: 0.8, resilienceModifier: 1.1, emotionalModifiers: { aggressionBoost: 0.1, riskToleranceBoost: 0.2, } }
        }
    },
    'ozai-not-comet-enhanced': {
        id: 'ozai-not-comet-enhanced', name: "Ozai (No Comet)", type: "Bender", pronouns: { s: 'he', p: 'his', o: 'him' },
        victoryStyle: "Supreme", powerTier: 9,
        pacingProfile: 'berserker',
        personalityProfile: { aggression: 0.95, patience: 0.2, riskTolerance: 1.0, opportunism: 1.0 },
        environmentalAffinity: { isHot: 1.2, isCold: 0.8, isIndustrial: 1.1, isUrban: 1.2 },
        techniques: [
            { name: "Jet Propulsion", verb: 'propel himself', object: 'forward with a burst of flame', type: 'Utility', power: 30, element: 'fire', moveTags: ['utility_reposition', 'evasive'] },
            { name: "Scorching Blast", verb: 'unleash', object: 'scorching blast of fire', type: 'Offense', power: 60, requiresArticle: true, element: 'fire', moveTags: ['ranged_attack', 'area_of_effect_small'] },
            { name: "Flame Wall", verb: 'erect', object: 'towering wall of flame', type: 'Defense', power: 65, requiresArticle: true, element: 'fire', moveTags: ['defensive_stance', 'utility_block', 'construct_creation', 'area_of_effect_large'] },
            { name: "Dragon's Roar", verb: 'breathe', object: 'devastating cone of fire', type: 'Offense', power: 88, requiresArticle: true, element: 'fire', moveTags: ['ranged_attack', 'area_of_effect', 'channeled'] },
            { name: "Emperor's Wrath", verb: 'unleash', object: "the Emperor's Wrath", type: 'Finisher', power: 100, element: 'fire', moveTags: ['area_of_effect_large', 'versatile', 'unblockable_standard', 'requires_opening'] }
        ],
        quotes: { postWin: ["The Fire Nation is supreme! My power is absolute!"], postWin_overwhelming: ["I am the Phoenix King! There is no equal!"], postWin_specific: { 'aang-airbending-only': "You thought you could stop me, child? You are nothing." } },
        relationships: {
            'azula': { relationshipType: "demanding_patriarch", stressModifier: 1.1, resilienceModifier: 1.25, emotionalModifiers: { aggressionBoost: 0.25, patienceReduction: 0.4, riskToleranceBoost: 0.2, } },
            'zuko': { relationshipType: "contemptuous_disdain", stressModifier: 0.6, resilienceModifier: 1.5, emotionalModifiers: { aggressionBoost: 0.3, } },
            'iroh': { relationshipType: "sibling_contempt", stressModifier: 1.0, resilienceModifier: 1.2, emotionalModifiers: { aggressionBoost: 0.1, } }
        }
    },
    'mai': {
        id: 'mai', name: "Mai", type: "Nonbender", pronouns: { s: 'she', p: 'her', o: 'her' },
        victoryStyle: "Deadpan", powerTier: 4,
        pacingProfile: 'opportunist',
        personalityProfile: { aggression: 0.4, riskTolerance: 0.4, opportunism: 0.8, patience: 0.7 },
        environmentalAffinity: { isUrban: 1.1, hasCover: 1.1, isCramped: 1.05, isExposed: 0.9 },
        techniques: [
            { name: "Knife Barrage", verb: 'unleash', object: 'barrage of knives', type: 'Offense', power: 50, emoji: '🔪', requiresArticle: true, element: 'physical', moveTags: ['ranged_attack', 'projectile', 'area_of_effect_small'] },
            { name: "Precision Strike", verb: 'throw', object: 'single, perfectly aimed knife', type: 'Offense', power: 65, emoji: '🎯', requiresArticle: true, element: 'physical', moveTags: ['ranged_attack', 'projectile', 'single_target', 'precise'] },
            { name: "Knife Wall", verb: 'create', object: 'defensive wall of knives', type: 'Defense', power: 45, emoji: '🧱', requiresArticle: true, element: 'physical', moveTags: ['defensive_stance', 'utility_block', 'trap_delayed'] },
            { name: "Pinning Strike", verb: 'pin', object: "her foe's sleeve to a wall", type: 'Utility', power: 40, emoji: '📌', element: 'physical', moveTags: ['ranged_attack', 'projectile', 'debuff_disable', 'single_target', 'precise'], setup: { name: 'Pinned', duration: 2, intensity: 1.45 } },
            { name: "Ricochet Shot", verb: 'launch', object: 'ricochet shot', type: 'Offense', power: 55, emoji: '🔄', requiresArticle: true, element: 'physical', moveTags: ['ranged_attack', 'projectile', 'unpredictable', 'bypasses_defense'] },
            { name: "Final Pin", verb: 'unleash', object: 'final volley to trap her opponent', type: 'Finisher', power: 80, emoji: '📍', requiresArticle: true, element: 'physical', moveTags: ['ranged_attack', 'projectile', 'debuff_disable', 'area_of_effect', 'requires_opening'] }
        ],
        quotes: { postWin: ["That's it. Are we done now?"], postWin_overwhelming: ["You were never a threat. Just... annoying."], postWin_specific: { 'ty-lee': "Try to flip your way out of that one." } },
        relationships: {}
    },
    'ty-lee': {
        id: 'ty-lee', name: "Ty Lee", type: "Chi Blocker", pronouns: { s: 'she', p: 'her', o: 'her' },
        victoryStyle: "Playful", powerTier: 4,
        pacingProfile: 'opportunist',
        personalityProfile: { aggression: 0.8, riskTolerance: 0.7, opportunism: 0.9, patience: 0.3 },
        environmentalAffinity: { isUrban: 1.1, isDense: 1.05, isExposed: 0.95, isSlippery: 0.9, hasShiftingGround: 0.95 },
        techniques: [
            { name: "Acrobatic Flips", verb: 'execute', object: 'series of acrobatic flips', type: 'Utility', power: 25, emoji: '🤸‍♀️', requiresArticle: true, element: 'utility', moveTags: ['utility_reposition', 'evasive'], setup: { name: 'Distracted', duration: 1, intensity: 1.2 } },
            { name: "Pressure Point Strike", verb: 'strike', object: 'vital pressure point', type: 'Offense', power: 60, emoji: '🎯', requiresArticle: true, element: 'physical', moveTags: ['melee_range', 'single_target', 'debuff_disable', 'precise'] },
            { name: "Graceful Dodge", verb: 'dodge', object: 'incoming attack', type: 'Defense', power: 40, emoji: '🍃', requiresArticle: true, element: 'utility', moveTags: ['utility_reposition', 'evasive'] },
            { name: "Chi-Blocking Flurry", verb: 'deliver', object: 'flurry of chi-blocking strikes', type: 'Finisher', power: 85, emoji: '🛑', requiresArticle: true, element: 'special', moveTags: ['melee_range', 'debuff_disable', 'single_target', 'unblockable', 'requires_opening'] }
        ],
        quotes: { postWin: ["Looks like your chi's... on vacation!"], postWin_overwhelming: ["Ta-da! That's how it's done!"], postWin_specific: { 'mai': "Sorry, Mai! Your aura is still a lovely shade of gloomy pink, though!" } },
        relationships: {}
    },
};
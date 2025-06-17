// FILE: js/data_characters_antagonists.js
'use strict';

// Aggregates Antagonist character data.

// Assuming ESCALATION_STATES is globally available or imported where this data is consumed.
// No direct import needed here.

export const antagonistCharacters = {
    'azula': {
        id: 'azula', name: "Azula", type: "Bender", element: "fire", pronouns: { s: 'she', p: 'her', o: 'her' },
        imageUrl: 'img/img_azula.avif',
        victoryStyle: "Ruthless", powerTier: 8,
        faction: "FireNation",
        isInsane: false,
        personalityProfile: {
            aggression: 0.9, patience: 0.3, riskTolerance: 0.9, opportunism: 1.0,
            creativity: 0.6, defensiveBias: 0.1, antiRepeater: 0.3,
            predictability: 0.8,
            signatureMoveBias: {
                "Feinting Ember Step": 1.2,
                "Blue Flame Daggers": 1.4,
                "Fire Lash": 1.1,
                "Lightning Generation": 1.9,
                "Flame Burst Counter": 1.1,
                "Precision Flame Strike": 1.3,
                "Tactical Reposition": 0.9
            }
        },
        specialTraits: { manipulative: 0.8, canGenerateLightning: true, canJetPropel: true }, // UPDATED: Added canJetPropel
        collateralTolerance: 0.9,
        mobility: 0.95,
        curbstompRules: [
            { ruleId: "azula_sane_precision_lightning", characterId: "azula", conditionLogic: (azula) => !azula.isInsane },
            { ruleId: "azula_sane_fire_tornado", characterId: "azula", conditionLogic: (azula) => !azula.isInsane },
            { ruleId: "azula_insane_unstable_kill", characterId: "azula", conditionLogic: (azula) => azula.mentalState.level === 'broken' },
            { ruleId: "azula_blue_fire_surge", characterId: "azula", conditionLogic: (azula) => true } // Blue Fire Surge is always active if this rule exists
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
        techniques: [
            { name: "Feinting Ember Step", verb: 'execute', object: 'a deceptive feint', description: "Uses deceptive movement to bait enemy attacks and create punishing openings.", type: 'Utility', power: 15, element: 'utility', moveTags: ['utility', 'reaction_bait', 'combo_starter', 'safe_reset'], collateralImpact: 'none' },
            { name: "Blue Flame Daggers", verb: 'launch', object: 'razor-sharp blue fire daggers', description: "Rapid, scalpel-like blue fire blasts thrown with lethal accuracy.", type: 'Offense', power: 45, element: 'fire', moveTags: ['ranged', 'multi_shot', 'small_aoe_splash', 'high_accuracy', 'ignite_chance'], collateralImpact: 'low' },
            { name: "Fire Lash", verb: 'lash', object: 'out with a fire whip', description: "A flexible arc of fire used for mid-range harassment or trip pressure.", type: 'Offense', power: 55, element: 'fire', moveTags: ['channeled', 'zone_control', 'can_trip', 'medium_damage'], collateralImpact: 'low' },
            { name: "Lightning Generation", verb: 'generate', object: 'precise bolt of lightning', description: "A focused bolt of lightning, unblockable but punishable if misused.", type: 'Finisher', power: 100, requiresArticle: true, element: 'lightning', moveTags: ['ranged', 'high_damage', 'unblockable', 'requires_opening', '-80% effect if punished'], collateralImpact: 'medium' },
            { name: "Flame Burst Counter", verb: 'erupt with', object: 'burst of blue flame', description: "Reactive burst of fire to punish aggression or create distance.", type: 'Defense', power: 50, requiresArticle: true, element: 'fire', moveTags: ['reactive_defense', 'aoe_burst', 'knockback', 'counter_starter'], collateralImpact: 'low' },
            { name: "Precision Flame Strike", verb: 'strike', object: 'with a focused fire blast', description: "A single-target jet of fire, faster and narrower than standard blasts.", type: 'Offense', power: 70, element: 'fire', moveTags: ['ranged', 'high_accuracy', 'single_target', 'quick_execution'], collateralImpact: 'low' },
            { name: "Tactical Reposition", verb: 'execute', object: 'a nimble repositioning', description: "Azula uses explosive momentum or smoke to escape danger and reset positioning.", type: 'Utility', power: 10, element: 'utility', moveTags: ['utility', 'evasion', 'mobility', 'combo_escape'], isRepositionMove: true, collateralImpact: 'none' }
        ],
        quotes: { postWin: ["Flawless. As expected."], postWin_overwhelming: ["My power is absolute. You are beneath me."], postWin_specific: { 'zuko': "You were always weak, Zuzu. That's why you'll always lose." } },
        relationships: { 'zuko': { relationshipType: "sibling_rivalry_dominant", stressModifier: 1.5, resilienceModifier: 0.9 }, 'ozai-not-comet-enhanced': { relationshipType: "parental_fear", stressModifier: 2.5, resilienceModifier: 0.7 }, 'iroh': { relationshipType: "contemptuous_underestimation", stressModifier: 0.8, resilienceModifier: 1.1 } }
    }
};
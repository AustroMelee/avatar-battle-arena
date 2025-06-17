// FILE: js/data_characters_antagonists.js
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
        specialTraits: { manipulative: 0.8, canGenerateLightning: true, canJetPropel: true }, // UPDATED: Added canJetPropel
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
        techniques: [
            { name: "Calculated Feint", verb: 'execute', object: 'a deceptive feint', type: 'Utility', power: 15, element: 'utility', moveTags: ['utility_reposition', 'setup', 'humiliation'], collateralImpact: 'none' },
            { name: "Blue Fire Daggers", verb: 'launch', object: 'razor-sharp blue fire daggers', type: 'Offense', power: 45, element: 'fire', moveTags: ['ranged_attack', 'projectile', 'precise', 'area_of_effect_small'], collateralImpact: 'low' },
            { name: "Fire Whip", verb: 'lash', object: 'out with a fire whip', type: 'Offense', power: 55, element: 'fire', moveTags: ['melee_range', 'ranged_attack_medium', 'channeled', 'single_target'], collateralImpact: 'low' },
            { name: "Lightning Generation", verb: 'generate', object: 'precise bolt of lightning', type: 'Finisher', power: 100, requiresArticle: true, element: 'lightning', moveTags: ['ranged_attack', 'instantaneous', 'single_target', 'unblockable_standard', 'requires_opening', 'highRisk', 'lightning_attack'], collateralImpact: 'medium' },
            { name: "Flame Burst", verb: 'erupt with', object: 'burst of blue flame', type: 'Defense', power: 50, requiresArticle: true, element: 'fire', moveTags: ['defensive_stance', 'utility_block', 'area_of_effect_small', 'pushback', 'counter'], collateralImpact: 'low' },
            { name: "Precision Strike", verb: 'strike', object: 'with a focused fire blast', type: 'Offense', power: 70, element: 'fire', moveTags: ['ranged_attack', 'single_target', 'precise'], collateralImpact: 'low' },
            { name: "Tactical Reposition", verb: 'execute', object: 'a nimble repositioning', type: 'Utility', power: 10, element: 'utility', moveTags: ['mobility_move', 'evasive', 'reposition'], isRepositionMove: true, collateralImpact: 'none' }
        ],
        quotes: { postWin: ["Flawless. As expected."], postWin_overwhelming: ["My power is absolute. You are beneath me."], postWin_specific: { 'zuko': "You were always weak, Zuzu. That's why you'll always lose." } },
        relationships: { 'zuko': { relationshipType: "sibling_rivalry_dominant", stressModifier: 1.5, resilienceModifier: 0.9 }, 'ozai-not-comet-enhanced': { relationshipType: "parental_fear", stressModifier: 2.5, resilienceModifier: 0.7 }, 'iroh': { relationshipType: "contemptuous_underestimation", stressModifier: 0.8, resilienceModifier: 1.1 } }
    }
};
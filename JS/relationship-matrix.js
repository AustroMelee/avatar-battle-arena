// FILE: js/relationship-matrix.js
'use strict';

// ====================================================================================
//  Relational Modifier Layer (RML) v1.2 Data File
// ====================================================================================
//  - stressModifier: Multiplier for how quickly stress accumulates. (Higher = more stressful)
//  - resilienceModifier: Multiplier for the stress thresholds. (Higher = more resilient)
// ====================================================================================

export const relationshipMatrix = {
    // --- AZULA ---
    'azula': {
        'zuko': {
            relationshipType: "sibling_rivalry_dominant",
            stressModifier: 1.2,
            resilienceModifier: 0.9, // She's confident against him, but his defiance can get to her.
            emotionalModifiers: {
                aggressionBoost: 0.2,
                opportunismBoost: 0.3,
                patienceReduction: 0.2,
            }
        },
        'ozai-not-comet-enhanced': {
            relationshipType: "parental_fear",
            stressModifier: 2.0,
            resilienceModifier: 0.5, // The ultimate source of her trauma; she breaks easily.
            emotionalModifiers: {
                riskToleranceBoost: 0.3, 
                aggressionReduction: 0.1,
            }
        },
        'iroh': {
            relationshipType: "contemptuous_underestimation",
            stressModifier: 0.8,
            resilienceModifier: 1.1, // His calm demeanor doesn't phase her.
            emotionalModifiers: {
                aggressionBoost: 0.1,
                riskToleranceBoost: 0.2, 
            }
        }
    },

    // --- ZUKO ---
    'zuko': {
        'azula': {
            relationshipType: "sibling_rivalry_inferior",
            stressModifier: 1.8,
            resilienceModifier: 0.8, // Azula knows how to break him down.
            emotionalModifiers: {
                aggressionBoost: 0.2,
                riskToleranceBoost: 0.3,
                patienceReduction: 0.2,
            }
        },
        'ozai-not-comet-enhanced': {
            relationshipType: "parental_defiance",
            stressModifier: 1.5,
            resilienceModifier: 1.2, // He's learned to stand up to him, making him more resilient.
            emotionalModifiers: {
                aggressionBoost: 0.3,
                riskToleranceReduction: 0.1,
                patienceBoost: 0.2,
            }
        },
        'iroh': {
            relationshipType: "mentor_respect",
            stressModifier: 0.5,
            resilienceModifier: 1.5, // Iroh's presence is calming and fortifying.
            emotionalModifiers: {
                aggressionReduction: 0.2,
                patienceBoost: 0.4,
                riskToleranceReduction: 0.2,
            }
        }
    },

    // --- AANG ---
    'aang-airbending-only': {
        'ozai-not-comet-enhanced': {
            relationshipType: "fated_adversary",
            stressModifier: 1.3,
            resilienceModifier: 1.3, // The weight is heavy, but his spirit is strong.
            emotionalModifiers: {
                aggressionBoost: 0.2,
                riskToleranceReduction: 0.3,
                patienceBoost: 0.2,
            }
        },
        'azula': {
            relationshipType: "nonlethal_pacifism",
            stressModifier: 1.1,
            resilienceModifier: 1.2, // Her lethality is stressful, but he remains centered.
            emotionalModifiers: {
                aggressionReduction: 0.4,
                riskToleranceReduction: 0.5,
                patienceBoost: 0.3,
                mercyTrigger: true,
            }
        }
    },

    // --- KATARA ---
    'katara': {
        'zuko': {
            relationshipType: "tense_alliance",
            stressModifier: 1.0,
            resilienceModifier: 1.1, // She is emotionally resilient.
            emotionalModifiers: {
                opportunismBoost: 0.2,
                patienceBoost: 0.1,
            }
        },
        'azula': {
            relationshipType: "bitter_rivalry",
            stressModifier: 1.4,
            resilienceModifier: 1.0, // Her hatred is a powerful, but stable, motivator.
            emotionalModifiers: {
                aggressionBoost: 0.3,
                riskToleranceBoost: 0.2,
                opportunismBoost: 0.2,
            }
        }
    },
    
    // --- SOKKA ---
    'sokka': {
        'katara': {
            relationshipType: 'sibling_support',
            stressModifier: 0.9,
            resilienceModifier: 1.2 // They support each other.
        }
    },

    // --- IROH ---
    'iroh': {
        'zuko': {
            relationshipType: "mentor_guidance",
            stressModifier: 0.7,
            resilienceModifier: 2.0, // Almost unshakable when guiding his nephew.
            emotionalModifiers: {
                aggressionReduction: 0.5,
                patienceBoost: 0.5,
                riskToleranceReduction: 0.4,
                mercyTrigger: true,
            }
        },
        'azula': {
            relationshipType: "pitying_disappointment",
            stressModifier: 1.1,
            resilienceModifier: 1.8, // He is sad for her, but not personally broken by her.
            emotionalModifiers: {
                aggressionReduction: 0.4,
                patienceBoost: 0.3,
                mercyTrigger: true,
            }
        }
    }
};
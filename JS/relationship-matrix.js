// FILE: js/relationship-matrix.js
'use strict';

// ====================================================================================
//  Relational Modifier Layer (RML) v1.6 - Precision Tuning
// ====================================================================================
//  - Increased Azula's resilience vs. Ozai to give her a better fighting chance.
// ====================================================================================

export const relationshipMatrix = {
    // --- AZULA ---
    'azula': {
        'zuko': {
            relationshipType: "sibling_rivalry_dominant",
            stressModifier: 1.5,
            resilienceModifier: 0.9,
            emotionalModifiers: {
                aggressionBoost: 0.2,
                opportunismBoost: 0.3,
                patienceReduction: 0.2,
            }
        },
        'ozai-not-comet-enhanced': {
            relationshipType: "parental_fear",
            stressModifier: 2.5,
            resilienceModifier: 0.7, // Increased from 0.5. Still low, but not cripplingly so.
            emotionalModifiers: {
                riskToleranceBoost: 0.3, 
                aggressionReduction: 0.1,
            }
        },
        'iroh': {
            relationshipType: "contemptuous_underestimation",
            stressModifier: 0.8,
            resilienceModifier: 1.1,
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
            stressModifier: 2.0,
            resilienceModifier: 0.8,
            emotionalModifiers: {
                aggressionBoost: 0.2,
                riskToleranceBoost: 0.3,
                patienceReduction: 0.2,
            }
        },
        'ozai-not-comet-enhanced': {
            relationshipType: "parental_defiance",
            stressModifier: 1.8,
            resilienceModifier: 1.2,
            emotionalModifiers: {
                aggressionBoost: 0.3,
                riskToleranceReduction: 0.1,
                patienceBoost: 0.2,
            }
        },
        'iroh': {
            relationshipType: "mentor_respect",
            stressModifier: 0.5,
            resilienceModifier: 1.5,
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
            stressModifier: 1.4,
            resilienceModifier: 1.3,
            emotionalModifiers: {
                aggressionBoost: 0.2,
                riskToleranceReduction: 0.3,
                patienceBoost: 0.2,
            }
        },
        'azula': {
            relationshipType: "nonlethal_pacifism",
            stressModifier: 1.2,
            resilienceModifier: 1.2,
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
            resilienceModifier: 1.1,
            emotionalModifiers: {
                opportunismBoost: 0.2,
                patienceBoost: 0.1,
            }
        },
        'azula': {
            relationshipType: "bitter_rivalry",
            stressModifier: 1.5,
            resilienceModifier: 1.0,
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
            resilienceModifier: 1.2
        }
    },

    // --- IROH ---
    'iroh': {
        'zuko': {
            relationshipType: "mentor_guidance",
            stressModifier: 0.7,
            resilienceModifier: 2.0,
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
            resilienceModifier: 1.8,
            emotionalModifiers: {
                aggressionReduction: 0.4,
                patienceBoost: 0.3,
                mercyTrigger: true,
            }
        }
    },
    
    // --- OZAI ---
    'ozai-not-comet-enhanced': {
        'azula': {
            relationshipType: "demanding_patriarch",
            stressModifier: 1.1,
            resilienceModifier: 1.25,
            emotionalModifiers: {
                aggressionBoost: 0.25,
                patienceReduction: 0.4,
                riskToleranceBoost: 0.2,
            }
        },
        'zuko': {
            relationshipType: "contemptuous_disdain",
            stressModifier: 0.6,
            resilienceModifier: 1.5,
            emotionalModifiers: {
                aggressionBoost: 0.3,
            }
        },
        'iroh': {
            relationshipType: "sibling_contempt",
            stressModifier: 1.0,
            resilienceModifier: 1.2,
            emotionalModifiers: {
                aggressionBoost: 0.1,
            }
        }
    }
};
// FILE: js/relationship-matrix.js
'use strict';

// ====================================================================================
//  Relational Modifier Layer (RML) v1.0 Data File
// ====================================================================================
//  Defines the emotional and psychological relationships between characters.
//  This matrix directly influences AI behavior, move selection, and narrative flavor.
//
//  - relationshipType: A descriptive tag for the relationship.
//  - emotionalModifiers: Multipliers applied to the character's base personality profile.
//      - *_Boost: Adds to the profile value (e.g., aggressionBoost: 0.2 increases aggression by 0.2).
//      - *_Reduction: Subtracts from the profile value.
//  - breakdownTrigger: If true, this relationship makes a mental breakdown more likely under stress.
//  - mercyTrigger: If true, the character may hesitate to land a finishing blow.
// ====================================================================================

export const relationshipMatrix = {
    // --- AZULA ---
    'azula': {
        'zuko': {
            relationshipType: "sibling_rivalry_dominant",
            emotionalModifiers: {
                aggressionBoost: 0.2,
                opportunismBoost: 0.3,
                patienceReduction: 0.2,
            }
        },
        'ozai-not-comet-enhanced': {
            relationshipType: "parental_fear",
            emotionalModifiers: {
                riskToleranceBoost: 0.3, // Tries to impress with risky moves
                aggressionReduction: 0.1, // Slightly more cautious
                breakdownTrigger: true,
            }
        },
        'iroh': {
            relationshipType: "contemptuous_underestimation",
            emotionalModifiers: {
                aggressionBoost: 0.1,
                riskToleranceBoost: 0.2, // Doesn't see him as a real threat
            }
        },
        'aang-airbending-only': {
            relationshipType: "predator_prey",
            emotionalModifiers: {
                aggressionBoost: 0.25,
                opportunismBoost: 0.25,
            }
        },
        'katara': {
            relationshipType: "rivalry_equal",
            emotionalModifiers: {
                aggressionBoost: 0.15,
                patienceBoost: 0.1, // Knows Katara is a threat
            }
        },
        'toph-beifong': {
            relationshipType: "annoyance_dismissal",
            emotionalModifiers: {
                aggressionBoost: 0.2,
                riskToleranceBoost: 0.1,
            }
        }
    },

    // --- ZUKO ---
    'zuko': {
        'azula': {
            relationshipType: "sibling_rivalry_inferior",
            emotionalModifiers: {
                aggressionBoost: 0.2,
                riskToleranceBoost: 0.3, // More desperate to prove himself
                patienceReduction: 0.2,
                breakdownTrigger: true,
            }
        },
        'ozai-not-comet-enhanced': {
            relationshipType: "parental_defiance",
            emotionalModifiers: {
                aggressionBoost: 0.3,
                riskToleranceReduction: 0.1, // Knows he can't be reckless
                patienceBoost: 0.2,
            }
        },
        'iroh': {
            relationshipType: "mentor_respect",
            emotionalModifiers: {
                aggressionReduction: 0.2,
                patienceBoost: 0.4,
                riskToleranceReduction: 0.2,
            }
        },
        'aang-airbending-only': {
            relationshipType: "conflicted_ally",
            emotionalModifiers: {
                aggressionReduction: 0.15,
                patienceBoost: 0.1,
            }
        },
        'katara': {
            relationshipType: "conflicted_respect",
            emotionalModifiers: {
                aggressionReduction: 0.1,
                patienceBoost: 0.2,
            }
        }
    },

    // --- AANG ---
    'aang-airbending-only': {
        'ozai-not-comet-enhanced': {
            relationshipType: "fated_adversary",
            emotionalModifiers: {
                aggressionBoost: 0.2, // Knows he has to be aggressive
                riskToleranceReduction: 0.3, // But still won't take lethal risks
                patienceBoost: 0.2,
            }
        },
        'azula': {
            relationshipType: "nonlethal_pacifism",
            emotionalModifiers: {
                aggressionReduction: 0.4,
                riskToleranceReduction: 0.5,
                patienceBoost: 0.3,
                mercyTrigger: true,
            }
        },
        'zuko': {
            relationshipType: "friend_rival",
            emotionalModifiers: {
                aggressionReduction: 0.2,
                patienceBoost: 0.1,
            }
        },
        'bumi': {
            relationshipType: "playful_friends",
            emotionalModifiers: {
                aggressionReduction: 0.3,
                patienceBoost: 0.2,
            }
        }
    },

    // --- KATARA ---
    'katara': {
        'zuko': {
            relationshipType: "tense_alliance",
            emotionalModifiers: {
                opportunismBoost: 0.2,
                patienceBoost: 0.1,
            }
        },
        'azula': {
            relationshipType: "bitter_rivalry",
            emotionalModifiers: {
                aggressionBoost: 0.3,
                riskToleranceBoost: 0.2,
                opportunismBoost: 0.2,
            }
        },
        'pakku': {
            relationshipType: "student_master",
            emotionalModifiers: {
                aggressionReduction: 0.1,
                patienceBoost: 0.2,
            }
        }
    },
    
    // --- IROH ---
    'iroh': {
        'zuko': {
            relationshipType: "mentor_guidance",
            emotionalModifiers: {
                aggressionReduction: 0.5,
                patienceBoost: 0.5,
                riskToleranceReduction: 0.4,
                mercyTrigger: true,
            }
        },
        'azula': {
            relationshipType: "pitying_disappointment",
            emotionalModifiers: {
                aggressionReduction: 0.4,
                patienceBoost: 0.3,
                mercyTrigger: true,
            }
        },
        'ozai-not-comet-enhanced': {
            relationshipType: "brotherly_opposition",
            emotionalModifiers: {
                patienceBoost: 0.2,
                riskToleranceReduction: 0.1,
            }
        }
    },

    // --- TOPH ---
    'toph-beifong': {
        'bumi': {
            relationshipType: "rival_respect",
            emotionalModifiers: {
                aggressionBoost: 0.2,
                riskToleranceBoost: 0.2,
            }
        },
        'aang-airbending-only': {
            relationshipType: "friendly_teasing",
            emotionalModifiers: {
                aggressionBoost: 0.1,
            }
        }
    },

    // --- BUMI ---
    'bumi': {
        'toph-beifong': {
            relationshipType: "rival_respect_elder",
            emotionalModifiers: {
                aggressionBoost: 0.2,
                riskToleranceBoost: 0.2,
            }
        },
        'aang-airbending-only': {
            relationshipType: "testing_a_friend",
            emotionalModifiers: {
                aggressionBoost: 0.1,
                patienceBoost: 0.1,
            }
        }
    },

    // --- PAKKU ---
    'pakku': {
        'katara': {
            relationshipType: "master_student",
            emotionalModifiers: {
                aggressionBoost: 0.1, // Testing her
                patienceBoost: 0.1,
            }
        }
    },
    
    // --- SOKKA ---
    'sokka': {
        'ty-lee': {
            relationshipType: "flustered_admiration",
            emotionalModifiers: {
                patienceReduction: 0.2,
                riskToleranceReduction: 0.1,
            }
        },
        'zuko': {
            relationshipType: "begrudging_ally",
            emotionalModifiers: {
                opportunismBoost: 0.15,
            }
        }
    }
};
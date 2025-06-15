// FILE: data_mechanics_universal.js
'use strict';

// Universal mechanics and rules applicable across all characters and locations.

export const universalMechanics = {
    maiKnifeAdvantage: {
        id: "mai_knife_advantage",
        description: "Mai's uncanny precision with knives.",
        characterId: "mai",
        conditions: [
            { type: "target_technique_speed", value: "slow", triggerChance: 0.85 },
            { type: "location_property", property: "cramped", modifier: 0.10 }
        ],
        maxChance: 0.85,
        counteredBy: ["fast_defensive_move", "area_denial_projectile"],
        personalityTrigger: "provoked",
        canTriggerPreBattle: false,
        outcome: { type: "instant_kill", successMessage: "{attackerName}'s thrown knife finds a fatal opening due to {targetName}'s slow technique!", failureMessage: "{targetName} narrowly avoids Mai's deadly accurate throw!" }
    },
    tyLeeChiBlocking: {
        id: "tylee_chi_blocking",
        description: "Ty Lee's ability to paralyze with precise strikes.",
        characterId: "ty-lee",
        conditions: [
            { type: "location_property", property: "cramped", triggerChance: 0.60 },
        ],
        maxChance: 0.85,
        counteredBy: ["projectile_attack", "area_denial_move"],
        personalityTrigger: "serious_fight",
        canTriggerPreBattle: false,
        activatingMoveTags: ["melee_range", "debuff_disable"],
        outcome: { type: "instant_paralysis", duration: 2, successMessage: "Ty Lee's acrobatic assault with {moveName} lands perfectly, blocking {targetName}'s chi!", failureMessage: "{targetName} manages to avoid Ty Lee's disabling strikes!" }
    },
    // Add other universal mechanics here
};
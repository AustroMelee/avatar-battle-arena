// FILE: data_mechanics_characters.js
'use strict';

// Refined Curb Stomp Mechanics (v2) for Direct Engine Integration

export const characterCurbstompRules = {
    'azula': [
        {
            id: "azula_sane_precision_lightning",
            description: "A sane Azula's lightning is a tool of chilling precision, especially effective against conductive targets.",
            triggerChance: 0.75,
            canTriggerPreBattle: false,
            severity: 'lethal',
            conditionLogic: (azula, opponent, battleState) => {
                return !azula.mentalState.isInsane && (opponent.specialTraits?.hasMetalArmor || opponent.specialTraits?.isWet);
            },
            outcome: { 
                type: "instant_win", 
                successMessage: "Azula's lightning strikes with surgical precision, using {targetName}'s armor or the water around them as a fatal conductor.",
            }
        },
        {
            id: "azula_sane_fire_tornado",
            description: "Azula creates a vortex of blue fire, incinerating anyone caught within.",
            triggerChance: 0.55,
            canTriggerPreBattle: false,
            severity: 'lethal',
            conditionLogic: (azula, opponent, battleState) => {
                return !azula.mentalState.isInsane && battleState.isOpenTerrain;
            },
            outcome: { 
                type: "instant_win", 
                successMessage: "Azula conjures a terrifying vortex of blue flame, engulfing and incinerating {targetName}.",
            }
        },
        {
            id: "azula_insane_unstable_kill",
            description: "A mentally unstable Azula attacks with raw, unpredictable power.",
            triggerChance: 0.60, // 60% chance to be an instant kill
            selfSabotageChance: 0.40, // 40% chance it backfires
            canTriggerPreBattle: false,
            severity: 'lethal',
            conditionLogic: (azula, opponent, battleState) => {
                return azula.mentalState.level === 'broken'; // simplified from isInsane
            },
            outcome: { 
                type: "conditional_instant_win_or_self_sabotage", 
                successMessage: "In her madness, Azula unleashes a wild, unpredictable assault that completely overwhelms {targetName}!",
                selfSabotageMessage: "Azula's attack is powerful but reckless, going awry and leaving her vulnerable."
            }
        },
        {
            id: "azula_blue_fire_surge",
            description: "Her iconic blue fire burns hotter, allowing her to cut through defenses.",
            triggerChance: 1.0,
            canTriggerPreBattle: true,
            severity: 'buff',
            outcome: { 
                type: "damage_increase_character", 
                value: 0.25,
                message: "Azula's blue fire rages with terrifying intensity, burning through standard defenses."
            }
        }
    ],
    'aang': [
        {
            id: "aang_avatar_state",
            description: "When in mortal danger, Aang can enter the Avatar State, wielding unimaginable power.",
            triggerChance: 0.95,
            canTriggerPreBattle: false,
            severity: 'lethal',
            conditionLogic: (aang, opponent, battleState) => {
                return (aang.hp < 20 || aang.mentalState.level === 'broken');
            },
            // Special outcome to reflect Aang's reluctance to kill
            outcome: {
                type: "conditional_instant_win_or_mercy",
                mercyChance: 0.20,
                successMessage: "Aang's eyes glow with the power of a thousand lifetimes. He unleashes the full power of the Avatar State, overwhelming {targetName} completely.",
                mercyMessage: "The Avatar State gives Aang the power to win, but at the last moment, his own spirit pulls back, incapacitating but not killing {targetName}."
            }
        },
        {
            id: "aang_mobility_edge",
            description: "Aang's mastery of airbending gives him a significant defensive advantage against grounded attacks.",
            triggerChance: 0.60,
            canTriggerPreBattle: true,
            severity: 'buff',
            outcome: { 
                type: "evasion_increase_vs_grounded",
                value: 0.60,
                message: "Aang zips around on his air scooter, making him an incredibly difficult target for ground-based assaults."
            }
        }
    ]
};
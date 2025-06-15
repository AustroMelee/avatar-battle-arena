// FILE: data_mechanics_characters.js
'use strict';

// Character-specific curbstomp rules.

export const characterCurbstompRules = {
    'ozai-not-comet-enhanced': [
        {
            id: "ozai_fire_comet_mode",
            description: "Ozai unleashes an overwhelming, comet-like fire assault.",
            triggerChance: 0.85,
            canTriggerPreBattle: false,
            personalityTrigger: "authority_challenged",
            activatingMoveName: "Emperor's Wrath",
            activatingMoveTags: ["fire", "area_of_effect_large", "highRisk", "lightning_attack"], // Added lightning_attack
            activatingMoveElement: "fire", // Can also be lightning if Emperor's Wrath can be lightning
            outcome: { type: "instant_kill_target", successMessage: "Ozai, his authority challenged, unleashes {moveName} with the devastating force of a comet, instantly incinerating {targetName}!", failureMessage: "{targetName} somehow withstands Ozai's monumental display of power!" }
        },
        {
            id: "ozai_lightning_spam",
            description: "Ozai relentlessly spams lightning attacks.",
            triggerChance: 0.70,
            canTriggerPreBattle: false,
            personalityTrigger: "authority_challenged",
            activatingMoveTags: ["lightning", "ranged_attack", "lightning_attack"], // Added lightning_attack
            activatingMoveElement: "lightning",
            outcome: { type: "instant_death_target", successMessage: "With {moveName}, Ozai rains down a terrifying storm of lightning, leaving {targetName} no chance of survival!", failureMessage: "{targetName} miraculously dodges or redirects Ozai's relentless lightning barrage!" }
        }
    ],
    'bumi': [
        {
            id: "bumi_massive_earthbending_bury",
            description: "Bumi buries opponent under a mountain of earth.",
            triggerChance: 0.60,
            canTriggerPreBattle: false,
            personalityTrigger: "underestimated",
            activatingMoveName: "Rock Avalanche",
            activatingMoveTags: ["earth", "area_of_effect_large", "environmental_manipulation"],
            outcome: { type: "instant_incapacitation_target_bury", successMessage: "With a cackle, Bumi's {moveName} shifts a mountain of earth, burying {targetName} completely!", failureMessage: "{targetName} narrowly escapes being crushed by Bumi's colossal earthbending!" }
        },
        {
            id: "bumi_structural_collapse",
            description: "Bumi causes a massive structural collapse (e.g., buildings in Omashu).",
            triggerChance: 0.80,
            canTriggerPreBattle: false,
            conditionLogic: (bumi, opponent, battleState) => battleState.locationTags.includes("urban") || battleState.locationTags.includes("dense"),
            personalityTrigger: "underestimated",
            activatingMoveName: "Terrain Reshape",
            activatingMoveTags: ["earth", "environmental_manipulation", "area_of_effect_large"],
            outcome: { type: "instant_kill_target_collapse", successMessage: "King Bumi's {moveName} brings the very structures around them crashing down on {targetName}!", failureMessage: "{targetName} makes a daring escape as the surroundings collapse!" }
        }
    ],
    'azula': [
        {
            id: "azula_sane_lightning_precision",
            description: "Azula's perfectly aimed lightning strike.",
            triggerChance: 0.75,
            canTriggerPreBattle: false,
            personalityTrigger: "in_control",
            conditionLogic: (azula) => !azula.isInsane,
            activatingMoveName: "Lightning Generation",
            activatingMoveTags: ["lightning", "ranged_attack", "single_target", "instantaneous", "lightning_attack"], // Added lightning_attack
            activatingMoveElement: "lightning",
            outcome: { type: "instant_kill_target", successMessage: "Azula's {moveName} strikes with chilling precision, ending {targetName}'s fight instantly!", failureMessage: "{targetName} anticipates Azula's lightning, managing a desperate dodge!" }
        },
        {
            id: "azula_sane_fire_tornado",
            description: "Azula creates a devastating blue fire tornado.",
            triggerChance: 0.55,
            canTriggerPreBattle: false,
            personalityTrigger: "in_control",
            conditionLogic: (azula) => !azula.isInsane,
            activatingMoveTags: ["fire", "area_of_effect_large", "channeled"],
            activatingMoveElement: "fire",
            outcome: { type: "instant_incapacitation_target_burn", successMessage: "Azula conjures a terrifying blue fire tornado with {moveName}, engulfing and incinerating {targetName}!", failureMessage: "{targetName} finds a way to disrupt or escape Azula's fiery vortex!" }
        }
    ],
    'azula_insane': [
        {
            id: "azula_insane_unpredictable_attacks",
            description: "Azula's attacks become wild and unpredictable due to mental instability.",
            triggerChance: 0.60,
            canTriggerPreBattle: false,
            selfSabotageChance: 0.40,
            personalityTrigger: "desperate_broken",
            conditionLogic: (azula) => azula.isInsane,
            activatingMoveTags: ["fire", "area_of_effect_large", "highRisk"], // Could be lightning too
            activatingMoveElement: "fire", // Could be lightning
            outcome: {
                type: "conditional_instant_kill_or_self_sabotage",
                successMessage: "Azula's crazed, unpredictable {moveName} overwhelms {targetName}!",
                failureMessage: "{targetName} capitalizes on a wild, unfocused attack from Azula!",
                selfSabotageMessage: "In her madness, Azula's {moveName} goes awry, hindering herself!"
            }
        },
        {
            id: "azula_insane_blue_fire_buff",
            description: "Her blue fire burns hotter and more erratically in her unstable state.",
            triggerChance: 1.0,
            canTriggerPreBattle: true,
            personalityTrigger: "desperate_broken",
            conditionLogic: (azula) => azula.isInsane,
            outcome: { type: "damage_increase_character_25_percent", message: "Azula's blue fire rages with terrifying, unstable intensity!" }
        }
    ],
    'toph-beifong': [
        {
            id: "toph_seismic_sense_accuracy",
            description: "Toph's seismic sense grants near-perfect accuracy.",
            triggerChance: 0.85,
            canTriggerPreBattle: true,
            outcome: { type: "accuracy_increase_character_85_percent", message: "Toph's seismic sense allows her to 'see' {targetName}'s every move with pinpoint accuracy." }
        },
        {
            id: "toph_metal_bending_vs_armor",
            description: "Toph's metalbending instantly crushes or bypasses metal armor.",
            triggerChance: 0.85,
            canTriggerPreBattle: false,
            personalityTrigger: "doubted",
            activatingMoveName: "Metal Bending",
            activatingMoveTags: ["metal", "utility_control"],
            outcome: { type: "instant_win_attacker_vs_armor", successMessage: "Toph's {moveName} twists and crushes {targetName}'s armor, leaving them defenseless!", failureMessage: "{targetName}'s armor holds, or they shed it just in time!" }
        }
    ],
    'katara': [
        {
            id: "katara_bloodbending",
            description: "Katara resorts to bloodbending under extreme duress (full moon).",
            triggerChance: 0.85,
            canTriggerPreBattle: false,
            conditionLogic: (katara, opponent, battleState) => battleState.isFullMoon === true,
            personalityTrigger: "desperate_mentally_broken",
            activatingMoveName: "Bloodbending",
            activatingMoveTags: ["special", "debuff_disable", "unblockable"],
            outcome: { type: "instant_win_attacker_control", successMessage: "Under the light of the full moon and pushed to her absolute limit, Katara's {moveName} seizes control of {targetName}, ending the fight instantly!", failureMessage: "{targetName}'s willpower (or Katara's hesitation) prevents the bloodbending from taking full effect!" }
        },
        {
            id: "katara_ice_prison_kill",
            description: "Katara encases opponent in a fatal ice prison.",
            triggerChance: 0.70,
            canTriggerPreBattle: false,
            personalityTrigger: "desperate_mentally_broken",
            activatingMoveName: "Ice Prison",
            activatingMoveTags: ["ice", "construct_creation", "debuff_disable"],
            outcome: { type: "instant_kill_target_ice", successMessage: "Katara summons massive ice shards with {moveName}, encasing and fatally wounding {targetName}!", failureMessage: "{targetName} shatters the forming ice prison just in time!" }
        }
    ],
    'aang-airbending-only': [
        {
            id: "aang_avatar_state_air",
            description: "Aang taps into the Avatar State, unleashing immense air power.",
            triggerChance: 0.85,
            canTriggerPreBattle: false,
            personalityTrigger: "mortal_danger",
            activatingMoveTags: ["air", "area_of_effect_large", "unblockable"], // Conceptual tags
            outcome: { type: "instant_win_attacker_overwhelm", successMessage: "Aang's eyes glow as he enters the Avatar State, unleashing a cataclysmic storm of air that overwhelms {targetName}!", failureMessage: "Aang struggles to fully control the Avatar State's power, giving {targetName} a fleeting chance!" }
        },
        {
            id: "aang_air_scooter_evasion",
            description: "Aang's masterful use of the air scooter for evasion.",
            triggerChance: 0.60,
            canTriggerPreBattle: true,
            outcome: { type: "evasion_chance_increase_60_percent", message: "Aang zips around on his air scooter, becoming an incredibly difficult target." }
        }
    ],
    'zuko': [
        {
            id: "zuko_scar_intimidation",
            description: "Zuko's scar and intensity can intimidate opponents.",
            triggerChance: 1.0,
            canTriggerPreBattle: true,
            outcome: { type: "attack_power_increase_character_15_percent", message: "Zuko's fierce determination and visible scar lend an intimidating edge to his attacks." }
        },
        {
            id: "zuko_dual_dao_kill",
            description: "Zuko's mastery with his dual dao swords combined with firebending.",
            triggerChance: 0.80,
            canTriggerPreBattle: false,
            personalityTrigger: "honor_violated",
            activatingMoveName: "Flame Sword",
            activatingMoveTags: ["fire", "melee_range", "precise"],
            outcome: { type: "instant_kill_target", successMessage: "Zuko's fiery {moveName} dances with deadly precision, delivering a fatal blow to {targetName}!", failureMessage: "{targetName} narrowly parries Zuko's lightning-fast sword assault!" }
        }
    ],
    'sokka': [
        {
            id: "sokka_strategy_exploit",
            description: "Sokka devises a clever environmental exploit or trap.",
            triggerChance: 0.30,
            canTriggerPreBattle: false,
            personalityTrigger: "meticulous_planning",
            escapeCondition: { type: "intelligence_roll", character: "sokka", threshold: 65, successChance: 0.10 },
            activatingMoveTags: ["utility", "trap_delayed", "environmental_manipulation"],
            outcome: { type: "advantage_attacker_environmental", successMessage: "Sokka's brilliant strategy (perhaps using {moveName}) turns the environment against {targetName}, creating a key advantage!", failureMessage: "Sokka's plan doesn't quite come together this time." }
        },
        {
            id: "sokka_vulnerability_death",
            description: "Sokka's inherent vulnerability as a non-bender.",
            appliesToCharacter: "sokka",
            triggerChance: 0.75,
            canTriggerPreBattle: true,
            conditionLogic: (sokkaChar, opponentChar) => opponentChar.type === "Bender",
            weightingLogic: ({ attacker, defender, rule, location, situation }) => {
                let sokkaUnderThreat;
                let opponentOfSokka;

                if (attacker.id === "sokka") {
                    sokkaUnderThreat = attacker;
                    opponentOfSokka = defender;
                } else if (defender.id === "sokka") {
                    sokkaUnderThreat = defender;
                    opponentOfSokka = attacker;
                } else {
                    return null;
                }

                let sokkaLosesChance = 0.75;
                if (opponentOfSokka.powerTier > sokkaUnderThreat.powerTier + 2) sokkaLosesChance = 0.90;
                if (opponentOfSokka.element === "fire" && situation.isDay) sokkaLosesChance += 0.05;
                if (opponentOfSokka.element === "water" && situation.isNight) sokkaLosesChance += 0.05;
                if (location.tags && location.tags.includes("open") && opponentOfSokka.element !== "earth") sokkaLosesChance += 0.05;
                if (location.tags && location.tags.includes("cover_rich")) sokkaLosesChance -= 0.10;

                sokkaLosesChance = Math.max(0, Math.min(1.0, sokkaLosesChance));
                return { victimId: "sokka", probability: sokkaLosesChance };
            },
            outcome: {
                type: "instant_loss_weighted_character",
                successMessage: "Outmatched by {opponentName}'s bending, {actualVictimName} falls in battle despite his bravery.",
                failureMessage: "{actualVictimName}'s agility and a bit of luck keep him out of lethal harm's way!"
            }
        }
    ],
    'jeong-jeong': [
        {
            id: "jeongjeong_fire_whips_disable",
            description: "Jeong Jeong uses precise fire whips to disable an opponent.",
            triggerChance: 0.45,
            canTriggerPreBattle: false,
            personalityTrigger: "confident_stance",
            activatingMoveName: "Flame Whips",
            activatingMoveTags: ["fire", "ranged_attack_medium", "precise"],
            outcome: { type: "incapacitation_target_disable_limbs", successMessage: "Jeong Jeong's {moveName} lash out with pinpoint accuracy, ensnaring and disabling {targetName}'s limbs!", failureMessage: "{targetName} narrowly evades Jeong Jeong's ensnaring fire whips!" }
        },
        {
            id: "jeongjeong_desert_advantage",
            description: "Jeong Jeong's fire control excels in dry, open desert environments.",
            triggerChance: 1.0,
            canTriggerPreBattle: true,
            conditionLogic: (jj, o, bs) => bs.locationId === 'si-wong-desert',
            outcome: { type: "power_increase_character_35_percent", message: "In the desolate expanse of the Si Wong Desert, Jeong Jeong's mastery over fire is amplified." }
        }
    ],
    'pakku': [
        {
            id: "pakku_water_mastery_curbstomp",
            description: "Pakku's overwhelming waterbending mastery.",
            triggerChance: 0.85,
            canTriggerPreBattle: false,
            personalityTrigger: "skill_challenged",
            activatingMoveName: "Octopus Form",
            activatingMoveTags: ["water", "versatile", "area_of_effect_small"],
            outcome: { type: "instant_win_attacker_overwhelm", successMessage: "Master Pakku unleashes {moveName}, an overwhelming display of waterbending that leaves {targetName} utterly defeated!", failureMessage: "{targetName} manages to weather the initial storm of Pakku's masterful assault!" }
        },
        {
            id: "pakku_ice_daggers_kill",
            description: "Pakku forms and launches lethal ice daggers.",
            triggerChance: 0.60,
            canTriggerPreBattle: false,
            personalityTrigger: "skill_challenged",
            activatingMoveName: "Ice Spikes", // Assuming Ice Spikes is the base for daggers
            activatingMoveTags: ["ice", "projectile", "precise"],
            outcome: { type: "instant_kill_target_ice", successMessage: "With chilling precision, Pakku's {moveName} form into deadly ice daggers, fatally striking {targetName}!", failureMessage: "{targetName} deflects or dodges Pakku's lethal ice projectiles!" }
        }
    ]
};
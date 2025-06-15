// FILE: mechanics.js
'use strict';

// ====================================================================================
//  Curbstomp Mechanics & Rules Definition (v1.3 - Corrected WeightingLogic Context)
// ====================================================================================
//  This file centralizes all rules related to instant win/loss conditions,
//  drastic advantages, and personality-driven mechanic triggers.
//  The battle engine will refer to this file to evaluate these conditions.
//  - Corrected context within weightingLogic for 'appliesToCharacter' rules.
// ====================================================================================

export const CURBSTOMP_RULES_VERSION = "1.3"; // Updated version

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
};

export const locationCurbstompRules = {
    'si-wong-desert': [
        {
            id: "si_wong_azula_vs_katara",
            description: "Azula's fire mastery amplified by sun vs. Katara's limited water.",
            appliesToPair: ["azula", "katara"],
            triggerChance: 0.85,
            canTriggerPreBattle: false,
            activatingMoveTags: ["fire", "ranged_attack"],
            outcome: { type: "instant_win_attacker", successMessage: "In the searing Si Wong Desert, Azula's sun-amplified {moveName} overwhelms Katara's dwindling water reserves!", failureMessage: "Katara, through sheer willpower and skill, endures Azula's desert inferno!" }
        },
        {
            id: "si_wong_sokka_heatstroke",
            description: "Sokka's vulnerability to extreme heat and dehydration.",
            appliesToCharacter: "sokka", // This rule is for Sokka
            triggerChance: 0.75,
            canTriggerPreBattle: true,
            conditionLogic: (sokkaChar, opponentChar) => opponentChar.type === "Bender", // Make sure parameters match how they are used
            weightingLogic: ({ attacker, defender, rule, location, situation }) => {
                // 'rule' here is the 'si_wong_sokka_heatstroke' object itself.
                // 'rule.appliesToCharacter' is "sokka".
                // We need to identify which of the *current combatants* (attacker, defender) is Sokka.
                let sokkaCharacter;
                let opponentOfSokka;

                if (attacker.id === rule.appliesToCharacter) { // rule.appliesToCharacter is "sokka"
                    sokkaCharacter = attacker;
                    opponentOfSokka = defender;
                } else if (defender.id === rule.appliesToCharacter) {
                    sokkaCharacter = defender;
                    opponentOfSokka = attacker;
                } else {
                    // This should ideally not happen if the rule evaluation is correct up to this point
                    return null;
                }

                let sokkaLosesChance = 0.85;
                if (opponentOfSokka.element === "fire" && situation.isDay) sokkaLosesChance = 0.95;
                // if (sokkaCharacter.specialTraits?.desertSurvivalTraining) sokkaLosesChance *= 0.5;
                return { victimId: "sokka", probability: sokkaLosesChance };
            },
            escapeCondition: { type: "intelligence_roll", character: "sokka", threshold: 70, successChance: 0.10 },
            outcome: {
                type: "instant_loss_weighted_character",
                successMessage: "Overcome by the brutal desert heat and {opponentName}'s assault, {actualVictimName} collapses!",
                failureMessage: "{actualVictimName}'s resilience (and perhaps a lucky find of shade) allows him to fight on!",
                escapeMessage: "{actualVictimName}'s quick thinking allows him to find a temporary reprieve, narrowly escaping incapacitation!"
            }
        }
    ],
    'omashu': [
        {
            id: "omashu_bumi_advantage",
            description: "King Bumi's unparalleled mastery of Omashu's terrain.",
            appliesToCharacter: "bumi",
            triggerChance: 0.85,
            canTriggerPreBattle: false,
            personalityTrigger: "disrespected",
            activatingMoveTags: ["earth", "environmental_manipulation"],
            outcome: { type: "instant_win_attacker", successMessage: "In his city, King Bumi's {moveName} is an unstoppable force, overwhelming {opponentName} with colossal earthbending!", failureMessage: "{opponentName} navigates Bumi's earth-shattering attacks with surprising skill!" }
        },
        {
            id: "omashu_tylee_chiblock",
            description: "Ty Lee's chi-blocking is extremely effective in the confined chutes.",
            appliesToCharacter: "ty-lee",
            triggerChance: 0.85,
            canTriggerPreBattle: false,
            activatingMoveTags: ["melee_range", "debuff_disable"],
            conditionLogic: (tylee, opponent, battleState) => battleState.locationTags.includes("cramped") && battleState.locationId === 'omashu',
            outcome: { type: "instant_paralysis_target", duration: 3, successMessage: "Within the chaotic Omashu chutes, Ty Lee's agility allows her {moveName} to instantly disable {opponentName}!", failureMessage: "{opponentName} narrowly avoids Ty Lee's flurry in the confined space!" }
        },
        {
            id: "omashu_crushing_hazard",
            description: "Risk of being crushed by shifting earth or out-of-control carts.",
            appliesToAll: true,
            triggerChance: 0.10,
            canTriggerPreBattle: true,
            weightingLogic: ({ attacker, defender, location, situation }) => {
                let probAttacker = 0.5;
                let probDefender = 0.5;

                const adjustProbs = (char) => {
                    let prob = 0.5;
                    if (char.id === 'bumi') prob *= 0.05;
                    else if (char.id === 'sokka') prob *= 2.5;
                    else if (char.type === 'Nonbender') prob *= 1.8;
                    else if (char.element === 'earth') prob *= 0.6;

                    if (char.mobility > 0.75) prob *= 0.4;
                    else if (char.mobility < 0.35) prob *= 1.8;

                    if (situation.environmentState && situation.environmentState.damageLevel > 30) prob *= 1.2;
                    if (situation.environmentState && situation.environmentState.damageLevel > 60) prob *= 1.5;
                    return prob;
                };

                probAttacker = adjustProbs(attacker);
                probDefender = adjustProbs(defender);

                const totalWeight = probAttacker + probDefender;
                if (totalWeight === 0 || isNaN(totalWeight)) return null;

                return {
                    probabilities: {
                        [attacker.id]: probAttacker / totalWeight,
                        [defender.id]: probDefender / totalWeight
                    }
                };
            },
            outcome: {
                type: "instant_loss_weighted_character",
                successMessage: "A sudden rockslide (or runaway cabbage cart!) in the Omashu chutes proves fatal for {actualVictimName}!",
                failureMessage: "Both fighters narrowly avoid a catastrophic accident in the chutes!"
            }
        }
    ],
    'northern-water-tribe': [
        {
            id: "nwt_katara_vs_firebenders",
            description: "Katara's mastery with unlimited water vs. weakened firebenders.",
            appliesToCharacter: "katara",
            conditionLogic: (katara, opponent) => opponent.element === "fire" || opponent.element === "lightning",
            triggerChance: 0.80,
            canTriggerPreBattle: false,
            activatingMoveTags: ["water", "ice"],
            outcome: { type: "advantage_attacker", effect: "opponent_power_reduced_50_hypothermia_10_percent_per_turn", successMessage: "In her element, Katara's {moveName} showcases her waterbending mastery, overwhelming {opponentName}'s fire as the biting cold weakens their flames!", failureMessage: "{opponentName}'s fierce fire manages to keep Katara's water at bay, for now." }
        },
        {
            id: "nwt_pakku_curbstomp",
            description: "Pakku's unparalleled waterbending mastery in his home city.",
            appliesToCharacter: "pakku",
            conditionLogic: (pakku, opponent) => opponent.type !== "Bender" || opponent.element !== "water",
            triggerChance: 0.85,
            canTriggerPreBattle: false,
            personalityTrigger: "honor_duty_challenged",
            activatingMoveTags: ["water", "ice", "Finisher"],
            outcome: { type: "instant_win_attacker", successMessage: "Master Pakku's {moveName} demonstrates the true power of the Northern Water Tribe, decisively defeating {opponentName}!", failureMessage: "{opponentName} surprisingly withstands Master Pakku's initial onslaught!" }
        },
        {
            id: "nwt_firebender_penalty",
            description: "Firebenders suffer reduced power and risk hypothermia.",
            appliesToCharacterElement: "fire",
            canTriggerPreBattle: true,
            outcome: { type: "persistent_effect", effect: "power_reduction_50_hypothermia_risk_10_percent_per_turn", message: "The frigid air of the North saps the strength from {characterName}'s fire." }
        }
    ],
    'foggy-swamp': [
        {
            id: "swamp_toph_weakness",
            description: "Toph's seismic sense is impaired by the soft, muddy ground.",
            appliesToCharacter: "toph-beifong",
            triggerChance: 0.60,
            canTriggerPreBattle: true,
            outcome: { type: "disadvantage_character", effect: "reduced_accuracy_defense_20_percent", successMessage: "The murky, soft ground of the Foggy Swamp dulls Toph's seismic sense, making her vulnerable.", failureMessage: "Toph focuses intensely, managing to 'see' through the muck surprisingly well." }
        },
        {
            id: "swamp_katara_buff",
            description: "Katara draws strength from the swamp's abundant water and plant life.",
            appliesToCharacter: "katara",
            triggerChance: 0.40,
            canTriggerPreBattle: true,
            outcome: { type: "advantage_character", effect: "power_increase_40_percent", successMessage: "Katara feels the life energy of the Foggy Swamp, her waterbending surging with newfound power!", failureMessage: "The swamp's energy is too chaotic for Katara to fully harness." }
        },
        {
            id: "swamp_ranged_accuracy_loss",
            description: "Thick fog and tangled vines reduce ranged accuracy.",
            appliesToMoveType: "ranged_attack",
            triggerChance: 0.50,
            canTriggerPreBattle: true,
            outcome: { type: "accuracy_penalty_50_percent", message: "The dense fog and vegetation make precise ranged attacks difficult." }
        }
    ],
    'fire-nation-capital': [
        {
            id: "fn_capital_ozai_azula_buff",
            description: "Ozai or Azula's power amplified in their seat of power.",
            appliesToCharacters: ["ozai-not-comet-enhanced", "azula"],
            triggerChance: 1.0,
            canTriggerPreBattle: true,
            outcome: { type: "power_increase_character_50_percent", message: "{characterName} feels invigorated by the heart of the Fire Nation, their flames burning with imperial might!" }
        },
        {
            id: "fn_capital_open_space_ranged",
            description: "Open plaza benefits ranged attacks.",
            appliesToMoveType: "ranged_attack",
            triggerChance: 1.0,
            canTriggerPreBattle: true,
            outcome: { type: "effectiveness_increase_30_percent", message: "The open expanse of the plaza allows for devastatingly effective ranged assaults." }
        },
        {
            id: "fn_capital_intimidation",
            description: "Non-Fire Nation combatants feel intimidated.",
            conditionLogic: (character) => character.faction !== "FireNation",
            triggerChance: 1.0,
            canTriggerPreBattle: true,
            outcome: { type: "performance_decrease_character_20_percent", message: "The imposing atmosphere of the Fire Nation Capital weighs heavily on {characterName}, hindering their performance." }
        }
    ],
    'kyoshi-island': [
        {
            id: "kyoshi_environmental_traps",
            description: "Kyoshi Warriors' traps or tricky village layout.",
            appliesToAll: true,
            triggerChance: 0.20,
            canTriggerPreBattle: true,
            // No weightingLogic means selectCurbstompVictim will use its appliesToAll fallback (50/50 if outcome is weighted type)
            outcome: { type: "advantage_random_character_or_debuff_random", effect: "ambush_or_minor_damage_stun", successMessage: "{actualVictimName} stumbles into a hidden Kyoshi trap, creating an opening (or taking damage)!", failureMessage: "The fighters navigate the village carefully, avoiding any obvious traps." }
        },
        {
            id: "kyoshi_narrow_bridges_knockoff",
            description: "Risk of being knocked off narrow bridges or platforms.",
            appliesToAll: true,
            triggerChance: 0.30,
            canTriggerPreBattle: false,
            conditionLogic: (character, opponent, battleState) => battleState.nearEdge === true,
            weightingLogic: ({ attacker, defender, situation }) => {
                let probAttackerFall = 0.5;
                let probDefenderFall = 0.5;
                if (attacker.mobility < defender.mobility) { probAttackerFall *= 1.5; probDefenderFall *= 0.5;}
                else if (defender.mobility < attacker.mobility) { probDefenderFall *= 1.5; probAttackerFall *= 0.5;}
                if (attacker.element === "air" || attacker.specialTraits?.canGrapple) probAttackerFall *= 0.2;
                if (defender.element === "air" || defender.specialTraits?.canGrapple) probDefenderFall *= 0.2;
                const totalWeight = probAttackerFall + probDefenderFall;
                if (totalWeight === 0 || isNaN(totalWeight)) return null;
                return { probabilities: { [attacker.id]: probAttackerFall / totalWeight, [defender.id]: probDefenderFall / totalWeight } };
            },
            outcome: {
                type: "instant_loss_weighted_character",
                successMessage: "A powerful blow (or a misstep near the edge!) sends {actualVictimName} tumbling from a narrow bridge into the waters below, out of the fight!",
                failureMessage: "Both fighters maintain their balance on the precarious platforms despite the close call."
            }
        },
        {
            id: "kyoshi_sokka_strategy_escape",
            description: "Sokka's strategic mind and potential escape.",
            appliesToCharacter: "sokka",
            triggerChance: 0.10,
            canTriggerPreBattle: false,
            escapeCondition: { type: "intelligence_roll", character: "sokka", threshold: 60, successChance: 0.10 },
            outcome: { type: "escape_character", successMessage: "Sokka, using his knowledge of Kyoshi tactics (and a bit of luck), manages to create an escape route!", failureMessage: "Sokka's escape plan is thwarted!", escapeMessage: "Sokka pulls off a daring escape!" }
        }
    ],
    'great-divide': [
        {
            id: "divide_aang_air_buff",
            description: "Aang's airbending is amplified by strong canyon updrafts.",
            appliesToCharacter: "aang-airbending-only",
            triggerChance: 1.0,
            canTriggerPreBattle: true,
            outcome: { type: "power_increase_character_40_percent", message: "The powerful updrafts of the Great Divide significantly enhance Aang's airbending!" }
        },
        {
            id: "divide_fall_risk",
            description: "High risk of falling into the chasm.",
            appliesToAll: true,
            triggerChance: 0.40,
            canTriggerPreBattle: false,
            conditionLogic: (character, opponent, battleState) => battleState.nearEdge === true || battleState.lastMovePushbackStrong === true,
            weightingLogic: ({ attacker, defender, situation }) => {
                let probAttackerFall = 0.5;
                let probDefenderFall = 0.5;
                if (attacker.mobility < defender.mobility) { probAttackerFall *= 1.5; probDefenderFall *= 0.5;}
                else if (defender.mobility < attacker.mobility) { probDefenderFall *= 1.5; probAttackerFall *= 0.5;}
                if (attacker.element === "air" || attacker.specialTraits?.canGrapple) probAttackerFall *= 0.1;
                if (defender.element === "air" || defender.specialTraits?.canGrapple) probDefenderFall *= 0.1;
                const totalWeight = probAttackerFall + probDefenderFall;
                if (totalWeight === 0 || isNaN(totalWeight)) return null;
                return { probabilities: { [attacker.id]: probAttackerFall / totalWeight, [defender.id]: probDefenderFall / totalWeight } };
            },
            outcome: {
                type: "instant_loss_weighted_character",
                successMessage: "{actualVictimName} loses their footing and plummets into the Great Divide!",
                failureMessage: "Both fighters narrowly avoid a fatal fall into the chasm."
            }
        },
        {
            id: "divide_mai_accuracy_buff",
            description: "Mai's throwing accuracy benefits from clear sightlines.",
            appliesToCharacter: "mai",
            triggerChance: 1.0,
            canTriggerPreBattle: true,
            outcome: { type: "accuracy_increase_character_25_percent", message: "The vast, open sightlines of the Great Divide allow Mai to aim her projectiles with uncanny accuracy." }
        }
    ],
    'ba-sing-se': [
        {
            id: "bs_lower_ring_toph_advantage",
            description: "Toph's earthbending is amplified in the dense, earthen Lower Ring.",
            appliesToCharacter: "toph-beifong",
            triggerChance: 1.0,
            canTriggerPreBattle: true,
            outcome: { type: "advantage_character", effect: "power_increase_30_percent_defense_increase_20_percent", successMessage: "Toph feels the pulse of Ba Sing Se's earth deep within the Lower Ring, her power surging!", failureMessage: "" }
        },
        {
            id: "bs_lower_ring_crowd_interference",
            description: "Dense crowds might interfere with combat.",
            appliesToAll: true,
            triggerChance: 0.15,
            canTriggerPreBattle: true,
            weightingLogic: ({ attacker, defender, location, situation }) => { // Example of a simple random fallback if not specifically targeted
                return { probabilities: { [attacker.id]: 0.5, [defender.id]: 0.5 } };
            },
            outcome: { type: "disruption_random_character", effect: "minor_stun_or_misstep", successMessage: "The panicked crowd surges, momentarily disrupting {actualVictimName}'s attack!", failureMessage: "The fighters manage to weave through the throngs of people." }
        },
        {
            id: "bs_lower_ring_tylee_chiblock",
            description: "Ty Lee's chi-blocking excels in the close quarters.",
            appliesToCharacter: "ty-lee",
            triggerChance: 0.40,
            canTriggerPreBattle: true,
            outcome: { type: "advantage_character", effect: "chi_blocking_effectiveness_increase_40_percent", successMessage: "The tight alleys and rooftops of the Lower Ring are a perfect playground for Ty Lee's acrobatic chi-blocking!", failureMessage: "" }
        }
    ]
};

export const characterCurbstompRules = {
    'ozai-not-comet-enhanced': [
        {
            id: "ozai_fire_comet_mode",
            description: "Ozai unleashes an overwhelming, comet-like fire assault.",
            triggerChance: 0.85,
            canTriggerPreBattle: false,
            personalityTrigger: "authority_challenged",
            activatingMoveName: "Emperor's Wrath",
            outcome: { type: "instant_kill_target", successMessage: "Ozai, his authority challenged, unleashes {moveName} with the devastating force of a comet, instantly incinerating {targetName}!", failureMessage: "{targetName} somehow withstands Ozai's monumental display of power!" }
        },
        {
            id: "ozai_lightning_spam",
            description: "Ozai relentlessly spams lightning attacks.",
            triggerChance: 0.70,
            canTriggerPreBattle: false,
            personalityTrigger: "authority_challenged",
            activatingMoveTags: ["lightning", "ranged_attack"],
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
            outcome: { type: "instant_kill_target", successMessage: "Azula's {moveName} strikes with chilling precision, ending {targetName}'s fight instantly!", failureMessage: "{targetName} anticipates Azula's lightning, managing a desperate dodge!" }
        },
        {
            id: "azula_sane_fire_tornado",
            description: "Azula creates a devastating blue fire tornado.",
            triggerChance: 0.55,
            canTriggerPreBattle: false,
            personalityTrigger: "in_control",
            conditionLogic: (azula) => !azula.isInsane,
            activatingMoveTags: ["fire", "area_of_effect_large"],
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
            conditionLogic: (toph, opponent) => opponent.hasMetalArmor === true,
            personalityTrigger: "doubted",
            activatingMoveName: "Metal Bending",
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
            outcome: { type: "instant_win_attacker_control", successMessage: "Under the light of the full moon and pushed to her absolute limit, Katara's {moveName} seizes control of {targetName}, ending the fight instantly!", failureMessage: "{targetName}'s willpower (or Katara's hesitation) prevents the bloodbending from taking full effect!" }
        },
        {
            id: "katara_ice_prison_kill",
            description: "Katara encases opponent in a fatal ice prison.",
            triggerChance: 0.70,
            canTriggerPreBattle: false,
            personalityTrigger: "desperate_mentally_broken",
            activatingMoveName: "Ice Prison",
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
            outcome: { type: "advantage_attacker_environmental", successMessage: "Sokka's brilliant strategy (perhaps using {moveName}) turns the environment against {targetName}, creating a key advantage!", failureMessage: "Sokka's plan doesn't quite come together this time." }
        },
        {
            id: "sokka_vulnerability_death",
            description: "Sokka's inherent vulnerability as a non-bender.",
            appliesToCharacter: "sokka", // Explicitly states this rule is about Sokka
            triggerChance: 0.75,
            canTriggerPreBattle: true,
            conditionLogic: (sokkaChar, opponentChar) => opponentChar.type === "Bender", // Using char names from function signature
            weightingLogic: ({ attacker, defender, rule, location, situation }) => {
                // 'rule' is 'sokka_vulnerability_death' object. rule.appliesToCharacter is "sokka".
                let sokkaUnderThreat;
                let opponentOfSokka;

                if (attacker.id === "sokka") {
                    sokkaUnderThreat = attacker;
                    opponentOfSokka = defender;
                } else if (defender.id === "sokka") {
                    sokkaUnderThreat = defender;
                    opponentOfSokka = attacker;
                } else {
                    return null; // Should not happen if rule is correctly targeted
                }

                let sokkaLosesChance = 0.75;
                if (opponentOfSokka.powerTier > sokkaUnderThreat.powerTier + 2) sokkaLosesChance = 0.90;
                if (opponentOfSokka.element === "fire" && situation.isDay) sokkaLosesChance += 0.05;
                if (opponentOfSokka.element === "water" && situation.isNight) sokkaLosesChance += 0.05;
                if (location.tags && location.tags.includes("open") && opponentOfSokka.element !== "earth") sokkaLosesChance += 0.05;
                if (location.tags && location.tags.includes("cover_rich")) sokkaLosesChance -= 0.10;

                // Ensure probability is between 0 and 1
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
            outcome: { type: "instant_win_attacker_overwhelm", successMessage: "Master Pakku unleashes {moveName}, an overwhelming display of waterbending that leaves {targetName} utterly defeated!", failureMessage: "{targetName} manages to weather the initial storm of Pakku's masterful assault!" }
        },
        {
            id: "pakku_ice_daggers_kill",
            description: "Pakku forms and launches lethal ice daggers.",
            triggerChance: 0.60,
            canTriggerPreBattle: false,
            personalityTrigger: "skill_challenged",
            activatingMoveName: "Ice Spikes",
            outcome: { type: "instant_kill_target_ice", successMessage: "With chilling precision, Pakku's {moveName} form into deadly ice daggers, fatally striking {targetName}!", failureMessage: "{targetName} deflects or dodges Pakku's lethal ice projectiles!" }
        }
    ]
};

export const personalityTriggerMappings = {
    "provoked": "Opponent lands a critical hit, taunts Mai, or targets Ty Lee/Zuko (if allied).",
    "serious_fight": "An ally's health drops below 30%, or opponent uses an overtly lethal move.",
    "authority_challenged": "Opponent lands two significant (Strong/Critical) hits on Ozai, or uses a taunt/defiant dialogue line.",
    "underestimated": "Opponent uses a taunt related to Bumi's age or unconventional tactics, or uses a 'Weak' effectiveness move against him.",
    "in_control": "Azula's health > 50% AND Azula has not received a 'Critical' hit this battle AND opponent's mental state is 'stable' or 'stressed'.",
    "desperate_broken": "Azula's health < 30% OR Azula's mental state is 'broken'.",
    "desperate_mentally_broken": "Katara: health < 10%, ally incapacitated, taken 2+ critical hits, OR mental state 'broken'.",
    "doubted": "Opponent uses a taunt targeting Toph's blindness or skill, or lands a hit that Toph 'didn't see coming'.",
    "mortal_danger": "An ally's health < 5% (if applicable) OR Aang's own health < 20%.",
    "honor_violated": "Opponent uses a move flagged as 'dishonorable' OR an ally is disarmed/incapacitated unfairly.",
    "meticulous_planning": "Opponent overcommits with a high-power/high-risk move and misses OR battle terrain strongly favors traps.",
    "confident_stance": "Jeong Jeong has successfully landed a 'Strong' or 'Critical' hit in the last turn OR an ally has successfully buffed/protected him.",
    "skill_challenged": "Opponent uses a taunt about Pakku's traditional style or skill OR opponent initiates combat with a direct, aggressive offensive move.",
    "disrespected": "Generic trigger for characters like Bumi if an opponent mocks their connection to the location or their methods there.",
};
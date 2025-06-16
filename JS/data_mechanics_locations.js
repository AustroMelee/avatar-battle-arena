// FILE: data_mechanics_locations.js
'use strict';

// Location-specific curbstomp rules.

export const locationCurbstompRules = {
    'si-wong-desert': [
        {
            id: "si_wong_azula_vs_katara",
            description: "Azula's fire mastery amplified by sun vs. Katara's limited water.",
            appliesToPair: ["azula", "katara"],
            triggerChance: 0.85,
            canTriggerPreBattle: false,
            canTriggerInPhase: ['Early', 'Mid', 'Late'], // NEW
            severity: 'lethal', // NEW
            activatingMoveTags: ["fire", "ranged_attack"],
            outcome: { type: "instant_win_attacker", successMessage: "In the searing Si Wong Desert, Azula's sun-amplified {moveName} overwhelms Katara's dwindling water reserves!", failureMessage: "Katara, through sheer willpower and skill, endures Azula's desert inferno!" }
        },
        {
            id: "si_wong_sokka_heatstroke",
            description: "Sokka's vulnerability to extreme heat and dehydration.",
            appliesToCharacter: "sokka", // This rule is for Sokka
            triggerChance: 0.75,
            canTriggerPreBattle: true,
            canTriggerInPhase: ['PreBanter', 'Poking', 'Early', 'Mid', 'Late'], // NEW
            severity: 'crippling', // NEW
            conditionLogic: (sokkaChar, opponentChar) => opponentChar.type === "Bender", // Make sure parameters match how they are used
            weightingLogic: ({ attacker, defender, location, situation }) => { // Removed 'rule' from destructuring, hardcoding "sokka" for robustness
                let sokkaCharacter;
                let opponentOfSokka;

                // Directly identify Sokka and opponent, as this rule is specific to Sokka
                if (attacker.id === "sokka") {
                    sokkaCharacter = attacker;
                    opponentOfSokka = defender;
                } else if (defender.id === "sokka") {
                    sokkaCharacter = defender;
                    opponentOfSokka = attacker;
                } else {
                    return null; // Should not happen if appliesToCharacter is correctly checked upstream
                }

                let sokkaLosesChance = 0.85;
                if (opponentOfSokka.element === "fire" && situation.isDay) sokkaLosesChance = 0.95;
                return { victimId: "sokka", probability: sokkaLosesChance };
            },
            escapeCondition: { type: "intelligence_roll", character: "sokka", threshold: 70, successChance: 0.10 },
            outcome: {
                type: "instant_loss_weighted_character",
                successMessage: "Overcome by the brutal desert heat and {opponentName}'s assault, {actualVictimName} collapses!",
                failureMessage: "{actualVictimName}'s resilience (and perhaps a lucky find of shade) allows him to fight on!",
                escapeMessage: "{actualVictimName}'s quick thinking allows him to find a temporary reprieve, narrowly escaping incapacitation!"
            }
        },
        // Old rules specific to this location
        {
            id: "si_wong_azula_vs_aang_heat",
            description: "Azula's fire amplified by heat vs. Aang's vulnerability to extreme conditions.",
            appliesToPair: ["azula", "aang-airbending-only"],
            triggerChance: 0.7,
            canTriggerPreBattle: true,
            canTriggerInPhase: ['PreBanter', 'Poking', 'Early', 'Mid', 'Late'], // NEW
            severity: 'crippling', // NEW
            outcome: {
                type: "instant_win_attacker",
                successMessage: "The oppressive desert heat amplifies Azula's fire, overwhelming {targetName}'s evasive maneuvers!",
                failureMessage: "{targetName} endures the desert's wrath, finding a way to mitigate Azula's fierce attacks."
            }
        },
        {
            id: "si_wong_toph_disadvantage",
            description: "Toph's seismic sense is hindered by loose sand.",
            appliesToCharacter: "toph-beifong",
            triggerChance: 0.7,
            canTriggerPreBattle: true,
            canTriggerInPhase: ['PreBanter', 'Poking', 'Early', 'Mid', 'Late'], // NEW
            severity: 'soft', // NEW
            outcome: {
                type: "disadvantage_character",
                effect: "reduced_accuracy_defense_30_percent",
                successMessage: "The shifting sands of the Si Wong Desert severely hinder Toph's seismic sense, making her vulnerable!",
                failureMessage: "Toph adapts quickly to the shifting sands, managing to maintain her senses remarkably well."
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
            canTriggerInPhase: ['Early', 'Mid', 'Late'], // NEW
            severity: 'lethal', // NEW
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
            canTriggerInPhase: ['Early', 'Mid', 'Late'], // NEW
            severity: 'crippling', // NEW
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
            canTriggerInPhase: ['PreBanter', 'Poking', 'Early', 'Mid', 'Late'], // NEW
            severity: 'lethal', // NEW
            weightingLogic: ({ attacker, defender, location, situation }) => {
                let probAttacker = 0.5;
                let probDefender = 0.5;

                const adjustProbs = (char) => {
                    let prob = 0.5;
                    if (char.id === 'bumi') prob *= 0.05;
                    else if (char.id === 'sokka') prob *= 2.5;
                    else if (char.type === "Nonbender") prob *= 1.8;
                    else if (char.element === "earth") prob *= 0.6;

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
            canTriggerInPhase: ['Early', 'Mid', 'Late'], // NEW
            severity: 'crippling', // NEW
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
            canTriggerInPhase: ['Mid', 'Late'], // NEW
            severity: 'lethal', // NEW
            personalityTrigger: "honor_duty_challenged",
            activatingMoveTags: ["water", "ice", "Finisher"],
            outcome: { type: "instant_win_attacker", successMessage: "Master Pakku's {moveName} demonstrates the true power of the Northern Water Tribe, decisively defeating {opponentName}!", failureMessage: "{opponentName} surprisingly withstands Master Pakku's initial onslaught!" }
        },
        {
            id: "nwt_firebender_penalty",
            description: "Firebenders suffer reduced power and risk hypothermia.",
            appliesToCharacterElement: "fire",
            canTriggerPreBattle: true,
            canTriggerInPhase: ['PreBanter', 'Poking', 'Early', 'Mid', 'Late'], // NEW
            severity: 'soft', // NEW
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
            canTriggerInPhase: ['PreBanter', 'Poking', 'Early', 'Mid', 'Late'], // NEW
            severity: 'soft', // NEW
            outcome: { type: "disadvantage_character", effect: "reduced_accuracy_defense_20_percent", successMessage: "The murky, soft ground of the Foggy Swamp dulls Toph's seismic sense, making her vulnerable.", failureMessage: "Toph adapts quickly to the shifting sands, managing to maintain her senses remarkably well." }
        },
        {
            id: "swamp_katara_buff",
            description: "Katara draws strength from the swamp's abundant water and plant life.",
            appliesToCharacter: "katara",
            triggerChance: 0.40,
            canTriggerPreBattle: true,
            canTriggerInPhase: ['PreBanter', 'Poking', 'Early', 'Mid', 'Late'], // NEW
            severity: 'soft', // NEW
            outcome: { type: "advantage_character", effect: "power_increase_40_percent", successMessage: "Katara feels the life energy of the Foggy Swamp, her waterbending surging with newfound power!", failureMessage: "The swamp's energy is too chaotic for Katara to fully harness." }
        },
        {
            id: "swamp_ranged_accuracy_loss",
            description: "Thick fog and tangled vines reduce ranged accuracy.",
            appliesToMoveType: "ranged_attack",
            triggerChance: 0.50,
            canTriggerPreBattle: true,
            canTriggerInPhase: ['PreBanter', 'Poking', 'Early', 'Mid', 'Late'], // NEW
            severity: 'soft', // NEW
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
            canTriggerInPhase: ['PreBanter', 'Poking', 'Early', 'Mid', 'Late'], // NEW
            severity: 'soft', // NEW
            outcome: { type: "power_increase_character_50_percent", message: "{characterName} feels invigorated by the heart of the Fire Nation, their flames burning with imperial might!" }
        },
        // REMOVED: fn_capital_open_space_ranged as per plan. Rely on environmentalModifiers.
        {
            id: "fn_capital_intimidation",
            description: "Non-Fire Nation combatants feel intimidated.",
            conditionLogic: (character) => character.faction !== "FireNation",
            triggerChance: 1.0,
            canTriggerPreBattle: true,
            canTriggerInPhase: ['PreBanter', 'Poking', 'Early', 'Mid', 'Late'], // NEW
            severity: 'soft', // NEW
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
            canTriggerInPhase: ['PreBanter', 'Poking', 'Early', 'Mid', 'Late'], // NEW
            severity: 'soft', // NEW
            outcome: { type: "advantage_random_character_or_debuff_random", effect: "ambush_or_minor_damage_stun", successMessage: "{actualVictimName} stumbles into a hidden Kyoshi trap, creating an opening (or taking damage)!", failureMessage: "The fighters navigate the village carefully, avoiding any obvious traps." }
        },
        {
            id: "kyoshi_narrow_bridges_knockoff",
            description: "Risk of being knocked off narrow bridges or platforms.",
            appliesToAll: true,
            triggerChance: 0.30,
            canTriggerPreBattle: false,
            canTriggerInPhase: ['Early', 'Mid', 'Late'], // NEW
            severity: 'lethal', // NEW
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
            canTriggerInPhase: ['Early', 'Mid', 'Late'], // NEW
            severity: 'soft', // NEW
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
            canTriggerInPhase: ['PreBanter', 'Poking', 'Early', 'Mid', 'Late'], // NEW
            severity: 'soft', // NEW
            outcome: { type: "power_increase_character_40_percent", message: "The powerful updrafts of the Great Divide significantly enhance Aang's airbending!" }
        },
        {
            id: "divide_fall_risk",
            description: "High risk of falling into the chasm.",
            appliesToAll: true,
            triggerChance: 0.40,
            canTriggerPreBattle: false,
            canTriggerInPhase: ['Early', 'Mid', 'Late'], // NEW
            severity: 'lethal', // NEW
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
            canTriggerInPhase: ['PreBanter', 'Poking', 'Early', 'Mid', 'Late'], // NEW
            severity: 'soft', // NEW
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
            canTriggerInPhase: ['PreBanter', 'Poking', 'Early', 'Mid', 'Late'], // NEW
            severity: 'soft', // NEW
            outcome: { type: "advantage_character", effect: "power_increase_30_percent_defense_increase_20_percent", successMessage: "Toph feels the pulse of Ba Sing Se's earth deep within the Lower Ring, her power surging!", failureMessage: "" }
        },
        {
            id: "bs_lower_ring_crowd_interference",
            description: "Dense crowds might interfere with combat.",
            appliesToAll: true,
            triggerChance: 0.15,
            canTriggerPreBattle: true,
            canTriggerInPhase: ['PreBanter', 'Poking', 'Early', 'Mid', 'Late'], // NEW
            severity: 'soft', // NEW
            weightingLogic: ({ attacker, defender, location, situation }) => {
                return { probabilities: { [attacker.id]: 0.5, [defender.id]: 0.5 } };
            },
            outcome: { type: "disruption_random_character", effect: "minor_stun_or_misstep", successMessage: "The panicked crowd surges, momentarily disrupting {actualVictimName}'s attack!", failureMessage: "The fighters manage to weave through the throngs of people." }
        },
        {
            id: "bs_lower_ring_tylee_chiblock", // NEW CURBSTOMP RULE FOR TY LEE IN BA SING SE
            description: "Ty Lee corners and disables her opponent in the tight spaces of Ba Sing Se's Lower Ring.",
            appliesToCharacter: "ty-lee",
            triggerChance: 0.85, // High chance if condition met
            canTriggerPreBattle: false,
            canTriggerInPhase: ['Early', 'Mid', 'Late'], // NEW
            severity: 'crippling', // NEW
            conditionLogic: (tylee, opponent, battleState) => {
                const isCrampedOrDense = (battleState.location?.isCramped || false) || (battleState.location?.isDense || false);
                const isOpponentMobile = opponent.mobility > 0.6; // Less mobile opponents are easier
                return isCrampedOrDense && !isOpponentMobile;
            },
            activatingMoveName: "Chi-Blocking Flurry",
            activatingMoveTags: ["melee_range", "debuff_disable", "unblockable"],
            outcome: {
                type: "instant_paralysis_target", // Incapacitates and applies stun
                duration: 2, // Stun for 2 turns
                successMessage: "Ty Lee's acrobatic agility allows her to corner {targetName} in the tight urban labyrinth, unleashing a precise {moveName} that instantly blocks {targetName}'s chi!",
                failureMessage: "{targetName} narrowly evades Ty Lee's disabling flurry in the cramped confines, but the pressure mounts!"
            }
        }
    ],
    'eastern-air-temple': [ // NEW: EASTERN AIR TEMPLE SPECIFIC CURBSTOMP
        {
            id: "aang_eat_home_turf_domination",
            description: "Aang's mastery of airbending in his sacred home temple.",
            appliesToCharacter: "aang-airbending-only",
            triggerChance: 0.8, // High chance for Aang on his home turf
            canTriggerPreBattle: false, // Triggers during battle based on performance
            canTriggerInPhase: ['Mid', 'Late'], // NEW
            severity: 'lethal', // NEW
            conditionLogic: (aang, opponent, battleState) => {
                // Aang is doing well (high HP, low stress) and/or opponent is struggling
                const aangIsConfident = aang.hp > 80 && aang.mentalState.level === 'stable';
                const opponentIsStruggling = opponent.hp < 50 || opponent.mentalState.level === 'shaken';
                return aangIsConfident || opponentIsStruggling;
            },
            activatingMoveName: "Tornado Whirl", // Or any powerful air move
            activatingMoveTags: ["air", "area_of_effect_large", "unblockable"],
            outcome: {
                type: "instant_win_attacker_overwhelm",
                successMessage: "With the full force of the Eastern Air Temple's winds, Aang's {moveName} becomes an unstoppable storm, sweeping {targetName} into utter defeat!",
                failureMessage: "{targetName} miraculously finds a momentary foothold against Aang's powerful air currents in the hallowed temple."
            }
        }
    ]
};
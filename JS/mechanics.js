// FILE: mechanics.js
'use strict';

// ====================================================================================
//  Curbstomp Mechanics & Rules Definition (v1.0)
// ====================================================================================
//  This file centralizes all rules related to instant win/loss conditions,
//  drastic advantages, and personality-driven mechanic triggers.
//  The battle engine will refer to this file to evaluate these conditions.
// ====================================================================================

export const CURBSTOMP_RULES_VERSION = "1.0";

// --- I. Universal Mechanics ---
export const universalMechanics = {
    maiKnifeAdvantage: {
        id: "mai_knife_advantage",
        description: "Mai's uncanny precision with knives.",
        characterId: "mai", // Applies specifically if Mai is the one acting
        conditions: [
            { type: "target_technique_speed", value: "slow", triggerChance: 0.85 }, // 85% vs slow tech
            { type: "location_property", property: "cramped", modifier: 0.10 } // +10% in cramped
        ],
        maxChance: 0.85,
        counteredBy: ["fast_defensive_move", "area_denial_projectile"],
        personalityTrigger: "provoked", // This ID maps to a condition evaluable in engine
        outcome: { type: "instant_kill", successMessage: "{attackerName}'s thrown knife finds a fatal opening due to {targetName}'s slow technique!", failureMessage: "{targetName} narrowly avoids Mai's deadly accurate throw!" }
    },
    tyLeeChiBlocking: {
        id: "tylee_chi_blocking",
        description: "Ty Lee's ability to paralyze with precise strikes.",
        characterId: "ty-lee",
        conditions: [
            { type: "location_property", property: "cramped", triggerChance: 0.60 },
            // Omashu Delivery Chutes will be handled under location-specific, this is for general cramped
        ],
        maxChance: 0.85, // Universal cap, specific locations can override
        counteredBy: ["projectile_attack", "area_denial_move"],
        personalityTrigger: "serious_fight",
        outcome: { type: "instant_paralysis", duration: 2, successMessage: "Ty Lee's acrobatic assault lands perfectly, blocking {targetName}'s chi!", failureMessage: "{targetName} manages to avoid Ty Lee's disabling strikes!" }
    },
};

// --- II. Location-Specific Curb Stomps ---
export const locationCurbstompRules = {
    'si-wong-desert': [
        {
            id: "si_wong_azula_vs_katara",
            description: "Azula's fire mastery amplified by sun vs. Katara's limited water.",
            appliesToPair: ["azula", "katara"], // [attacker, target]
            triggerChance: 0.85,
            outcome: { type: "instant_win_attacker", successMessage: "In the searing Si Wong Desert, Azula's sun-amplified blue fire overwhelms Katara's dwindling water reserves!", failureMessage: "Katara, through sheer willpower and skill, endures Azula's desert inferno!" }
        },
        {
            id: "si_wong_azula_vs_aang_heat",
            description: "Azula's relentless assault causing heat exhaustion for Aang.",
            appliesToPair: ["azula", "aang-airbending-only"],
            triggerChance: 0.70, // This is an "advantage" more than an instant win, could be rephrased as "severe debuff"
            outcome: { type: "advantage_attacker", effect: "severe_heat_exhaustion_target", successMessage: "The relentless desert heat, amplified by Azula's fire, pushes Aang to the brink of exhaustion!", failureMessage: "Aang's airbending mastery allows him to create a pocket of cooler air, resisting the worst of the heat." }
        },
        {
            id: "si_wong_toph_disadvantage",
            description: "Toph's seismic sense hindered by loose sand.",
            appliesToCharacter: "toph-beifong",
            triggerChance: 0.40, // Disadvantage, not an instant loss
            outcome: { type: "disadvantage_character", effect: "reduced_accuracy_defense", successMessage: "The shifting sands of the Si Wong Desert make it difficult for Toph to maintain her usual precise earthbending control.", failureMessage: "Toph adapts, focusing on larger earth movements to compensate for the unstable ground." }
        },
        {
            id: "si_wong_sokka_heatstroke",
            description: "Sokka's vulnerability to extreme heat and dehydration.",
            appliesToCharacter: "sokka", // Sokka is the target
            triggerChance: 0.85, // Chance of "death" or incapacitation
            // This needs to be checked against *any* bender opponent if Sokka is present
            conditionLogic: (sokka, opponent) => opponent.type === "Bender", // Only applies if opponent is a bender
            escapeCondition: { type: "intelligence_roll", character: "sokka", threshold: 70, successChance: 0.10 },
            outcome: { type: "instant_loss_character", successMessage: "Overcome by the brutal desert heat and {opponentName}'s assault, Sokka collapses!", failureMessage: "Sokka's resilience (and perhaps a lucky find of shade) allows him to fight on!", escapeMessage: "Sokka's quick thinking allows him to find a temporary reprieve, narrowly escaping incapacitation!" }
        }
    ],
    'northern-water-tribe': [
        {
            id: "nwt_katara_vs_firebenders",
            description: "Katara's mastery with unlimited water vs. weakened firebenders.",
            appliesToCharacter: "katara",
            conditionLogic: (katara, opponent) => opponent.element === "fire" || opponent.element === "lightning",
            triggerChance: 0.80,
            outcome: { type: "advantage_attacker", effect: "opponent_power_reduced_50_hypothermia_10_percent_per_turn", successMessage: "In her element, Katara's waterbending overwhelms {opponentName}'s fire, the biting cold weakening their flames!", failureMessage: "{opponentName}'s fierce fire manages to keep Katara's water at bay, for now." }
        },
        {
            id: "nwt_pakku_curbstomp",
            description: "Pakku's unparalleled waterbending mastery in his home city.",
            appliesToCharacter: "pakku",
            conditionLogic: (pakku, opponent) => opponent.type !== "Bender" || opponent.element !== "water",
            triggerChance: 0.85,
            personalityTrigger: "honor_duty_challenged", // e.g., opponent insults tradition or attacks first
            outcome: { type: "instant_win_attacker", successMessage: "Master Pakku demonstrates the true power of the Northern Water Tribe, decisively defeating {opponentName}!", failureMessage: "{opponentName} surprisingly withstands Master Pakku's initial onslaught!" }
        },
        {
            id: "nwt_firebender_penalty",
            description: "Firebenders suffer reduced power and risk hypothermia.",
            appliesToCharacterElement: "fire", // Affects any character whose primary element is fire (e.g. Zuko, Azula, Ozai)
            // This will be a persistent effect/check rather than a single triggerChance
            outcome: { type: "persistent_effect", effect: "power_reduction_50_hypothermia_risk_10_percent_per_turn", message: "The frigid air of the North saps the strength from {characterName}'s fire." }
        }
    ],
    'foggy-swamp': [
        {
            id: "swamp_toph_weakness",
            description: "Toph's seismic sense is impaired by the soft, muddy ground.",
            appliesToCharacter: "toph-beifong",
            triggerChance: 0.60,
            outcome: { type: "disadvantage_character", effect: "reduced_accuracy_defense_20_percent", successMessage: "The murky, soft ground of the Foggy Swamp dulls Toph's seismic sense, making her vulnerable.", failureMessage: "Toph focuses intensely, managing to 'see' through the muck surprisingly well." }
        },
        {
            id: "swamp_katara_buff",
            description: "Katara draws strength from the swamp's abundant water and plant life.",
            appliesToCharacter: "katara",
            triggerChance: 0.40, // This is a buff chance
            outcome: { type: "advantage_character", effect: "power_increase_40_percent", successMessage: "Katara feels the life energy of the Foggy Swamp, her waterbending surging with newfound power!", failureMessage: "The swamp's energy is too chaotic for Katara to fully harness." }
        },
        {
            id: "swamp_ranged_accuracy_loss",
            description: "Thick fog and tangled vines reduce ranged accuracy.",
            appliesToMoveType: "ranged_attack", // Affects all ranged attacks
            triggerChance: 0.50, // 50% chance for any ranged attack to suffer
            outcome: { type: "accuracy_penalty_50_percent", message: "The dense fog and vegetation make precise ranged attacks difficult." }
        }
    ],
    'omashu': [ // Specifically for delivery chutes, assuming a sub-location or specific event
        {
            id: "omashu_bumi_advantage",
            description: "King Bumi's unparalleled mastery of Omashu's terrain.",
            appliesToCharacter: "bumi",
            triggerChance: 0.85,
            personalityTrigger: "disrespected",
            outcome: { type: "instant_win_attacker", successMessage: "In his city, King Bumi is an unstoppable force, overwhelming {opponentName} with colossal earthbending!", failureMessage: "{opponentName} navigates Bumi's earth-shattering attacks with surprising skill!" }
        },
        {
            id: "omashu_tylee_chiblock",
            description: "Ty Lee's chi-blocking is extremely effective in the confined chutes.",
            appliesToCharacter: "ty-lee", // Ty Lee is attacker
            // conditionLogic: (tylee, opponent) => true, // Always applies if Ty Lee is here
            triggerChance: 0.85, // Capped
            outcome: { type: "instant_paralysis_target", duration: 3, successMessage: "Within the chaotic Omashu chutes, Ty Lee's agility allows her to instantly disable {opponentName}!", failureMessage: "{opponentName} narrowly avoids Ty Lee's flurry in the confined space!" }
        },
        {
            id: "omashu_crushing_hazard",
            description: "Risk of being crushed by shifting earth or out-of-control carts.",
            appliesToAll: true, // Both characters are at risk
            triggerChance: 0.25,
            outcome: { type: "instant_loss_random_character", successMessage: "A sudden rockslide (or runaway cabbage cart!) in the Omashu chutes proves fatal for {characterName}!", failureMessage: "Both fighters narrowly avoid a catastrophic accident in the chutes!" }
        }
    ],
    'fire-nation-capital': [ // Plaza specific
        {
            id: "fn_capital_ozai_azula_buff",
            description: "Ozai or Azula's power amplified in their seat of power.",
            appliesToCharacters: ["ozai-not-comet-enhanced", "azula"],
            triggerChance: 1.0, // Always active buff
            outcome: { type: "power_increase_character_50_percent", message: "{characterName} feels invigorated by the heart of the Fire Nation, their flames burning with imperial might!" }
        },
        {
            id: "fn_capital_open_space_ranged",
            description: "Open plaza benefits ranged attacks.",
            appliesToMoveType: "ranged_attack",
            triggerChance: 1.0, // Always active buff for ranged
            outcome: { type: "effectiveness_increase_30_percent", message: "The open expanse of the plaza allows for devastatingly effective ranged assaults." }
        },
        {
            id: "fn_capital_intimidation",
            description: "Non-Fire Nation combatants feel intimidated.",
            conditionLogic: (character) => character.faction !== "FireNation", // Assuming faction property exists
            triggerChance: 1.0, // Always active debuff
            outcome: { type: "performance_decrease_character_20_percent", message: "The imposing atmosphere of the Fire Nation Capital weighs heavily on {characterName}, hindering their performance." }
        }
    ],
    'kyoshi-island': [ // Village
        {
            id: "kyoshi_environmental_traps",
            description: "Kyoshi Warriors' traps or tricky village layout.",
            appliesToAll: true,
            triggerChance: 0.20, // Low chance for an ambush/trap to work
            outcome: { type: "advantage_random_character_or_debuff_random", effect: "ambush_or_minor_damage_stun", successMessage: "{characterName} stumbles into a hidden Kyoshi trap, gaining an advantage (or taking damage)!", failureMessage: "The fighters navigate the village carefully, avoiding any obvious traps." }
        },
        {
            id: "kyoshi_narrow_bridges_knockoff",
            description: "Risk of being knocked off narrow bridges or platforms.",
            appliesToAll: true,
            triggerChance: 0.60, // Higher chance if fight occurs near edges
            conditionLogic: (character, opponent, battleState) => battleState.nearEdge === true, // Hypothetical state
            outcome: { type: "instant_loss_random_character_if_knocked_off", successMessage: "A powerful blow sends {characterName} tumbling from a narrow bridge into the waters below, out of the fight!", failureMessage: "Both fighters maintain their balance on the precarious platforms." }
        },
        {
            id: "kyoshi_sokka_strategy_escape",
            description: "Sokka's strategic mind and potential escape.",
            appliesToCharacter: "sokka",
            triggerChance: 0.10, // +10% strategy bonus (applied elsewhere), this is escape
            escapeCondition: { type: "intelligence_roll", character: "sokka", threshold: 60, successChance: 0.10 },
            outcome: { type: "escape_character", successMessage: "Sokka, using his knowledge of Kyoshi tactics (and a bit of luck), manages to create an escape route!", failureMessage: "Sokka's escape plan is thwarted!", escapeMessage: "Sokka pulls off a daring escape!" }
        }
    ],
    'great-divide': [
        {
            id: "divide_aang_air_buff",
            description: "Aang's airbending is amplified by strong canyon updrafts.",
            appliesToCharacter: "aang-airbending-only",
            triggerChance: 1.0, // Always active
            outcome: { type: "power_increase_character_40_percent", message: "The powerful updrafts of the Great Divide significantly enhance Aang's airbending!" }
        },
        {
            id: "divide_fall_risk",
            description: "High risk of falling into the chasm.",
            appliesToAll: true,
            triggerChance: 0.60, // If near edge or after strong pushback
            conditionLogic: (character, opponent, battleState) => battleState.nearEdge === true || battleState.lastMovePushbackStrong === true,
            outcome: { type: "instant_loss_character_if_fall", successMessage: "{characterName} loses their footing and plummets into the Great Divide!", failureMessage: "Both fighters narrowly avoid a fatal fall into the chasm." }
        },
        {
            id: "divide_mai_accuracy_buff",
            description: "Mai's throwing accuracy benefits from clear sightlines.",
            appliesToCharacter: "mai",
            triggerChance: 1.0, // Always active
            outcome: { type: "accuracy_increase_character_25_percent", message: "The vast, open sightlines of the Great Divide allow Mai to aim her projectiles with uncanny accuracy." }
        }
    ],
    'ba-sing-se': [ // Lower Ring specific
        {
            id: "bs_lower_ring_toph_advantage",
            description: "Toph's earthbending is amplified in the dense, earthen Lower Ring.",
            appliesToCharacter: "toph-beifong",
            triggerChance: 1.0, // Always active
            outcome: { type: "advantage_character", effect: "power_increase_30_percent_defense_increase_20_percent", successMessage: "Toph feels the pulse of Ba Sing Se's earth deep within the Lower Ring, her power surging!", failureMessage: "" } // No failure for passive buff
        },
        {
            id: "bs_lower_ring_crowd_interference",
            description: "Dense crowds might interfere with combat.",
            appliesToAll: true,
            triggerChance: 0.15,
            outcome: { type: "disruption_random_character", effect: "minor_stun_or_misstep", successMessage: "The panicked crowd surges, momentarily disrupting {characterName}'s attack!", failureMessage: "The fighters manage to weave through the throngs of people." }
        },
        {
            id: "bs_lower_ring_tylee_chiblock",
            description: "Ty Lee's chi-blocking excels in the close quarters.",
            appliesToCharacter: "ty-lee",
            triggerChance: 0.40, // Base chance increased by cramped nature
            outcome: { type: "advantage_character", effect: "chi_blocking_effectiveness_increase_40_percent", successMessage: "The tight alleys and rooftops of the Lower Ring are a perfect playground for Ty Lee's acrobatic chi-blocking!", failureMessage: "" } // No failure for passive buff
        }
    ]
};

// --- III. Character-Specific Instant Wins/Strong Advantages ---
// These usually have a personalityTrigger associated with them.
export const characterCurbstompRules = {
    'ozai-not-comet-enhanced': [
        {
            id: "ozai_fire_comet_mode", // Conceptual mode, not literal comet
            description: "Ozai unleashes an overwhelming, comet-like fire assault.",
            triggerChance: 0.85,
            personalityTrigger: "authority_challenged", // e.g., opponent lands two significant hits or openly defies him
            outcome: { type: "instant_kill_target", successMessage: "Ozai, his authority challenged, unleashes a devastating inferno, instantly incinerating {targetName}!", failureMessage: "{targetName} somehow withstands Ozai's monumental display of power!" }
        },
        {
            id: "ozai_lightning_spam",
            description: "Ozai relentlessly spams lightning attacks.",
            triggerChance: 0.70,
            personalityTrigger: "authority_challenged",
            outcome: { type: "instant_death_target", successMessage: "Ozai rains down a terrifying storm of lightning, leaving {targetName} no chance of survival!", failureMessage: "{targetName} miraculously dodges or redirects Ozai's relentless lightning barrage!" }
        }
    ],
    'bumi': [
        {
            id: "bumi_massive_earthbending_bury",
            description: "Bumi buries opponent under a mountain of earth.",
            triggerChance: 0.60,
            personalityTrigger: "underestimated", // e.g., opponent mocks his age or unconventional strategy
            outcome: { type: "instant_incapacitation_target_bury", successMessage: "With a cackle, Bumi shifts a mountain of earth, burying {targetName} completely!", failureMessage: "{targetName} narrowly escapes being crushed by Bumi's colossal earthbending!" }
        },
        {
            id: "bumi_structural_collapse",
            description: "Bumi causes a massive structural collapse (e.g., buildings in Omashu).",
            triggerChance: 0.80, // Higher if location is urban/has structures
            conditionLogic: (bumi, opponent, battleState) => battleState.locationTags.includes("urban") || battleState.locationTags.includes("dense"),
            personalityTrigger: "underestimated",
            outcome: { type: "instant_kill_target_collapse", successMessage: "King Bumi brings the very structures around them crashing down on {targetName}!", failureMessage: "{targetName} makes a daring escape as the surroundings collapse!" }
        }
    ],
    'azula': [ // Sane Azula
        {
            id: "azula_sane_lightning_precision",
            description: "Azula's perfectly aimed lightning strike.",
            triggerChance: 0.75,
            personalityTrigger: "in_control", // e.g., opponent health > 50% and Azula hasn't taken critical hits
            outcome: { type: "instant_kill_target", successMessage: "Azula's lightning strikes with chilling precision, ending {targetName}'s fight instantly!", failureMessage: "{targetName} anticipates Azula's lightning, managing a desperate dodge!" }
        },
        {
            id: "azula_sane_fire_tornado",
            description: "Azula creates a devastating blue fire tornado.",
            triggerChance: 0.55,
            personalityTrigger: "in_control",
            outcome: { type: "instant_incapacitation_target_burn", successMessage: "Azula conjures a terrifying blue fire tornado, engulfing and incinerating {targetName}!", failureMessage: "{targetName} finds a way to disrupt or escape Azula's fiery vortex!" }
        }
    ],
    'azula_insane': [ // Specific rules if Azula is in "insane" state
        {
            id: "azula_insane_unpredictable_attacks",
            description: "Azula's attacks become wild and unpredictable due to mental instability.",
            triggerChance: 0.60, // Chance of instant kill
            selfSabotageChance: 0.40, // Chance it backfires or hinders her
            personalityTrigger: "desperate_broken", // e.g., health < 30% or mental state is broken
            outcome: {
                type: "conditional_instant_kill_or_self_sabotage",
                successMessage: "Azula's crazed, unpredictable assault overwhelms {targetName}!",
                failureMessage: "{targetName} capitalizes on a wild, unfocused attack from Azula!", // If self-sabotage roll fails but kill roll also fails
                selfSabotageMessage: "In her madness, Azula's attack goes awry, hindering herself!"
            }
        },
        {
            id: "azula_insane_blue_fire_buff",
            description: "Her blue fire burns hotter and more erratically in her unstable state.",
            triggerChance: 1.0, // Passive buff when insane
            personalityTrigger: "desperate_broken",
            outcome: { type: "damage_increase_character_25_percent", message: "Azula's blue fire rages with terrifying, unstable intensity!" }
        }
    ],
    'toph-beifong': [
        {
            id: "toph_seismic_sense_accuracy",
            description: "Toph's seismic sense grants near-perfect accuracy.",
            triggerChance: 0.85, // This is more of a passive accuracy buff than an instant win
            outcome: { type: "accuracy_increase_character_85_percent", message: "Toph's seismic sense allows her to 'see' {targetName}'s every move with pinpoint accuracy." }
        },
        {
            id: "toph_metal_bending_vs_armor",
            description: "Toph's metalbending instantly crushes or bypasses metal armor.",
            triggerChance: 0.85,
            conditionLogic: (toph, opponent) => opponent.hasMetalArmor === true, // Hypothetical property
            personalityTrigger: "doubted", // e.g., opponent taunts her or lands a 'blind' hit
            outcome: { type: "instant_win_attacker_vs_armor", successMessage: "Toph's metalbending twists and crushes {targetName}'s armor, leaving them defenseless!", failureMessage: "{targetName}'s armor holds, or they shed it just in time!" }
        }
    ],
    'katara': [
        {
            id: "katara_bloodbending",
            description: "Katara resorts to bloodbending under extreme duress (full moon).",
            triggerChance: 0.85,
            conditionLogic: (katara, opponent, battleState) => battleState.isFullMoon === true, // Assumes battleState has this
            personalityTrigger: "desperate_mentally_broken", // e.g., health < 10%, ally incapacitated, or taken two critical hits
            outcome: { type: "instant_win_attacker_control", successMessage: "Under the light of the full moon and pushed to her absolute limit, Katara seizes control of {targetName} with bloodbending, ending the fight instantly!", failureMessage: "{targetName}'s willpower (or Katara's hesitation) prevents the bloodbending from taking full effect!" }
        },
        {
            id: "katara_ice_prison_kill",
            description: "Katara encases opponent in a fatal ice prison.",
            triggerChance: 0.70,
            personalityTrigger: "desperate_mentally_broken",
            outcome: { type: "instant_kill_target_ice", successMessage: "Katara summons massive ice shards, encasing and fatally wounding {targetName}!", failureMessage: "{targetName} shatters the forming ice prison just in time!" }
        }
    ],
    'aang-airbending-only': [
        {
            id: "aang_avatar_state_air", // Air-only version of Avatar State
            description: "Aang taps into the Avatar State, unleashing immense air power.",
            triggerChance: 0.85,
            personalityTrigger: "mortal_danger", // e.g., ally health < 5% or self health < 20%
            outcome: { type: "instant_win_attacker_overwhelm", successMessage: "Aang's eyes glow as he enters the Avatar State, unleashing a cataclysmic storm of air that overwhelms {targetName}!", failureMessage: "Aang struggles to fully control the Avatar State's power, giving {targetName} a fleeting chance!" }
        },
        {
            id: "aang_air_scooter_evasion",
            description: "Aang's masterful use of the air scooter for evasion.",
            triggerChance: 0.60, // High evasion chance
            outcome: { type: "evasion_chance_increase_60_percent", message: "Aang zips around on his air scooter, becoming an incredibly difficult target." }
        }
    ],
    'zuko': [
        {
            id: "zuko_scar_intimidation",
            description: "Zuko's scar and intensity can intimidate opponents.",
            triggerChance: 1.0, // Passive buff
            outcome: { type: "attack_power_increase_character_15_percent", message: "Zuko's fierce determination and visible scar lend an intimidating edge to his attacks." }
        },
        {
            id: "zuko_dual_dao_kill",
            description: "Zuko's mastery with his dual dao swords combined with firebending.",
            triggerChance: 0.80,
            personalityTrigger: "honor_violated", // e.g., opponent cheats or disarms an ally
            outcome: { type: "instant_kill_target", successMessage: "Zuko's fiery dual dao swords dance with deadly precision, delivering a fatal blow to {targetName}!", failureMessage: "{targetName} narrowly parries Zuko's lightning-fast sword assault!" }
        }
    ],
    'sokka': [
        {
            id: "sokka_strategy_exploit",
            description: "Sokka devises a clever environmental exploit or trap.",
            triggerChance: 0.30,
            personalityTrigger: "meticulous_planning", // e.g., opponent overcommits or terrain favors traps
            escapeCondition: { type: "intelligence_roll", character: "sokka", threshold: 65, successChance: 0.10 }, // For himself to escape bad situations
            outcome: { type: "advantage_attacker_environmental", successMessage: "Sokka's brilliant strategy turns the environment against {targetName}, creating a key advantage!", failureMessage: "Sokka's plan doesn't quite come together this time." }
        },
        {
            id: "sokka_vulnerability_death",
            description: "Sokka's inherent vulnerability as a non-bender.",
            triggerChance: 0.85,
            conditionLogic: (sokka, opponent) => opponent.type === "Bender",
            outcome: { type: "instant_death_character", successMessage: "Outmatched by {opponentName}'s bending, Sokka falls in battle despite his bravery.", failureMessage: "Sokka's agility and a bit of luck keep him out of lethal harm's way!" }
        }
    ],
    'jeong-jeong': [ // Renamed from Jong Jong
        {
            id: "jeongjeong_fire_whips_disable",
            description: "Jeong Jeong uses precise fire whips to disable an opponent.",
            triggerChance: 0.45,
            personalityTrigger: "confident_stance", // e.g., after landing an early hit or with ally support
            outcome: { type: "incapacitation_target_disable_limbs", successMessage: "Jeong Jeong's fire whips lash out with pinpoint accuracy, ensnaring and disabling {targetName}'s limbs!", failureMessage: "{targetName} narrowly evades Jeong Jeong's ensnaring fire whips!" }
        },
        {
            id: "jeongjeong_desert_advantage",
            description: "Jeong Jeong's fire control excels in dry, open desert environments.",
            triggerChance: 1.0, // Passive
            conditionLogic: (jj, o, bs) => bs.locationId === 'si-wong-desert',
            outcome: { type: "power_increase_character_35_percent", message: "In the desolate expanse of the Si Wong Desert, Jeong Jeong's mastery over fire is amplified." }
        }
    ],
    'pakku': [
        {
            id: "pakku_water_mastery_curbstomp",
            description: "Pakku's overwhelming waterbending mastery.",
            triggerChance: 0.85,
            personalityTrigger: "skill_challenged", // e.g., opponent insults his skill or attacks him first directly
            outcome: { type: "instant_win_attacker_overwhelm", successMessage: "Master Pakku unleashes the full, overwhelming force of his waterbending, leaving {targetName} utterly defeated!", failureMessage: "{targetName} manages to weather the initial storm of Pakku's masterful assault!" }
        },
        {
            id: "pakku_ice_daggers_kill",
            description: "Pakku forms and launches lethal ice daggers.",
            triggerChance: 0.60,
            personalityTrigger: "skill_challenged",
            outcome: { type: "instant_kill_target_ice", successMessage: "With chilling precision, Pakku forms and launches a volley of deadly ice daggers, fatally striking {targetName}!", failureMessage: "{targetName} deflects or dodges Pakku's lethal ice projectiles!" }
        }
    ]
};

// --- IV. Personality Trigger Definitions (Conceptual Mappings) ---
// The actual evaluation of these happens in the battle engine based on game state.
// This section is more for documentation and consistency.
export const personalityTriggerMappings = {
    // Mai
    "provoked": "Opponent lands a critical hit, taunts Mai, or targets Ty Lee/Zuko (if allied).",
    // Ty Lee
    "serious_fight": "An ally's health drops below 30%, or opponent uses an overtly lethal move.",
    // Ozai
    "authority_challenged": "Opponent lands two significant (Strong/Critical) hits on Ozai, or uses a taunt/defiant dialogue line.",
    // Bumi
    "underestimated": "Opponent uses a taunt related to Bumi's age or unconventional tactics, or uses a 'Weak' effectiveness move against him.",
    // Azula (Sane)
    "in_control": "Azula's health > 50% AND Azula has not received a 'Critical' hit this battle AND opponent's mental state is 'stable' or 'stressed'.",
    // Azula (Insane)
    "desperate_broken": "Azula's health < 30% OR Azula's mental state is 'broken'.",
    // Toph
    "doubted": "Opponent uses a taunt targeting Toph's blindness or skill, or lands a hit that Toph 'didn't see coming' (e.g., from extreme air or unexpected angle).",
    // Katara
    "desperate_mentally_broken": "Katara's health < 10% OR an ally is incapacitated (if applicable) OR Katara has received two 'Critical' hits.",
    // Aang
    "mortal_danger": "An ally's health < 5% (if applicable) OR Aang's own health < 20%.",
    // Zuko
    "honor_violated": "Opponent uses a move flagged as 'dishonorable' (e.g., attacking a downed foe, a cheap shot - needs moveTagging) OR an ally is disarmed/incapacitated unfairly.",
    // Sokka
    "meticulous_planning": "Opponent overcommits with a high-power/high-risk move and misses OR battle terrain strongly favors traps (e.g., Kyoshi Island, dense parts of Ba Sing Se).",
    // Jeong Jeong
    "confident_stance": "Jeong Jeong has successfully landed a 'Strong' or 'Critical' hit in the last turn OR an ally has successfully buffed/protected him.",
    // Pakku
    "skill_challenged": "Opponent uses a taunt about Pakku's traditional style or skill OR opponent initiates combat with a direct, aggressive offensive move.",

    // Location Triggers (for personality interactions with locations)
    "disrespected": "Generic trigger for characters like Bumi if an opponent mocks their connection to the location or their methods there.",
};

// --- V. Stacking Rules & Precedence (Conceptual) ---
// 1. Highest probability mechanic applies by default.
// 2. Specific character rules can override general location rules if more impactful (e.g., Azula's insane state rules would override generic Fire Nation Capital buffs for her).
// 3. Universal mechanics (Mai's Knives, Ty Lee's Chi Blocking) apply on top of character/location, but their *maxChance* is a hard cap unless a specific rule explicitly states it bypasses this.
// 4. Escape conditions (like Sokka's intelligence roll) are checked *after* the primary curbstomp trigger chance is met.

// --- VI. AI Integration Logging Example (Conceptual) ---
// Log Entry: "Curbstomp Triggered: azula_sane_lightning_precision (Azula, 75%) due to personality_trigger:in_control. Target: Sokka. Outcome: instant_kill_target. Sokka has no counter."
// Log Entry: "Curbstomp Check: si_wong_sokka_heatstroke (Sokka, 85%). Trigger Met. Escape Check: intelligence_roll (Sokka, 65) vs threshold 70. Roll: 45. Escape Failed. Outcome: instant_loss_character."
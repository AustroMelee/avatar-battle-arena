// FILE: data_mechanics_characters.js
'use strict';

// Refined Curb Stomp Mechanics (v2) for Direct Engine Integration

export const characterCurbstompRules = {
    // --- GLOBAL MECHANICS ---
    'mai': [
        {
            id: "mai_precision_knives",
            description: "Mai punishes slow, telegraphed moves with a volley of precisely aimed knives.",
            triggerChance: 0.85,
            canTriggerPreBattle: false,
            severity: 'lethal',
            conditionLogic: (mai, opponent, battleState) => {
                const telegraphedMoveTags = ["lightning_charge", "boulder_hurl", "water_construct"];
                return opponent.lastMove && telegraphedMoveTags.some(tag => opponent.lastMove.moveTags.includes(tag));
            },
            outcome: { 
                type: "instant_win", 
                successMessage: "As {targetName} prepares a powerful but slow attack, Mai exploits the opening, ending the fight with a volley of perfectly aimed knives.",
            }
        }
    ],
    'ty-lee': [
        {
            id: "tylee_chi_block_strike",
            description: "Ty Lee closes the distance with incredible speed, disabling a bender with precise chi-blocking strikes.",
            triggerChance: 0.60,
            canTriggerPreBattle: false,
            severity: 'lethal', // Represents a fight-ending outcome
            conditionLogic: (tylee, opponent, battleState) => {
                return opponent.lastMove?.type === 'Bender' && battleState.distance <= 'close';
            },
            outcome: { 
                type: "instant_win", // Effectively a win against a bender
                successMessage: "In a flash, Ty Lee closes the distance, and a series of precise strikes leaves {targetName}'s bending completely neutralized.",
            }
        }
    ],
    // --- CHARACTER-SPECIFIC INSTANT WINS ---
    'ozai': [
        {
            id: "ozai_comet_mode",
            description: "Fueled by Sozin's Comet, Ozai's power becomes absolute, incinerating any non-firebender who stands against him.",
            triggerChance: 0.90,
            canTriggerPreBattle: true,
            severity: 'lethal',
            conditionLogic: (ozai, opponent, battleState) => {
                return battleState.isSozinsComet && opponent.element !== 'fire';
            },
            outcome: { 
                type: "instant_win", 
                successMessage: "Under the power of Sozin's Comet, Ozai's fire is absolute. {targetName} is overwhelmed and incinerated in an instant.",
            }
        },
        {
            id: "ozai_lightning_barrage",
            description: "Ozai unleashes a terrifying and overwhelming barrage of lightning.",
            triggerChance: 0.70,
            canTriggerPreBattle: false,
            severity: 'lethal',
            conditionLogic: (ozai, opponent, battleState) => {
                // This will be countered by a specific "lightning_redirection" trait/check in the engine
                return !opponent.specialTraits?.canRedirectLightning;
            },
            outcome: { 
                type: "instant_win", 
                successMessage: "Ozai rains down a storm of lightning, giving {targetName} no chance to escape the lethal barrage.",
            }
        }
    ],
    'bumi': [
        {
            id: "bumi_mass_bury",
            description: "In an earth-rich environment, Bumi shifts the very landscape to bury his opponent.",
            triggerChance: 0.60,
            canTriggerPreBattle: false,
            severity: 'lethal',
            conditionLogic: (bumi, opponent, battleState) => {
                return ['omashu', 'ba-sing-se', 'great-divide'].includes(battleState.locationId);
            },
            outcome: { 
                type: "instant_win", 
                successMessage: "With a cackle, King Bumi reshapes the battlefield, burying {targetName} under a mountain of earth.",
            }
        },
        {
            id: "bumi_structural_collapse",
            description: "Bumi turns an urban environment into a weapon, bringing buildings down on his foe.",
            triggerChance: 0.80,
            canTriggerPreBattle: false,
            severity: 'lethal',
            conditionLogic: (bumi, opponent, battleState) => {
                return ['omashu', 'ba-sing-se-lower-ring'].includes(battleState.locationId);
            },
            outcome: { 
                type: "instant_win", 
                successMessage: "The city itself becomes Bumi's weapon. He brings a nearby structure crashing down on {targetName}, ending the fight decisively.",
            }
        }
    ],
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
    'toph': [
        {
            id: "toph_seismic_prediction",
            description: "Toph's seismic sense allows her to predict and counter attacks before they happen.",
            triggerChance: 0.85,
            canTriggerPreBattle: true,
            severity: 'buff',
            outcome: { 
                type: "evasion_increase_character", 
                value: 0.85, // Represents an 85% counter/evade rate
                message: "Toph reads the earth, anticipating {targetName}'s every move with unnerving accuracy."
            }
        },
        {
            id: "toph_metalbending_armor_crush",
            description: "Toph's metalbending makes short work of any opponent relying on metal armor or weapons.",
            triggerChance: 1.0, // It's an auto-win, not a chance
            canTriggerPreBattle: false,
            severity: 'lethal',
            conditionLogic: (toph, opponent, battleState) => {
                return opponent.specialTraits?.hasMetalArmor || opponent.specialTraits?.hasMetalWeapon;
            },
            outcome: { 
                type: "instant_win", 
                successMessage: "With a flick of her wrist, Toph seizes control of {targetName}'s armor and weapon, twisting the metal and leaving them utterly defenseless.",
            }
        }
    ],
    'katara': [
        {
            id: "katara_bloodbending",
            description: "Under the full moon, a sufficiently pushed Katara can resort to bloodbending, an unstoppable technique.",
            triggerChance: 1.0,
            canTriggerPreBattle: false,
            severity: 'lethal',
            conditionLogic: (katara, opponent, battleState) => {
                const isMentallyBroken = katara.mentalState.level === 'broken' || katara.mentalState.level === 'stressed';
                return battleState.isFullMoon && isMentallyBroken && opponent.id !== 'aang';
            },
            outcome: { 
                type: "instant_win", 
                successMessage: "The full moon empowers Katara. Pushed to her absolute limit, she reaches for a dark power, seizing control of {targetName}'s body and ending the fight instantly.",
            }
        },
        {
            id: "katara_ice_capture",
            description: "In a cold environment, Katara can generate enough ice to fatally encase an opponent.",
            triggerChance: 0.70,
            canTriggerPreBattle: false,
            severity: 'lethal',
            conditionLogic: (katara, opponent, battleState) => {
                return ['northern-water-tribe', 'eastern-air-temple'].includes(battleState.locationId);
            },
            outcome: { 
                type: "instant_win", 
                successMessage: "Using the ambient cold, Katara summons a massive prison of ice, fatally trapping {targetName}.",
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
    ],
    'zuko': [
        {
            id: "zuko_intimidation",
            description: "Zuko's fierce presence and scar can be intimidating to his opponents.",
            triggerChance: 1.0,
            canTriggerPreBattle: true,
            severity: 'buff',
            conditionLogic: (zuko, opponent, battleState) => {
                return opponent.faction !== 'Fire Nation';
            },
            outcome: { 
                type: "morale_penalty_opponent", 
                value: 0.15, // Represents a 15% penalty to opponent's 'resolve' or 'effectiveness'
                message: "Zuko's fierce determination and visible scar are unsettling, putting {targetName} on the back foot."
            }
        },
        {
            id: "zuko_dual_dao_execution",
            description: "If Zuko disarms his opponent, he can end the fight with his dual dao swords.",
            triggerChance: 0.80,
            canTriggerPreBattle: false,
            severity: 'lethal',
            conditionLogic: (zuko, opponent, battleState) => {
                return opponent.specialTraits?.isDisarmed;
            },
            outcome: { 
                type: "instant_win", 
                successMessage: "His opponent disarmed, Zuko presses the advantage with his dual dao, ending the fight with a swift and deadly strike.",
            }
        }
    ],
    'sokka': [
        {
            id: "sokka_environmental_exploit",
            description: "Sokka's quick thinking allows him to use the environment to his advantage.",
            triggerChance: 0.30,
            canTriggerPreBattle: false,
            severity: 'reversal',
            outcome: { 
                type: "advantage_attacker_environmental",
                successMessage: "Thinking on his feet, Sokka uses the terrain in an unexpected way, turning the tables on {targetName} and creating a massive opening!",
            }
        },
        {
            id: "sokka_vulnerability",
            description: "As a non-bender, Sokka is extremely vulnerable to a direct bending assault.",
            triggerChance: 0.90,
            canTriggerPreBattle: false,
            severity: 'lethal',
            conditionLogic: (sokka, opponent, battleState) => {
                return opponent.lastMove?.isBending && opponent.lastMove?.effectiveness > 'Weak';
            },
            outcome: { 
                type: "instant_loss", 
                successMessage: "Caught by a direct bending attack from {targetName}, Sokka has no defense. The fight is over.",
            }
        }
    ],
    'jeong-jeong': [
        {
            id: "jeongjeong_fire_whips",
            description: "Jeong Jeong creates precise whips of fire to disable his opponents.",
            triggerChance: 0.45,
            canTriggerPreBattle: false,
            severity: 'crippling',
            outcome: { 
                type: "instant_incapacitation", 
                successMessage: "Jeong Jeong's masterful fire whips lash out, severely burning and disabling {targetName}.",
            }
        },
    ],
    'pakku': [
        {
            id: "pakku_ice_daggers",
            description: "Pakku launches a volley of deadly ice daggers at his opponent.",
            triggerChance: 0.60,
            canTriggerPreBattle: false,
            severity: 'lethal',
            outcome: { 
                type: "instant_win", 
                successMessage: "With a flick of his wrists, Pakku sends a volley of razor-sharp ice daggers at {targetName}, leaving no room for escape.",
            }
        }
    ]
};
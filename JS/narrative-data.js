'use strict';

// ** THE DEFINITIVE, PRONOUN-AWARE VERSION **
// The templates now explicitly request the verb form and use pronouns for natural language.

export const battleBeats = {
    opening: [
        "{initiatorName} opened the fight by {initiator_verb_ing} {initiator_object}, forcing {responderName} to immediately {responder_verb_base} in response.",
        "The battle began as {initiatorName} {initiator_verb_past} {initiator_object}, putting {responderName} on the defensive. {responderPronounS} could only {responder_verb_base} to hold {initiatorPronounO} back.",
        "Without hesitation, {initiatorName} went on the offensive, {initiator_verb_ing} {initiator_object}. {responderName} quickly countered by {responder_verb_ing}."
    ],
    advantage_attack: [
        "Sensing an opportunity, {initiatorName} pressed the advantage. {initiatorPronounS} {initiator_verb_past} {initiator_object}, leaving {responderName} scrambling.",
        "Dominating the flow, {initiatorName} relentlessly {initiator_verb_past} {initiator_object}. {responderName} was forced to use {responderPronounP} full power just to defend.",
        "With momentum on {initiatorPronounP} side, {initiatorName} {initiator_verb_past} {initiator_object}. A desperate {responderName} could only respond by {responder_verb_ing}."
    ],
    disadvantage_attack: [
        "Fighting from a disadvantage, {initiatorName} tried to {initiator_verb_base} {initiator_object}, but {responderName} easily countered, {responder_verb_ing} to shut {initiatorPronounO} down.",
        "Trying to turn the tide, {initiatorName} gambled and {initiator_verb_past} {initiator_object}. The attempt was deftly handled by {responderName}."
    ],
    terrain_interaction: [
        "Using the {locationFeature} to {initiatorPronounP} advantage, {initiatorName} {initiator_verb_past} {initiator_object}, forcing {responderName} onto the treacherous {locationTerrain}.",
        "The {locationTerrain} became a weapon for {initiatorName}. {initiatorPronounS} {initiator_verb_past} {initiator_object}, and {responderName} had to adapt quickly."
    ],
    finishing_move: [
        // This is now a dynamic template. The key placeholder is {winnerFinisherDescription}.
        "The decisive moment arrived. {winnerName} saw an opening and {winnerFinisherDescription}",
        "It all came down to one final moment. Seizing the opportunity, {winnerName} {winnerFinisherDescription}",
        "The battle reached its climax. With a final, powerful move, {winnerName} {winnerFinisherDescription}"
    ]
};
Use code with caution.
JavaScript
--- END OF FILE narrative-data.js ---
--- START OF FILE mechanics.js ---
'use strict';

export const combatStyleAdvantages = [
    { winnerRole: "defensive_zoner", loserRole: "dominant_offense", advantage: 5, reason: "{AttackerName}'s defensive zoning contained {DefenderName}'s raw aggression" },
    { winnerRole: "mentor_strategist", loserRole: "brawler_redemption", advantage: 7, reason: "{AttackerName}'s strategic wisdom guided {DefenderName}'s fiery impulsiveness" },
    { winnerRole: "disabler", loserType: "Bender", advantage: 15, reason: "{AttackerName}'s chi-blocking prowess rendered {DefenderName}'s bending useless" }
];

export const adjectiveToNounMap = {
    "pacifistic": "pacifism", "agile": "agility", "inventive": "inventiveness", "adaptable": "adaptability",
    "resourceful": "resourcefulness", "clever": "cleverness", "determined": "determination", "resilient": "resilience",
    "stubborn_resolve": "stubborn resolve", "immovable": "immovability", "disciplined_combatant": "disciplined combat",
    "formidable": "formidability", "precise": "precision", "eccentric": "eccentricity", "powerful": "power",
    "unpredictable": "unpredictability", "wise": "wisdom", "calm": "calmness", "ruthless": "ruthlessness",
    "arrogant": "arrogance", "intimidating": "intimidation", "compassionate": "compassion",
    "unwavering_determination": "unwavering determination", "exceptional_swordsman": "exceptional swordsmanship",
    "controlled_fury": "controlled fury", "firebending_prodigy": "firebending prowess",
    "master_tactician": "masterful tactics", "highly_manipulative": "manipulative skill",
    "exceptional_firebending_prowess": "exceptional firebending prowess", "indomitable_will": "indomitable will",
    "raw_power": "raw power", "fear-inducing_presence": "fear-inducing presence", "relentless": "relentlessness",
    "mad_genius_tactics": "mad genius tactics", "brilliant_strategist": "brilliant strategy",
    "ancient_wisdom": "ancient wisdom", "terrain_control": "terrain control",
    "exceptional_agility": "exceptional agility", "disables_benders": "chi-blocking prowess",
    "precise_strikes": "precise strikes", "unpredictable_movements": "unpredictable movements",
    "speed": "speed", "deadly_accuracy": "deadly accuracy", "high_precision": "high precision",
    "unflappable_demeanor": "unflappable demeanor", "ranged_dominance": "ranged dominance",
    "silent_approach": "silent approach", "masterful_strategist": "masterful strategy",
    "profound_wisdom": "profound wisdom", "lightning_redirection": "lightning redirection",
    "hidden_power": "hidden power", "exceptional_self-control": "exceptional self-control",
    "defensive_master": "defensive mastery", "evasive": "evasiveness", "pacifistic_tendencies": "pacifistic tendencies", 
    "prodigious_bending_talent": "prodigious bending talent", "exceptional_healing": "exceptional healing",
    "fierce_determination": "fierce determination", "unconventional_fighting_style": "unconventional fighting style",
    "seismic_perception": "seismic perception",
    "vulnerable_to_direct_bending_attacks": "vulnerability to direct bending attacks",
    "reliance_on_equipment": "reliance on equipment", "limited_close_combat": "limited close combat",
    "can_be_overwhelmed": "susceptibility to being overwhelmed", "physically_average": "average physical condition",
    "aversion_to_lethal_force": "aversion to lethal force", "direct_confrontation": "struggle in direct confrontation",
    "vulnerable_to_ground_traps": "vulnerability to ground traps", "less_offensive_power": "limited offensive power",
    "emotional_volatility": "emotional volatility", "vulnerable_to_fire": "vulnerability to fire",
    "reliance_on_water_source": "reliance on water source", "deep-seated_mental_instability": "deep-seated mental instability",
    "lack_of_compassion": "lack of compassion", "can_be_overconfident": "overconfidence",
    "over-reliance_on_offensive_power": "over-reliance on offensive power", "extreme_arrogance": "extreme arrogance",
    "underestimates_opponents": "underestimation of opponents", "lack_of_adaptability": "lack of adaptability",
    "poor_defensive_strategy": "poor defensive strategy", "underestimated": "being underestimated",
    "vulnerable_when_not_on_earth": "vulnerability when not on earth", "can_be_distracted": "susceptibility to distraction",
    "slow": "slowness", "vulnerable_if_immobilized": "vulnerability if immobilized", "fragile": "fragility",
    "direct_physical_confrontation": "struggle in direct physical confrontation", "crowd_control": "vulnerability to crowd control",
    "limited_to_ranged_attacks": "limitation to ranged attacks", "vulnerable_in_close_proximity": "vulnerability in close proximity",
    "emotionally_reserved": "emotional reservedness", "lack_of_close_combat_skills": "lack of close combat skills",
    "reluctance_to_engage_in_direct_combat": "reluctance to engage in direct combat",
    "underestimated_by_adversaries": "being underestimated by adversaries", "prefers_philosophy_to_fighting": "preference for philosophy over fighting",
    "can_be_paternalistic": "paternalistic tendencies", "rigid_adherence_to_tradition": "rigid adherence to tradition",
    "initial_arrogance": "initial arrogance", "limited_adaptability": "limited adaptability",
    "less_effective_in_open_terrain": "less effectiveness in open terrain", "reluctance_to_fight": "reluctance to fight",
    "pessimistic_outlook": "pessimistic outlook", "cannot_generate_lightning": "inability to generate lightning",
    "vulnerable_to_direct_assault": "vulnerability to direct assault", "emotional_instability": "emotional instability",
    "impulsiveness": "impulsiveness", "can_be_hot-headed": "hot-headedness",
    // Terrain tags
    "air_rich": "abundant air currents", "vertical": "vertical terrain", "exposed": "open exposure",
    "water_rich": "abundant water", "ice_rich": "icy conditions", "slippery": "slippery footing",
    "cold": "cold environment", "urban": "urban environment", "dense": "dense environment",
    "earth_rich": "abundant earth", "cover_rich": "ample cover", "cramped": "cramped spaces",
    "sandy": "sandy terrain", "hot": "intense heat", "shifting_ground": "shifting ground",
    "plants_rich": "abundant plant life", "low_visibility": "low visibility",
    "industrial": "industrial setting", "metal_rich": "abundant metal",
    "precarious": "precarious footing", "rocky": "rocky terrain"
};
Use code with caution.
JavaScript
--- END OF FILE mechanics.js ---
--- START OF FILE narrative.js ---
'use strict';

export const victoryTypes = {
    'overwhelm': {
        narrativeEndings: {
            // These can be specific overrides for a victory type
        }
    },
    'disabling_strike': { 
        narrativeEndings: {
            "ty-lee": "With a final, graceful flip, <span class='char-ty-lee'>Ty Lee</span> landed a precise jab, leaving <span class='char-{LoserID}'>{LoserName}</span> completely unable to bend. \"{WinnerQuote}\"",
        }
    },
    'outsmart': { 
        narrativeEndings: {
            "sokka": "<span class='char-sokka'>Sokka</span> wiped his brow, a triumphant grin spreading across his face as his trap sprung perfectly. 'See? Brains beat brawn... eventually!' he declared, retrieving his boomerang. \"{WinnerQuote}\"",
        }
    },
    'terrain_kill': { 
        narrativeEndings: {
            "toph-beifong": "<span class='char-toph-beifong'>Toph</span> scoffed, stomping a foot. The earth itself cemented her victory, leaving <span class='char-{LoserID}'>{LoserName}</span> immobilized. 'That's what you get for not paying attention to the ground, Twinkletoes,' she muttered. \"{WinnerQuote}\"",
        }
    },
    'morale_break': { 
        narrativeEndings: {
            "iroh": "<span class='char-iroh'>Iroh</span> approached his defeated foe, offering a comforting hand. 'There is always hope for redirection,' he said kindly, as <span class='char-{LoserID}'>{LoserName}</span>, outmatched in spirit, yielded. \"{WinnerQuote}\"",
        }
    }
};

// Generic endings based on the winner's "Victory Style" defined in characters.js
export const postBattleVictoryPhrases = {
    "Pacifist": [
        "Aang quietly offered a helping hand, {WinnerPronounP} victory a testament to peace. \"{WinnerQuote}\"",
        "The Avatar sighed in relief, the fight ending without true harm. \"{WinnerQuote}\"",
    ],
    "Madcap": [
        "{WinnerName} retrieved {WinnerPronounP} boomerang with a flourish, {WinnerPronounP} victory a mix of genius and goofiness. \"{WinnerQuote}\"",
        "{WinnerName} let out a hearty laugh, already planning {WinnerPronounP} next eccentric stunt. \"{WinnerQuote}\"",
    ],
    "Playful": [
        "{WinnerName} giggled, skipping away from {WinnerPronounP} bewildered opponent. \"{WinnerQuote}\"",
        "With a cheerful 'Ta-da!', {WinnerName} celebrated a victory that felt more like a game. \"{WinnerQuote}\""
    ],
    "Disciplined": [
        "{WinnerName} nodded stiffly, {WinnerPronounP} victory a clear affirmation of tradition and mastery. \"{WinnerQuote}\"",
    ],
    "Fierce": [
        "{WinnerName} stood firm, {WinnerPronounP} bending prowess undeniable. \"{WinnerQuote}\"",
        "{WinnerName} radiated quiet power, {WinnerPronounP} fierce determination evident in {WinnerPronounP} victory. \"{WinnerQuote}\""
    ],
    "Cocky": [
        "{WinnerName} brushed dirt from {WinnerPronounP} clothes with a smirk, {WinnerPronounP} victory a foregone conclusion. \"{WinnerQuote}\"",
    ],
    "Determined": [
        "{WinnerName} stood breathing heavily, {WinnerPronounP} victory a testament to {WinnerPronounP} hard-won resolve. \"{WinnerQuote}\"",
        "{WinnerName} clenched {WinnerPronounP} fist, the battle an affirmation of {WinnerPronounP} chosen path. \"{WinnerQuote}\""
    ],
    "Ruthless": [
        "{WinnerName}'s blue flames flickered, leaving no doubt about {WinnerPronounP} cold, efficient triumph over {LoserName}. \"{WinnerQuote}\"",
    ],
    "Supreme": [
        "{WinnerName} stood radiating immense power, {WinnerPronounP} victory a declaration of {WinnerPronounP} absolute dominion. \"{WinnerQuote}\"",
    ],
    "Wise": [
        "{WinnerName} offered a gentle smile, {WinnerPronounP} victory a quiet lesson in subtlety and wisdom. \"{WinnerQuote}\"",
    ],
    "Wise_Reluctant": [
        "{WinnerName} sighed, {WinnerPronounP} victory a somber affirmation of control over destruction. \"{WinnerQuote}\"",
    ],
    "Deadpan": [
        "{WinnerName} merely blinked, {WinnerPronounP} victory as precise and unemotional as {WinnerPronounP} throws. \"{WinnerQuote}\"",
    ],
    "default": [
        "{WinnerName} stood victorious over {LoserName}, the battle concluded. \"{WinnerQuote}\""
    ]
};
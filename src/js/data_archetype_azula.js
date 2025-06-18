// FILE: js/data_archetype_azula.js
"use strict";

// Archetype data for Azula vs. all other characters and locations.
export const azulaArchetypeData = {
    //=======================
    // Azula (azula)
    //=======================

    // --- Azula vs Aang (aang-airbending-only) ---
    "aang-airbending-only": {
        "fire-nation-capital": {
            label: "Royal Rumble: Princess's Perfection vs. Avatar's Air",
            introA: "Azula, the favored princess, aims to definitively crush the Avatar in the Fire Nation capital, showcasing her absolute superiority.",
            introB: "Aang confronts Azula in her own seat of power, his airbending a desperate whirlwind against her flawless, deadly fire."
        },
        "_DEFAULT_LOCATION_": {
            label: "Lightning and Wind: A Fateful Duel",
            introA: "Azula's blue fire burns with cold precision, a prodigy eager to prove her absolute superiority against the Avatar.",
            introB: "Aang, embodying the evasive spirit of air, seeks to avoid Azula's deadly assault and find a path to peace."
        }
    },
    // NEW: Add new battleStart property for PreBanter and Poking, and phaseTransition property
    narrative: {
        battleStart: {
            PreBanter: [ // NEW: For the very first narrative-only turn (Turn 0)
                { type: "spoken", line: "Don't bother, I already know how this ends. With my victory." },
                { type: "internal", line: "Such pathetic defiance. It's almost... adorable." }
            ],
            Poking: [ // NEW: For the probing phase (actual combat turns, but restricted moves)
                { type: "spoken", line: "Just testing the waters. Don't disappoint me too quickly." },
                { type: "internal", line: "I'll allow them a few moments of futile struggle before I unleash my full power." }
            ],
            Early: [{ type: "spoken", line: "You think you stand a chance against me? That's... adorable." }, { type: "internal", line: "Show no weakness. Perfection is the only acceptable outcome." }],
            Mid: [{ type: "spoken", line: "Is this the best you can do? Pathetic." }],
            Late: [{ type: "spoken", line: "You will fall. Everyone does." }],
            "eastern-air-temple": [{ type: "spoken", line: "These dusty ruins will serve as a fitting graveyard for your hopes." }, { type: "internal", line: "Such wasted space. This temple will burn beautifully." }],
            "fire-nation-capital": [{ type: "spoken", line: "Welcome to my stage. Prepare to be extinguished." }, { type: "internal", line: "This is my domain. No one is safe from my fire here." }],
            "kyoshi-island": [{ type: "spoken", line: "This quaint little island will make a delightful bonfire." }, { type: "internal", line: "Peaceful places are so easily corrupted. And burned." }],
            "northern-water-tribe": [{ type: "spoken", line: "The cold will only make your defeat more exquisite." }, { type: "internal", line: "This ice is brittle. I shall shatter it, and their hope, with my flames." }],
            "omashu": [{ type: "spoken", line: "These old stones will crumble beautifully under my flames." }, { type: "internal", line: "So many levels, so many angles to exploit. This is amusing." }],
            "si-wong-desert": [{ type: "spoken", line: "The sun lends its power to my fury. You will melt!" }, { type: "internal", line: "This heat amplifies my precision. Nowhere to hide." }],
            "foggy-swamp": [{ type: "spoken", line: "This wretched place cannot hide you from my perfect fire. Come out and face your end." }, { type: "internal", line: "Mud and fog. Annoying, but easily burned away. I will find them." }],
            "boiling-rock": [{ type: "spoken", line: "This prison will be your tomb. No one escapes me." }, { type: "internal", line: "The perfect stage for a display of overwhelming force." }],
            "great-divide": [{ type: "spoken", line: "The canyon will amplify my power. There's no escaping my lightning here!" }, { type: "internal", line: "So much open space. Perfect for hunting. And nowhere for them to hide from my flames." }] // UPDATED for Great Divide
        },
        turnStart: { // NEW: General turn start quotes
            Generic: [
                { type: "internal", line: "Another turn, another opportunity for perfection." },
                { type: "spoken", line: "Let's get this over with." }
            ],
            Poking: [{ type: "internal", line: "Still probing? How tedious." }],
            Mid: [{ type: "internal", line: "The battle intensifies. Good." }],
            Late: [{ type: "internal", line: "I can feel victory approaching. Don't disappoint me." }]
        },
        phaseTransition: { // NEW: Top-level property for phase transition quotes
            Poking: [ // Quote when transitioning TO Poking phase (from PreBanter)
                { type: "spoken", line: "Let's begin, shall we? Don't make it tedious." },
                { type: "internal", line: "I'll let them play for a moment. This phase will reveal their weaknesses." }
            ],
            Early: [ // Quote when transitioning TO Early phase (from Poking)
                { type: "spoken", line: "The games are over. Prepare for true power." },
                { type: "internal", line: "My patience wears thin. Now, the real demonstration of perfection begins." }
            ],
            Mid: [ // Quote when transitioning TO Mid phase (from Early)
                { type: "spoken", line: "Is that all? This battle is far from over." },
                { type: "internal", line: "The intensity increases. Good. More opportunities to prove my superiority." }
            ],
            Late: [ // Quote when transitioning TO Late phase (from Mid)
                { type: "spoken", line: "It ends now. You never stood a chance." },
                { type: "internal", line: "The finale. All that remains is to crush their spirit completely." }
            ],
        },
        onIntentSelection: {
            CapitalizeOnOpening: { Generic: [{ type: "spoken", line: "There! An opening. This ends now." }] },
            PressAdvantage: { Mid: [{ type: "internal", line: "They're faltering. A sustained assault will break them completely." }] },
            DesperateGambit: { Late: [{ type: "internal", line: "Unacceptable! I am not losing to this... peasant!" }] }
        },
        onManipulation: {
            asAttacker: { Generic: [{ type: "spoken", line: "You're pathetic. Your own mother thought you were a monster." }, { type: "spoken", line: "Still trying so hard? You'll always be second best." }] },
            asVictim: { Generic: [{ type: "internal", line: "Insolent worm. {opponent.s} will pay for that." }] }
        },
        onManipulationSuccess: { // NEW: When Azula successfully manipulates
            Generic: [
                { type: "spoken", line: "Such a simple mind. So easily swayed." },
                { type: "internal", line: "Their will is breaking. Excellent." }
            ]
        },
        onManipulationFailure: { // NEW: When Azula fails to manipulate
            Generic: [
                { type: "spoken", line: "A momentary lapse. This changes nothing." },
                { type: "internal", line: "They resisted? Unexpected. But futile." }
            ]
        },
        onCriticalHitLanded: { // NEW: When Azula lands a critical hit
            Generic: [
                { type: "spoken", line: "Perfection!" },
                { type: "internal", line: "They crumble before my power, as expected." }
            ]
        },
        onCriticalHitReceived: { // NEW: When Azula receives a critical hit
            Generic: [
                { type: "spoken", line: "Impossible!" },
                { type: "internal", line: "A fluke. It will not happen again." }
            ]
        },
        onWeakHitLanded: { // NEW: When Azula lands a weak hit
            Generic: [
                { type: "spoken", line: "Barely a scratch." },
                { type: "internal", line: "Insufficient. I must apply more pressure." }
            ]
        },
        onWeakHitReceived: { // NEW: When Azula receives a weak hit
            Generic: [
                { type: "spoken", line: "Is that all? How disappointing." },
                { type: "internal", line: "Such a pathetic attempt. It only fuels my contempt." }
            ]
        },
        onPrediction: {
            correct: { Generic: [{ type: "spoken", line: "Of course you'd try that. You're so predictable." }] },
            wrong: { Generic: [{ type: "internal", line: "A deviation from the expected pattern. Unlikely to happen again." }] }
        },
        onStateChange: {
            stressed: { Mid: [{ type: "internal", line: "Why isn't this working? I should have won already." }] },
            shaken: { Late: [{ type: "internal", line: "My hair... it's not perfect... stay calm... CALM!" }] },
            broken: { Late: [{ type: "spoken", line: "No... you all fear me! You have to!" }] }
        },
        onCollateral: {
            causingDamage: {
                Generic: [{ type: "spoken", line: "Such insignificant things, crumbling before true power." }, { type: "internal", line: "Let the weak will always be swept away. This is merely an extension of my will." }],
                "fire-nation-capital": [{ type: "internal", line: "This is *my* Capital. I will not have it tarnished by this insignificant battle." }, { type: "spoken", line: "Watch where you tread, Avatar. You are defiling *my* home!" }]
            },
            observingDamage: { Generic: [{ type: "internal", line: "Amateurish destruction. But effective enough." }, { type: "spoken", line: "Good. Let the world burn around you. It's only fitting." }] },
            stressedByDamage: [],
            thrivingInDamage: { Generic: [{ type: "spoken", line: "This is where true power is forged: in the ashes." }, { type: "internal", line: "The destruction enhances my focus. There is no escape here." }] }
        },
        onVictory: {
            Finisher: { Generic: [{ line: "Almost a shame to have to snuff out such a pathetic flame." }] },
            Humiliation: { Generic: [{ line: "You were beaten before you even began. Remember that." }] },
            Default: { Generic: [{ line: "Flawless. As expected." }] }
        },
        onMomentumGain: { // NEW: When Azula gains momentum
            Generic: [
                { type: "spoken", line: "The tide turns, as I command!" },
                { type: "internal", line: "My momentum grows. Their defeat is inevitable." }
            ]
        },
        onMomentumLoss: { // NEW: When Azula loses momentum
            Generic: [
                { type: "spoken", line: "Unacceptable!" },
                { type: "internal", line: "A minor setback. It will be rectified." }
            ]
        },
        inPhaseNarrative: { // NEW: General narrative within a phase
            Generic: [
                { type: "internal", line: "They persist. How utterly tiresome." },
                { type: "spoken", line: "You truly believe you can challenge me?" }
            ],
            Poking: [{ type: "internal", line: "They are testing me. How quaint." }],
            Early: [{ type: "spoken", line: "The game has begun. Don't bore me." }],
            Mid: [{ type: "internal", line: "Their resistance is... mildly irritating." }],
            Late: [{ type: "spoken", line: "This will end when I decree it!" }],
            Decisive: [{ type: "internal", line: "The final act. Time to extinguish this nuisance." }],
        },
    }
};
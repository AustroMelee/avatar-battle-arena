// FILE: js/data_archetype_aang.js
"use strict";

// Archetype data for Aang (Airbending Only) vs. all other characters and locations.
export const aangArchetypeData = {
    //=======================
    // Aang (aang-airbending-only)
    //=======================

    // --- Aang vs Azula (azula) ---
    "azula": {
        "fire-nation-capital": {
            label: "Royal Rumble: Princess's Perfection vs. Avatar's Air",
            introA: "Aang confronts Azula in her own seat of power, his airbending a desperate whirlwind against her flawless, deadly fire.",
            introB: "Azula, the favored princess, aims to definitively crush the Avatar in the Fire Nation capital, showcasing her absolute superiority."
        },
        "_DEFAULT_LOCATION_": {
            label: "Lightning and Wind: A Fateful Duel",
            introA: "Aang, embodying the evasive spirit of air, seeks to avoid Azula's deadly assault and find a path to peace.",
            introB: "Azula's blue fire burns with cold precision, a prodigy eager to prove her absolute superiority against the Avatar."
        }
    },
    // NEW: Add new battleStart property for PreBanter and Poking, and phaseTransition property
    narrative: {
        battleStart: {
            PreBanter: [ // NEW: For the very first narrative-only turn (Turn 0)
                { type: "spoken", line: "I hope we don't have to fight, but I will if I have to protect my friends." },
                { type: "internal", line: "Maybe {opponentName} will just give up if I stand here looking very calm?" }
            ],
            Poking: [ // NEW: For the probing phase (actual combat turns, but restricted moves)
                { type: "spoken", line: "Just a gentle breeze. No need to get too serious, right?" },
                { type: "internal", line: "Okay, just testing the air. Need to be gentle. Very, very gentle." }
            ],
            Early: [{ type: "spoken", line: "I don't want to fight, but I will if I have to protect my friends." }, { type: "internal", line: "Be like the leaf. Flow with the wind. Don't let them pin you down." }],
            Mid: [{ type: "spoken", line: "This is getting serious. I have to find a way to end this peacefully!" }],
            Late: [{ type: "action", line: "Aang channels the very air around him, preparing for a decisive move." }], // Changed to action
            "eastern-air-temple": [{ type: "spoken", line: "It's good to be home. The air feels so alive here!" }, { type: "internal", line: "I can feel the presence of the monks... I must protect this place." }],
            "fire-nation-capital": [{ type: "spoken", line: "I hope we don't have to break too much... This is a lot of history." }, { type: "internal", line: "So much pride here. It feels... heavy." }],
            "kyoshi-island": [{ type: "spoken", line: "Kyoshi's island... I must respect this place, and its people." }, { type: "internal", line: "The air here is gentle, like its people. I must be gentle too." }],
            "northern-water-tribe": [{ type: "spoken", line: "So much ice! This is amazing, but also... really cold." }, { type: "internal", line: "I have to be careful with my airbending here, for the structures and the people." }],
            "omashu": [{ type: "spoken", line: "Whee! Omashu is so fun! Let's play!" }, { type: "internal", line: "I love these chutes! So many ways to get around." }],
            "si-wong-desert": [{ type: "spoken", line: "So hot... but the air is free! I can do this!" }, { type: "internal", line: "No solid ground for some benders. That's my advantage!" }],
            "foggy-swamp": [{ type: "spoken", line: "This place is so peaceful, but also... a little sad. I must be careful not to disturb its spirit." }, { type: "internal", line: "I can feel the life energy of the swamp. I must use my bending gently here." }],
            "boiling-rock": [{ type: "spoken", line: "So many ways to move around here! Let's get to it!" }, { type: "internal", line: "This is a Fire Nation prison... I should be careful, but I can use its own structure against them." }],
            "great-divide": [{ type: "spoken", line: "The air currents here are incredible! So many ways to move!" }, { type: "internal", line: "Such an open space. I can use the wind to my full advantage without harming anything." }] // NEW for Great Divide
        },
        turnStart: { // NEW: General turn start quotes
            Generic: [
                { type: "internal", line: "Okay, what's next?" },
                { type: "spoken", line: "Here we go again!" }
            ],
            Poking: [{ type: "internal", line: "Another turn to keep things light." }],
            Mid: [{ type: "internal", line: "Time to make my move count." }],
            Late: [{ type: "internal", line: "I need to end this soon, for everyone's sake." }]
        },
        phaseTransition: { // NEW: Top-level property for phase transition quotes
            Poking: [ // Quote when transitioning TO Poking phase (from PreBanter)
                { type: "spoken", line: "Okay, looks like we're past introductions. Let's keep it light, though!" },
                { type: "internal", line: "Alright, they're feeling me out. I need to be evasive, like a leaf on the wind!" }
            ],
            Early: [ // Quote when transitioning TO Early phase (from Poking)
                { type: "spoken", line: "Uh oh, things are getting serious! Please, let's not hurt anyone too badly!" },
                { type: "internal", line: "The real battle's beginning. I need to balance my defense with decisive action." }
            ],
            Mid: [ // Quote when transitioning TO Mid phase (from Early)
                { type: "spoken", line: "Whoa, the intensity is really picking up! I've got to focus!" },
                { type: "internal", line: "The stakes are rising. I can feel the weight of my responsibility now." }
            ],
            Late: [ // Quote when transitioning TO Late phase (from Mid)
                { type: "spoken", line: "It's all coming down to this! I have to end it, now, peacefully if I can!" },
                { type: "internal", line: "This is the final push. The balance of the world depends on this moment!" }
            ],
        },
        onIntentSelection: {
            OpeningMoves: { Early: [{ type: "internal", line: "Maybe if I'm evasive enough, {opponent.s} will just get tired and stop?" }] },
            CautiousDefense: { Generic: [{ type: "spoken", line: "Let's just calm down for a second, okay?" }] },
            CapitalizeOnOpening: { Mid: [{ type: "internal", line: "There's an opening! A quick puff of air should do it." }] }
        },
        onManipulation: {
            asVictim: { Generic: [{ type: "internal", line: "{opponent.p} words are... heavy. But I can't let them stop me." }] },
        },
        onManipulationSuccess: { // NEW: When Aang successfully manipulates
            Generic: [
                { type: "spoken", line: "See? There's always a way around!" },
                { type: "internal", line: "A gentle nudge can be more powerful than a punch." }
            ]
        },
        onManipulationFailure: { // NEW: When Aang fails to manipulate
            Generic: [
                { type: "spoken", line: "Oh, that didn't quite work. Uh oh." },
                { type: "internal", line: "They're not listening. I need another approach." }
            ]
        },
        onCriticalHitLanded: { // NEW: When Aang lands a critical hit
            Generic: [
                { type: "spoken", line: "Oops! Too much air!" },
                { type: "internal", line: "Whoa, that was a big one! Hope they're okay." }
            ]
        },
        onCriticalHitReceived: { // NEW: When Aang receives a critical hit
            Generic: [
                { type: "spoken", line: "Yikes! That stung!" },
                { type: "internal", line: "That hit me harder than I expected. Gotta be faster." }
            ]
        },
        onWeakHitLanded: { // NEW: When Aang lands a weak hit
            Generic: [
                { type: "spoken", line: "Hmm, didn't have much oomph." },
                { type: "internal", line: "That's not gonna cut it. Need to find a better angle." }
            ]
        },
        onWeakHitReceived: { // NEW: When Aang receives a weak hit
            Generic: [
                { type: "spoken", line: "Ha! Is that all you've got?" },
                { type: "internal", line: "Just a breeze. Nothing I can't handle." }
            ]
        },
        onPrediction: {
            correct: { Generic: [{ type: "internal", line: "I felt the shift in the air. I knew that was coming." }] },
            wrong: { Generic: [{ type: "internal", line: "Whoa, that was fast. Gotta be quicker." }] }
        },
        onStateChange: {
            stressed: { Mid: [{ type: "internal", line: "This is getting too violent. I have to end it without anyone getting seriously hurt." }] },
            shaken: { Late: [{ type: "spoken", line: "Please, stop! This isn't the way!" }] },
            broken: { Late: [{ type: "internal", line: "Everyone... Gyatso... I'm sorry..." }] }
        },
        onMomentumGain: { // NEW: When Aang gains momentum
            Generic: [
                { type: "internal", line: "Alright, feeling good! Time to keep the flow going!" },
                { type: "spoken", line: "Yes! The wind is with me!" }
            ]
        },
        onMomentumLoss: { // NEW: When Aang loses momentum
            Generic: [
                { type: "internal", line: "Oh no, I'm losing my rhythm. Gotta get back in sync." },
                { type: "spoken", line: "Aw, nuts!" }
            ]
        },
        onCollateral: {
            causingDamage: { Generic: [{ type: "internal", line: "No! I have to be careful not to hurt anything else." }, { type: "spoken", line: "Watch out! We don't have to destroy everything!" }] },
            observingDamage: { Generic: [{ type: "spoken", line: "Stop! This isn't what bending is for!" }, { type: "internal", line: "The balance is being broken. I have to restore it." }] },
            stressedByDamage: { Generic: [{ type: "internal", line: "The world... it's hurting. I can't let this continue." }, { type: "spoken", line: "This isn't what Gyatso taught me! I have to find a way out!" }] },
            thrivingInDamage: []
        },
        onVictory: { Default: { Generic: [{ line: "Phew! Nobody got hurt, right? Mostly." }] } },
        inPhaseNarrative: { // NEW: General narrative within a phase
            Generic: [
                { type: "internal", line: "I need to stay focused. This fight isn't over yet." },
                { type: "spoken", line: "The air feels heavy today... I need to find a way through this." }
            ],
            Poking: [{ type: "internal", line: "Just a little longer... I need to see their full style." }],
            Early: [{ type: "spoken", line: "This is getting more intense. I have to keep my head." }],
            Mid: [{ type: "internal", line: "The tension is rising. What's my next move?" }],
            Late: [{ type: "spoken", line: "I have to push harder. Everyone is counting on me!" }],
            Decisive: [{ type: "internal", line: "This is it. One final push for peace." }],
        },
    }
};
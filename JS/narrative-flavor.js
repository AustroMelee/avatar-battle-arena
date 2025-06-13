'use strict';

// ====================================================================================
//  Narrative Flavor Library (RML v1.1 - Multi-State)
// ====================================================================================
//  Provides flavor text for the Multi-Stage Emotional Breakdown Framework.
// ====================================================================================

export const emotionalFlavor = {
    // --- GENERIC STATES FOR ANY CHARACTER ---
    generic: {
        stressed: [
            "{actorName}'s brow furrows with concentration.",
            "A hint of strain appears in {actorName}'s movements.",
            "{actorName} takes a sharp breath, refocusing under the pressure."
        ],
        shaken: [
            "A flicker of panic flashes in {actorName}'s eyes.",
            "{actorName}'s confident stance begins to waver.",
            "The pressure seems to be getting to {actorName}, whose movements become slightly erratic."
        ],
        broken: [
            "Frustration boils over, and {actorName}'s technique becomes sloppy and desperate.",
            "A desperate cry escapes {actorName} as {possessive} guard breaks completely.",
            "All strategy is gone, replaced by raw, unfocused rage."
        ]
    },

    // --- CHARACTER-SPECIFIC STATES ---
    'azula': {
        stressed: [
            "Azula's smile tightens, a hint of strain at the edges.",
            "Her precise movements become a fraction too sharp, betraying a hidden tension.",
            "'You're starting to annoy me,' {actorName} says, her voice dangerously calm."
        ],
        shaken: [
            "A single hair falls out of place, and Azula's perfect composure cracks, replaced by a snarl.",
            "A memory of her mother's words seems to haunt her, and her blue flames flicker with instability.",
            "'I am perfect...' {actorName} mutters, as if trying to convince herself."
        ],
        broken: [
            "'Everyone thinks I'm a monster!' she shrieks, her attack laced with furious despair rather than precision.",
            "Her attacks become wild, powerful, but without their usual terrifying focus.",
            "Tears stream down her face, sizzling into steam as they touch her superheated armor."
        ],
        taunt: {
            'zuko': "You've always been weak, Zuzu. Pathetic.",
            'katara': "Is that all the power the little peasant can muster?",
            'aang-airbending-only': "Still playing games, Avatar? I'll put an end to them.",
            'toph-beifong': "Your dirty tricks are no match for perfection, little girl."
        }
    },
    'zuko': {
        stressed: [
            "The scar on his face seems to tighten as he focuses, his breath coming in short bursts.",
            "{actorName} grits his teeth, pushing back against the memory of his father's scorn.",
            "'I won't lose my way,' he whispers, his fists clenched."
        ],
        shaken: [
            "His father's mocking laughter echoes in his mind, and {actorName} lashes out with uncontrolled anger.",
            "He falters for a moment, torn between his past and present, leaving an opening.",
            "'I have to restore my honor!' he yells, but his voice cracks with uncertainty."
        ],
        broken: [
            "He clutches his head, overwhelmed by conflicting emotions. 'I'm so confused...'",
            "His firebending becomes a storm of raw emotion, dangerous to everyone, including himself.",
            "'Which path is mine?!' he shouts at the sky, his defense faltering completely."
        ]
    },
    'aang-airbending-only': {
        stressed: [
            "Aang's playful demeanor fades, replaced by the heavy burden of his duty.",
            "'This is getting too serious,' he thinks, his evasive maneuvers becoming more urgent.",
        ],
        shaken: [
            "He looks at {targetName} with worried eyes. 'Please, we don't have to do this!'",
            "A memory of the Hundred Year War flashes in his mind, and he pulls back from a powerful attack."
        ],
        broken: [
            // Aang doesn't 'break' in the same way; he enters the Avatar State. This is beyond current scope.
            // So his 'broken' state is a form of desperate, powerful defense.
            "His eyes and tattoos begin to glow faintly. 'I have to protect everyone!'",
            "A powerful sphere of wind begins to form around him, a desperate defensive measure."
        ]
    },
    'iroh': {
        stressed: [ // It's hard to stress Iroh, this is more 'disappointed'
            "Iroh sighs, a look of profound sadness on his face. 'It is time to stop this foolishness.'",
            "He shakes his head slowly. 'You have lost your way.'",
        ],
        mercy: [
            "He sees the pain in {targetName}'s eyes and holds back, turning his attack into a gentle push.",
            "He sips from an imaginary teacup. 'Have you considered that this conflict is... ill-advised?' he asks, deflecting the blow."
        ]
    }
};

// ====================================================================================
//  Tactical Flavor Library (v1.0)
// ====================================================================================
//  Provides narrative text for the Tactical State system.
// ====================================================================================
export const tacticalFlavor = {
    // --- APPLYING A STATE ---
    apply: {
        generic: "The move creates a clear opening!",
        Exposed: "The brilliant feint leaves {targetName} completely exposed!",
        'Off-Balance': "{targetName} stumbles, knocked completely off-balance by the swift maneuver.",
        Disoriented: "The whirling attack leaves {targetName} disoriented and unable to focus.",
        Trapped: "{actorName}'s clever trap springs shut, leaving {targetName} with nowhere to run!",
        Immobilized: "A prison of {element} envelops {targetName}, holding them fast!",
        Staggered: "The earth-shattering impact leaves {targetName} staggered and struggling to recover their footing.",
        Pinned: "A perfectly aimed shot pins {targetName}'s clothing, severely restricting their movement!",
        Distracted: "{targetName} is distracted by the flashy acrobatics, dropping their guard for a crucial moment.",
        Cornered: "The wall of {element} cuts off all escape routes, leaving {targetName} cornered.",
        Unstable: "The ground shifts beneath {targetName}'s feet, making their stance precarious and unstable.",
    },

    // --- CONSUMING A STATE (Payoff) ---
    consume: {
        generic: "Exploiting the opening,",
        Exposed: "Capitalizing on {targetName}'s exposed defense,",
        'Off-Balance': "Seeing {targetName} off-balance,",
        Disoriented: "While {targetName} is still disoriented,",
        Trapped: "With {targetName} trapped,",
        Immobilized: "With {targetName} unable to move,",
        Staggered: "While {targetName} is still reeling,",
        Pinned: "With {targetName} pinned in place,",
        Distracted: "Taking advantage of the distraction,",
        Cornered: "With nowhere left to run,",
        Unstable: "As {targetName} struggles for footing,"
    },

    // --- NARRATING AN ACTION WHILE A STATE IS ACTIVE ---
    // (Used as a prefix for the actor's move narration)
    has_state: {
        generic: "Sensing an opportunity,",
        Exposed: "Pressing the attack while {targetName} is exposed,",
        'Off-Balance': "Moving to capitalize on {targetName}'s poor footing,",
        Disoriented: "While {targetName} struggles to regain their senses,",
        Trapped: "With {targetName} caught in the trap,",
        Immobilized: "With {targetName} held fast,",
        Staggered: "Before {targetName} can recover,",
        Pinned: "While {targetName} is restricted,",
        Distracted: "Before {targetName} can refocus,",
        Cornered: "Closing in on the cornered foe,",
        Unstable: "As the ground continues to shift,"
    }
};
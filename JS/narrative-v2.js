'use strict';

export const battlePhases = [
    { name: "Opening Clash", emoji: "⚔️" },
    { name: "Momentum Shift", emoji: "🔄" },
    { name: "Counterplay", emoji: "🔃" },
    { name: "Terrain Interaction", emoji: "🌍" },
    { name: "Climactic Exchange", emoji: "💥" },
    { name: "Finishing Move", emoji: "🏁" }
];

export const effectivenessLevels = {
    WEAK: { label: "Weak", emoji: "💤" },
    NORMAL: { label: "Normal", emoji: "⚔️" },
    STRONG: { label: "Strong", emoji: "🔥" },
    CRITICAL: { label: "Critical", emoji: "💥" }
};

export const phaseTemplates = {
    phaseWrapper: `<div class="battle-phase" data-phase="{phaseName}">{phaseContent}</div>`,
    header: `<h4 class="phase-header">{phaseName} {phaseEmoji}</h4>`,
    move: `
        <div class="move-line" data-energy-cost="{energyCost}">
            <div class="move-actor">
                <span class="char-{actorId}">{actorName}</span> used <span class="move-name">{moveName}</span> ({moveEmoji})
            </div>
            <div class="move-effectiveness {effectivenessLabel}">
                {effectivenessLabel} ({effectivenessEmoji})
            </div>
        </div>
        <p class="move-description">{moveDescription}</p>
    `,
    finalBlow: `<p class="final-blow">{winnerName} lands a finishing blow, defeating {loserName}!</p>`,
    conclusion: `<p class="conclusion">{endingNarration}</p>`
};

export const narrativeStatePhrases = {
    energy_depletion: ["Nearing exhaustion,", "Digging deep for energy,", "Visibly tiring,", "Summoning their last reserves,"],
    momentum_gain: ["Building on the prior momentum,", "Pressing the advantage,", "Smelling blood in the water,", "With their opponent on the back foot,"],
    momentum_loss: ["Desperate to turn the tide,", "Trying to regain composure,", "Forced onto the defensive,", "Struggling to find an answer,"]
};

export const introductoryPhrases = {
    CONFIDENT: ["With calculated precision,", "Calmly, and with focus,", "Finding a perfect opening,", "Effortlessly,", "With an air of supreme confidence,"],
    AGGRESSIVE: ["Taking the offensive,", "With a ferocious cry,", "Deciding to end this quickly,", "Lunging forward,"],
    REACTIVE: ["Responding in kind,", "Seizing the opportunity,", "Countering the last move,", "Not missing a beat,", "Pivoting smoothly,"],
    NEUTRAL: ["Without hesitation,", "With a quick movement,", "Looking for an opening,", "Switching tactics,", "Testing the opponent's defenses,"]
};

export const microToneModifiers = {
    intensity: ["with explosive force", "with precise control", "with reckless abandon", "with focused intensity", "with blinding speed", "with brutal efficiency"],
    tempo: ["in rapid succession", "with fluid grace", "before the opening vanishes", "in a single, swift motion", "without a moment's delay", "in the blink of an eye"]
};

export const verbSynonyms = { 'launch': ['hurl', 'send', 'unleash', 'fire', 'project', 'let loose', 'send hurtling', 'propel'], 'strike': ['slam', 'hit', 'connect with', 'land a blow with', 'drive', 'hammer', 'blast', 'shatter'], 'lash': ['whip', 'snap', 'flick', 'lacerate with'], 'create': ['form', 'generate', 'summon', 'materialize', 'conjure', 'manifest'], 'throw': ['fling', 'hurl', 'send', 'toss', 'catapult'], 'unleash': ['release', 'discharge', 'emit', 'let loose', 'unleash'], 'generate': ['create', 'produce', 'summon'], 'ride': ['mount', 'glide on', 'ride'], 'form': ['construct', 'shape', 'create', 'assemble'], 'sweep': ['knock down', 'sweep', 'topple'], 'push': ['shove', 'blast', 'force back', 'repel'], 'erupt with': ['erupt with', 'explode with'], 'propel': ['launch', 'boost', 'propel'], 'release': ['emit', 'discharge', 'release'], 'trigger': ['activate', 'trigger', 'initiate'], 'don': ['equip', 'wear', 'don', 'sheathe themself in'], 'scan': ['scan', 'sense', 'read'], 'hurl': ['throw', 'launch', 'fling'], 'trap': ['ensnare', 'trap', 'catch', 'immobilize'], 'reshape': ['alter', 'reshape', 'change the terrain with'], 'breathe': ['exhale', 'breathe', 'spew'], 'redirect': ['deflect', 'redirect', 'guide'], 'perform': ['execute', 'perform'], 'offer': ['offer', 'present'], 'raise': ['erect', 'raise', 'construct'], 'conjure': ['summon', 'conjure'], 'inflict': ['inflict', 'deliver'], 'disperse': ['scatter', 'dissipate', 'disperse'], 'end': ['conclude', 'end'], 'ignite': ['set ablaze', 'ignite', 'envelop'], 'assume': ['take on', 'assume'], 'encase': ['envelop', 'encase', 'imprison'], 'freeze': ['freeze', 'chill', 'flash-freeze'], 'execute': ['perform', 'execute'], 'dodge': ['evade', 'dodge', 'sidestep'], 'pin': ['pin', 'fasten', 'affix'], 'block': ['block', 'parry', 'deflect'], 'devise': ['construct', 'devise', 'rig'], 'spring': ['spring', 'activate'], 'send': ['send', 'dispatch'], 'bend': ['bend', 'manipulate'], 'tunnel': ['tunnel', 'burrow'], 'turn': ['turn', 'transform'], 'entomb': ['entomb', 'encase'], 'deliver': ['deliver', 'unleash'], 'dive': ['dive', 'lunge'], 'attempt': ['attempt', 'try'] };

export const impactPhrases = {
    DEFAULT: {
        WEAK: ["but the attack glances off harmlessly.", "but {targetName} easily dodges it.", "but the technique lacks the power to connect meaningfully."],
        NORMAL: ["The blow strikes {targetName} squarely.", "It forces {targetName} to brace for impact.", "A solid hit lands, and {targetName} stumbles."],
        STRONG: ["A powerful blow sends {targetName} reeling!", "The attack smashes through {targetName}'s guard with ease.", "{targetName} staggers back, caught off-guard by the intensity."],
        CRITICAL: ["A devastating hit! {targetName} is overwhelmed completely.", "The technique is executed perfectly, leaving {targetName} staggered and vulnerable.", "An incredible strike! {targetName} is knocked to the ground."]
    },
    fire: {
        NORMAL: ["The flames force {targetName} to retreat.", "Searing heat washes over {targetName}."],
        STRONG: ["The blaze engulfs {targetName}, who cries out in pain!", "The intense fire melts through {targetName}'s defense."]
    },
    ice: {
        NORMAL: ["A layer of frost covers {targetName}, slowing them down.", "Shards of ice shatter against {targetName}'s defense."],
        STRONG: ["The bitter cold seeps into {targetName}'s bones.", "The ice encases {targetName}'s limbs, restricting movement."]
    },
    physical: {
        NORMAL: ["The physical blow connects with a dull thud.", "{targetName} grunts from the solid impact."],
        STRONG: ["The raw force of the blow sends {targetName} flying!", "A bone-jarring impact leaves {targetName} disoriented."]
    },
    DEFENSE: {
        REACTIVE: ["The defensive maneuver perfectly counters the incoming assault.", "The attack is negated completely by the well-timed defense.", "With a skillful move, the blow is parried effortlessly."],
        PROACTIVE: ["The armor forms perfectly, ready for the next assault.", "A formidable barrier now surrounds {actorName}, daring the opponent to attack.", "{actorName} prepares their defense, anticipating the next move."]
    }
};

export const postBattleVictoryPhrases = {
    default: {
        dominant: "{WinnerName} stood victorious over {LoserName}, the battle concluded.",
        narrow: "{WinnerName} stood breathing heavily, the hard-fought victory against {LoserName} finally secured."
    },
    Ruthless: {
        dominant: "{WinnerName}'s blue flames flickered, leaving no doubt about {WinnerPronounP} cold, efficient triumph over {LoserName}.",
        narrow: "Even in a close-fought battle, {WinnerName}'s ruthless precision was the deciding factor against {LoserName}."
    },
    Supreme: {
        dominant: "{WinnerName} stood radiating immense power, {WinnerPronounP} victory a declaration of {WinnerPronounP} absolute dominion over {LoserName}.",
        narrow: "Though the battle was intense, {WinnerName}'s superior power ultimately crushed {LoserName}'s hopes."
    }
};
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
        <div class="move-line">
            <div class="move-actor">
                <span class="char-{actorId}">{actorName}</span> used <span class="move-name">{moveName}</span> ({moveEmoji})
            </div>
            <div class="move-effectiveness {effectivenessLabel}">
                {effectivenessLabel} ({effectivenessEmoji})
            </div>
        </div>
        <p class="move-description">{moveDescription}</p>
    `,
    finalBlow: `<p class="final-blow">{winnerName} lands the finishing blow, defeating {loserName}!</p>`,
    conclusion: `<p class="conclusion">{endingNarration}</p>`
};

export const narrativeStatePhrases = {
    energy_depletion: ["Nearing exhaustion,", "Digging deep for energy,", "Visibly tiring,", "Summoning their last reserves,", "Struggling to stand,"],
    momentum_gain: ["Building on the prior momentum,", "Pressing the advantage,", "Sensing weakness,", "With their opponent on the back foot,"],
    momentum_loss: ["Desperate to turn the tide,", "Trying to regain composure,", "Forced onto the defensive,", "Struggling to find an answer,"]
};

export const introductoryPhrases = {
    CONFIDENT: ["With calculated precision,", "Calmly, and with focus,", "Finding a perfect opening,", "Effortlessly,", "With an air of supreme confidence,"],
    AGGRESSIVE: ["Taking the offensive,", "With a ferocious cry,", "Deciding to end this quickly,", "Lunging forward,"],
    REACTIVE: ["Responding in kind,", "Seizing the opportunity,", "Countering the last move,", "Not missing a beat,", "Pivoting smoothly,"],
    NEUTRAL: ["Without hesitation,", "With a quick movement,", "Looking for an opening,", "Switching tactics,", "Testing the opponent's defenses,"]
};

export const adverbPool = {
    offensive: ['with relentless precision', 'in a swift blur', 'with unyielding force', 'with deadly accuracy', 'with ferocious intensity', 'in a calculated strike', 'with overwhelming power'],
    defensive: ['with calculated timing', 'in a deft maneuver', 'with steady resolve'],
};

export const verbSynonyms = { 'launch': ['hurl', 'send', 'unleash', 'fire', 'project', 'let loose', 'send hurtling', 'propel'], 'strike': ['slam', 'hit', 'connect with', 'land a blow with', 'drive', 'hammer', 'blast', 'shatter'], 'lash': ['whip', 'snap', 'flick', 'lacerate with'], 'create': ['form', 'generate', 'summon', 'materialize', 'conjure', 'manifest'], 'throw': ['fling', 'hurl', 'send', 'toss', 'catapult'], 'unleash': ['release', 'discharge', 'emit', 'let loose', 'unleash'], 'generate': ['create', 'produce', 'summon'], 'ride': ['mount', 'glide on', 'ride'], 'form': ['construct', 'shape', 'create', 'assemble'], 'sweep': ['knock down', 'sweep', 'topple'], 'push': ['shove', 'blast', 'force back', 'repel'], 'erupt with': ['erupt with', 'explode with'], 'propel': ['launch', 'boost', 'propel'], 'release': ['emit', 'discharge', 'release'], 'trigger': ['activate', 'trigger', 'initiate'], 'don': ['equip', 'wear', 'don', 'sheathe themself in'], 'scan': ['scan', 'sense', 'read'], 'hurl': ['throw', 'launch', 'fling'], 'trap': ['ensnare', 'trap', 'catch', 'immobilize'], 'reshape': ['alter', 'reshape', 'change the terrain with'], 'breathe': ['exhale', 'breathe', 'spew'], 'redirect': ['deflect', 'redirect', 'guide'], 'perform': ['execute', 'perform'], 'offer': ['offer', 'present'], 'raise': ['erect', 'raise', 'construct'], 'conjure': ['summon', 'conjure'], 'inflict': ['inflict', 'deliver'], 'disperse': ['scatter', 'dissipate', 'disperse'], 'end': ['conclude', 'end'], 'ignite': ['set ablaze', 'ignite', 'envelop'], 'assume': ['take on', 'assume'], 'encase': ['envelop', 'encase', 'imprison'], 'freeze': ['freeze', 'chill', 'flash-freeze'], 'execute': ['perform', 'execute'], 'dodge': ['evade', 'dodge', 'sidestep'], 'pin': ['pin', 'fasten', 'affix'], 'block': ['block', 'parry', 'deflect'], 'devise': ['construct', 'devise', 'rig'], 'spring': ['spring', 'activate'], 'send': ['send', 'dispatch'], 'bend': ['bend', 'manipulate'], 'tunnel': ['tunnel', 'burrow'], 'turn': ['turn', 'transform'], 'entomb': ['entomb', 'encase'], 'deliver': ['deliver', 'unleash'], 'dive': ['dive', 'lunge'], 'attempt': ['attempt', 'try'], 'control': ['control', 'manipulate', 'dominate'] };

export const impactPhrases = {
    DEFAULT: {
        WEAK: ["but the attack glances off harmlessly, leaving an opening.", "but {targetName} easily dodges it, creating a chance to counter.", "but the technique lacks the power to connect meaningfully.", "but the strike is too slow to find its mark, giving {targetName} a chance to recover."],
        NORMAL: ["The blow strikes {targetName} squarely.", "It forces {targetName} to brace for impact.", "A solid hit lands, and {targetName} stumbles.", "The attack connects, interrupting {targetName}'s rhythm."],
        STRONG: ["A powerful blow sends {targetName} reeling!", "The attack smashes through {targetName}'s guard with ease.", "{targetName} staggers back, caught off-guard by the intensity.", "The impact is significant, leaving {targetName} momentarily stunned."],
        CRITICAL: ["A devastating hit! {targetName} is overwhelmed completely.", "The technique is executed perfectly, leaving {targetName} staggered and vulnerable.", "An incredible strike! {targetName} is knocked to the ground."]
    },
    PIN: {
        NORMAL: ["The onslaught pins {targetName} against a crumbling wall.", "The strike traps {targetName}, limiting their movement."],
        WEAK: ["The attempt to pin {targetName} falters, missing its mark.", "The weak volley fails to trap {targetName}."]
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
    },
    Fierce: {
        dominant: "{WinnerName} radiated quiet power, {WinnerPronounP} fierce determination evident in {WinnerPronounP} victory over {LoserName}.",
        narrow: "Pushed to the brink, {WinnerName}'s fierce determination proved to be the key in overcoming {LoserName}."
    },
    Cocky: {
        dominant: "{WinnerName} brushed dirt from {WinnerPronounP} clothes with a smirk, {WinnerPronounP} victory over {LoserName} a foregone conclusion.",
        narrow: "'That was almost a challenge,' {WinnerName} quipped, despite the close call against {LoserName}."
    },
    Deadpan: {
        dominant: "{WinnerName} merely blinked, {WinnerPronounP} victory as precise and unemotional as {WinnerPronounP} throws against {LoserName}.",
        narrow: "With an unflappable expression, {WinnerName} confirms the end of the duel with {LoserName}."
    },
    Madcap: {
        dominant: "{WinnerName} retrieved {WinnerPronounP} boomerang with a flourish, {WinnerPronounP} victory over {LoserName} a mix of genius and goofiness.",
        narrow: "Against all odds, {WinnerName}'s unconventional tactics secured a narrow victory over {LoserName}."
    }
};
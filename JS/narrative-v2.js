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
    header: `<h4 class="phase-header">{phaseName} {phaseEmoji}</h4>`,
    move: `
        <div class="move-line">
            <div class="move-actor">
                <span class="char-{actorId}">{actorName}</span> used <span class="move-name">{moveName}</span> ({moveEmoji}) [-{energyCost}⚡]
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

// --- NEW NARRATIVE DATA STRUCTURES ---

export const introductoryPhrases = [
    "Without hesitation,",
    "Taking the offensive,",
    "With a quick movement,",
    "Seizing the opportunity,",
    "In a sudden burst of speed,",
    "Responding in kind,",
    "Looking for an opening,"
];

export const verbSynonyms = {
    'launch': ['hurls', 'sends', 'unleashes', 'projects'],
    'strike': ['slams', 'hits', 'attacks with', 'lands'],
    'lash': ['whips', 'snaps', 'flicks'],
    'create': ['forms', 'generates', 'summons', 'materializes'],
    'throw': ['flings', 'hurls', 'sends'],
    'unleash': ['releases', 'discharges', 'emits'],
    'generate': ['creates', 'produces', 'summons'],
    'ride': ['mounts', 'glides on'],
    'form': ['constructs', 'shapes', 'creates'],
    'sweep': ['knocks', 'sweeps'],
    'push': ['shoves', 'blasts', 'forces'],
    'erupt': ['erupts with', 'explodes with'],
    'propel': ['launches', 'boosts'],
    'release': ['emits', 'discharges'],
    'trigger': ['unleashes', 'activates', 'triggers'],
    'don': ['equips', 'wears', 'dons'],
    'scan': ['scans', 'senses', 'reads'],
    'hurl': ['throws', 'launches', 'flings'],
    'trap': ['ensnares', 'traps', 'catches'],
    'reshape': ['alters', 'reshapes', 'changes'],
    'breathe': ['exhales', 'breathes'],
    'redirect': ['deflects', 'redirects', 'guides'],
    'perform': ['executes', 'performs'],
    'offer': ['offers', 'presents'],
    'raise': ['erects', 'raises', 'constructs'],
    'conjure': ['summons', 'conjures'],
    'inflict': ['inflicts', 'delivers'],
    'disperse': ['scatters', 'dissipates', 'disperses'],
    'end': ['concludes', 'ends'],
    'ignite': ['sets ablaze', 'ignites', 'envelops'],
    'assume': ['takes on', 'assumes'],
    'encase': ['envelops', 'encases', 'imprisons'],
    'freeze': ['freezes', 'chills'],
    'execute': ['performs', 'executes'],
    'dodge': ['evades', 'dodges'],
    'pin': ['pins', 'fastens'],
    'block': ['blocks', 'parries', 'deflects'],
    'devise': ['constructs', 'devises'],
    'spring': ['springs', 'activates'],
    'send': ['sends', 'dispatches'],
    'bend': ['bends', 'manipulates'],
    'tunnel': ['tunnels', 'burrows'],
    'turn': ['turns', 'transforms'],
    'entomb': ['entombs', 'encases'],
    'deliver': ['delivers', 'unleashes'],
};

export const impactPhrases = {
    WEAK: [
        "The attack glances off harmlessly.",
        "It's easily dodged by {targetName}.",
        "{targetName} shrugs off the blow.",
        "The technique lacks the power to connect meaningfully."
    ],
    NORMAL: [
        "The blow strikes {targetName} squarely.",
        "It forces {targetName} to brace for impact.",
        "{targetName} is pushed back by the force of the attack.",
        "A solid hit lands on {targetName}."
    ],
    STRONG: [
        "A powerful blow sends {targetName} reeling!",
        "The attack smashes through {targetName}'s guard.",
        "{targetName} staggers back, caught off-guard by the intensity.",
        "The impact is significant, leaving {targetName} momentarily stunned."
    ],
    CRITICAL: [
        "A devastating hit! {targetName} is overwhelmed completely.",
        "The technique is executed perfectly, leaving {targetName} staggered and vulnerable.",
        "It's a massive blow that leaves {targetName} on the verge of collapse.",
        "The sheer force of the attack breaks {targetName}'s defense entirely."
    ],
    DEFENSE: [
        "The defensive maneuver perfectly counters the incoming assault.",
        "The attack is negated completely.",
        "With a well-timed move, the blow is parried effortlessly.",
        "The defensive stance holds strong, absorbing the impact."
    ]
};

// --- VICTORY NARRATION DATA ---
export const postBattleVictoryPhrases = {
    "Pacifist": ["Aang quietly offered a helping hand, {WinnerPronounP} victory a testament to peace.","The Avatar sighed in relief, the fight ending without true harm.",],
    "Madcap": ["{WinnerName} retrieved {WinnerPronounP} boomerang with a flourish, {WinnerPronounP} victory a mix of genius and goofiness.","{WinnerName} let out a hearty laugh, already planning {WinnerPronounP} next eccentric stunt.",],
    "Playful": ["{WinnerName} giggled, skipping away from {WinnerPronounP} bewildered opponent.","With a cheerful 'Ta-da!', {WinnerName} celebrated a victory that felt more like a game."],
    "Disciplined": ["{WinnerName} nodded stiffly, {WinnerPronounP} victory a clear affirmation of tradition and mastery.",],
    "Fierce": ["{WinnerName} stood firm, {WinnerPronounP} bending prowess undeniable.","{WinnerName} radiated quiet power, {WinnerPronounP} fierce determination evident in {WinnerPronounP} victory."],
    "Cocky": ["{WinnerName} brushed dirt from {WinnerPronounP} clothes with a smirk, {WinnerPronounP} victory a foregone conclusion.",],
    "Determined": ["{WinnerName} stood breathing heavily, {WinnerPronounP} victory a testament to {WinnerPronounP} hard-won resolve.","{WinnerName} clenched {WinnerPronounP} fist, the battle an affirmation of {WinnerPronounP} chosen path."],
    "Ruthless": ["{WinnerName}'s blue flames flickered, leaving no doubt about {WinnerPronounP} cold, efficient triumph over {LoserName}."],
    "Supreme": ["{WinnerName} stood radiating immense power, {WinnerPronounP} victory a declaration of {WinnerPronounP} absolute dominion.",],
    "Wise": ["{WinnerName} offered a gentle smile, {WinnerPronounP} victory a quiet lesson in subtlety and wisdom.",],
    "Wise_Reluctant": ["{WinnerName} sighed, {WinnerPronounP} victory a somber affirmation of control over destruction. \"{WinnerQuote}\"",],
    "Deadpan": ["{WinnerName} merely blinked, {WinnerPronounP} victory as precise and unemotional as {WinnerPronounP} throws.",],
    "default": ["{WinnerName} stood victorious over {LoserName}, the battle concluded. \"{WinnerQuote}\""]
};
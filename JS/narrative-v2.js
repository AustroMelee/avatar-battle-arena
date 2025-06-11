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

export const introductoryPhrases = {
    CONFIDENT: {
        standalone: ["With calculated precision,", "Calmly, and with focus,", "Finding a perfect opening,", "Effortlessly,"],
        leading: ["Radiating confidence, {actorName}", "Showing superior technique, {actorName}", "With an air of supreme confidence, {actorName}"]
    },
    AGGRESSIVE: {
        standalone: ["Taking the offensive,", "Pressing the advantage,", "With a ferocious cry,", "Deciding to end this quickly,"],
        leading: ["In a sudden, aggressive push, {actorName}", "Wanting to overwhelm the opponent, {actorName}", "{actorName} lunges forward and"]
    },
    REACTIVE: {
        standalone: ["Responding in kind,", "Seizing the opportunity,", "Countering the last move,", "Not missing a beat,"],
        leading: ["Quickly retaliating, {actorName}", "Finding an opening in the opponent's attack, {actorName}", "Pivoting smoothly, {actorName}"]
    },
    DESPERATE: {
        standalone: ["In a desperate gamble,", "With their remaining energy,", "Fighting to stay in the battle,", "Mustering their last reserves,"],
        leading: ["In a last-ditch effort, {actorName}", "Refusing to give up, {actorName}", "Pushing past the pain, {actorName}"]
    },
    NEUTRAL: {
        standalone: ["Without hesitation,", "With a quick movement,", "Looking for an opening,", "Switching tactics,"],
        leading: ["Testing the opponent's defenses, {actorName}", "Maintaining a steady guard, {actorName}", "{actorName} makes a move and"]
    }
};

export const intensityPhrases = ["with explosive force", "with precise control", "with reckless abandon", "with focused intensity", "with blinding speed"];
export const tempoPhrases = ["in rapid succession", "with fluid grace", "before the opening vanishes", "in a single, swift motion", "without a moment's delay"];

export const verbSynonyms = {
    'launch': ['hurl', 'send', 'unleash', 'fire', 'project', 'let loose'], 'strike': ['slam', 'hit', 'connect with', 'land a blow with'], 'lash': ['whip', 'snap', 'flick'], 'create': ['form', 'generate', 'summon', 'materialize'], 'throw': ['fling', 'hurl', 'send', 'toss'], 'unleash': ['release', 'discharge', 'emit', 'let loose'], 'generate': ['create', 'produce', 'summon'], 'ride': ['mount', 'glide on'], 'form': ['construct', 'shape', 'create'], 'sweep': ['knock down', 'sweep'], 'push': ['shove', 'blast', 'force back'], 'erupt with': ['erupt with', 'explode with'], 'propel': ['launch', 'boost'], 'release': ['emit', 'discharge'], 'trigger': ['unleash', 'activate', 'trigger'], 'don': ['equip', 'wear', 'don'], 'scan': ['scan', 'sense', 'read'], 'hurl': ['throw', 'launch', 'fling'], 'trap': ['ensnare', 'trap', 'catch'], 'reshape': ['alter', 'reshape', 'change'], 'breathe': ['exhale', 'breathe'], 'redirect': ['deflect', 'redirect', 'guide'], 'perform': ['execute', 'perform'], 'offer': ['offer', 'present'], 'raise': ['erect', 'raise', 'construct'], 'conjure': ['summon', 'conjure'], 'inflict': ['inflict', 'deliver'], 'disperse': ['scatter', 'dissipate', 'disperse'], 'end': ['conclude', 'end'], 'ignite': ['set ablaze', 'ignite', 'envelop'], 'assume': ['take on', 'assume'], 'encase': ['envelop', 'encase', 'imprison'], 'freeze': ['freeze', 'chill'], 'execute': ['perform', 'execute'], 'dodge': ['evade', 'dodge'], 'pin': ['pin', 'fasten'], 'block': ['block', 'parry', 'deflect'], 'devise': ['construct', 'devise'], 'spring': ['spring', 'activate'], 'send': ['send', 'dispatch'], 'bend': ['bend', 'manipulate'], 'tunnel': ['tunnel', 'burrow'], 'turn': ['turn', 'transform'], 'entomb': ['entomb', 'encase'], 'deliver': ['deliver', 'unleash'], 'dive': ['dive', 'lunge'], 'attempt': ['attempt', 'try']
};

export const impactPhrases = {
    WEAK: [
        "but the attack glances off harmlessly.", "but {targetName} easily dodges it.", "but {targetName} shrugs off the blow.", "but the technique lacks the power to connect meaningfully.", "but the strike is too slow to find its mark."
    ],
    NORMAL: [
        "The blow strikes {targetName} squarely.", "It forces {targetName} to brace for impact.", "{targetName} is pushed back by the force of the attack.", "A solid hit lands on {targetName}, who stumbles.", "The attack connects, interrupting {targetName}'s rhythm."
    ],
    STRONG: [
        "A powerful blow sends {targetName} reeling!", "The attack smashes through {targetName}'s guard with ease.", "{targetName} staggers back, caught off-guard by the intensity.", "The impact is significant, leaving {targetName} momentarily stunned.", "It's a direct hit, and {targetName} clearly feels the force of it."
    ],
    CRITICAL: [
        "A devastating hit! {targetName} is overwhelmed completely.", "The technique is executed perfectly, leaving {targetName} staggered and vulnerable.", "It's a massive blow that leaves {targetName} on the verge of collapse.", "The sheer force of the attack breaks {targetName}'s defense entirely.", "An incredible strike! {targetName} is knocked to the ground."
    ],
    REACTIVE_DEFENSE: [
        "The defensive maneuver perfectly counters the incoming assault.", "The attack is negated completely by the well-timed defense.", "With a skillful move, the blow is parried effortlessly.", "The defensive stance holds strong, absorbing the full impact."
    ],
    PROACTIVE_DEFENSE: [
        "The armor forms perfectly, ready for the next assault.", "A formidable barrier now surrounds {actorName}, daring the opponent to attack.", "{actorName} prepares their defense, anticipating the next move.", "The defensive form is established, holding strong against any potential attack."
    ]
};

export const postBattleVictoryPhrases = {
    "Pacifist": ["Aang quietly offered a helping hand, {WinnerPronounP} victory a testament to peace.","The Avatar sighed in relief, the fight ending without true harm.",], "Madcap": ["{WinnerName} retrieved {WinnerPronounP} boomerang with a flourish, {WinnerPronounP} victory a mix of genius and goofiness.","{WinnerName} let out a hearty laugh, already planning {WinnerPronounP} next eccentric stunt.",], "Playful": ["{WinnerName} giggled, skipping away from {WinnerPronounP} bewildered opponent.","With a cheerful 'Ta-da!', {WinnerName} celebrated a victory that felt more like a game."], "Disciplined": ["{WinnerName} nodded stiffly, {WinnerPronounP} victory a clear affirmation of tradition and mastery.",], "Fierce": ["{WinnerName} stood firm, {WinnerPronounP} bending prowess undeniable.","{WinnerName} radiated quiet power, {WinnerPronounP} fierce determination evident in {WinnerPronounP} victory."], "Cocky": ["{WinnerName} brushed dirt from {WinnerPronounP} clothes with a smirk, {WinnerPronounP} victory a foregone conclusion.",], "Determined": ["{WinnerName} stood breathing heavily, {WinnerPronounP} victory a testament to {WinnerPronounP} hard-won resolve.","{WinnerName} clenched {WinnerPronounP} fist, the battle an affirmation of {WinnerPronounP} chosen path."], "Ruthless": ["{WinnerName}'s blue flames flickered, leaving no doubt about {WinnerPronounP} cold, efficient triumph over {LoserName}."], "Supreme": ["{WinnerName} stood radiating immense power, {WinnerPronounP} victory a declaration of {WinnerPronounP} absolute dominion.",], "Wise": ["{WinnerName} offered a gentle smile, {WinnerPronounP} victory a quiet lesson in subtlety and wisdom.",], "Wise_Reluctant": ["{WinnerName} sighed, {WinnerPronounP} victory a somber affirmation of control over destruction. \"{WinnerQuote}\"",], "Deadpan": ["{WinnerName} merely blinked, {WinnerPronounP} victory as precise and unemotional as {WinnerPronounP} throws.",], "default": ["{WinnerName} stood victorious over {LoserName}, the battle concluded. \"{WinnerQuote}\""]
};
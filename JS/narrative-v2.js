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


// --- Data moved from obsolete narrative.js ---

export const victoryTypes = {
    'overwhelm': {
        narrativeEndings: {}
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
            "jeong-jeong": [
                { 
                    action: "<span class='char-jeong-jeong'>Jeong Jeong</span> simply extinguished his last flame, his shoulders slumping.",
                    dialogue: "'The path of fire is destruction,' he sighed, turning away. 'I will fight no more.'"
                }
            ]
        }
    }
};

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
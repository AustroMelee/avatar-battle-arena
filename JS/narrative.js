'use strict';

export const victoryTypes = {
    'overwhelm': {
        narrativeEndings: {
            "azula": "<span class='char-azula'>Azula's</span> blue flames danced with triumphant, cold efficiency. She didn't even look back at <span class='char-{LoserID}'>{LoserName}</span>, already forgotten. \"{WinnerQuote}\"",
            "ozai-not-comet-enhanced": "<span class='char-ozai-not-comet-enhanced'>Ozai</span> stood amidst the devastation, his power radiating, leaving no doubt about the dominion of the Phoenix King. The battle concluded. \"{WinnerQuote}\"",
            "bumi": "<span class='char-bumi'>Bumi</span> merely chuckled, the ground beneath <span class='char-{LoserID}'>{LoserName}</span> still churning in his wake. 'Another one for the collection!' he declared, quite pleased with his overwhelming display. \"{WinnerQuote}\"",
        }
    },
    'disabling_strike': { 
        narrativeEndings: {
            "ty-lee": "<span class='char-ty-lee'>Ty Lee</span> landed silently, a quick, almost gentle jab ending the fight. 'Looks like your chi's... on vacation!' she quipped, a playful grin her only victory declaration.",
            "mai": "A single blade pinned <span class='char-{LoserID}'>{LoserName}'s</span> shadow to the ground, a silent, stark declaration. <span class='char-mai'>Mai</span> didn't miss. She merely turned and walked away, the fight concluded.",
        }
    },
    'outsmart': { 
        narrativeEndings: {
            "sokka": "<span class='char-sokka'>Sokka</span> wiped his brow, a triumphant grin spreading across his face. 'See? Brains beat brawn... eventually!' he declared, retrieving his boomerang.",
            "azula": "<span class='char-azula'>Azula's</span> victory was cold and absolute, a testament to her calculated cruelty. <span class='char-{LoserID}'>{LoserName}</span> hadn't been defeated; they had been outplayed.",
            "iroh": "<span class='char-iroh'>Iroh</span> offered a gentle smile. 'Sometimes, a direct path is not the wisest, eh?' he mused, as <span class='char-{LoserID}'>{LoserName}</span> conceded defeat, outmaneuvered by the Dragon of the West.",
        }
    },
    'terrain_kill': { 
        narrativeEndings: {
            "toph-beifong": "<span class='char-toph-beifong'>Toph</span> scoffed, stomping a foot. The earth itself cemented her victory, leaving <span class='char-{LoserID}'>{LoserName}</span> immobilized. 'That's what you get for not paying attention to the ground, Twinkletoes,' she muttered, walking away.",
            "bumi": "<span class='char-bumi'>Bumi</span> merely chuckled, the ground beneath <span class='char-{LoserID}'>{LoserName}</span> still churning in his wake. 'Another one for the collection!' he declared, quite pleased with his overwhelming display.",
            "pakku": "<span class='char-pakku'>Pakku</span> surveyed the scene, <span class='char-{LoserID}'>{LoserName}</span> incapacitated by the elements. 'Order is maintained,' he stated, a chilling calm in his voice.",
        }
    },
    'morale_break': { 
        narrativeEndings: {
            "jeong-jeong": "<span class='char-jeong-jeong'>Jeong Jeong</span> simply extinguished his last flame, his shoulders slumping. 'The path of fire is destruction,' he sighed, turning away. 'I will fight no more.'", 
            "iroh": "<span class='char-iroh'>Iroh</span> approached his defeated foe, offering a comforting hand. 'There is always hope for redirection,' he said kindly, as <span class='char-{LoserID}'>{LoserName}</span>, outmatched in spirit, yielded. The battle ended not with a blow, but a surrender.",
        }
    }
};

export const postBattleVictoryPhrases = {
    "Pacifist": [
        "Aang quietly offered a helping hand, his victory a testament to peace. \"{WinnerQuote}\"",
        "The Avatar sighed in relief, the fight ending without true harm. \"{WinnerQuote}\"",
        "Aang stood triumphant, having neutralized the threat without needing to hurt his opponent. \"{WinnerQuote}\""
    ],
    "Madcap": [
        "Sokka retrieved his boomerang with a flourish, his victory a mix of genius and goofiness. \"{WinnerQuote}\"",
        "Bumi let out a hearty laugh, already planning his next eccentric stunt. \"{WinnerQuote}\"",
        "Ty Lee giggled, skipping away from her bewildered opponent. \"{WinnerQuote}\""
    ],
    "Disciplined": [
        "Pakku nodded stiffly, his victory a clear affirmation of tradition and mastery. \"{WinnerQuote}\"",
        "Katara stood firm, her waterbending prowess undeniable. \"{WinnerQuote}\""
    ],
    "Fierce": [
        "Katara stood firm, her waterbending prowess undeniable. \"{WinnerQuote}\"",
        "Katara radiated quiet power, her fierce determination evident in her victory. \"{WinnerQuote}\""
    ],
    "Cocky": [
        "Toph brushed dirt from her clothes with a smirk, her victory a foregone conclusion. \"{WinnerQuote}\"",
        "Toph crossed her arms, declaring herself the greatest once more. \"{WinnerQuote}\""
    ],
    "Determined": [
        "Zuko stood breathing heavily, his victory a testament to his hard-won resolve. \"{WinnerQuote}\"",
        "Zuko clenched his fist, the battle an affirmation of his chosen path. \"{WinnerQuote}\""
    ],
    "Ruthless": [
        "Azula's blue flames flickered, leaving no doubt about her cold, efficient triumph. \"{WinnerQuote}\"",
        "Azula surveyed the scene with a chillingly detached expression, her victory absolute. \"{WinnerQuote}\""
    ],
    "Supreme": [
        "Ozai stood radiating immense power, his victory a declaration of his absolute dominion. \"{WinnerQuote}\"",
        "Ozai's presence filled the arena, his win a terrifying display of unchallengeable might. \"{WinnerQuote}\""
    ],
    "Wise": [
        "Iroh offered a gentle smile, his victory a quiet lesson in subtlety and wisdom. \"{WinnerQuote}\"",
        "Iroh exhaled slowly, content in a battle won through understanding rather than force. \"{WinnerQuote}\""
    ],
    "Wise_Reluctant": [
        "Jeong Jeong sighed, his victory a somber affirmation of control over destruction. \"{WinnerQuote}\"",
        "Jeong Jeong extinguished his last flame, having achieved a necessary, if reluctant, win. \"{WinnerQuote}\""
    ],
    "Deadpan": [
        "Mai merely blinked, her victory as precise and unemotional as her throws. \"{WinnerQuote}\"",
        "Mai collected her blades, the fight concluded with minimal fuss. \"{WinnerQuote}\""
    ],
    "default": [
        "<span class='char-{WinnerID}'>{WinnerName}</span> stood victorious, the battle concluded. \"{WinnerQuote}\""
    ]
};
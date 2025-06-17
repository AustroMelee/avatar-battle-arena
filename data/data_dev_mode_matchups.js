// FILE: data_dev_mode_matchups.js
'use strict';
// This file contains a curated list of matchups for Dev Mode batch simulations.
// Each entry specifies two fighters, a location, and a time of day.
// This list is designed to test various interactions, character strengths,
// environmental effects, and specific curbstomp rules.
// Total matchups: 100
export const devModeMatchups = [
// === GAANG vs GAANG ===
{ fighter1: 'sokka', fighter2: 'katara', location: 'northern-water-tribe', timeOfDay: 'day' },
{ fighter1: 'aang-airbending-only', fighter2: 'toph-beifong', location: 'ba-sing-se', timeOfDay: 'day' },
{ fighter1: 'zuko', fighter2: 'sokka', location: 'boiling-rock', timeOfDay: 'night' },
{ fighter1: 'katara', fighter2: 'aang-airbending-only', location: 'kyoshi-island', timeOfDay: 'day' },
{ fighter1: 'toph-beifong', fighter2: 'zuko', location: 'fire-nation-capital', timeOfDay: 'night' },
// === GAANG vs ANTAGONISTS ===
{ fighter1: 'sokka', fighter2: 'azula', location: 'great-divide', timeOfDay: 'day' },
{ fighter1: 'aang-airbending-only', fighter2: 'ozai-not-comet-enhanced', location: 'fire-nation-capital', timeOfDay: 'night' },
{ fighter1: 'katara', fighter2: 'azula', location: 'ba-sing-se', timeOfDay: 'night' },
{ fighter1: 'toph-beifong', fighter2: 'mai', location: 'omashu', timeOfDay: 'day' },
{ fighter1: 'zuko', fighter2: 'ty-lee', location: 'boiling-rock', timeOfDay: 'day' },

// === ANTAGONISTS vs ANTAGONISTS ===
{ fighter1: 'azula', fighter2: 'ozai-not-comet-enhanced', location: 'fire-nation-capital', timeOfDay: 'day' },
{ fighter1: 'mai', fighter2: 'ty-lee', location: 'ba-sing-se', timeOfDay: 'day' },
{ fighter1: 'ozai-not-comet-enhanced', fighter2: 'azula', location: 'eastern-air-temple', timeOfDay: 'night' },
{ fighter1: 'ty-lee', fighter2: 'mai', location: 'si-wong-desert', timeOfDay: 'day' },

// === MASTERS vs GAANG ===
{ fighter1: 'pakku', fighter2: 'katara', location: 'northern-water-tribe', timeOfDay: 'night' },
{ fighter1: 'bumi', fighter2: 'aang-airbending-only', location: 'omashu', timeOfDay: 'day' },
{ fighter1: 'jeong-jeong', fighter2: 'zuko', location: 'fire-nation-capital', timeOfDay: 'night' },
{ fighter1: 'pakku', fighter2: 'sokka', location: 'kyoshi-island', timeOfDay: 'day' },
{ fighter1: 'bumi', fighter2: 'toph-beifong', location: 'great-divide', timeOfDay: 'day' },
{ fighter1: 'jeong-jeong', fighter2: 'katara', location: 'foggy-swamp', timeOfDay: 'night' },

// === MASTERS vs ANTAGONISTS ===
{ fighter1: 'pakku', fighter2: 'azula', location: 'northern-water-tribe', timeOfDay: 'night' },
{ fighter1: 'bumi', fighter2: 'ozai-not-comet-enhanced', location: 'omashu', timeOfDay: 'day' },
{ fighter1: 'jeong-jeong', fighter2: 'mai', location: 'fire-nation-capital', timeOfDay: 'night' },
{ fighter1: 'pakku', fighter2: 'ty-lee', location: 'eastern-air-temple', timeOfDay: 'day' },
{ fighter1: 'bumi', fighter2: 'azula', location: 'si-wong-desert', timeOfDay: 'day' },
{ fighter1: 'jeong-jeong', fighter2: 'ozai-not-comet-enhanced', location: 'boiling-rock', timeOfDay: 'night' },

// === MASTERS vs MASTERS (Mirror/Clash) ===
{ fighter1: 'pakku', fighter2: 'jeong-jeong', location: 'fire-nation-capital', timeOfDay: 'day' },
{ fighter1: 'bumi', fighter2: 'pakku', location: 'omashu', timeOfDay: 'day' },
{ fighter1: 'jeong-jeong', fighter2: 'bumi', location: 'great-divide', timeOfDay: 'night' },

// === UNIQUE / CURBSTOMP TESTS ===
{ fighter1: 'katara', fighter2: 'azula', location: 'northern-water-tribe', timeOfDay: 'night' }, // Katara bloodbending curbstomp potential
{ fighter1: 'sokka', fighter2: 'ozai-not-comet-enhanced', location: 'si-wong-desert', timeOfDay: 'day' }, // Sokka heatstroke curbstomp
{ fighter1: 'toph-beifong', fighter2: 'zuko', location: 'boiling-rock', timeOfDay: 'day' }, // Toph metalbending curbstomp
{ fighter1: 'azula', fighter2: 'zuko', location: 'fire-nation-capital', timeOfDay: 'day' }, // Zuko lightning redirection
{ fighter1: 'zuko', fighter2: 'azula', location: 'fire-nation-capital', timeOfDay: 'day' }, // Azula lightning vs Zuko
{ fighter1: 'mai', fighter2: 'pakku', location: 'great-divide', timeOfDay: 'day' }, // Mai accuracy curbstomp
{ fighter1: 'aang-airbending-only', fighter2: 'ozai-not-comet-enhanced', location: 'eastern-air-temple', timeOfDay: 'day' }, // Aang Avatar State curbstomp
{ fighter1: 'bumi', fighter2: 'sokka', location: 'omashu', timeOfDay: 'day' }, // Bumi Omashu advantage
{ fighter1: 'ty-lee', fighter2: 'katara', location: 'omashu', timeOfDay: 'day' }, // Ty Lee chi-blocking in Omashu chutes
{ fighter1: 'sokka', fighter2: 'ty-lee', location: 'foggy-swamp', timeOfDay: 'day' }, // Sokka low int against Ty Lee
{ fighter1: 'katara', fighter2: 'toph-beifong', location: 'si-wong-desert', timeOfDay: 'day' }, // Katara water scarcity disadvantage

// === ADDITIONAL COMBINATIONS (Fill to 100) ===
{ fighter1: 'zuko', fighter2: 'katara', location: 'northern-water-tribe', timeOfDay: 'night' },
{ fighter1: 'aang-airbending-only', fighter2: 'sokka', location: 'eastern-air-temple', timeOfDay: 'day' },
{ fighter1: 'toph-beifong', fighter2: 'katara', location: 'ba-sing-se', timeOfDay: 'day' },
{ fighter1: 'azula', fighter2: 'mai', location: 'fire-nation-capital', timeOfDay: 'day' },
{ fighter1: 'pakku', fighter2: 'aang-airbending-only', location: 'kyoshi-island', timeOfDay: 'day' },
{ fighter1: 'bumi', fighter2: 'jeong-jeong', location: 'ba-sing-se', timeOfDay: 'day' },
{ fighter1: 'jeong-jeong', fighter2: 'sokka', location: 'omashu', timeOfDay: 'night' },
{ fighter1: 'mai', fighter2: 'ozai-not-comet-enhanced', location: 'boiling-rock', timeOfDay: 'day' },
{ fighter1: 'ty-lee', fighter2: 'sokka', location: 'ba-sing-se', timeOfDay: 'day' },
{ fighter1: 'sokka', fighter2: 'aang-airbending-only', location: 'si-wong-desert', timeOfDay: 'day' },
{ fighter1: 'katara', fighter2: 'zuko', location: 'boiling-rock', timeOfDay: 'day' },
{ fighter1: 'toph-beifong', fighter2: 'sokka', location: 'foggy-swamp', timeOfDay: 'night' },
{ fighter1: 'azula', fighter2: 'jeong-jeong', location: 'fire-nation-capital', timeOfDay: 'day' },
{ fighter1: 'ozai-not-comet-enhanced', fighter2: 'bumi', location: 'great-divide', timeOfDay: 'day' },
{ fighter1: 'mai', fighter2: 'katara', location: 'kyoshi-island', timeOfDay: 'day' },
{ fighter1: 'ty-lee', fighter2: 'aang-airbending-only', location: 'eastern-air-temple', timeOfDay: 'day' },
{ fighter1: 'pakku', fighter2: 'sokka', location: 'northern-water-tribe', timeOfDay: 'night' },
{ fighter1: 'bumi', fighter2: 'toph-beifong', location: 'omashu', timeOfDay: 'night' },
{ fighter1: 'jeong-jeong', fighter2: 'azula', location: 'si-wong-desert', timeOfDay: 'day' },
{ fighter1: 'sokka', fighter2: 'katara', location: 'foggy-swamp', timeOfDay: 'day' },
{ fighter1: 'aang-airbending-only', fighter2: 'zuko', location: 'great-divide', timeOfDay: 'night' },
{ fighter1: 'katara', fighter2: 'toph-beifong', location: 'eastern-air-temple', timeOfDay: 'day' },
{ fighter1: 'zuko', fighter2: 'ozai-not-comet-enhanced', location: 'boiling-rock', timeOfDay: 'day' },
{ fighter1: 'toph-beifong', fighter2: 'mai', location: 'fire-nation-capital', timeOfDay: 'night' },
{ fighter1: 'azula', fighter2: 'ty-lee', location: 'ba-sing-se', timeOfDay: 'day' },
{ fighter1: 'ozai-not-comet-enhanced', fighter2: 'pakku', location: 'northern-water-tribe', timeOfDay: 'night' },
{ fighter1: 'mai', fighter2: 'bumi', location: 'omashu', timeOfDay: 'day' },
{ fighter1: 'ty-lee', fighter2: 'jeong-jeong', location: 'kyoshi-island', timeOfDay: 'day' },
{ fighter1: 'sokka', fighter2: 'azula', location: 'fire-nation-capital', timeOfDay: 'day' },
{ fighter1: 'aang-airbending-only', fighter2: 'ozai-not-comet-enhanced', location: 'great-divide', timeOfDay: 'day' },
{ fighter1: 'katara', fighter2: 'azula', location: 'si-wong-desert', timeOfDay: 'night' },
{ fighter1: 'toph-beifong', fighter2: 'zuko', location: 'boiling-rock', timeOfDay: 'day' },
{ fighter1: 'zuko', fighter2: 'katara', location: 'kyoshi-island', timeOfDay: 'day' },
{ fighter1: 'azula', fighter2: 'mai', location: 'si-wong-desert', timeOfDay: 'day' },
{ fighter1: 'ozai-not-comet-enhanced', fighter2: 'ty-lee', location: 'eastern-air-temple', timeOfDay: 'day' },
{ fighter1: 'pakku', fighter2: 'bumi', location: 'great-divide', timeOfDay: 'night' },
{ fighter1: 'jeong-jeong', fighter2: 'pakku', location: 'foggy-swamp', timeOfDay: 'day' },
{ fighter1: 'bumi', fighter2: 'sokka', location: 'ba-sing-se', timeOfDay: 'day' },
{ fighter1: 'mai', fighter2: 'jeong-jeong', location: 'kyoshi-island', timeOfDay: 'night' },
{ fighter1: 'ty-lee', fighter2: 'pakku', location: 'northern-water-tribe', timeOfDay: 'night' },
{ fighter1: 'sokka', fighter2: 'bumi', location: 'omashu', timeOfDay: 'day' },
{ fighter1: 'aang-airbending-only', fighter2: 'jeong-jeong', location: 'eastern-air-temple', timeOfDay: 'day' },
{ fighter1: 'katara', fighter2: 'pakku', location: 'si-wong-desert', timeOfDay: 'day' },
{ fighter1: 'toph-beifong', fighter2: 'ozai-not-comet-enhanced', location: 'fire-nation-capital', timeOfDay: 'night' },
{ fighter1: 'zuko', fighter2: 'mai', location: 'boiling-rock', timeOfDay: 'day' },
{ fighter1: 'azula', fighter2: 'ty-lee', location: 'omashu', timeOfDay: 'day' },
{ fighter1: 'ozai-not-comet-enhanced', fighter2: 'pakku', location: 'fire-nation-capital', timeOfDay: 'day' },
{ fighter1: 'pakku', fighter2: 'jeong-jeong', location: 'northern-water-tribe', timeOfDay: 'night' },
{ fighter1: 'bumi', fighter2: 'aang-airbending-only', location: 'great-divide', timeOfDay: 'day' },
{ fighter1: 'jeong-jeong', fighter2: 'katara', location: 'ba-sing-se', timeOfDay: 'day' },
{ fighter1: 'mai', fighter2: 'sokka', location: 'kyoshi-island', timeOfDay: 'day' },
{ fighter1: 'ty-lee', fighter2: 'zuko', location: 'si-wong-desert', timeOfDay: 'night' },
{ fighter1: 'sokka', fighter2: 'pakku', location: 'fire-nation-capital', timeOfDay: 'day' },
{ fighter1: 'aang-airbending-only', fighter2: 'bumi', location: 'omashu', timeOfDay: 'night' },
{ fighter1: 'katara', fighter2: 'jeong-jeong', location: 'eastern-air-temple', timeOfDay: 'day' },
{ fighter1: 'toph-beifong', fighter2: 'mai', location: 'si-wong-desert', timeOfDay: 'day' },
{ fighter1: 'zuko', fighter2: 'pakku', location: 'northern-water-tribe', timeOfDay: 'day' },
{ fighter1: 'azula', fighter2: 'bumi', location: 'ba-sing-se', timeOfDay: 'night' },
{ fighter1: 'ozai-not-comet-enhanced', fighter2: 'jeong-jeong', location: 'boiling-rock', timeOfDay: 'day' },
{ fighter1: 'mai', fighter2: 'pakku', location: 'foggy-swamp', timeOfDay: 'night' },
{ fighter1: 'ty-lee', fighter2: 'bumi', location: 'eastern-air-temple', timeOfDay: 'day' },
{ fighter1: 'sokka', fighter2: 'jeong-jeong', location: 'great-divide', timeOfDay: 'day' },
{ fighter1: 'aang-airbending-only', fighter2: 'mai', location: 'kyoshi-island', timeOfDay: 'night' },
{ fighter1: 'katara', fighter2: 'ty-lee', location: 'northern-water-tribe', timeOfDay: 'day' },
{ fighter1: 'toph-beifong', fighter2: 'pakku', location: 'omashu', timeOfDay: 'day' },
{ fighter1: 'zuko', fighter2: 'jeong-jeong', location: 'fire-nation-capital', timeOfDay: 'night' },
{ fighter1: 'azula', fighter2: 'ozai-not-comet-enhanced', location: 'great-divide', timeOfDay: 'day' },
{ fighter1: 'ozai-not-comet-enhanced', fighter2: 'mai', location: 'si-wong-desert', timeOfDay: 'day' },
{ fighter1: 'pakku', fighter2: 'ty-lee', location: 'boiling-rock', timeOfDay: 'night' },
{ fighter1: 'bumi', fighter2: 'jeong-jeong', location: 'fire-nation-capital', timeOfDay: 'day' },
{ fighter1: 'jeong-jeong', fighter2: 'sokka', location: 'foggy-swamp', timeOfDay: 'night' },
{ fighter1: 'mai', fighter2: 'ozai-not-comet-enhanced', location: 'omashu', timeOfDay: 'day' },
{ fighter1: 'ty-lee', fighter2: 'sokka', location: 'great-divide', timeOfDay: 'day' },
{ fighter1: 'sokka', fighter2: 'aang-airbending-only', location: 'kyoshi-island', timeOfDay: 'night' },
{ fighter1: 'katara', fighter2: 'zuko', location: 'eastern-air-temple', timeOfDay: 'day' },
{ fighter1: 'toph-beifong', fighter2: 'azula', location: 'northern-water-tribe', timeOfDay: 'night' },
{ fighter1: 'zuko', fighter2: 'ty-lee', location: 'si-wong-desert', timeOfDay: 'day' },
{ fighter1: 'azula', fighter2: 'ozai-not-comet-enhanced', location: 'boiling-rock', timeOfDay: 'day' },
{ fighter1: 'ozai-not-comet-enhanced', fighter2: 'pakku', location: 'eastern-air-temple', timeOfDay: 'night' },
{ fighter1: 'pakku', fighter2: 'bumi', location: 'ba-sing-se', timeOfDay: 'day' },
{ fighter1: 'bumi', fighter2: 'jeong-jeong', location: 'kyoshi-island', timeOfDay: 'day' },
{ fighter1: 'jeong-jeong', fighter2: 'mai', location: 'great-divide', timeOfDay: 'night' },
{ fighter1: 'mai', fighter2: 'ty-lee', location: 'fire-nation-capital', timeOfDay: 'day' },
{ fighter1: 'ty-lee', fighter2: 'pakku', location: 'foggy-swamp', timeOfDay: 'night' },
{ fighter1: 'sokka', fighter2: 'jeong-jeong', location: 'eastern-air-temple', timeOfDay: 'day' },
{ fighter1: 'aang-airbending-only', fighter2: 'mai', location: 'si-wong-desert', timeOfDay: 'night' },
{ fighter1: 'katara', fighter2: 'ty-lee', location: 'boiling-rock', timeOfDay: 'day' },
{ fighter1: 'toph-beifong', fighter2: 'pakku', location: 'great-divide', timeOfDay: 'day' },
{ fighter1: 'zuko', fighter2: 'azula', location: 'omashu', timeOfDay: 'night' },
{ fighter1: 'azula', fighter2: 'jeong-jeong', location: 'northern-water-tribe', timeOfDay: 'day' },
{ fighter1: 'ozai-not-comet-enhanced', fighter2: 'sokka', location: 'fire-nation-capital', timeOfDay: 'night' },
{ fighter1: 'pakku', fighter2: 'katara', location: 'foggy-swamp', timeOfDay: 'day' },
{ fighter1: 'bumi', fighter2: 'toph-beifong', location: 'ba-sing-se', timeOfDay: 'night' },
{ fighter1: 'jeong-jeong', fighter2: 'aang-airbending-only', location: 'kyoshi-island', timeOfDay: 'day' },
{ fighter1: 'mai', fighter2: 'sokka', location: 'eastern-air-temple', timeOfDay: 'day' },
{ fighter1: 'ty-lee', fighter2: 'katara', location: 'si-wong-desert', timeOfDay: 'night' },
{ fighter1: 'sokka', fighter2: 'zuko', location: 'fire-nation-capital', timeOfDay: 'day' },
{ fighter1: 'aang-airbending-only', fighter2: 'toph-beifong', location: 'boiling-rock', timeOfDay: 'night' },
{ fighter1: 'katara', fighter2: 'sokka', location: 'kyoshi-island', timeOfDay: 'day' },
{ fighter1: 'toph-beifong', fighter2: 'aang-airbending-only', location: 'omashu', timeOfDay: 'day' },
{ fighter1: 'zuko', fighter2: 'azula', location: 'northern-water-tribe', timeOfDay: 'night' },
{ fighter1: 'azula', fighter2: 'zuko', location: 'eastern-air-temple', timeOfDay: 'day' },
{ fighter1: 'ozai-not-comet-enhanced', fighter2: 'ozai-not-comet-enhanced', location: 'fire-nation-capital', timeOfDay: 'day' }, // Mirror match
{ fighter1: 'sokka', fighter2: 'sokka', location: 'kyoshi-island', timeOfDay: 'day' }, // Mirror match
{ fighter1: 'katara', fighter2: 'katara', location: 'northern-water-tribe', timeOfDay: 'night' }, // Mirror match
{ fighter1: 'toph-beifong', fighter2: 'toph-beifong', location: 'omashu', timeOfDay: 'day' }, // Mirror match
{ fighter1: 'aang-airbending-only', fighter2: 'aang-airbending-only', location: 'eastern-air-temple', timeOfDay: 'day' }, // Mirror match
{ fighter1: 'mai', fighter2: 'mai', location: 'ba-sing-se', timeOfDay: 'day' }, // Mirror match
{ fighter1: 'ty-lee', fighter2: 'ty-lee', location: 'foggy-swamp', timeOfDay: 'night' }, // Mirror match
{ fighter1: 'pakku', fighter2: 'pakku', location: 'northern-water-tribe', timeOfDay: 'day' }, // Mirror match
{ fighter1: 'bumi', fighter2: 'bumi', location: 'omashu', timeOfDay: 'day' }, // Mirror match
{ fighter1: 'jeong-jeong', fighter2: 'jeong-jeong', location: 'fire-nation-capital', timeOfDay: 'night' }, // Mirror match

];
'use strict';

export const foggySwamp = {
    id: 'foggy-swamp',
    name: 'The Foggy Swamp',
    description: "A vast, mystical wetland teeming with unique flora and fauna, home to an isolated tribe of waterbenders.",
    environmentalModifiers: {
        air: { damage: -15, energy: 10, reason: "The dense, heavy fog dampens air currents." },
        fire: { damage: -25, energy: 20, reason: "The dampness of the swamp makes firebending difficult." },
        earth: { damage: 10, energy: -5, reason: "The soft, muddy ground is easily manipulated." },
        water: { damage: 25, energy: -20, reason: "The entire swamp is a massive source of water." },
        ice: { damage: 20, energy: -15, reason: "The abundant water can be readily frozen." },
        physical: { damage: -10, energy: 5, reason: "The murky water and tangled roots hinder movement." },
        mobility_move: { damage: -20, energy: 15, reason: "The swamp's terrain makes agile movements difficult." },
        evasive: { damage: 15, energy: -10, reason: "The fog and dense vegetation provide excellent cover for hiding." },
        ranged_attack: { damage: -30, energy: 25, reason: "The thick fog severely obscures visibility for ranged attacks." }
    },
    fragility: 40,
    background: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/d6d7c1b2-0ee9-4c1d-8409-df66708de1b2/dcl1087-f747ae92-7c52-425c-9e39-cb44a8ac1192.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2Q2ZDdjMWIyLTBlZTktNGMxZC04NDA5LWRmNjY3MDhkZTFiMlwvZGNsMTA4Ny1mNzQ3YWU5Mi03YzUyLTQyNWMtOWUzOS1jYjQ0YThhYzExOTIucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQnXX0.JlX6wz3VT7glihqrMtryIFr7catdfCSucw4iB53M_wg',
}; 
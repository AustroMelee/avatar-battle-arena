'use strict';

export const boilingRock = {
    id: 'boiling-rock',
    name: 'The Boiling Rock',
    description: "A high-security prison in the middle of a boiling lake, with metal structures and oppressive heat.",
    environmentalModifiers: {
        air: { damage: -10, energy: 5, reason: "The hot, heavy air slightly hinders airbending." },
        fire: { damage: 15, energy: -10, reason: "The intense heat empowers firebending." },
        earth: { damage: -50, energy: 50, reason: "There is no earth to bend, only metal." },
        water: { damage: -90, energy: 90, reason: "The surrounding water is boiling hot and unusable." },
        ice: { damage: -100, energy: 100, reason: "Ice instantly sublimates into steam." },
        physical: { damage: 5, energy: -5, reason: "The metal structures provide advantages for physical combat." },
        mobility_move: { damage: -15, energy: 10, reason: "Confined walkways and guard towers limit mobility." },
        evasive: { damage: -10, energy: 5, reason: "Limited space makes evasion difficult." },
        ranged_attack: { damage: 10, energy: -5, reason: "Guard towers provide clear lines of sight for ranged attacks." }
    },
    fragility: 20,
    background: 'https://static1.cbrimages.com/wordpress/wp-content/uploads/2022/02/boiling-rock.jpg',
}; 
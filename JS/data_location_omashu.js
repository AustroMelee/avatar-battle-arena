'use strict';

export const omashu = {
    id: 'omashu',
    name: 'Omashu Delivery Chutes',
    description: "A vast, city-wide network of stone and metal chutes for transporting goods, creating a chaotic and unpredictable battlefield.",
    environmentalModifiers: {
        air: { damage: 10, energy: -5, reason: "The open chutes and verticality create strong air currents." },
        fire: { damage: -10, energy: 5, reason: "The stone and metal environment offers little to burn." },
        earth: { damage: 25, energy: -20, reason: "The entire city of Omashu is a paradise for earthbenders." },
        water: { damage: -40, energy: 30, reason: "Water sources are very limited in the stone city." },
        ice: { damage: -50, energy: 40, reason: "The lack of water makes icebending nearly impossible." },
        physical: { damage: 5, energy: 0, reason: "The chutes and structures provide many opportunities for unconventional attacks." },
        mobility_move: { damage: 25, energy: -20, reason: "The delivery system is a playground for highly mobile fighters." },
        evasive: { damage: 15, energy: -10, reason: "The complex network of chutes offers endless escape routes." },
        ranged_attack: { damage: -25, energy: 15, reason: "The twisting chutes make it difficult to maintain line of sight." }
    },
    fragility: 50,
    background: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2F64.media.tumblr.com%2F8475f62de8844462709cb9c9d47458e2%2Ftumblr_o87pc3jINC1ug9atlo3_1280.png&f=1&nofb=1&ipt=d90f8eeb356860f047bf1d607ed017d343ab6a2a1a4b2899c333a3e5889d8b85',
}; 
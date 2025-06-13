'use strict';

// This file provides detailed environmental data for each location.
// This data will be used by the battle engine to apply real-time modifiers.

export const locationConditions = {
    'eastern-air-temple': {
        airRich: true,
        isVertical: true,
        isExposed: true,
        wind: 0.3, // Strong wind currents
        notes: "High altitude and strong winds favor airbenders."
    },
    'northern-water-tribe': {
        waterRich: true,
        iceRich: true,
        isSlippery: true,
        isCold: true,
        notes: "An abundance of water and ice makes this a fortress for waterbenders."
    },
    'ba-sing-se': {
        isUrban: true,
        isDense: true,
        earthRich: true,
        hasCover: true,
        notes: "Tight streets and abundant earth favor tactical and earthbending combat."
    },
    'si-wong-desert': {
        isSandy: true,
        isHot: true,
        hasShiftingGround: true,
        lowVisibility: true,
        notes: "Scorching heat and lack of water severely penalize waterbenders."
    },
    'foggy-swamp': {
        waterRich: true,
        earthRich: true,
        plantsRich: true,
        isDense: true,
        lowVisibility: true,
        isSlippery: true,
        notes: "A unique environment where water and earthbending can be uniquely applied."
    },
    'boiling-rock': {
        isIndustrial: true,
        isHot: true,
        metalRich: true,
        isPrecarious: true,
        waterRich: true, // The boiling lake is a water source, but a dangerous one.
        notes: "Metal and heat are abundant, but the terrain is treacherous."
    },
    'fire-nation-capital': {
        isUrban: true,
        isDense: true,
        earthRich: true, // Cities are made of earth/rock
        isHot: true,
        metalRich: true,
        isIndustrial: true,
        notes: "The heart of the Fire Nation empowers firebenders."
    },
    'omashu': {
        isUrban: true,
        isDense: true,
        earthRich: true,
        isVertical: true,
        hasCover: true,
        isPrecarious: true,
        notes: "A massive, tiered city of stone perfect for earthbenders."
    },
    'great-divide': {
        isExposed: true,
        isRocky: true,
        isVertical: true,
        isPrecarious: true,
        earthRich: true,
        notes: "A sheer canyon with little cover, favoring those with high mobility or powerful earthbending."
    },
    'kyoshi-island': {
        isCoastal: true,
        waterRich: true,
        earthRich: true,
        hasCover: true,
        plantsRich: true,
        notes: "A balanced environment with access to multiple elements."
    }
};
// FILE: js/location-battle-conditions.js
'use strict';

// This file provides detailed environmental data for each location.
// This data will be used by the battle engine to apply real-time modifiers.

export const locationConditions = {
'eastern-air-temple': {
airRich: true,
isVertical: true,
isExposed: true,
wind: 0.3, // Strong wind currents
fragility: 0.5, // Ancient structures and natural rock formations have moderate fragility
damageThresholds: { // % of total damage capacity
minor: 10, moderate: 25, severe: 50, catastrophic: 75
},
environmentalImpacts: {
minor: [
"Dust billows from cracked stone.",
"Small sections of the ancient structure begin to crumble.",
"Loose rock slides down cliff faces."
],
moderate: [
"A section of a tiered platform collapses with a groan.",
"Ancient carvings are obscured by falling debris.",
"The strong winds whip up clouds of shattered stone and dust."
],
severe: [
"A large section of the temple's foundation gives way, threatening further collapse.",
"Whole sections of cliff crumble into the abyss.",
"The air currents become unpredictable, swirling with immense debris."
],
catastrophic: [
"The once serene Eastern Air Temple is scarred by massive fissures and collapsing structures.",
"The sacred grounds are reduced to a perilous landscape of falling rock and violent updrafts.",
"The very air vibrates with the sound of grinding earth and crumbling masonry."
]
},
// NEW: Environmental Modifiers for move effectiveness and energy cost
environmentalModifiers: {
air: { damageMultiplier: 1.15, energyCostModifier: 0.9, description: "Airbending flows freely with the winds." },
fire: { damageMultiplier: 0.8, energyCostModifier: 1.2, description: "Fire struggles against the high winds." },
earth: { damageMultiplier: 1.0, energyCostModifier: 1.05, description: "Earthbending is challenging on unstable platforms." },
physical: { damageMultiplier: 0.9, energyCostModifier: 1.05, description: "Physical attacks are hindered by footing and wind." }
},
disabledElements: [], // No specific element bans here
notes: "High altitude and strong winds favor airbenders. Structures are old and somewhat brittle."
},
'northern-water-tribe': {
waterRich: true,
iceRich: true,
isSlippery: true,
isCold: true,
fragility: 0.6, // Ice structures are somewhat fragile, but water can be reformed
damageThresholds: {
minor: 10, moderate: 25, severe: 50, catastrophic: 75
},
environmentalImpacts: {
minor: [
"Cracks spiderweb across the ice bridges.",
"A spray of slush erupts from the canals.",
"Distant ice formations begin to groan and shift."
],
moderate: [
"Sections of ice pathways shatter, plunging into the freezing water.",
"Waterbending constructs begin to destabilize from the force.",
"The intricate ice architecture shows significant fracturing."
],
severe: [
"Large chunks of ice infrastructure break off, creating dangerous floes.",
"The canals churn violently as ice dams are breached.",
"The cold wind carries stinging shards of ice and snow."
],
catastrophic: [
"The beautiful ice city is torn apart, leaving a chaotic seascape of shattered ice and raging water.",
"The tranquil canals are now violent currents, threatening to consume all in their path.",
"What remains are icy ruins, a testament to the battle's ferocity."
]
},
environmentalModifiers: {
water: { damageMultiplier: 1.15, energyCostModifier: 0.9, description: "Waterbending thrives with abundant water and ice." },
ice: { damageMultiplier: 1.2, energyCostModifier: 0.85, description: "Ice bending is exceptionally potent here." },
fire: { damageMultiplier: 1.5, energyCostModifier: 1.2, description: "Fire melts and shatters ice, but faces moisture." },
earth: { damageMultiplier: 0.7, energyCostModifier: 1.3, description: "Earthbending is limited in icy water terrain." }
},
disabledElements: [],
notes: "An abundance of water and ice makes this a fortress for waterbenders. Ice structures are vulnerable to heat."
},
'ba-sing-se': {
isUrban: true,
isDense: true,
earthRich: true,
hasCover: true,
fragility: 0.7, // Buildings and city infrastructure are relatively fragile
damageThresholds: {
minor: 10, moderate: 25, severe: 50, catastrophic: 75
},
environmentalImpacts: {
minor: [
"Dust rises from cracked cobblestones.",
"A street vendor's cart is overturned, cabbages scattering.",
"A small section of a building facade crumbles."
],
moderate: [
"Roofs buckle and glass shatters as buildings take direct hits.",
"Deep fissures appear in the packed earth of the streets.",
"Civilians flee in terror as the battle intensifies, leaving debris-strewn alleys."
],
severe: [
"Entire sections of city blocks begin to collapse, sending dust clouds skyward.",
"The once-impenetrable walls show alarming cracks and structural failure.",
"The urban landscape is transformed into a maze of rubble and falling masonry."
],
catastrophic: [
"Ba Sing Se's lower ring is reduced to a smoking, crumbling ruin, barely recognizable.",
"The air chokes with dust and the cries of the displaced, a testament to utter devastation.",
"What once stood as a symbol of peace is now a monument to the battle's destructive power."
]
},
environmentalModifiers: {
earth: { damageMultiplier: 1.3, energyCostModifier: 0.9, description: "Earthbending tears through stone and pavement." },
fire: { damageMultiplier: 1.0, energyCostModifier: 1.0, description: "Fire causes fires in urban settings." },
air: { damageMultiplier: 0.9, energyCostModifier: 1.05, description: "Airbending primarily pushes, less structural damage." },
physical: { damageMultiplier: 1.0, energyCostModifier: 1.0, description: "Tight spaces can impact physical combat." }
},
disabledElements: [],
notes: "Tight streets and abundant earth favor tactical and earthbending combat. Urban structures are vulnerable."
},
'si-wong-desert': {
isSandy: true,
isHot: true,
hasShiftingGround: true,
lowVisibility: true,
fragility: 0.2, // Natural desert is very resilient to damage, mostly just shifts sand
damageThresholds: {
minor: 10, moderate: 25, severe: 50, catastrophic: 75
},
environmentalImpacts: {
minor: [
"Sand whips up into stinging gusts.",
"Small dunes are displaced.",
"The ground shudders, creating minor sand geysers."
],
moderate: [
"Large sandstorms are stirred, reducing visibility further.",
"Deeper fissures appear in the desert floor.",
"Oasis flora is uprooted and buried under shifting sands."
],
severe: [
"Massive sand whirlwinds tear across the landscape, obscuring everything.",
"Canyons widen and shift as the very ground gives way.",
"The desert environment becomes a chaotic, blinding maelstrom of sand and heat."
],
catastrophic: [
"The desert is utterly transformed, vast dunes are flattened, and new canyons carved by destructive forces.",
"A blinding sandstorm rages, making continued combat almost impossible.",
"The once featureless expanse is now a scarred, tortured wasteland."
]
},
environmentalModifiers: {
fire: { damageMultiplier: 0.9, energyCostModifier: 0.95, description: "Fire has limited structural impact but intensifies heat." },
earth: { damageMultiplier: 1.5, energyCostModifier: 0.85, description: "Earthbending can reshape the sandy terrain dramatically." },
water: { damageMultiplier: 0.5, energyCostModifier: 1.5, description: "Waterbending struggles to cause widespread damage in dry sand and intense heat." },
air: { damageMultiplier: 1.0, energyCostModifier: 0.95, description: "Airbending can manipulate sand, but costs energy." }
},
disabledElements: ['water', 'ice'], // Water and Ice bending are disabled (except canteen moves)
notes: "Scorching heat and lack of water severely penalize waterbenders. Sand shifts constantly."
},
'foggy-swamp': {
waterRich: true,
earthRich: true,
plantsRich: true,
isDense: true,
lowVisibility: true,
isSlippery: true,
fragility: 0.4, // Natural environment, plants can be damaged, but ground/water absorb much
damageThresholds: {
minor: 10, moderate: 25, severe: 50, catastrophic: 75
},
environmentalImpacts: {
minor: [
"Muck splashes as roots are torn up.",
"The thick fog briefly disperses in patches.",
"Ancient swamp trees groan from impacts."
],
moderate: [
"Massive trees are uprooted, crashing into the murky water.",
"The swamp's mist thickens with disturbed spores and debris.",
"The ground becomes an even more treacherous bog of mud and shattered flora."
],
severe: [
"The banyan-grove tree's roots themselves show deep scarring.",
"Sections of the swamp become impassable due to deep, destructive churns.",
"The air fills with the smell of disturbed earth and rotting vegetation."
],
catastrophic: [
"The ancient swamp is scarred, its vibrant ecosystem ravaged by uncontrolled power.",
"The Banyan-Grove tree stands defiant but wounded, its surroundings a desolate mire.",
"What was once a living, breathing landscape is now a churned, broken battlefield."
]
},
environmentalModifiers: {
water: { damageMultiplier: 1.1, energyCostModifier: 0.9, description: "Waterbending amplifies the swamp's natural currents." },
earth: { damageMultiplier: 1.2, energyCostModifier: 0.95, description: "Earthbending causes massive mudslides and root damage." },
fire: { damageMultiplier: 1.3, energyCostModifier: 1.15, description: "Fire creates steam and burns vegetation, but struggles with moisture." },
air: { damageMultiplier: 1.0, energyCostModifier: 1.1, description: "Airbending is partially absorbed by dense fog and humidity." },
physical: { damageMultiplier: 0.9, energyCostModifier: 1.1, description: "Physical combat is hampered by thick muck and vegetation." }
},
disabledElements: [],
notes: "A unique environment where water and earthbending can be uniquely applied. Dense vegetation and muck."
},
'boiling-rock': {
isIndustrial: true,
isHot: true,
metalRich: true,
isPrecarious: true,
waterRich: true, // The boiling lake is a water source, but a dangerous one.
fragility: 0.8, // Industrial structures, metal walkways are very fragile when attacked
damageThresholds: {
minor: 10, moderate: 25, severe: 50, catastrophic: 75
},
environmentalImpacts: {
minor: [
"Sparks fly as metal walkways are dented.",
"A geyser of scalding steam erupts from a damaged pipe.",
"The precarious walkways vibrate dangerously."
],
moderate: [
"Metal scaffolding collapses into the boiling lake below.",
"Pipes rupture, spraying superheated water and steam across the arena.",
"The industrial complex groans under immense structural strain."
],
severe: [
"Entire sections of the prison's outer structure begin to buckle and fall.",
"The air becomes thick with toxic steam and smoke from damaged machinery.",
"The boiling lake itself seems to churn more violently, threatening to overflow."
],
catastrophic: [
"The Boiling Rock is a twisted ruin of molten metal and scalding water, a testament to ultimate destruction.",
"The prison, once a symbol of the Fire Nation's might, is now a burning, sinking wreck.",
"Survival itself becomes a challenge amidst the collapsing industrial nightmare."
]
},
environmentalModifiers: {
fire: { damageMultiplier: 1.2, energyCostModifier: 0.9, description: "Fire melts and warps metal, thriving in the heat." },
earth: { damageMultiplier: 1.1, energyCostModifier: 1.0, description: "Earthbending causes structural collapse of metal." },
water: { damageMultiplier: 1.0, energyCostModifier: 1.0, description: "Waterbending can disturb the boiling lake, causing steam explosions." },
metal: { damageMultiplier: 1.3, energyCostModifier: 0.85, description: "Metalbending is empowered by the abundant metal structures." },
physical: { damageMultiplier: 1.0, energyCostModifier: 1.1, description: "Precarious footing and extreme heat impact physical combat." }
},
// Waterbending is allowed, but it's boiling water (or steam). Canteen moves are normal.
// No specific disabledElements but water moves might be re-flavored or have special effects.
disabledElements: [],
notes: "Metal and heat are abundant, but the terrain is treacherous. Extremely volatile environment. Water is present but dangerous."
},
'fire-nation-capital': {
isUrban: true,
isDense: true,
earthRich: true, // Cities are made of earth/rock
isHot: true,
metalRich: true,
isIndustrial: true,
fragility: 0.75, // Grand public spaces are built solid but can still be damaged dramatically
damageThresholds: {
minor: 10, moderate: 25, severe: 50, catastrophic: 75
},
environmentalImpacts: {
minor: [
"Cracks appear in the elaborate pavement designs.",
"Statues are chipped by stray attacks.",
"The air shimmers with distorted heat from impacts."
],
moderate: [
"Ornate buildings are scorched and their facades crumble.",
"Sections of the plaza pavement explode outwards, sending debris flying.",
"The very air seems to crackle with uncontrolled energy."
],
severe: [
"Grand arches collapse, sending shockwaves through the plaza.",
"The central fountain shatters, its waters turning to scalding steam.",
"Once pristine streets are choked with rubble and smoke."
],
catastrophic: [
"The Fire Nation Capital Plaza, a symbol of empire, is reduced to a smoking, ravaged ruin.",
"The air is thick with ash and the smell of burning stone, a true inferno.",
"A once-majestic urban landscape is now a monument to chaos and unchecked power."
]
},
environmentalModifiers: {
fire: { damageMultiplier: 1.2, energyCostModifier: 0.85, description: "Fire spreads rapidly in a dry, urban setting and is empowered." },
lightning: { damageMultiplier: 1.3, energyCostModifier: 0.9, description: "Lightning arcs, causing widespread damage and fires." },
earth: { damageMultiplier: 1.1, energyCostModifier: 1.0, description: "Earthbending causes widespread structural damage." },
water: { damageMultiplier: 0.8, energyCostModifier: 1.2, description: "Waterbending struggles against the dry, hot environment." }
},
disabledElements: [],
notes: "The heart of the Fire Nation empowers firebenders. Grand but still destructible."
},
'omashu': {
isUrban: true,
isDense: true,
earthRich: true,
isVertical: true,
hasCover: true,
isPrecarious: true,
fragility: 0.65, // Massive stone structures, but can be brought down
damageThresholds: {
minor: 10, moderate: 25, severe: 50, catastrophic: 75
},
environmentalImpacts: {
minor: [
"A delivery chute rattles violently, nearly dislodging its contents.",
"Loose stones rain down from the towering buildings.",
"The ground shudders beneath the impact."
],
moderate: [
"Sections of stone pathways collapse, revealing dizzying drops below.",
"The unique delivery chute system is severely damaged, sending packages crashing.",
"Dust clouds engulf entire sections of the tiered city."
],
severe: [
"Massive support columns crack and begin to give way.",
"Entire sections of the cliffside city slide and crumble.",
"The once-bustling city is eerily silent, covered in a thick layer of rock dust."
],
catastrophic: [
"Omashu, the great Earth Kingdom city, is a testament to raw, unchecked power, its tiers shattered and collapsing.",
"The air rings with the sounds of grinding earth and the groans of dying stone.",
"What remains is a perilous landscape of broken rock and treacherous chasms."
]
},
environmentalModifiers: {
earth: { damageMultiplier: 1.5, energyCostModifier: 0.8, description: "Earthbending can tear Omashu apart with ease and low energy cost." },
metal: { damageMultiplier: 1.2, energyCostModifier: 0.95, description: "Metalbending can warp the city's infrastructure." },
fire: { damageMultiplier: 0.9, energyCostModifier: 1.1, description: "Fire has less effect on solid stone and can be diffused." },
air: { damageMultiplier: 1.05, energyCostModifier: 0.95, description: "Airbending can utilize verticality for increased mobility." },
physical: { damageMultiplier: 1.0, energyCostModifier: 1.05, description: "Verticality and precarious footing can hinder physical attacks." }
},
disabledElements: [],
notes: "A massive, tiered city of stone perfect for earthbenders. Gravity is a significant factor."
},
'great-divide': {
isExposed: true,
isRocky: true,
isVertical: true,
isPrecarious: true,
earthRich: true,
fragility: 0.3, // Natural canyon, mostly just causes rockslides or widens fissures
damageThresholds: {
minor: 10, moderate: 25, severe: 50, catastrophic: 75
},
environmentalImpacts: {
minor: [
"Small pebbles dislodge from the canyon walls.",
"The echo of impacts rings through the chasm.",
"Dust puffs up from the dry riverbed."
],
moderate: [
"A significant rockslide thunders down the cliff face.",
"New cracks appear in the sheer rock walls, revealing deeper fissures.",
"The chasm itself seems to widen under the pressure."
],
severe: [
"Massive boulders detach and plummet to the canyon floor, shaking the very ground.",
"Sections of the canyon wall begin to collapse entirely.",
"The air is thick with rock dust, making breathing difficult."
],
catastrophic: [
"The Great Divide is transformed into a chaotic abyss of shifting rock and active landslides.",
"The canyon's sheer walls are now crumbled, treacherous slopes.",
"The raw power of the battle has irrevocably reshaped the natural landscape."
]
},
environmentalModifiers: {
earth: { damageMultiplier: 1.4, energyCostModifier: 0.9, description: "Earthbending causes massive geological shifts with ease." },
air: { damageMultiplier: 1.0, energyCostModifier: 1.0, description: "Airbending can dislodge loose scree and move with currents." },
fire: { damageMultiplier: 0.8, energyCostModifier: 1.1, description: "Fire has limited structural effect on solid rock and can be diffused." },
physical: { damageMultiplier: 0.9, energyCostModifier: 1.1, description: "Precarious footing and echoing sounds hinder physical combat." }
},
disabledElements: ['water', 'ice'], // No significant water sources
notes: "A sheer canyon with little cover, favoring those with high mobility or powerful earthbending. Very stable."
},
'kyoshi-island': {
isCoastal: true,
waterRich: true,
earthRich: true,
hasCover: true,
plantsRich: true,
fragility: 0.6, // Village houses are moderately fragile, natural elements less so
damageThresholds: {
minor: 10, moderate: 25, severe: 50, catastrophic: 75
},
environmentalImpacts: {
minor: [
"Ocean spray mixes with kicked-up dust.",
"A small fishing boat bobs wildly from distant impacts.",
"Thatched roofs show minor damage."
],
moderate: [
"Village houses are torn apart, their wooden frames splintering.",
"The coastline is eroded by powerful elemental forces.",
"The tranquil waters of the bay are churned into violent swells."
],
severe: [
"The main village square is devastated, its buildings flattened and docks shattered.",
"The ocean itself seems to rage, sending massive waves crashing inland.",
"The once picturesque island is marred by widespread wreckage and flooding."
],
catastrophic: [
"Kyoshi Island is ravaged, its gentle village obliterated and its natural beauty scarred.",
"The relentless ocean assaults the broken land, reclaiming what the battle has destroyed.",
"A once peaceful sanctuary is now a testament to the brutal force unleashed upon it."
]
},
environmentalModifiers: {
water: { damageMultiplier: 1.3, energyCostModifier: 0.85, description: "Waterbending can unleash the power of the ocean with ease." },
earth: { damageMultiplier: 1.0, energyCostModifier: 1.0, description: "Earthbending can damage village structures and terrain." },
fire: { damageMultiplier: 1.1, energyCostModifier: 1.05, description: "Fire burns wooden structures easily, but moisture can hinder." },
physical: { damageMultiplier: 1.0, energyCostModifier: 1.0, description: "The varied terrain provides balanced physical combat." }
},
disabledElements: [],
notes: "A balanced environment with access to multiple elements. Village structures are relatively fragile."
},
};


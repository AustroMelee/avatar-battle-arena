'use strict';

export const terrainTags = {
    "eastern-air-temple": ["air_rich", "vertical", "exposed", "open"],
    "northern-water-tribe": ["water_rich", "ice_rich", "slippery", "cold", "cramped"],
    "ba-sing-se": ["urban", "dense", "earth_rich", "cover_rich", "cramped"],
    "si-wong-desert": ["sandy", "open", "hot", "exposed", "shifting_ground"],
    "foggy-swamp": ["water_rich", "earth_rich", "plants_rich", "dense", "low_visibility", "slippery", "cramped"],
    "boiling-rock": ["industrial", "enclosed", "hot", "metal_rich", "precarious", "cramped"],
    "fire-nation-capital": ["urban", "dense", "earth_rich", "hot", "cramped", "metal_rich"],
    "omashu": ["urban", "dense", "earth_rich", "vertical", "cramped", "cover_rich"],
    "great-divide": ["open", "exposed", "rocky", "vertical", "high_altitude"],
    "kyoshi-island": ["coastal", "open", "water_rich", "earth_rich", "cover_rich"]
};

export const locations = {
    'eastern-air-temple': { 
        name: "Eastern Air Temple", 
        terrain: "rocky outcrops and tiered platforms", 
        feature: "powerful wind currents and high altitude", 
        has: ['earth', 'air_currents', 'falls'], 
        interactiveElements: ['narrow_ledge', 'wind_currents', 'falls'],
        terrainType: "vertical-challenge",
        featureA: "rushing wind currents",
        featureB: "treacherous tiered platforms",
        featureC: "a narrow cliff ledge"
    },
    'northern-water-tribe': { 
        name: "Northern Water Tribe", 
        terrain: "intricate ice canals and slippery bridges", 
        feature: "endless supply of water and ice", 
        has: ['water', 'ice'], 
        interactiveElements: ['ice_bridge', 'frozen_wall', 'water_canal', 'slippery_terrain', 'ice_shards'],
        terrainType: "aquatic-icy",
        featureA: "the swirling water of the canals",
        featureB: "slippery ice bridges",
        featureC: "a precarious ice formation"
    },
    'ba-sing-se': { 
        name: "Ba Sing Se", 
        terrain: "crowded city streets and massive stone walls", 
        feature: "countless alleyways for an ambush", 
        has: ['earth', 'urban', 'buildings', 'water'], 
        interactiveElements: ['alleyways', 'stone_walls', 'building_rooftops'],
        terrainType: "urban-dense",
        featureA: "the towering stone walls",
        featureB: "the labyrinthine city streets",
        featureC: "a crowded market stall"
    },
    'si-wong-desert': { 
        name: "Si Wong Desert", 
        terrain: "vast, shifting sand dunes", 
        feature: "scorching desert heat and disorienting winds", 
        has: ['sand', 'heat', 'wind'], 
        interactiveElements: ['shifting_sand', 'sand_dunes', 'sandstone_outcrops', 'heat_haze'],
        terrainType: "sandy-open",
        featureA: "the scorching desert heat",
        featureB: "disorienting shimmering heat haze",
        featureC: "a crumbling sandstone outcrop"
    },
    'foggy-swamp': { 
        name: "Foggy Swamp", 
        terrain: "dense, twisting vines and murky water", 
        feature: "disorienting fog and hidden roots", 
        has: ['water', 'earth', 'plants', 'fog'], 
        interactiveElements: ['dense_vines', 'murky_water', 'hidden_roots', 'thick_fog'],
        terrainType: "swamp-dense",
        featureA: "the thick, disorienting fog",
        featureB: "the gnarled, twisting vines",
        featureC: "a treacherous patch of murky water"
    },
    'boiling-rock': { 
        name: "Boiling Rock", 
        terrain: "narrow metal walkways over a boiling lake", 
        feature: "scalding steam vent and volatile water below", 
        has: ['water', 'metal', 'heat', 'steam'], 
        interactiveElements: ['metal_walkways', 'boiling_lake', 'steam_vents', 'precarious_footing'],
        terrainType: "industrial-enclosed",
        featureA: "scalding steam vents",
        featureB: "the precarious metal walkways",
        featureC: "a sudden geyser from the boiling lake"
    },
    'fire-nation-capital': { 
        name: "Fire Nation Capital", 
        terrain: "tiered city of black rock and industrial zones", 
        feature: "intense heat from industrial zones and defensive structures", 
        has: ['earth', 'heat', 'urban', 'fire'], 
        interactiveElements: ['black_rock_structures', 'industrial_steam', 'narrow_alleys', 'defensive_walls'],
        terrainType: "urban-dense",
        featureA: "the oppressive industrial heat",
        featureB: "the narrow, dark alleyways",
        featureC: "a crumbling black rock structure"
    },
    'omashu': { 
        name: "Omashu", 
        terrain: "tiered city levels and giant stone buildings", 
        feature: "massive delivery chute system and winding pathways", 
        has: ['earth', 'urban', 'buildings'], 
        interactiveElements: ['delivery_chutes', 'stone_buildings', 'tiered_levels', 'high_ground', 'narrow_passages'],
        terrainType: "urban-dense",
        featureA: "the towering stone buildings",
        featureB: "the winding tiered pathways",
        featureC: "a discarded cabbage cart"
    },
    'great-divide': { 
        name: "Great Divide", 
        terrain: "sheer rocky cliffs and narrow ledges", 
        feature: "threat of a rockslide and echoing chasms", 
        has: ['earth', 'high_altitude'], 
        interactiveElements: ['rocky_cliffs', 'narrow_ledges', 'chasms', 'loose_scree', 'rockslides'],
        terrainType: "open-plain",
        featureA: "the echoing chasms",
        featureB: "the sheer rocky cliffs",
        featureC: "a pile of loose scree"
    },
    'kyoshi-island': { 
        name: "Kyoshi Island", 
        terrain: "coastal village and open plains", 
        feature: "wooden village houses for cover and proximity to the ocean", 
        has: ['earth', 'water', 'urban'], 
        interactiveElements: ['coastal_waters', 'village_houses', 'sandy_beaches', 'sea_cliffs'],
        terrainType: "coastal-open",
        featureA: "the crashing ocean waves",
        featureB: "the quaint village houses",
        featureC: "a slippery patch of seaweed"
    },
};
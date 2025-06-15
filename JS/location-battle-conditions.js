// FILE: location-battle-conditions.js
'use strict';

// This file now aggregates detailed environmental data from modular files.

// Import individual location condition data from the same directory
import { easternAirTempleConditions } from './data_location_eastern-air-temple.js';
import { northernWaterTribeConditions } from './data_location_northern-water-tribe.js';
import { baSingSeConditions } from './data_location_ba-sing-se.js';
import { siWongDesertConditions } from './data_location_si-wong-desert.js';
import { foggySwampConditions } from './data_location_foggy-swamp.js';
import { boilingRockConditions } from './data_location_boiling-rock.js';
import { fireNationCapitalConditions } from './data_location_fire-nation-capital.js';
import { omashuConditions } from './data_location_omashu.js';
import { greatDivideConditions } from './data_location_great-divide.js';
import { kyoshiIslandConditions } from './data_location_kyoshi-island.js';


// This object will combine all the individual location data
export const locationConditions = {
    [easternAirTempleConditions.id]: easternAirTempleConditions,
    [northernWaterTribeConditions.id]: northernWaterTribeConditions,
    [baSingSeConditions.id]: baSingSeConditions,
    [siWongDesertConditions.id]: siWongDesertConditions,
    [foggySwampConditions.id]: foggySwampConditions,
    [boilingRockConditions.id]: boilingRockConditions,
    [fireNationCapitalConditions.id]: fireNationCapitalConditions,
    [omashuConditions.id]: omashuConditions,
    [greatDivideConditions.id]: greatDivideConditions,
    [kyoshiIslandConditions.id]: kyoshiIslandConditions,
};
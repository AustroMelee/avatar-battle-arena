/**
 * @fileoverview Combines and exports all character-specific narrative pools.
 * @description This file acts as the central registry for all written narrative content.
 * To add a new character, import their pool and add it to the `narrativePools` object.
 */

import { NarrativePools } from '../narrative.types';
import { aangNarrativePool } from './aang.narrative';
import { azulaNarrativePool } from './azula.narrative';

export const narrativePools: NarrativePools = {
  Aang: aangNarrativePool,
  Azula: azulaNarrativePool,
};

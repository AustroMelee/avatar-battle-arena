// @file pronouns.data.ts
// @description SINGLE SOURCE OF TRUTH for all pronoun sets used in the narrative system.

export type PronounSet = {
  subject: 'he' | 'she' | 'they' | 'it';         // e.g., "he attacks"
  object: 'him' | 'her' | 'them' | 'it';          // e.g., "Aang attacks him"
  possessive: 'his' | 'her' | 'their' | 'its';   // e.g., "his attack"
  reflexive: 'himself' | 'herself' | 'themselves' | 'itself'; // e.g., "he prepares himself"
};

export const PRONOUN_SETS: Record<string, PronounSet> = {
  male: {
    subject: 'he',
    object: 'him',
    possessive: 'his',
    reflexive: 'himself',
  },
  female: {
    subject: 'she',
    object: 'her',
    possessive: 'her',
    reflexive: 'herself',
  },
  // Add more sets as needed (e.g., non-binary, custom)
  // non_binary: {
  //   subject: 'they',
  //   object: 'them',
  //   possessive: 'their',
  //   reflexive: 'themselves',
  // },
};

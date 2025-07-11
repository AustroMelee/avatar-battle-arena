// Central type exports for encyclopedia data domains
export type Character = {
  id: string;
  name: string;
  nation: string;
  bending?: string;
  description: string;
};

export type BendingArt = {
  id: string;
  name: string;
  element: string;
  description: string;
};

export type Location = {
  id: string;
  name: string;
  region: string;
  description: string;
};

export type Fauna = {
  id: string;
  name: string;
  habitat: string;
  description: string;
};

export type Food = {
  id: string;
  name: string;
  origin: string;
  description: string;
};

export type SpiritWorldEntry = {
  id: string;
  name: string;
  type: string;
  description: string;
};

export * from './rawTypes';
export * from './domainTypes';
